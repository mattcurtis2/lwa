import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format, parse, isValid } from "date-fns";
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
import { useState, useEffect } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatInputDate, parseApiDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

const mediaSchema = z.object({
  url: z.string().min(1, "Media URL or file path is required"),
  type: z.enum(["image", "video"]),
  fileName: z.string().optional(),
});

const createDogSchema = (isPuppy: boolean = false) => {
  const baseSchema = {
    name: z.string().min(1, "Name is required"),
    registrationName: z.string().optional(),
    birthDate: z.string().min(1, "Birth date is required"),
    gender: z.enum(["male", "female"]),
    description: z.string().optional(),
    motherId: z.number().nullable(),
    fatherId: z.number().nullable(),
    litterId: z.number().nullable(),
    profileImageUrl: z.string().optional(),
    healthData: z.string().optional(),
    color: z.string().optional(),
    dewclaws: z.string().optional(),
    furLength: z.string().optional(),
    height: z.string().optional().nullable(),
    weight: z.string().optional().nullable(),
    pedigree: z.string().optional(),
    narrativeDescription: z.string().optional(),
    media: z.array(mediaSchema).optional(),
    outsideBreeder: z.boolean().default(false),
    puppy: z.boolean().default(false),
    available: z.boolean().default(false),
    price: z.string().optional(),
    breed: z.string().optional(),
  };

  return z.object(baseSchema);
};

interface DogFormProps {
  dog?: Partial<Dog & { media?: DogMedia[] }>;
  isPuppy?: boolean;
  mode: 'create' | 'edit';
  onSubmit?: (values: any) => Promise<void>;
  onCancel?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  defaultValues?: Partial<z.infer<ReturnType<typeof createDogSchema>>>;
}

interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
}

