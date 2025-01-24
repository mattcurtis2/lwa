
import { useState, useRef } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number;
  onCropComplete: (croppedImageUrl: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  circularCrop?: boolean;
}

export default function ImageCropper({
  imageUrl,
  aspectRatio,
  onCropComplete,
  open,
  onOpenChange,
  circularCrop = false,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: aspectRatio ? 90 * aspectRatio : 90,
    x: 5,
    y: 5,
  });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const getCroppedImg = async () => {
    console.log('getCroppedImg called with:', { completedCrop, imageRef: !!imageRef.current });
    
    if (!imageRef.current || !completedCrop) {
      console.error('Missing required refs:', { 
        hasImageRef: !!imageRef.current, 
        hasCompletedCrop: !!completedCrop 
      });
      return;
    }

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    console.log('Crop dimensions:', {
      width: completedCrop.width,
      height: completedCrop.height,
      x: completedCrop.x,
      y: completedCrop.y,
      scaleX,
      scaleY
    });

    canvas.width = completedCrop.width! * scaleX;
    canvas.height = completedCrop.height! * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x! * scaleX,
      completedCrop.y! * scaleY,
      completedCrop.width! * scaleX,
      completedCrop.height! * scaleY,
      0,
      0,
      completedCrop.width! * scaleX,
      completedCrop.height! * scaleY
    );

    if (circularCrop) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 2;
      
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return new Promise<string>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          reject(new Error('Failed to create blob'));
          return;
        }
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve(croppedImageUrl);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    console.log('handleCropComplete called with completedCrop:', completedCrop);
    
    if (!completedCrop) {
      console.error('No completed crop data available');
      return;
    }
    
    try {
      const croppedImageUrl = await getCroppedImg();
      console.log('Cropped image URL generated:', !!croppedImageUrl);
      
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
        onOpenChange(false);
      } else {
        console.error('Failed to generate cropped image URL');
      }
    } catch (error) {
      console.error('Error during crop completion:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Crop Image</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="flex flex-col items-center gap-4 pb-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop me"
                className="max-w-full"
              />
            </ReactCrop>
            <div className="flex justify-end gap-4 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCropComplete}>
                Apply Crop
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
