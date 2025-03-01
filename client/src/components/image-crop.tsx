interface ImageCropProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string, croppedFile?: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

const handleCrop = async () => {
    if (completedCrop) {
      console.log("Crop completed:", completedCrop);

      const canvas = document.createElement('canvas');
      const crop = completedCrop;
      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const ctx = canvas.getContext('2d');

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

      const base64Image = canvas.toDataURL('image/jpeg');
      console.log("Created cropped image URL:", base64Image);

      try {
        // Convert base64 to blob
        const response = await fetch(base64Image);
        const blob = await response.blob();
        console.log("Processing cropped image:", base64Image.substring(0, 100) + "...");

        // Create a file from the blob
        const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        console.log("Created file from URL:", file.size, "bytes");

        // Upload file to server
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload cropped image');
        }

        const data = await uploadRes.json();
        console.log("Upload response:", data);

        // Return the file URL from the server response
        if (data && data.length > 0) {
          onCropComplete(data[0].url);
        } else {
          throw new Error('Invalid upload response');
        }
      } catch (error) {
        console.error("Error processing cropped image:", error);
        // Pass the base64 image as fallback
        onCropComplete(base64Image);
      }
    }
  };