export default function DogForm({
  dog,
  isPuppy = false,
  mode = 'create',
  onSubmit: customOnSubmit,
  onCancel,
  onOpenChange,
  open,
  defaultValues
}: DogFormProps) {
  const { toast } = useToast();
  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [inputMethod, setInputMethod] = useState<"url" | "upload">("url");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [healthDocuments, setHealthDocuments] = useState<DogDocument[]>([]);
  const [pedigreeDocuments, setPedigreeDocuments] = useState<DogDocument[]>([]);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string>("");


  const dogSchema = createDogSchema(isPuppy);

  const form = useForm<z.infer<ReturnType<typeof createDogSchema>>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      registrationName: "",
      birthDate: defaultValues?.birthDate || new Date().toISOString().split('T')[0],
      gender: "male",
      description: "",
      motherId: defaultValues?.motherId || null,
      fatherId: defaultValues?.fatherId || null,
      litterId: defaultValues?.litterId || null,
      profileImageUrl: "",
      healthData: "",
      color: "",
      dewclaws: "",
      furLength: "",
      height: "",
      weight: "",
      pedigree: "",
      narrativeDescription: "",
      media: [],
      outsideBreeder: false,
      puppy: isPuppy,
      available: false,
      price: "",
      breed: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (dog) {
      const formattedDog = {
        ...dog,
        birthDate: dog.birthDate ? formatInputDate(new Date(dog.birthDate)) : "",
        height: dog.height?.toString() || "",
        weight: dog.weight?.toString() || "",
        price: dog.price?.toString() || "",
      };

      if (dog.media?.length) {
        const media = dog.media.map(m => ({
          url: m.url,
          type: m.type as "image" | "video",
          fileName: m.fileName || m.url.split('/').pop() || '',
        }));
        formattedDog.media = media;
        setMediaInputs(media.map(m => ({ ...m, isNew: false })));
      }

      form.reset(formattedDog);
    }
  }, [dog, form]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(mediaInputs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMediaInputs(items);
    form.setValue("media", items);
  };

  const handleAddMedia = () => {
    if (inputMethod === "url") {
      if (!mediaUrl) {
        toast({
          title: "Error",
          description: "Please enter a URL",
          variant: "destructive",
        });
        return;
      }

      const newMedia = {
        url: mediaUrl,
        type: mediaType,
        fileName: mediaUrl.split('/').pop() || '',
        isNew: true,
      };

      const newInputs = [newMedia, ...mediaInputs];
      setMediaInputs(newInputs);
      form.setValue("media", newInputs);
      setShowAddMedia(false);
      setMediaUrl("");
    } else {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = mediaType === 'image' ? 'image/*' : 'video/*';
      fileInput.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handleFileUpload(file);
        }
      };
      fileInput.click();
    }
  };

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
      setShowAddMedia(false);
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
    const response = await fetch(croppedImageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload cropped image");
      }

      const { url } = await uploadRes.json();
      form.setValue("profileImageUrl", url, { shouldValidate: true });
      setShowCropper(false);

      URL.revokeObjectURL(croppedImageUrl);
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast({
        title: "Error",
        description: "Failed to upload cropped image",
        variant: "destructive",
      });
    }
  };

  const handleDocumentUpload = async (file: File, type: 'health' | 'pedigree') => {
    setIsUploadingDoc(true);
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
      const newDoc = {
        url: data.url,
        type,
        name: file.name,
        mimeType: file.type,
        isNew: true,
      };

      if (type === 'health') {
        setHealthDocuments(prev => [newDoc, ...prev]);
      } else {
        setPedigreeDocuments(prev => [newDoc, ...prev]);
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const removeDocument = (index: number, type: 'health' | 'pedigree') => {
    if (type === 'health') {
      setHealthDocuments(prev => prev.filter((_, i) => i !== index));
    } else {
      setPedigreeDocuments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formatDisplayDate = (date: Date) => format(date, 'yyyy-MM-dd');

  const onSubmitWrapper = async (values: any) => {
    console.log('DogForm - Original form values:', values);

    const processedValues = {
      ...values,
      birthDate: values.birthDate,
      height: values.height ? parseFloat(values.height) || null : null,
      weight: values.weight ? parseFloat(values.weight) || null : null,
      price: values.price ? parseInt(values.price.replace(/\D/g, ''), 10) || null : null,
      motherId: values.motherId ? parseInt(values.motherId.toString()) : null,
      fatherId: values.fatherId ? parseInt(values.fatherId.toString()) : null,
      litterId: values.litterId ? parseInt(values.litterId.toString()) : null,
      puppy: isPuppy || values.puppy, 
      media: mediaInputs.map(m => ({
        url: m.url,
        type: m.type,
        fileName: m.fileName
      }))
    };

    console.log('DogForm - Processed values before submission:', processedValues);

    if (customOnSubmit) {
      try {
        await customOnSubmit(processedValues);
      } catch (error) {
        console.error('DogForm - Error in customOnSubmit:', error);
        throw error;
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitWrapper)} className="space-y-6">
        <div className="space-y-4">
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
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
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
                  <Input type="date" {...field} />
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
                    value={field.value}
                    onValueChange={field.onChange}
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
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="profileImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 relative group">
                    <AvatarImage src={field.value} alt="Profile picture" />
                    <AvatarFallback>
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
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
                    Upload Profile Picture
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

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

            <DragDropContext onDragEnd={handleDragEnd}>
              <StrictModeDroppable droppableId="droppable-media-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {mediaInputs.map((input, index) => (
                      <Draggable
                        key={input.url}
                        draggableId={input.url}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "p-4 rounded-lg",
                              input.isNew
                                ? "bg-primary/5 border border-primary/20"
                                : "bg-muted"
                            )}
                          >
                            <div className="flex gap-4">
                              <div className="w-20 h-20 relative shrink-0">
                                {input.type === "image" ? (
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
                                  {input.fileName || input.url.split("/").pop()}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </DragDropContext>
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder={isPuppy ? "Optional description" : "Required description"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="narrativeDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Narrative Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Detailed description of personality, training, and characteristics" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
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
        </div>

        <FormField
          control={form.control}
          name="healthData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Health Information</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Health certifications, testing results, etc."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isPuppy && (
          <div className="space-y-4">
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

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available</FormLabel>
                    <FormDescription>
                      Mark this if the dog is available
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
                  <FormLabel>Price (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter price"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Set a price if the dog is available for sale (whole dollars only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-between pt-6">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" className="ml-auto">
            {mode === 'edit' ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface DogDocument {
  id?: number;
  url: string;
  type: "health" | "pedigree";
  name: string;
  mimeType: string;
  isNew?: boolean;
}