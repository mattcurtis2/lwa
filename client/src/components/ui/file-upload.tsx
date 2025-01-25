import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload, Crop, X } from "lucide-react";
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
  isUploading?: boolean;
  skipCrop?: boolean;
}

export function FileUpload({ 
  onFileSelect, 
  value, 
  onChange,
  label,
  className,
  accept = 'image/*,video/*',
  cropAspect,
  isUploading = false,
  skipCrop = true // Changed default to true to make cropping optional
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType | null>(null);

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

      // If skipCrop is true or file is not an image, bypass cropping
      if (skipCrop || !file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        setSelectedFile(file);
        const tempUrl = URL.createObjectURL(file);
        setTempImageUrl(tempUrl);
        setShowCropper(true);
      }
    }
  }, [onFileSelect, toast, skipCrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => {
      acc[curr.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  });

  const handleCropComplete = async () => {
    if (!completedCrop || !tempImageUrl) return;

    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = tempImageUrl;
    await new Promise(resolve => {
      image.onload = resolve;
    });

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    ctx?.drawImage(
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

    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const croppedFile = new File([blob], selectedFile?.name || 'cropped-image.jpg', { type: 'image/jpeg' });

    onFileSelect(croppedFile);
    setShowCropper(false);
    setTempImageUrl(null);
    setSelectedFile(null);
  };

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
                : "Drag & drop files here, or click to select"
            }
          </p>
        </div>
      </div>

      {value && (
        <div className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
            onClick={() => {
              if (!skipCrop) {
                setTempImageUrl(value);
                setShowCropper(true);
              }
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (onChange) onChange("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showCropper && tempImageUrl && (
        <Dialog open={showCropper} onOpenChange={setShowCropper}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={cropAspect}
            >
              <img src={tempImageUrl} alt="Crop preview" />
            </ReactCrop>
            <DialogFooter>
              <Button onClick={handleCropComplete}>Save Crop</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}