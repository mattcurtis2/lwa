import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string, blob?: Blob) => void;
  onCancel: () => void;
  aspect?: number;
  onSkip?: () => void;
  circularCrop?: boolean;
}

export function ImageCrop({
  imageUrl,
  onCropComplete,
  onCancel,
  aspect = 1,
  onSkip,
  circularCrop = false
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          width,
          height
        ),
        width,
        height
      ));
    }
  }

  const createCroppedImage = async () => {
    try {
      if (!completedCrop || !imgRef.current) {
        console.error("Missing crop or image reference");
        return;
      }

      setIsProcessing(true);

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('No 2d context');
        setIsProcessing(false);
        return;
      }

      // Set the canvas dimensions to the cropped size
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        image,
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
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to create blob");
          setIsProcessing(false);
          return;
        }

        // Create a URL for the blob
        const croppedUrl = URL.createObjectURL(blob);

        // Call the crop complete callback
        onCropComplete(croppedUrl, blob);
        setIsProcessing(false);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error("Error completing crop:", error);
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="my-4">
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
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full h-auto"
            />
          </ReactCrop>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {onSkip && (
              <Button 
                variant="outline" 
                onClick={onSkip} 
                className="ml-2"
              >
                Skip Cropping
              </Button>
            )}
          </div>
          <Button 
            onClick={createCroppedImage} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to create canvas preview
export function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height,
  );
}