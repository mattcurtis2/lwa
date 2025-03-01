
import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface ImageCropProps {
  imageUrl: string;
  aspect?: number;
  circularCrop?: boolean;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
}

export function ImageCrop({
  imageUrl,
  aspect,
  circularCrop = false,
  onCropComplete,
  onCancel,
  onSkip
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelCrop = {
      x: completedCrop.x * scaleX,
      y: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw the cropped image
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    // If circular crop is enabled, create circular mask
    if (circularCrop) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        pixelCrop.width / 2,
        pixelCrop.height / 2,
        Math.min(pixelCrop.width, pixelCrop.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const croppedImageUrl = URL.createObjectURL(blob);
          console.log('Created cropped image URL:', croppedImageUrl);
          resolve(croppedImageUrl);
        },
        'image/jpeg',
        0.95
      );
    });
  }, [completedCrop, circularCrop]);

  const handleCropComplete = (c: Crop) => {
    console.log('Crop completed:', c);
    setCompletedCrop(c);
  };

  const handleApplyCrop = async () => {
    try {
      const croppedImageUrl = await createCroppedImage();
      if (croppedImageUrl) {
        console.log('Applying crop with URL:', croppedImageUrl);
        onCropComplete(croppedImageUrl);
      } else {
        console.error('Failed to generate cropped image');
      }
    } catch (error) {
      console.error('Error applying crop:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogTitle>Crop Image</DialogTitle>
        <div className="mb-4 max-w-full overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={handleCropComplete}
            aspect={aspect}
            circularCrop={circularCrop}
          >
            <img
              src={imageUrl}
              alt="Crop me"
              onLoad={(e) => onImageLoad(e.currentTarget)}
              className="max-h-[60vh] max-w-full"
            />
          </ReactCrop>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={onCancel} className="mr-2">
              Cancel
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip} className="mr-2">
                Skip Cropping
              </Button>
            )}
          </div>
          <Button onClick={handleApplyCrop}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
