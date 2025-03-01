import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
  aspect?: number;
  circularCrop?: boolean;
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
  onCropComplete, 
  onCancel, 
  onSkip,
  aspect,
  circularCrop = false 
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
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
      if (!completedCrop || !imgRef.current) {
        if (imgRef.current) {
          const fullImage = imgRef.current;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (ctx) {
            canvas.width = fullImage.naturalWidth;
            canvas.height = fullImage.naturalHeight;
            ctx.drawImage(fullImage, 0, 0);
            const fullImageUrl = canvas.toDataURL('image/jpeg', 0.85);
            onCropComplete(fullImageUrl);
          }
        }
        return;
      }

      const validCrop = {
        ...completedCrop,
        width: completedCrop.width <= 0 ? imgRef.current.width / 4 : completedCrop.width,
        height: completedCrop.height <= 0 ? imgRef.current.height / 4 : completedCrop.height,
      };

      setIsProcessing(true);

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      canvas.width = validCrop.width;
      canvas.height = validCrop.height;

      ctx.drawImage(
        image,
        validCrop.x,
        validCrop.y,
        validCrop.width,
        validCrop.height,
        0,
        0,
        validCrop.width,
        validCrop.height
      );

      if (circularCrop) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY);

        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, true);
        ctx.fill();
      }

      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
      onCropComplete(croppedImageUrl);
    } catch (error) {

    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, circularCrop, onCropComplete]);

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