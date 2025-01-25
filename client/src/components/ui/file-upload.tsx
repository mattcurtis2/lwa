import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { Upload, Crop } from "lucide-react";
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
}

function ImageCropper({ imageUrl, onCropComplete, open, onOpenChange }: { imageUrl: string; onCropComplete: (croppedImageUrl: string) => void; open: boolean; onOpenChange: (open: boolean) => void; }) {
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<CropType | null>(null);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imageUrl) {
      return null;
    }

    console.log('Inside getCroppedImg, completedCrop:', completedCrop);
    console.log('Inside getCroppedImg, imageUrl:', imageUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = imageUrl;
    await new Promise(resolve => {
      image.onload = resolve;
    });
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    ctx!.drawImage(
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
    console.log('Cropped image URL generated:', croppedImageUrl);
    return croppedImageUrl;
  }, [completedCrop, imageUrl]);


  const handleCropComplete = async () => {
    console.log('Starting crop completion...');
    if (!completedCrop) {
      console.log('No completed crop data');
      return;
    }
    try {
      console.log('Getting cropped image...');
      const croppedImageUrl = await getCroppedImg();
      console.log('Cropped image URL:', croppedImageUrl);
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error in crop completion:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <ReactCrop
                src={imageUrl}
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
            />
            <Button onClick={handleCropComplete}>Crop Image</Button>
        </DialogContent>
    </Dialog>
  );
}

export function FileUpload({ 
  onFileSelect, 
  value, 
  onChange,
  label,
  className,
  accept = 'image/*,video/*',
  cropAspect,
  isUploading = false
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

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('Files dropped:', acceptedFiles, rejectedFiles);
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
      console.log('Selected file:', file);
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "Error",
          description: "File is too large (max 50MB)",
          variant: "destructive"
        });
        return;
      }

      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const tempUrl = URL.createObjectURL(file);
        setTempImageUrl(tempUrl);
        setShowCropper(true);
      } else {
        onFileSelect(file);
      }
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => {
      acc[curr.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: () => {
      toast({
        title: "Error",
        description: "File type not supported or file is too large (max 50MB)",
        variant: "destructive"
      });
    }
  });

  const handleCroppedImage = async (croppedImageUrl: string) => {
    console.log('handleCroppedImage called with:', croppedImageUrl);
    if (!selectedFile) return;

    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const croppedFile = new File([blob], selectedFile.name, { type: 'image/jpeg' });
      console.log('Cropped file created:', croppedFile);
      onFileSelect(croppedFile);
      setShowCropper(false);
      setTempImageUrl(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error handling cropped image:", error);
    }
  };

  return (
    <div className="space-y-2">
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCroppedImage}
          open={showCropper}
          onOpenChange={setShowCropper}
        />
      )}
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
    </div>
  );
}