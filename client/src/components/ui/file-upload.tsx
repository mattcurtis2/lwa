
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload, Crop } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";
import { ImageCrop } from "./image-crop";
import { Button } from "./button";

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
  accept = 'image/*',
  cropAspect
}: FileUploadProps) {
  const [showCrop, setShowCrop] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    
    setSelectedFile(file);
    setIsUploading(true);

    try {
      // Create temporary preview for immediate feedback
      const tempPreview = URL.createObjectURL(file);
      setPreviewUrl(tempPreview);
      
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Clean up temp preview and set actual URL
      URL.revokeObjectURL(tempPreview);
      setPreviewUrl(data.url);
      onFileSelect(file);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  }, [onFileSelect]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { [accept]: [] },
    maxFiles: 1
  });

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!selectedFile) return;

    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' });
      
      // Clean up URLs
      URL.revokeObjectURL(croppedImageUrl);
      if (previewUrl && !previewUrl.startsWith('/')) {
        URL.revokeObjectURL(previewUrl);
      }

      handleFile(croppedFile);
      setShowCrop(false);
    } catch (error) {
      console.error("Error processing cropped image:", error);
    }
  };

  const handleCropClick = () => {
    if (value) {
      setPreviewUrl(value);
      setShowCrop(true);
    } else if (selectedFile) {
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
      setShowCrop(true);
    }
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer",
          isDragActive && "border-primary bg-accent",
          isUploading && "opacity-50 pointer-events-none",
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Upload className="h-8 w-8" />
          <p className="text-sm text-center">
            {isDragActive 
              ? "Drop the file here" 
              : isUploading 
                ? "Uploading..."
                : "Drag & drop a file here, or click to select"
            }
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="flex gap-2">
          <Input
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          {(value || selectedFile) && !isUploading && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleCropClick}
              type="button"
              title="Crop Image"
            >
              <Crop className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {previewUrl && !showCrop && selectedFile?.type.startsWith('image/') && (
        <div className="mt-2">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 rounded-lg object-contain"
          />
        </div>
      )}

      {showCrop && previewUrl && (
        <ImageCrop
          imageUrl={previewUrl}
          aspect={cropAspect}
          open={showCrop}
          onOpenChange={setShowCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
