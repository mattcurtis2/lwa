import { useCallback, useRef, useState, type SyntheticEvent } from "react";
import { getProxiedImageUrl } from "@/lib/upload-utils";
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (
    croppedImageUrl: string,
    cropData: { x: number; y: number; width: number; height: number },
  ) => void;
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
  circularCrop = false,
}: ImageCropProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const onImageLoad = useCallback(
    (e: SyntheticEvent<HTMLImageElement>) => {
      if (!aspect) return;

      const { width, height } = e.currentTarget;
      const nextCrop = centerAspectCrop(width, height, aspect);
      setCrop(nextCrop);
      // Seed completedCrop so Apply Crop works without requiring a drag first
      setCompletedCrop(convertToPixelCrop(nextCrop, width, height));
    },
    [aspect],
  );

  const createCroppedImage = useCallback(async () => {
    try {
      setIsProcessing(true);

      const image = imgRef.current;
      if (!image) {
        console.error("[ImageCrop] Missing image reference");
        toast({
          title: "Crop failed",
          description: "Image is not ready yet. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      let activeCrop = completedCrop;
      if (
        (!activeCrop || !activeCrop.width || !activeCrop.height) &&
        crop
      ) {
        activeCrop = convertToPixelCrop(crop, image.width, image.height);
        setCompletedCrop(activeCrop);
      }

      if (!activeCrop || !activeCrop.width || !activeCrop.height) {
        console.error("[ImageCrop] Invalid crop data or image reference");
        toast({
          title: "Crop failed",
          description: "Adjust the crop area, then click Apply Crop.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("[ImageCrop] Failed to get 2D context");
        toast({
          title: "Crop failed",
          description: "Could not process the image. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = activeCrop.width * pixelRatio;
      canvas.height = activeCrop.height * pixelRatio;

      ctx.scale(pixelRatio, pixelRatio);
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      ctx.drawImage(
        image,
        activeCrop.x * scaleX,
        activeCrop.y * scaleY,
        activeCrop.width * scaleX,
        activeCrop.height * scaleY,
        0,
        0,
        activeCrop.width,
        activeCrop.height,
      );

      const cropData = {
        x: activeCrop.x,
        y: activeCrop.y,
        width: activeCrop.width,
        height: activeCrop.height,
      };

      const croppedImageUrl = await new Promise<string>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create image blob"));
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read cropped image"));
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.95,
        );
      });

      onCropComplete(croppedImageUrl, cropData);
      setIsProcessing(false);
    } catch (error) {
      console.error("[ImageCrop] Error during cropping:", error);
      toast({
        title: "Crop failed",
        description:
          error instanceof Error ? error.message : "Could not crop the image.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  }, [completedCrop, crop, onCropComplete, toast]);

  const processedImageUrl = getProxiedImageUrl(imageUrl);
  const canApply =
    Boolean(completedCrop?.width && completedCrop?.height) ||
    Boolean(crop?.width && crop?.height);

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Adjust the crop area to select the portion of the image you want to
            use.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 overflow-y-auto max-h-[calc(70vh-8rem)]">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop={circularCrop}
          >
            <img
              ref={imgRef}
              src={processedImageUrl}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full h-auto"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {onSkip && (
              <Button variant="outline" onClick={onSkip} className="ml-2">
                Skip Cropping
              </Button>
            )}
          </div>
          <Button
            onClick={createCroppedImage}
            disabled={isProcessing || !canApply}
          >
            {isProcessing ? "Processing..." : "Apply Crop"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ImageCrop;
