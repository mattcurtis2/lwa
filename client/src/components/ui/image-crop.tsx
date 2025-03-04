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
  onCropComplete: (croppedImageUrl: string | null, completedCrop: PixelCrop | null) => void;
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
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      console.error("Missing completedCrop, previewCanvasRef, or imgRef");
      return;
    }

    console.log("handleApplyCrop called with completedCrop:", completedCrop);

    try {
      const canvas = previewCanvasRef.current;
      const image = imgRef.current;
      const crop = completedCrop;
      // Use different variable names to avoid redeclaration
      const imgScaleX = image.naturalWidth / image.width;
      const imgScaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error('No 2D context');
      }

      // Set canvas to same dimensions as crop
      canvas.width = crop.width * imgScaleX;
      canvas.height = crop.height * imgScaleY;

      ctx.drawImage(
        image,
        crop.x * imgScaleX,
        crop.y * imgScaleY,
        crop.width * imgScaleX,
        crop.height * imgScaleY,
        0,
        0,
        crop.width * imgScaleX,
        crop.height * imgScaleY
      );

      // Convert canvas to data URL with high quality
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      console.log("Generated cropped image data URL successfully:", dataUrl.substring(0, 50) + "...");

      // Call the callback with the data URL
      if (typeof onCropComplete === 'function') {
        onCropComplete(dataUrl, completedCrop);
      } else {
        console.error("onCropComplete is not a function");
      }
    } catch (error) {
      console.error("Error completing crop:", error);
      // Don't pass incorrect data if there's an error - it only confuses the caller
      if (typeof onCropComplete === 'function') {
          console.log("Error occurred during crop completion");
      } else {
          console.error("onCropComplete is not a function or is undefined");
      }
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
                className="max-h-[500px] object-contain"
                crossOrigin="anonymous"
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