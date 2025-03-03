const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !onCropComplete) return;

    try {
      // Convert the cropped image to a base64 string
      const base64Image = await getCroppedImage(imgRef.current, completedCrop);
      console.log('Created cropped image URL:', base64Image.substring(0, 50) + '...');

      // Create a blob from the base64 data
      // This step is now unnecessary because we send base64 directly.
      // const response = await fetch(base64Image);
      // const blob = await response.blob();

      // Create FormData and append the blob
      // This step is now unnecessary because we send base64 directly.
      // const formData = new FormData();
      // formData.append('image', blob, 'cropped-image.jpg');

      // Upload to the API endpoint that handles S3 uploads
      console.log('Sending image to S3 upload endpoint...');
      const uploadResponse = await fetch('/api/admin/upload-principle-image-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Image }),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed with status: ${uploadResponse.status}, details: ${errorText}`);
      }

      const data = await uploadResponse.json();

      if (!data.url || !data.url.includes('s3.amazonaws.com')) {
        throw new Error(`Invalid S3 URL returned: ${data.url}`);
      }

      console.log('S3 upload successful, URL:', data.url);

      // Return the S3 URL from the server
      onCropComplete(data.url);
    } catch (error) {
      console.error('Error completing crop:', error);
      alert('Failed to upload image to S3. Please try again or contact support.');
      // Do not complete the crop with fallback data
      // Instead, let the user know there was an error
    }
  }, [completedCrop, onCropComplete]);