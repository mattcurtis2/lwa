import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ImageCropper from "@/components/ui/image-cropper";

const formSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string(),
});

export function CMDContentForm() {
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: heroContent } = useQuery({
    queryKey: ['/api/dogs-hero'],
    queryFn: async () => {
      const res = await fetch('/api/dogs-hero');
      if (!res.ok) throw new Error('Failed to fetch hero content');
      return res.json();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      title: heroContent?.[0]?.title || "",
      subtitle: heroContent?.[0]?.subtitle || "",
      imageUrl: heroContent?.[0]?.imageUrl || "",
    },
  });

  const handleCropComplete = async (croppedUrl: string) => {
    try {
      // Convert the cropped data URL to a blob
      const response = await fetch(croppedUrl);
      if (!response.ok) throw new Error('Failed to fetch cropped image');

      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'hero-image.jpg');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');

      const { url } = await uploadRes.json();
      form.setValue('imageUrl', url);

      toast({
        title: 'Success',
        description: 'Hero image updated successfully',
      });

      setCropperOpen(false);
    } catch (error) {
      console.error('Error handling cropped image:', error);
      toast({
        title: 'Error',
        description: 'Failed to save cropped image',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');

      const { url } = await uploadRes.json();
      setImageToEdit(url);
      setCropperOpen(true);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await fetch(`/api/dogs-hero/${heroContent?.[0]?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update content');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dogs-hero'] });
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <>
      <ImageCropper
        imageUrl={imageToEdit}
        onCropComplete={handleCropComplete}
        open={cropperOpen}
        onOpenChange={setCropperOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Title</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Subtitle</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Image</FormLabel>
                <FormControl>
                  <FileUpload
                    value={field.value}
                    onChange={field.onChange}
                    onFileSelect={handleFileSelect}
                  />
                </FormControl>
                {field.value && (
                  <div className="relative group">
                    <img
                      src={field.value}
                      alt="Hero"
                      className="mt-2 rounded-lg max-h-48 object-cover cursor-pointer"
                      onClick={() => {
                        setImageToEdit(field.value);
                        setCropperOpen(true);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white">Click to crop</p>
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </>
  );
}