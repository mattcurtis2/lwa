import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useDebounceEffect from "@/lib/useDebounceEffect";
import {Loader2} from "@/components/ui/loader";

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
  const [isProcessing, setIsProcessing] = useState(false); // Added state for processing
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

  const handleApplyCrop = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    try {
      console.log("Crop completed:", completedCrop);

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

      try {
        // Draw the cropped image onto the canvas
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

        // Directly try to get the data URL first
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          onCropComplete(dataUrl);
        } catch (corsError) {
          console.warn("CORS error when accessing canvas directly, trying alternative approach:", corsError);

          // Alternative approach: render to a blob and use FileReader
          canvas.toBlob((blob) => {
            if (!blob) {
              console.error("Failed to create blob from canvas");
              setIsProcessing(false);
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                onCropComplete(reader.result);
              } else {
                console.error("FileReader result is not a string");
              }
              setIsProcessing(false);
            };
            reader.onerror = () => {
              console.error("Error reading blob as data URL");
              setIsProcessing(false);
            };
            reader.readAsDataURL(blob);
          }, 'image/jpeg', 0.95);
        }
      } catch (error) {
        console.error("Error in cropping process:", error);
        setIsProcessing(false);
      }

    } catch (error) {
      console.error("Error completing crop:", error);
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, imgRef, onCropComplete]);

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
                crossOrigin="anonymous"
                className="max-h-[500px] object-contain"
              />
            </ReactCrop>

            <div className="hidden">
              <canvas ref={previewCanvasRef} />
            </div>

            <div className="flex justify-end space-x-2 w-full">
              <Button variant="outline" onClick={(e) => {e.preventDefault(); onCancel()}}>
                Cancel
              </Button>
              {onSkip && (
                <Button variant="secondary" onClick={(e) => {e.preventDefault(); onSkip()}}>
                  Skip Cropping
                </Button>
              )}
              <Button onClick={(e) => {e.preventDefault(); handleApplyCrop()}}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Apply"
                )}
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