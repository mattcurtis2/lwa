import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  className?: string;
  accept?: string;
}

export function FileUpload({ 
  onFileSelect, 
  value, 
  onChange,
  label,
  className,
  accept = 'image/*'
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { [accept]: [] },
    maxFiles: 1
  });

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
    </div>
  );
}
