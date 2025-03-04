import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => Promise<void>;
  onCancel: () => void;
  onSkip?: () => void;
  aspect?: number;
  circularCrop?: boolean;
}

export function ImageCrop({
  imageUrl,
  onCropComplete,
  onCancel,
  onSkip,
  aspect = 1,
  circularCrop = false
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) {
      console.error('Missing required data for crop:', { completedCrop, image: !!imgRef.current });
      return;
    }

    setIsProcessing(true);
    try {
      // Get the image data directly from the source
      const response = await fetch('/api/proxy-image?url=' + encodeURIComponent(imageUrl));
      if (!response.ok) {
        throw new Error('Failed to load image through proxy');
      }
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a new image and wait for it to load
      const image = new Image();
      image.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = blobUrl;
      });

      // Create a canvas to draw the cropped image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get 2D context');
      }

      // Calculate scaling factors
      const scaleX = image.naturalWidth / imgRef.current.width;
      const scaleY = image.naturalHeight / imgRef.current.height;

      // Set canvas dimensions to match crop size
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      // Draw the cropped portion
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      // Convert to blob
      const croppedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          0.95
        );
      });

      if (!croppedBlob) {
        throw new Error('Failed to create blob from canvas');
      }

      // Clean up the temporary blob URL
      URL.revokeObjectURL(blobUrl);

      // Upload to S3
      const formData = new FormData();
      formData.append('file', croppedBlob, 'cropped-image.jpg');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      const data = await uploadRes.json();
      const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;
      await onCropComplete(uploadedUrl);

      toast({
        title: 'Success',
        description: 'Image cropped and uploaded successfully',
      });
    } catch (error) {
      console.error('Error in crop process:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area to select the portion of the image you want to keep.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              circularCrop={circularCrop}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageUrl}
                crossOrigin="anonymous"
                onLoad={onImageLoad}
                className="max-h-[500px] object-contain"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  toast({
                    title: 'Error',
                    description: 'Failed to load image for cropping',
                    variant: 'destructive',
                  });
                }}
              />
            </ReactCrop>

            <div className="flex justify-end space-x-2 w-full">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              {onSkip && (
                <Button variant="secondary" onClick={onSkip}>
                  Skip Cropping
                </Button>
              )}
              <Button 
                onClick={handleApplyCrop}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Apply Crop"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ImageCrop;