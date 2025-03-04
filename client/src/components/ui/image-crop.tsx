import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Add console logging for debugging
const logDebug = (message: string, ...args: any[]) => {
  console.log(`[ImageCrop] ${message}`, ...args);
};

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
      console.log('[ImageCrop] Starting cropping process. Image URL:', imageUrl);
      console.log('[ImageCrop] Completed crop data:', completedCrop);

      if (!completedCrop || !imgRef.current || !completedCrop.width || !completedCrop.height) {
        console.error("[ImageCrop] Invalid crop data or image reference");
        setIsProcessing(false);
        return;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error("[ImageCrop] Failed to get 2D context");
        setIsProcessing(false);
        return;
      }

      const pixelRatio = window.devicePixelRatio;
      canvas.width = completedCrop.width * pixelRatio;
      canvas.height = completedCrop.height * pixelRatio;
      console.log("[ImageCrop] Canvas dimensions set:", canvas.width / pixelRatio, "x", canvas.height / pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      // Draw the cropped portion of the image
      // Calculate the proper scaling factors based on natural image dimensions
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      ctx.drawImage(
        image,
        completedCrop.x * scaleX, // source x (scaled)
        completedCrop.y * scaleY, // source y (scaled)
        completedCrop.width * scaleX, // source width (scaled)
        completedCrop.height * scaleY, // source height (scaled)
        0, // destination x
        0, // destination y
        completedCrop.width, // destination width
        completedCrop.height, // destination height
      );
      console.log("[ImageCrop] Image drawn on canvas with crop coordinates applied");

      const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
      console.log("[ImageCrop] Cropped image data URL generated:", croppedImageUrl.substring(0, 200) + "..." /* truncate for logs */);

      // Ensure we send the crop data for debugging
      const cropData = {
        x: completedCrop.x,
        y: completedCrop.y,
        width: completedCrop.width,
        height: completedCrop.height
      };

      console.log("[ImageCrop] Final crop data being sent:", cropData);
      onCropComplete(croppedImageUrl, cropData);
      setIsProcessing(false);
    } catch (error) {
      console.error("[ImageCrop] Error during cropping:", error);
      setIsProcessing(false);
    }
  }, [completedCrop, imgRef, onCropComplete]);

  // Convert image URL to use proxy if it's from S3
  const processedImageUrl = imageUrl.includes('lwacontent.s3') ? 
    `/api/proxy-image?url=${encodeURIComponent(imageUrl)}` : 
    imageUrl;
    
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Select an area of the image to crop
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 overflow-y-auto max-h-[calc(70vh-8rem)]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
          >
            <img
              ref={imgRef}
              src={processedImageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full h-auto"
              crossOrigin="anonymous"
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