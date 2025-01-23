import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload, Crop } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";
import { ImageCrop } from "./image-crop";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";

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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Initialize preview URL from value prop
  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);

    // Create preview immediately before upload
    const tempPreview = URL.createObjectURL(file);
    setPreviewUrl(tempPreview);

    // Show crop dialog immediately after file selection
    setShowCrop(true);

  }, [toast]);

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
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive",
      });
      // Don't clear preview on upload error - keep the local preview
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { [accept]: [] },
    maxFiles: 1,
    multiple: false
  });

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!selectedFile) return;

    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], selectedFile.name, { type: selectedFile.type });

      // Only clean up the cropped preview URL
      URL.revokeObjectURL(croppedImageUrl);

      // Upload the cropped file
      await handleUpload(croppedFile);
      setShowCrop(false);
    } catch (error) {
      console.error("Error processing cropped image:", error);
      toast({
        title: "Error",
        description: "Failed to process cropped image",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPreviewUrl(newValue);
    onChange?.(newValue);
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
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          {previewUrl && !isUploading && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCrop(true)}
              type="button"
              title="Crop Image"
            >
              <Crop className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {previewUrl && !showCrop && (
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