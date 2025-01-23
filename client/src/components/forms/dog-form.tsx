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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dog, DogMedia } from "@db/schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageCropper from "@/components/ui/image-cropper";

const mediaSchema = z.object({
  url: z.string().min(1, "Media URL or file path is required"),
  type: z.enum(["image", "video"]),
  fileName: z.string().optional(),
});

const dogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registrationName: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  description: z.string().optional().nullable(),
  motherId: z.number().optional().nullable(),
  fatherId: z.number().optional().nullable(),
  litterId: z.number().optional().nullable(),
  profileImageUrl: z.string().optional().nullable(),
  healthData: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  dewclaws: z.string().optional().nullable(),
  furLength: z.string().optional().nullable(),
  height: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  pedigree: z.string().optional().nullable(),
  narrativeDescription: z.string().optional().nullable(),
  media: z.array(mediaSchema).optional().default([]),
  outsideBreeder: z.boolean().optional().default(false),
  puppy: z.boolean().optional().default(false),
  available: z.boolean().optional().default(false),
  price: z.string().optional().nullable().transform((val) => val ? parseFloat(val) : null),
});

interface DogFormProps {
  dog?: Dog & { media?: DogMedia[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DogForm({ dog, open, onOpenChange }: DogFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>("");
  const [mediaInputs, setMediaInputs] = useState<Array<{ url: string; type: "image" | "video"; fileName?: string }>>([]);

  const form = useForm<z.infer<typeof dogSchema>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      registrationName: null,
      birthDate: null,
      gender: null,
      description: null,
      profileImageUrl: null,
      healthData: null,
      color: null,
      dewclaws: null,
      furLength: null,
      height: null,
      weight: null,
      pedigree: null,
      narrativeDescription: null,
      media: [],
      outsideBreeder: false,
      puppy: false,
      available: false,
      price: null,
    },
  });

  const handleProfilePictureUpload = async (file: File) => {
    setIsUploadingProfile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload profile picture");
      }

      const data = await res.json();
      setCropImageUrl(data.url);
      setShowCropper(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleCroppedImage = async (croppedImageUrl: string) => {
    form.setValue("profileImageUrl", croppedImageUrl);
    setShowCropper(false);
    setCropImageUrl("");
  };

  const removeMediaInput = (index: number) => {
    const newInputs = [...mediaInputs];
    newInputs.splice(index, 1);
    setMediaInputs(newInputs);
    form.setValue("media", newInputs);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95vw] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{dog ? "Edit Dog" : "Add New Dog"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-6 pt-6">
            {/* Form fields here */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 relative group">
                      <AvatarImage src={field.value || ""} alt="Profile picture" />
                      <AvatarFallback>
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </AvatarFallback>
                      {field.value && (
                        <div
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(field.value || "");
                            setShowCropper(true);
                          }}
                        >
                          <Upload className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </Avatar>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploadingProfile}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            handleProfilePictureUpload(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploadingProfile ? "Uploading..." : "Upload Profile Picture"}
                    </Button>
                  </div>
                  <FormDescription>
                    Upload a profile picture (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Pictures & Videos</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddMedia(true)}
                  disabled={isUploading}
                >
                  Add Media
                </Button>
              </div>
              <div className="space-y-4">
                {mediaInputs.map((input, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted"
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {input.fileName || input.url.split('/').pop()}
                        </p>
                        <p className="text-xs text-muted-foreground truncate" title={input.url}>
                          {input.url}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => removeMediaInput(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button type="submit">
                {dog ? "Save Changes" : "Add Dog"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>

      {showCropper && cropImageUrl && (
        <ImageCropper
          src={cropImageUrl}
          onComplete={handleCroppedImage}
          onClose={() => {
            setShowCropper(false);
            setCropImageUrl("");
          }}
          aspect={1}
        />
      )}
    </Sheet>
  );
}