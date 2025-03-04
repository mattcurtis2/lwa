import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string, cropData: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
  onSkip?: () => void;
  aspect?: number;
  circularCrop?: boolean;
}

export function ImageCrop({ 
  imageUrl, 
  onCropComplete, 
  onCancel, 
  onSkip,
  aspect = 1,
  circularCrop = false 
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }, [aspect]);

  const createCroppedImage = useCallback(async () => {
    try {
      setIsProcessing(true);

      if (!completedCrop || !imgRef.current || !completedCrop.width || !completedCrop.height) {
        console.error("No valid crop data or image reference");
        setIsProcessing(false);
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error("No 2d context");
        setIsProcessing(false);
        return;
      }

      // Set canvas dimensions to the cropped size
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      // Draw the cropped image
      ctx.drawImage(
        image,
        completedCrop.x,
        completedCrop.y,
        completedCrop.width,
        completedCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert canvas to data URL
      const cropDataUrl = canvas.toDataURL('image/jpeg', 0.95);

      // Call the onCropComplete with both the data URL and crop coordinates
      onCropComplete(cropDataUrl, {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width,
        height: completedCrop.height
      });

      setIsProcessing(false);
    } catch (error) {
      console.error("Error completing crop:", error);
      setIsProcessing(false);
    }
  }, [completedCrop, imgRef, onCropComplete]);

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

export default ImageCrop;