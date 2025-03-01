
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './button';
import { X } from 'lucide-react';
import { useDebounceEffect } from '@/lib/useDebounceEffect';

export interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
  aspect?: number;
  circularCrop?: boolean;
}

const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect?: number) => {
  if (!aspect) return { unit: '%', width: 90, height: 90, x: 5, y: 5 };
  
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
};

export function ImageCrop({ 
  imageUrl, 
  onCropComplete, 
  onCancel,
  onSkip,
  aspect,
  circularCrop = false
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  function generateDownload(canvas: HTMLCanvasElement, crop: PixelCrop) {
    if (!crop || !canvas) {
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Failed to create blob');
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        console.log("Created cropped image URL:", blobUrl);
        console.log("Applying crop with URL:", blobUrl);
        onCropComplete(blobUrl);
      },
      'image/jpeg',
      0.95
    );
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        canvasRef.current
      ) {
        console.log("Crop completed:", completedCrop);
        await canvasPreview(
          imgRef.current,
          canvasRef.current,
          completedCrop,
          1,
          0,
          circularCrop
        );
      }
    },
    [completedCrop, circularCrop],
    100
  );

  const handleApplyCrop = async () => {
    if (
      !completedCrop ||
      !canvasRef.current
    ) {
      console.error("Missing refs for crop:", {
        hasCompletedCrop: !!completedCrop,
        hasCanvasRef: !!canvasRef.current
      });
      return;
    }

    generateDownload(canvasRef.current, completedCrop);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Crop Image</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <div className="mb-4 max-h-[70vh] overflow-auto flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={circularCrop}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageUrl}
                onLoad={onImageLoad}
                className="max-w-full max-h-[60vh] object-contain"
              />
            </ReactCrop>
          </div>
          <div className="mt-4 hidden">
            <canvas
              ref={canvasRef}
              style={{
                display: 'none',
                objectFit: 'contain',
                width: completedCrop?.width,
                height: completedCrop?.height,
              }}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip Cropping
              </Button>
            )}
            <Button onClick={handleApplyCrop}>
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// This is a separate function for canvas preview
async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
  circular = false
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  // devicePixelRatio slightly increases sharpness on retina displays
  // at the expense of slightly more memory usage.
  const pixelRatio = window.devicePixelRatio;
  // const pixelRatio = 1

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const rotateRads = rotate * Math.PI / 180;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY);
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY);
  // 3) Rotate around the origin
  ctx.rotate(rotateRads);
  // 2) Scale the image
  ctx.scale(scale, scale);
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY);

  // Draw the image
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );

  // Apply circular mask if needed
  if (circular) {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(
      cropX + crop.width * scaleX / 2,
      cropY + crop.height * scaleY / 2,
      Math.min(crop.width, crop.height) * scaleX / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }

  ctx.restore();
}

export default ImageCrop;
