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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setSelectedFile(file);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    // Do not automatically show crop dialog
    onFileSelect(file);
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

    // Convert the cropped image URL to a File object
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const croppedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' });

    // Clean up the temporary URLs
    URL.revokeObjectURL(croppedImageUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    onFileSelect(croppedFile);
  };

  const handleCropClick = () => {
    if (value) {
      // For existing images, use the current value URL
      setPreviewUrl(value);
      setShowCrop(true);
    } else if (selectedFile) {
      // For newly uploaded files, use the selected file
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
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Upload className="h-8 w-8" />
          <p className="text-sm text-center">
            {isDragActive ? (
              "Drop the file here"
            ) : (
              "Drag & drop a file here, or click to select"
            )}
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
          {(value || selectedFile) && (
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