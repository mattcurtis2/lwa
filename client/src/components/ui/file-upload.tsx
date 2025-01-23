import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload, Crop } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { type Crop as CropType } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
  accept?: string;
  cropAspect?: number;
}

export function FileUpload({ 
  onFileSelect, 
  value, 
  onChange,
  label,
  className,
  accept = 'image/*,video/*',
  cropAspect
}: FileUploadProps) {
  const [showCrop, setShowCrop] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState<CropType>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const { toast } = useToast();

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const getCroppedImg = async (image: HTMLImageElement, crop: CropType) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width!;
    canvas.height = crop.height!;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x! * scaleX,
      crop.y! * scaleY,
      crop.width! * scaleX,
      crop.height! * scaleY,
      0,
      0,
      crop.width!,
      crop.height!
    );

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob || !selectedFile) return;
        const file = new File([blob], selectedFile.name, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 1);
    });
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text() || 'Upload failed');
      }

      const data = await response.json();
      setPreviewUrl(data.url);
      onChange?.(data.url);
      onFileSelect(file);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropComplete = async (imageRef: HTMLImageElement) => {
    try {
      const croppedFile = await getCroppedImg(imageRef, crop);
      await handleUpload(croppedFile);
      setShowCrop(false);
    } catch (error) {
      console.error("Error cropping image:", error);
      toast({
        title: "Error",
        description: "Failed to crop image",
        variant: "destructive",
      });
    }
  };

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      const tempPreview = URL.createObjectURL(file);
      setPreviewUrl(tempPreview);
      setShowCrop(true);
    } else if (file.type.startsWith('video/')) {
      setSelectedFile(file);
      await handleUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive"
      });
    }
  }, [toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
          isDragActive && "border-primary bg-accent",
          isUploading && "opacity-50 pointer-events-none",
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Upload className="h-10 w-10" />
          <p className="text-sm text-center">
            {isDragActive 
              ? "Drop your file here..."
              : isUploading 
                ? "Uploading..."
                : "Drag & drop images or videos here, or click to select"
            }
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="mt-2">
          {selectedFile?.type.startsWith('video/') ? (
            <video
              src={previewUrl}
              controls
              className="max-h-48 rounded-lg"
            />
          ) : (
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain cursor-pointer"
                onClick={() => setShowCrop(true)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Crop className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showCrop} onOpenChange={setShowCrop}>
        <DialogContent className="max-w-screen-lg">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex flex-col gap-4">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={cropAspect}
              >
                <img
                  src={previewUrl}
                  alt="Crop preview"
                  id="cropImage"
                  style={{ maxHeight: '70vh' }}
                />
              </ReactCrop>
              <DialogFooter>
                <Button onClick={() => setShowCrop(false)} variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    const img = document.getElementById('cropImage') as HTMLImageElement;
                    if (img) handleCropComplete(img);
                  }}
                >
                  Apply Crop
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}