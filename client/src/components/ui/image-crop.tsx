
import React, { useState, useCallback, useRef } from "react";
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
  onSkip?: () => void;
  aspect?: number;
  circularCrop?: boolean;
}

export function ImageCrop({
  imageUrl,
  aspect = 1,
  circularCrop = false,
  onCropComplete,
  onCancel 
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onLoad = useCallback((img: HTMLImageElement) => {
    imgRef.current = img;
  }, []);

  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop);
  };

  const getCroppedImg = () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    return new Promise<string>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve(croppedImageUrl);
      }, 'image/jpeg', 1);
    });
  };

  const handleApplyCrop = async () => {
    try {
      const croppedImageUrl = await getCroppedImg();
      if (croppedImageUrl) {
        onCropComplete(croppedImageUrl);
      }
    } catch (e) {
      console.error('Error applying crop:', e);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[800px] overflow-hidden">
        <div className="p-4 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-4">Crop Image</h2>
          <div className="mb-4 max-w-full max-h-[400px] overflow-auto">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={handleCropComplete}
              aspect={aspect}
              circularCrop={circularCrop}
            >
              <img
                src={imageUrl}
                alt="Crop me"
                onLoad={e => onLoad(e.currentTarget)}
                style={{ maxWidth: '100%', maxHeight: '400px' }}
              />
            </ReactCrop>
          </div>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleApplyCrop}>
              Apply Crop
            </Button>
          </div>
          <canvas
            ref={canvasRef}
            style={{
              display: 'none',
              width: completedCrop?.width ?? 0,
              height: completedCrop?.height ?? 0
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
