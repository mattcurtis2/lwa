
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
  accept = 'image/*,video/*',
  cropAspect
}: FileUploadProps) {
  const [showCrop, setShowCrop] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    if (file.type.startsWith('image/')) {
      setSelectedFile(file);
      const tempPreview = URL.createObjectURL(file);
      setPreviewUrl(tempPreview);
      setShowCrop(true);
    } else if (file.type.startsWith('video/')) {
      setSelectedFile(file);
      const tempPreview = URL.createObjectURL(file);
      setPreviewUrl(tempPreview);
      await handleUpload(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive"
      });
    }
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

  const handleCropComplete = async (croppedImageUrl: string) => {
    if (!selectedFile) return;

    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], selectedFile.name, { type: selectedFile.type });
      URL.revokeObjectURL(croppedImageUrl);
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

      <div className="space-y-2">
        {label && <Label>{label}</Label>}
        <div className="flex gap-2">
          <Input
            value={value || ''}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
            className="flex-1"
          />
          {previewUrl && !isUploading && selectedFile?.type.startsWith('image/') && (
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
          {selectedFile?.type.startsWith('video/') ? (
            <video
              src={previewUrl}
              controls
              className="max-h-48 rounded-lg"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 rounded-lg object-contain"
            />
          )}
        </div>
      )}

      {showCrop && previewUrl && selectedFile?.type.startsWith('image/') && (
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
