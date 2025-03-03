const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !previewCanvasRef.current) return;

    console.log('Crop completed:', completedCrop);

    // Generate the cropped image
    const canvas = previewCanvasRef.current;
    const image = imageRef.current;

    if (!image) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('No 2d context');
      return;
    }

    const pixelRatio = window.devicePixelRatio;

    canvas.width = completedCrop.width * pixelRatio;
    canvas.height = completedCrop.height * pixelRatio;

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL('image/jpeg', 0.95);
    console.log('Created cropped image URL:', base64Image.substring(0, 500) + '...');

    try {
      // Convert base64 to blob for upload
      const fetchResponse = await fetch(base64Image);
      const blob = await fetchResponse.blob();

      // Create FormData and append the blob
      const formData = new FormData();
      formData.append('image', blob, 'cropped-image.jpg');

      // Upload to the API endpoint that handles S3 uploads
      const response = await fetch('/api/admin/upload-principle-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Applying crop with URL:', data.url);

      // Return the S3 URL from the server
      onCropComplete(data.url);
    } catch (error) {
      console.error('Error completing crop:', error);
      // Fall back to base64 if upload fails
      onCropComplete(base64Image);
    }
  }, [completedCrop, onCropComplete]);