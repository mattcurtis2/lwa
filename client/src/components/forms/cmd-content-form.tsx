
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useCallback, useState } from "react";
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";
import { X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { ImageCrop } from "@/components/ui/image-crop";

const formSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string(),
});

export function CMDContentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");

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

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      form.setValue("imageUrl", data.url);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': []
    },
    maxSize: 10485760, // 10MB
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setCropImageUrl(previewUrl);
        setShowCropper(true);
      }
    },
    onDropRejected: () => {
      toast({
        title: "Error",
        description: "File type not supported or file is too large (max 10MB)",
        variant: "destructive",
      });
    }
  });

  const handleCroppedImage = async (croppedImageUrl: string) => {
    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'hero-image.jpg');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload cropped image');
      }

      const data = await uploadRes.json();
      form.setValue("imageUrl", data.url);
      setShowCropper(false);

      URL.revokeObjectURL(croppedImageUrl);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl("");

      toast({
        title: 'Success',
        description: 'Hero image updated successfully',
      });
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload cropped image',
        variant: 'destructive',
      });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
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
              <div className="space-y-4">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
                    isDragActive && "border-primary bg-accent"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="h-10 w-10" />
                    <p className="text-sm text-center">
                      {isDragActive 
                        ? "Drop your image here..."
                        : "Drag & drop an image here, or click to select"
                      }
                    </p>
                  </div>
                </div>
                {field.value && (
                  <div className="relative group aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={field.value}
                      alt="Hero"
                      className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                      onClick={() => {
                        setCropImageUrl(field.value);
                        setShowCropper(true);
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => field.onChange("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                )}
              </div>
            </FormItem>
          )}
        />
        {showCropper && cropImageUrl && (
          <ImageCrop
            imageUrl={cropImageUrl}
            onCropComplete={handleCroppedImage}
            onCancel={() => {
              setShowCropper(false);
              setCropImageUrl("");
            }}
          />
        )}
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
