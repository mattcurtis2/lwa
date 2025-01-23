import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
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
import { formatApiDate, formatInputDate, parseApiDate } from "@/lib/date-utils";
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
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>("");
  const [mediaInputs, setMediaInputs] = useState<Array<{ url: string; type: "image" | "video" }>>([]);

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95vw] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{dog ? "Edit Dog" : "Add New Dog"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => console.log(data))} className="space-y-6 pt-6">
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

            {/* Add other form fields here as needed */}
            <FormField
              control={form.control}
              name="registrationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional" />
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
                  <FormLabel>Birth Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sex</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <label htmlFor="male" className="flex items-center gap-1">
                          Male <span className="text-blue-500">♂</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <label htmlFor="female" className="flex items-center gap-1">
                          Female <span className="text-pink-500">♀</span>
                        </label>
                      </div>
                    </RadioGroup>
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
              name="outsideBreeder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Outside Breeder</FormLabel>
                    <FormDescription>
                      Mark this if the dog is from an outside breeding program
                    </FormDescription>
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
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="puppy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Puppy</FormLabel>
                      <FormDescription>
                        Mark this if the dog is a puppy
                      </FormDescription>
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
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available</FormLabel>
                      <FormDescription>
                        Mark this if the dog is available for purchase
                      </FormDescription>
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
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter price (optional)"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Set a price if the dog is available for sale
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            <FormField
              control={form.control}
              name="narrativeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narrative Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Detailed description of the dog's personality, training, and characteristics" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., White with brown markings" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (inches)</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (lbs)</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="furLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fur Length</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Medium length, double coat" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dewclaws"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dewclaws</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Removed, Natural" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="healthData"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Information</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Health certifications, testing results, etc." />
                  </FormControl>
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-sm text-muted-foreground">Health Documents</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleDocumentUpload(file, 'health');
                          };
                          input.click();
                        }}
                        disabled={isUploadingDoc}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploadingDoc ? "Uploading..." : "Upload Document"}
                      </Button>
                    </div>
                    <DocumentList documents={healthDocuments} type="health" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pedigree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedigree Information</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Family history and lineage information" />
                  </FormControl>
                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-sm text-muted-foreground">Pedigree Documents</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingDoc}
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              handleDocumentUpload(file, 'pedigree');
                            }
                          };
                          input.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploadingDoc ? "Uploading..." : "Upload Document"}
                      </Button>
                    </div>
                    <DocumentList documents={pedigreeDocuments} type="pedigree" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4 mt-8">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : dog ? "Save Changes" : "Add Dog"}
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