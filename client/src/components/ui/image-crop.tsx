
import { useState, useRef, useCallback } from 'react';
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
  )
}

export function ImageCrop({
  imageUrl,
  aspect = 1,
  circularCrop = false,
  onCropComplete,
  onCancel,
  onSkip
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }, [aspect]);

  async function canvasPreview(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop,
    scale = 1,
    rotate = 0,
  ) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);

    // Apply rotation if necessary
    if (rotate) {
      ctx.translate(centerX, centerY);
      ctx.rotate(rotate * Math.PI / 180);
      ctx.translate(-centerX, -centerY);
    }

    // Apply scale if necessary
    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

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

    ctx.restore();
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        canvasRef.current
      ) {
        await canvasPreview(
          imgRef.current,
          canvasRef.current,
          completedCrop,
        );
      }
    },
    100,
    [completedCrop],
  );

  const handleApplyCrop = async () => {
    try {
      if (!completedCrop || !canvasRef.current) {
        console.error('No crop data or canvas reference');
        return;
      }

      setIsLoading(true);

      // Generate the cropped image as a blob URL
      const canvas = canvasRef.current;
      const croppedImageUrl = canvas.toDataURL('image/jpeg');

      // Convert data URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const croppedImageBlobUrl = URL.createObjectURL(blob);

      console.log('Created cropped image URL:', croppedImageBlobUrl);
      console.log('Applying crop with URL:', croppedImageBlobUrl);

      // Call the provided callback with the cropped image URL
      onCropComplete(croppedImageBlobUrl);
    } catch (error) {
      console.error('Error applying crop:', error);
    } finally {
      setIsLoading(false);
    }
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
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip} disabled={isLoading}>
                Skip Cropping
              </Button>
            )}
            <Button onClick={handleApplyCrop} disabled={!completedCrop || isLoading}>
              {isLoading ? 'Applying...' : 'Apply Crop'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add a default export that re-exports the named export
export default ImageCrop;
