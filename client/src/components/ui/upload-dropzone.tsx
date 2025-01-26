import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface UploadDropzoneProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxFiles?: number;
}

export function UploadDropzone({ onUpload, accept, maxFiles = 1 }: UploadDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxFiles,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <UploadCloud className="h-10 w-10" />
        <p className="text-sm text-center">
          {isDragActive ? (
            "Drop the file here"
          ) : (
            "Drag and drop a file here, or click to select"
          )}
        </p>
      </div>
    </div>
  );
}
