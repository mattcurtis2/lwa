
import React, { useState, useRef } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);

  const getCroppedImg = async () => {
    if (!imgRef || !crop.width || !crop.height) return null;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw the cropped image
    ctx.drawImage(
      imgRef,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    // If circular crop is enabled, create circular mask
    if (circularCrop) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        2 * Math.PI,
        true
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
          resolve(URL.createObjectURL(blob));
        },
        'image/jpeg',
        1
      );
    });
  };

  const handleCropComplete = async () => {
    try {
      const croppedImageUrl = await getCroppedImg();
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
      }
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center p-4 max-h-[70vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
          >
            <img
              ref={(ref) => setImgRef(ref)}
              src={imageUrl}
              alt="Crop preview"
              style={{ maxWidth: '100%' }}
              onLoad={(e) => {
                // Initialize with a reasonable crop area
                const img = e.currentTarget;
                const width = img.width;
                const height = img.height;
                const cropWidth = aspect ? Math.min(80, (height * aspect / width) * 80) : 80;
                const cropHeight = aspect ? Math.min(80, (width / aspect / height) * 80) : 80;
                
                setCrop({
                  unit: '%',
                  width: cropWidth,
                  height: cropHeight,
                  x: (100 - cropWidth) / 2,
                  y: (100 - cropHeight) / 2
                });
              }}
            />
          </ReactCrop>
        </div>
        <DialogFooter className="flex space-x-2">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          {onSkip && (
            <Button onClick={onSkip} variant="outline">
              Skip Cropping
            </Button>
          )}
          <Button onClick={handleCropComplete}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
