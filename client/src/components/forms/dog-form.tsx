import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format, parse } from "date-fns";
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
import { Dog, DogMedia } from "@db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { X, Upload } from "lucide-react";

const mediaSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["image", "video"]),
  fileName: z.string().optional(),
});

const dogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.string().refine((date) => {
    try {
      const parsedDate = parse(date, 'MM/dd/yyyy', new Date());
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    } catch {
      return false;
    }
  }, "Please enter a valid date in MM/DD/YYYY format"),
  description: z.string(),
  media: z.array(mediaSchema),
});

interface DogFormProps {
  dog?: Dog & { media?: DogMedia[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
}

export default function DogForm({ dog, open, onOpenChange }: DogFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof dogSchema>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      birthDate: format(new Date(), 'MM/dd/yyyy'),
      description: "",
      media: [],
    },
  });

  // Reset form when editing a different dog
  useEffect(() => {
    if (dog) {
      const media = dog.media?.map(m => ({
        url: m.url,
        type: m.type as "image" | "video",
        isNew: false,
      })) || [];

      form.reset({
        name: dog.name,
        birthDate: format(new Date(dog.birthDate), 'MM/dd/yyyy'),
        description: dog.description ?? "",
        media,
      });
      setMediaInputs(media);
    } else {
      form.reset({
        name: "",
        birthDate: format(new Date(), 'MM/dd/yyyy'),
        description: "",
        media: [],
      });
      setMediaInputs([]);
    }
  }, [dog, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof dogSchema>) => {
      const parsedDate = parse(values.birthDate, 'MM/dd/yyyy', new Date());
      const formattedValues = {
        ...values,
        breed: "Colorado Mountain Dog",
        birthDate: format(parsedDate, 'yyyy-MM-dd'),
      };

      const res = await fetch(dog ? `/api/dogs/${dog.id}` : "/api/dogs", {
        method: dog ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
      toast({
        title: "Success",
        description: `Dog ${dog ? "updated" : "created"} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await res.json();
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';

      const newMedia = {
        url: data.url,
        type: fileType,
        fileName: file.name,
        isNew: true,
      };

      const newInputs = [newMedia, ...mediaInputs];
      setMediaInputs(newInputs);
      form.setValue("media", newInputs);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeMediaInput = (index: number) => {
    const newInputs = [...mediaInputs];
    newInputs.splice(index, 1);
    setMediaInputs(newInputs);
    form.setValue("media", newInputs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dog ? "Edit Dog" : "Add New Dog"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
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
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date (MM/DD/YYYY)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="MM/DD/YYYY" />
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Media</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*,video/*';
                    fileInput.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    };
                    fileInput.click();
                  }}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? "Uploading..." : "Upload Media"}
                </Button>
              </div>

              <div className="space-y-4">
                {mediaInputs.map((input, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg ${input.isNew ? 'bg-primary/5 border border-primary/20' : 'bg-muted'}`}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 relative shrink-0">
                        {input.type === 'image' ? (
                          <img
                            src={input.url}
                            alt="Preview"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <video
                            src={input.url}
                            className="w-full h-full object-cover rounded"
                            controls
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {input.fileName || input.url.split('/').pop()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {input.type.charAt(0).toUpperCase() + input.type.slice(1)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMediaInput(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}