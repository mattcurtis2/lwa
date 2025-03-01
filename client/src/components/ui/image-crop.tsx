
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
    // devicePixelRatio slightly increases sharpness on retina displays
    // at the expense of slightly slower render times and slightly more memory use.
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

    // Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY);
    // Move the origin to the center of the original position
    ctx.translate(centerX, centerY);
    // Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY);
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

    if (circularCrop && ctx) {
      // Draw circular mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      const radius = Math.min(canvas.width, canvas.height) / 2;
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, 2 * Math.PI, true);
      ctx.fill();
    }

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
    [completedCrop, circularCrop],
  );

  async function handleApplyCrop() {
    try {
      console.log("Crop completed:", completedCrop);
      setIsLoading(true);
      
      if (!completedCrop || !canvasRef.current) {
        throw new Error('Crop not complete');
      }

      // Convert canvas to blob
      const canvas = canvasRef.current;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) throw new Error('Canvas to Blob conversion failed');
          resolve(blob);
        }, 'image/jpeg', 0.95);
      });

      // Create URL for the blob
      const croppedImageUrl = URL.createObjectURL(blob);
      console.log("Created cropped image URL:", croppedImageUrl);
      console.log("Applying crop with URL:", croppedImageUrl);
      
      // Upload the cropped image
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload cropped image');
      }
      
      const data = await response.json();
      console.log("Upload response:", data);
      
      const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;
      onCropComplete(uploadedUrl);
      
    } catch (error) {
      console.error('Error applying crop:', error);
    } finally {
      setIsLoading(false);
    }
  }

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
