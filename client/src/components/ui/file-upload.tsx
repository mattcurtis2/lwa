import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload, FileText } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
  accept?: string;
  isUploading?: boolean;
  skipCrop?: boolean;
}

export function FileUpload({ 
  onFileSelect, 
  value, 
  onChange,
  label,
  className,
  accept = 'application/pdf,image/*,video/*,.doc,.docx',
  isUploading = false,
  skipCrop = false,
}: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File is too large (max 50MB)",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const uploadedFiles = Array.isArray(data) ? data : [data];
      const uploadedFile = uploadedFiles[0];

      if (!uploadedFile?.url) {
        throw new Error("Invalid upload response");
      }

      setPreviewUrl(uploadedFile.url);
      if (onChange) {
        onChange(uploadedFile.url);
      }
      onFileSelect(file);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
    }
  }, [onFileSelect, onChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': [],
      'video/*': [],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  });

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (extension === 'pdf' || extension === 'doc' || extension === 'docx') {
      return <FileText className="h-8 w-8" />;
    }
    return null;
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'File';
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
                : "Drag & drop files here, or click to select"}
          </p>
          <p className="text-xs text-center">
            Supports PDF, DOC, DOCX, images, and videos up to 50MB
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="flex items-center gap-2 p-2 border rounded">
          {getFileIcon(previewUrl) || (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-8 h-8 object-cover rounded"
            />
          )}
          <span className="flex-1 truncate">{getFileName(previewUrl)}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (onChange) onChange("");
              setPreviewUrl(null);
            }}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}