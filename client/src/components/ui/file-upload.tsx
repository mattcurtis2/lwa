import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";
import { ImageCrop } from "./image-crop";

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
    setShowCrop(true);
  }, []);

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
        <Input
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
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