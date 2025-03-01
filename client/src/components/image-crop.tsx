import React, { useRef, useState, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';


interface ImageCropProps {
  imageUrl: string;
  aspect?: number;
  circularCrop?: boolean;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCrop({
  imageUrl,
  aspect = 16 / 9,
  circularCrop = false,
  onCropComplete,
  onCancel,
  onSkip,
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  const handleComplete = async () => {
    if (!imgRef.current || !completedCrop || !completedCrop.width || !completedCrop.height) {
      console.error("Invalid crop dimensions", completedCrop);
      toast({
        title: "Error",
        description: "Please select a valid crop area before confirming",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Convert canvas to blob
      const base64Image = canvas.toDataURL('image/jpeg', 0.9); // Added quality parameter
      console.log("Created cropped image URL:", base64Image);
      console.log("Applying crop with URL:", base64Image);

      try {
        // Convert base64 to blob
        const response = await fetch(base64Image);
        const blob = await response.blob();

        // Create a file from the blob
        const fileToUpload = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

        // Create FormData and append file
        const formData = new FormData();
        formData.append('file', fileToUpload);

        // Upload the file
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload cropped image');
        }

        const data = await uploadRes.json();
        console.log("Upload response:", data);

        // Return the file URL from the server response
        if (data && data.length > 0) {
          // Add a timestamp to prevent caching issues
          const imageUrl = `${data[0].url}?t=${Date.now()}`;
          onCropComplete(imageUrl);
        } else {
          throw new Error('Invalid upload response');
        }
      } catch (error) {
        console.error("Error uploading cropped image:", error);
        // If server upload fails, fall back to base64
        onCropComplete(base64Image);
      }
    } catch (error) {
      console.error("Error completing crop:", error);
      toast({
        title: "Error",
        description: "An error occurred while cropping the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Crop completed:", completedCrop);
  }, [completedCrop]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="max-h-[60vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={circularCrop}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Crop me"
                onLoad={onImageLoad}
                className="max-w-full"
              />
            </ReactCrop>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip} disabled={isLoading}>
                Skip Cropping
              </Button>
            )}
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Apply Crop'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}