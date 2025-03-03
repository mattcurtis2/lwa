const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      setIsSaving(true);

      // Use a canvas to create the cropped image
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to the crop size
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      // Draw the cropped portion of the image
      ctx?.drawImage(
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

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      console.log('Created cropped image URL:', dataUrl.substring(0, 200) + '...');

      // Extract filename from original image or generate a new one
      let filename;
      if (imageUrl.includes('/')) {
        const urlParts = imageUrl.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        // Keep the extension if it exists, otherwise default to jpg
        const extension = originalFilename.includes('.') ? 
          originalFilename.split('.').pop() : 'jpg';
        filename = `cropped-${originalFilename.split('.')[0]}-${Date.now()}.${extension}`;
      } else {
        filename = `cropped-image-${Date.now()}.jpg`;
      }

      // Save the cropped image
      const response = await fetch('/api/admin/save-cropped-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataUrl,
          fileName: filename,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save cropped image: ${errorData.details || errorData.error}`);
      }

      const { url } = await response.json();
      console.log('Applying crop with URL:', url);

      // Trigger the onCropComplete callback with the URL
      onCropComplete(url);
      onClose();
    } catch (error) {
      console.error('Error completing crop:', error);
      toast({
        title: 'Error',
        description: `Failed to save cropped image: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };