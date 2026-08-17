const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !onCropComplete) return;

    try {
      // Convert the cropped image to a base64 string
      const base64Image = await getCroppedImage(imgRef.current, completedCrop);
      console.log('Created cropped image URL:', base64Image.substring(0, 50) + '...');

      const blob = await (await fetch(base64Image)).blob();
      const formData = new FormData();
      formData.append("file", blob, "cropped-image.jpg");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed with status: ${uploadResponse.status}, details: ${errorText}`);
      }

      const data = await uploadResponse.json();
      const url = Array.isArray(data) ? data[0]?.url : data.url;

      if (!url || typeof url !== "string" || !url.startsWith("http")) {
        throw new Error(`Invalid upload URL returned: ${url}`);
      }

      onCropComplete(url);
    } catch (error) {
      console.error('Error completing crop:', error);
      alert('Failed to upload image. Please try again or contact support.');
      // Do not complete the crop with fallback data
      // Instead, let the user know there was an error
    }
  }, [completedCrop, onCropComplete]);

// Apply the crop to the image
  const applyCrop = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    console.log("Applying crop with URL:", imageRef.current);

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('No 2d context');
      return;
    }

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    // Convert to blob for upload instead of using data URL directly
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
        return;
      }

      try {
        console.log("Uploading cropped image to S3...");

        // Create a file from the blob for upload
        const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });

        // Upload directly to S3 through our API
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Use the S3 URL from the response
        if (data && data.url) {
          console.log("Image uploaded to S3:", data.url);
          imageRef.current = data.url;
          onCropComplete && onCropComplete(data.url);
        } else {
          throw new Error('Invalid upload response - no URL returned');
        }
      } catch (error) {
        console.error("Failed to upload cropped image to S3:", error);
        // Fall back to data URL only if S3 upload fails
        const base64 = canvas.toDataURL('image/jpeg');
        imageRef.current = base64;
        onCropComplete && onCropComplete(base64);
      } finally {
        onClose && onClose();
      }
    }, 'image/jpeg', 0.95);
  }, [completedCrop, onCropComplete, onClose]);

const handleApplyCrop = useCallback(async () => {
    if (completedCrop) {
      try {
        const croppedImageUrl = await getCroppedImg(
          imgRef.current,
          completedCrop,
          'newFile.jpg'
        );
        console.log('Applying crop with URL:', croppedImageUrl);

        // For debugging - log the start of the URL to check it's a base64 image
        if (croppedImageUrl && croppedImageUrl.startsWith('data:image/')) {
          console.log('Successfully created base64 image of length:', croppedImageUrl.length);
        } else {
          console.warn('Created image is not in expected base64 format');
        }

        onCropComplete(croppedImageUrl);
        onClose();
      } catch (e) {
        console.error('Error applying crop:', e);
      }
    }
  }, [completedCrop, onCropComplete, onClose]);