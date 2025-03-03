import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageCrop from '@/components/admin/image-crop';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import type { PrincipleFormValues } from './types';


const PrincipleForm = ({ principle }: { principle?: Principle }) => {
  const form = useForm<PrincipleFormValues>({
    defaultValues: {
      title: principle?.title || '',
      description: principle?.description || '',
      imageUrl: principle?.imageUrl || '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false); // Added for upload status

  const handleCropComplete = async (croppedUrl: string) => {
    console.log('Crop completed, setting cropped image:', croppedUrl?.substring(0, 50) + '...');
    
    setIsUploading(true);
    try {
      // Upload to S3
      const s3Url = await handleUploadImage(croppedUrl);
      if (s3Url) {
        console.log('Image uploaded to S3 successfully:', s3Url);
        form.setValue('imageUrl', s3Url);
      } else {
        throw new Error('Failed to get S3 URL from server');
      }
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      toast({
        title: 'Image upload failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Convert file to data URL for the image cropper
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCropImageUrl(dataUrl);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async (croppedUrl: string) => {
    try {
      if (!croppedUrl || !croppedUrl.startsWith('data:image')) {
        throw new Error('Invalid image data');
      }

      // Create a FormData object to send the image
      const formData = new FormData();

      // Convert base64 to a blob
      const base64Response = await fetch(croppedUrl);
      const blob = await base64Response.blob();
      
      if (!blob || blob.size === 0) {
        throw new Error('Failed to convert image to blob');
      }

      const filename = `principle-${principle?.id || 'new'}-${Date.now()}.jpg`;
      formData.append('file', blob, filename);

      // Upload the image to S3 using the general upload endpoint
      console.log('Uploading principle image to S3...', filename);
      console.log('Blob size:', blob.size, 'bytes');
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorData.message || errorData.details || 'Upload failed';
          console.error('Upload error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        throw new Error(`Failed to upload image: ${errorMessage}`);
      }

      // Get the S3 URL from the response
      const uploadData = await uploadResponse.json();
      
      if (!uploadData || !uploadData[0] || !uploadData[0].url) {
        console.error('Invalid upload response:', uploadData);
        throw new Error('Server returned invalid upload data');
      }
      
      console.log('S3 upload successful:', uploadData[0].url);
      return uploadData[0].url;
    } catch (error) {
      console.error('Error during S3 upload:', error);
      throw error;
    }
  };


  const onSubmit = async (values: PrincipleFormValues) => {
    setIsSubmitting(true);
    try {
      let finalValues = { ...values };

      if (values.imageUrl && values.imageUrl.startsWith('data:image')) {
        console.log('Detected base64 image, uploading to S3 first...');
        //this section now handled by handleCropComplete
      }

      let response;

      if (principle?.id) {
        // Update existing principle
        console.log('Updating principle with data:', finalValues);
        response = await fetch(`/api/principles/${principle.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalValues),
        });
      } else {
        // Create new principle
        console.log('Creating new principle with data:', finalValues);
        response = await fetch('/api/principles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalValues),
        });
      }

      if (response.ok) {
        toast({
          title: 'Principle saved!',
          description: 'Your principle has been saved successfully.',
        });
        // Optionally, navigate to the principle list page or refresh the page
      } else {
        const errorData = await response.json();
        throw new Error(`Failed to save principle: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error saving principle',
        description: `An error occurred while saving the principle: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Principle Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Principle Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.setValue('imageUrl', '');
                  }}
                >
                  Remove
                </Button>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="max-w-xs"
                />

                {showCropper && (
                  <ImageCrop
                    imageUrl={cropImageUrl}
                    onClose={() => setShowCropper(false)}
                    onCropComplete={handleCropComplete}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? 'Saving...' : isUploading ? 'Uploading...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
};

export default PrincipleForm;