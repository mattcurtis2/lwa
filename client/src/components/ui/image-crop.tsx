
import React, { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const canvasPreview = async (
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No 2d context');
  }

  const pixelRatio = window.devicePixelRatio;
  const scaleX = img.naturalWidth / img.width;
  const scaleY = img.naturalHeight / img.height;

  canvas.width = Math.floor(crop.width * pixelRatio * scaleX);
  canvas.height = Math.floor(crop.height * pixelRatio * scaleY);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;

  const centerX = img.naturalWidth / 2;
  const centerY = img.naturalHeight / 2;

  ctx.save();
  ctx.translate(-cropX, -cropY);
  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
  );
  ctx.restore();
};

const getCroppedImg = async (
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string
): Promise<string | null> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        resolve(null);
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 'image/jpeg', 0.95);
  });
};

// Simple debounce implementation
function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps: React.DependencyList,
) {
  React.useEffect(() => {
    const timeout = setTimeout(fn, waitTime);
    return () => {
      clearTimeout(timeout);
    };
  }, deps);
}

interface ImageCropProps {
  imageUrl: string;
  aspect?: number;
  circularCrop?: boolean;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
}

export default function ImageCrop({
  imageUrl,
  aspect = 1,
  circularCrop = false,
  onCropComplete,
  onCancel,
  onSkip
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const onLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
  }, []);

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop
        );
      }
    },
    100,
    [completedCrop]
  );

  const handleComplete = async () => {
    if (
      completedCrop?.width &&
      completedCrop?.height &&
      imgRef.current &&
      previewCanvasRef.current
    ) {
      console.log('Crop completed:', completedCrop);
      const croppedImageUrl = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'cropped-image.jpg'
      );
      console.log('Created cropped image URL:', croppedImageUrl);
      if (croppedImageUrl) {
        console.log('Applying crop with URL:', croppedImageUrl);
        onCropComplete(croppedImageUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Crop Image</h2>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col space-y-4">
            <div className="relative">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop={circularCrop}
                keepSelection
              >
                <img
                  src={imageUrl}
                  alt="Crop"
                  onLoad={(e) => onLoad(e.currentTarget)}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-center">
              <canvas
                ref={previewCanvasRef}
                className={`max-w-40 max-h-40 ${
                  circularCrop ? 'rounded-full' : ''
                } border`}
                style={{
                  objectFit: 'contain',
                  display: completedCrop ? 'block' : 'none'
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {onSkip && (
              <Button variant="outline" onClick={onSkip}>
                Skip Cropping
              </Button>
            )}
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleComplete}>
              Apply Crop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
