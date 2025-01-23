import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CarouselItem } from "@db/schema";
import { FileUpload } from "@/components/ui/file-upload";

const carouselItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
});

interface CarouselFormProps {
  item?: CarouselItem;
  onClose: () => void;
}

export default function CarouselForm({ item, onClose }: CarouselFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(carouselItemSchema),
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
      imageUrl: item?.imageUrl ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof carouselItemSchema>) => {
      const res = await fetch(item ? `/api/carousel/${item.id}` : "/api/carousel", {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save carousel item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
      toast({
        title: "Success",
        description: `Carousel item ${item ? "updated" : "created"} successfully`,
      });
      onClose();
    },
  });

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image");

      const { url } = await uploadRes.json();
      form.setValue("imageUrl", url, { shouldValidate: true });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
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
              <div className="space-y-4">
                <FormControl>
                  <div className="space-y-4">
                    <FileUpload
                      value={field.value}
                      onFileSelect={handleImageUpload}
                      onChange={field.onChange}
                    />
                    <div className="- or text-center text-sm text-muted-foreground">or</div>
                    <Input
                      placeholder="Enter image URL..."
                      {...field}
                    />
                  </div>
                </FormControl>
                {field.value && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={field.value}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}