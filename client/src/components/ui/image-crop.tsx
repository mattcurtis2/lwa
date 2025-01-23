import { useState } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ImageCropProps {
  imageUrl: string;
  aspect?: number;
  circularCrop?: boolean;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

export function ImageCrop({ 
  imageUrl, 
  aspect,
  circularCrop = false,
  onCropComplete,
  onCancel 
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: aspect ? 80 : 60, // Different default height for free-form
    x: 10,
    y: 10,
  });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [lockAspectRatio, setLockAspectRatio] = useState(!!aspect);

  const getCroppedImg = async (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    // Draw the cropped image
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

    // If circular crop is enabled, create circular mask
    if (circularCrop) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        crop.width / 2,
        crop.height / 2,
        Math.min(crop.width, crop.height) / 2,
        0,
        2 * Math.PI,
        true
      );
      ctx.fill();
    }

    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(URL.createObjectURL(blob));
        },
        'image/jpeg',
        1
      );
    });
  };

  const handleCropComplete = async () => {
    if (!imageRef || !crop) return;

    try {
      const croppedImageUrl = await getCroppedImg(imageRef, crop);
      onCropComplete(croppedImageUrl);
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-screen-lg">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="aspect-ratio"
                checked={lockAspectRatio}
                onCheckedChange={setLockAspectRatio}
              />
              <Label htmlFor="aspect-ratio">Lock aspect ratio (square)</Label>
            </div>
          </div>
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              aspect={lockAspectRatio ? 1 : undefined}
              circularCrop={circularCrop}
              className={circularCrop ? "rounded-full overflow-hidden" : ""}
            >
              <img
                ref={(ref) => setImageRef(ref)}
                src={imageUrl}
                alt="Crop preview"
                style={{ maxHeight: '70vh' }}
              />
            </ReactCrop>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleCropComplete} disabled={!crop}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}