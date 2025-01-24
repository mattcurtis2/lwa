
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
  accept?: string;
  cropAspect?: number;
  isUploading?: boolean;
}

function ImageCropper({ imageUrl, onCropComplete, open, onOpenChange }: { imageUrl: string; onCropComplete: (croppedImageUrl: string) => void; open: boolean; onOpenChange: (open: boolean) => void; }) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setImage(img);
  }, [imageUrl]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !image) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x,
      completedCrop.y,
      completedCrop.width,
      completedCrop.height,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg');
    });
  }, [completedCrop, image]);

  const handleCropComplete = async () => {
    const croppedImageUrl = await getCroppedImg();
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {image && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <img src={imageUrl} alt="Crop preview" />
            </ReactCrop>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleCropComplete}>Apply Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FileUpload({ 
  onFileSelect, 
  value, 
  onChange,
  label,
  className,
  accept = 'image/*,video/*',
  cropAspect,
  isUploading = false
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({
        title: "Error",
        description: "File type not supported or file is too large (max 50MB)",
        variant: "destructive"
      });
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File is too large (max 50MB)",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      if (!file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => {
      acc[curr.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    multiple: false,
    maxSize: 50 * 1024 * 1024
  });

  const handleCroppedImage = async (croppedImageUrl: string) => {
    if (!selectedFile) return;

    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' });
      onFileSelect(croppedFile);
      setShowCropper(false);
      setTempImageUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error handling cropped image:", error);
    }
  };

  return (
    <div className="space-y-2">
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCroppedImage}
          open={showCropper}
          onOpenChange={setShowCropper}
        />
      )}
      <div className="space-y-4">
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
                  : "Drag & drop files here, or click to select"
              }
            </p>
          </div>
        </div>
        {previewUrl && selectedFile?.type.startsWith('image/') && (
          <div 
            className="relative cursor-pointer group"
            onClick={() => setShowCropper(true)}
          >
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-auto rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-lg">
              Click to crop
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
