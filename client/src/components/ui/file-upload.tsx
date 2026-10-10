import { useCallback, useState, useEffect, useMemo } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload, FileText } from "lucide-react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/upload-utils";

const MIME_EXTENSIONS: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/jpg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "video/*": [".mp4", ".webm", ".mov"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

function acceptFromProp(accept: string): Accept {
  const result: Accept = {};
  for (const part of accept.split(",").map((value) => value.trim()).filter(Boolean)) {
    const extensions = MIME_EXTENSIONS[part] || (part.startsWith(".") ? [part] : []);
    const mime = part.startsWith(".") ? "application/octet-stream" : part;
    result[mime] = Array.from(new Set([...(result[mime] || []), ...extensions]));
  }
  return result;
}

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

  const dropzoneAccept = useMemo(() => acceptFromProp(accept), [accept]);

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

    // Document forms upload the file themselves. Uploading here as well
    // sends pedigree PNGs through the server twice and fails the size limit.
    if (!onChange) {
      onFileSelect(file);
      return;
    }

    try {
      const url = await uploadFile(file);
      setPreviewUrl(url);
      onChange(url);
      onFileSelect(file);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
    }
  }, [onFileSelect, onChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const message = rejections[0]?.errors[0]?.message || "That file type is not supported";
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    },
    accept: dropzoneAccept,
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