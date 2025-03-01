
import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './button';
import { X } from 'lucide-react';
import { useDebounceEffect } from '@/lib/useDebounceEffect';

interface ImageCropProps {
  imageUrl: string;
  aspect?: number;
  circularCrop?: boolean;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
}

function ImageCrop({
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

  function getCroppedImg(
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      canvas.width = crop.width;
      canvas.height = crop.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const url = URL.createObjectURL(blob);
          resolve(url);
        },
        'image/jpeg',
        0.95
      );
    });
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

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    // devicePixelRatio slightly increases sharpness on retina displays
    // at the expense of slightly slower render times and possibly minor
    // visual artifacts
    const pixelRatio = window.devicePixelRatio;
    // const pixelRatio = 1

    canvas.width = Math.floor(crop.width * pixelRatio);
    canvas.height = Math.floor(crop.height * pixelRatio);

    // Fill the canvas with white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const centerX = img.naturalWidth / 2;
    const centerY = img.naturalHeight / 2;

    ctx.save();

    // If we want a circular crop (and the crop is square)
    if (circularCrop && crop.width === crop.height) {
      // Move the canvas origin to the center of the canvas
      ctx.translate(crop.width / 2, crop.height / 2);
      // Create a circular clip area
      ctx.beginPath();
      ctx.arc(0, 0, crop.width / 2, 0, Math.PI * 2);
      ctx.clip();
      // Move back to draw the image centered
      ctx.translate(-crop.width / 2, -crop.height / 2);
    }

    // Draw the image
    ctx.drawImage(
      img,
      cropX,
      cropY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    ctx.restore();
  };

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

// Export both as default and named export
export { ImageCrop };
export default ImageCrop;
