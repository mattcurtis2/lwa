
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
import 'react-image-crop/dist/ReactCrop.css';

// This is to help TypeScript find the types
import type { Crop as CropType } from 'react-image-crop';

function useDebounceEffect(
  fn: () => void,
  deps: any[],
  wait: number
) {
  const timeout = useRef<number | null>(null);
  
  const callback = useRef(fn);
  callback.current = fn;

  const debouncedFunc = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = window.setTimeout(() => {
      callback.current();
    }, wait);
  };

  React.useEffect(() => {
    debouncedFunc();
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, deps);
}

function canvasPreview(
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

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspect?: number;
  onSkip?: () => void;
}

export function ImageCrop({
  imageUrl,
  onCropComplete,
  onCancel,
  aspect = 1,
  onSkip
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

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

      // Convert percent crop to pixel values
      const validCrop = completedCrop as PixelCrop;

      // Set canvas dimensions to match the cropped image
      canvas.width = validCrop.width;
      canvas.height = validCrop.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No 2d context');
      }

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        validCrop.x * scaleX,
        validCrop.y * scaleY,
        validCrop.width * scaleX,
        validCrop.height * scaleY,
        0,
        0,
        validCrop.width,
        validCrop.height
      );

      try {
        // Convert canvas to blob and create an object URL
        canvas.toBlob((blob) => {
          if (!blob) {
            console.error("Failed to create blob");
            setIsProcessing(false);
            return;
          }

          // Create a URL for the blob
          const croppedUrl = URL.createObjectURL(blob);

          // Call the crop complete callback
          onCropComplete(croppedUrl);
          setIsProcessing(false);
        }, 'image/jpeg', 0.95);
      } catch (error) {
        console.error("Error completing crop:", error);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error in cropping process:", error);
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

// Default export for backwards compatibility
export default ImageCrop;
