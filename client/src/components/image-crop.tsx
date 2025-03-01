interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string, croppedFile?: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const handleCrop = () => {
    try {
      if (typeof cropperRef.current?.cropper !== "undefined") {
        // Get crop data to log what's being cropped
        const cropData = cropperRef.current?.cropper.getData();
        console.log("Crop completed:", cropData);

        const croppedCanvas = cropperRef.current?.cropper.getCroppedCanvas({
          maxWidth: 800,
          maxHeight: 800,
          fillColor: "#fff",
          imageSmoothingEnabled: true,
          imageSmoothingQuality: "high",
        });

        if (croppedCanvas) {
          const croppedImageUrl = croppedCanvas.toDataURL("image/jpeg", 0.9);
          console.log("Created cropped image URL:", croppedImageUrl.substring(0, 200) + "...");
          console.log("Applying crop with URL:", croppedImageUrl.substring(0, 200) + "...");
          const blob = await new Promise((resolve) => {
            croppedCanvas.toBlob(resolve, "image/jpeg", 0.9);
          });
          const croppedFile = new File([blob!], "cropped.jpg", { type: "image/jpeg" });
          onCropComplete(croppedImageUrl, croppedFile);
        }
      }
    } catch (error) {
      console.error("Error during crop:", error);
    }
  };