import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useDebounceEffect from "@/lib/useDebounceEffect";

function canvasPreview(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const pixelRatio = window.devicePixelRatio;
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';
  ctx.save();

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  // First draw the source image
  ctx.drawImage(
    img,
    cropX,
    cropY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  ctx.restore();
}

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  aspect?: number;
  onSkip?: () => void;
}

// Export as both default and named export
export function ImageCrop({
  imageUrl,
  onCropComplete,
  onCancel,
  aspect = 1,
  onSkip
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
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

  useDebounceEffect(
    function () {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than createObjectURL
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop
        );
      }
    },
    [completedCrop],
    100
  );

  const handleApplyCrop = async () => {
    try {
      if (!completedCrop || !imgRef.current) return;

      console.log("Crop completed:", completedCrop);

      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply these settings to prevent canvas taint (adapted for original code)
      ctx.imageSmoothingQuality = 'high';

      try {
        // Create an intermediate canvas that we can safely manipulate
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        if (!tempCtx) return;

        // Set crossOrigin property on a new Image instance
        const tempImage = new Image();
        tempImage.crossOrigin = "anonymous";
        tempImage.src = imgRef.current.src;

        // Function to complete drawing once image is loaded
        const completeDrawing = () => {
          tempCanvas.width = completedCrop.width * scaleX;
          tempCanvas.height = completedCrop.height * scaleY;

          // Draw the cropped image onto the canvas
          tempCtx.drawImage(
            tempImage,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY
          );

          // Draw temp canvas to main canvas
          ctx.drawImage(tempCanvas, 0, 0);

          // Convert canvas to data URL
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            onCropComplete(dataUrl);
          } catch (error) {
            console.error("Error completing crop:", error);
          }
        };

        // If image is already loaded, draw it immediately; otherwise wait
        if (tempImage.complete) {
          completeDrawing();
        } else {
          tempImage.onload = completeDrawing;
        }
      } catch (error) {
        console.error("Error in cropping process:", error);
      }

    } catch (error) {
      console.error("Error completing crop:", error);
    }
  };

  console.log("Crop completed:", completedCrop);

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={false}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl}
                onLoad={onImageLoad}
                crossOrigin="anonymous"  {/* Added crossOrigin attribute */}
                className="max-h-[500px] object-contain"
              />
            </ReactCrop>

            <div className="hidden">
              <canvas ref={previewCanvasRef} />
            </div>

            <div className="flex justify-end space-x-2 w-full">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {onSkip && (
                <Button variant="secondary" onClick={onSkip}>
                  Skip Cropping
                </Button>
              )}
              <Button onClick={handleApplyCrop}>
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Also maintain the default export for backward compatibility
export default ImageCrop;