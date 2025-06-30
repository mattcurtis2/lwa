import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { ImageCrop } from "@/components/ui/image-crop";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Product } from "@db/schema";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  section: z.string().min(1, "Section is required"),
  description: z.string(),
  price: z.string().min(1, "Price is required"),
  imageUrl: z.string().optional().nullable(),
  inStock: z.boolean().default(true),
});

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "",
      section: product?.section ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      imageUrl: product?.imageUrl ?? "",
      inStock: product?.inStock ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof productSchema>) => {
      const res = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: `Product ${product ? "updated" : "created"} successfully`,
      });
      onClose();
    },
  });

  const handleProfilePictureSelect = async (file: File) => {
    if (!file) return;
    try {
      const previewUrl = URL.createObjectURL(file);
      setCropImageUrl(previewUrl);
      setShowCropper(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load image for cropping',
        variant: 'destructive',
      });
    }
  };

  const handleCroppedImage = async (croppedImageUrl: string) => {
    try {
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload cropped image');
      }

      const data = await uploadRes.json();
      const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;
      form.setValue("imageUrl", uploadedUrl);

      setShowCropper(false);
      URL.revokeObjectURL(croppedImageUrl);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl("");

      toast({
        title: 'Success',
        description: 'Image cropped and saved successfully',
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        form.setValue('imageUrl', data[0].url);
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6 max-h-[80vh] overflow-y-auto pr-6">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <div className="relative flex w-full flex-col rounded-lg border border-input bg-background p-4">
                  <div {...getRootProps({ className: cn("w-full rounded-lg border border-dashed p-4", isDragActive && "border-primary") })}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p className="text-center">Drop the files here ...</p>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <label
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed bg-background px-4 py-2 text-center text-sm text-muted-foreground hover:bg-secondary"
                          htmlFor="fileInput"
                        >
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          <span>Upload</span>
                        </label>
                      </div>
                    )}
                  </div>
                  {field.value && (
                    <div className="w-full aspect-video rounded-lg overflow-hidden border mt-4">
                      <img
                        src={field.value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
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
            onSkip={async () => {
              const formData = new FormData();
              const response = await fetch(cropImageUrl);
              const blob = await response.blob();
              formData.append('file', blob);

              const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });

              if (!uploadRes.ok) {
                throw new Error('Failed to upload image');
              }

              const data = await uploadRes.json();
              const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;
              form.setValue("imageUrl", uploadedUrl);

              setShowCropper(false);
              setCropImageUrl("");
            }}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bread">Bread</SelectItem>
                  <SelectItem value="pastry">Pastry</SelectItem>
                  <SelectItem value="vegetable">Vegetable</SelectItem>
                  <SelectItem value="fruit">Fruit</SelectItem>
                  <SelectItem value="eggs">Eggs</SelectItem>
                  <SelectItem value="honey">Honey</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                <Textarea {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="$0.00"
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inStock"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">In Stock</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Mark this product as available for purchase
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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