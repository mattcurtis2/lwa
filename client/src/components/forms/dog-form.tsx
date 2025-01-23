import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dog, DogMedia } from "@db/schema";
import { useState, useEffect } from "react";
import { X, Upload, ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatInputDate, parseApiDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageCrop } from "@/components/ui/image-crop";

const mediaSchema = z.object({
  url: z.string().min(1, "Media URL or file path is required"),
  type: z.enum(["image", "video"]),
  fileName: z.string().optional(),
});

const createDogSchema = (isPuppy: boolean = false) => {
  const baseSchema = {
    name: z.string().min(1, "Name is required"),
    registrationName: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.enum(["male", "female"]),
    motherId: z.number().optional().nullable(),
    fatherId: z.number().optional().nullable(),
    litterId: z.number().optional().nullable(),
    description: z.string().optional(),
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
    breed: z.string().default("Colorado Mountain Dogs"),
  };

  return z.object(baseSchema);
};

interface DogFormProps {
  dog?: Dog & { media?: DogMedia[] };
  isPuppy?: boolean;
  onSubmit: (values: any) => Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<z.infer<ReturnType<typeof createDogSchema>>>;
}

export default function DogForm({ dog, isPuppy = false, onSubmit, onCancel, defaultValues }: DogFormProps) {
  const { toast } = useToast();
  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [inputMethod, setInputMethod] = useState<"url" | "upload">("url");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [healthDocuments, setHealthDocuments] = useState<any[]>([]);
  const [pedigreeDocuments, setPedigreeDocuments] = useState<any[]>([]);
  const [availableMothers, setAvailableMothers] = useState<Dog[]>([]);
  const [availableFathers, setAvailableFathers] = useState<Dog[]>([]);
  const [availableLitters, setAvailableLitters] = useState<any[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");

  const dogSchema = createDogSchema(isPuppy);

  const form = useForm<z.infer<typeof dogSchema>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      registrationName: "",
      birthDate: defaultValues?.birthDate || new Date().toISOString().split('T')[0],
      gender: "male",
      description: "",
      motherId: null,
      fatherId: null,
      litterId: null,
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
    const fetchParents = async () => {
      const response = await fetch('/api/dogs');
      const dogs = await response.json();
      setAvailableMothers(dogs.filter((d: Dog) => d.gender === 'female'));
      setAvailableFathers(dogs.filter((d: Dog) => d.gender === 'male'));
    };
    fetchParents();
  }, []);

  useEffect(() => {
    const fetchLitters = async () => {
      const motherId = form.getValues('motherId');
      const fatherId = form.getValues('fatherId');
      if (motherId && fatherId) {
        const response = await fetch('/api/litters');
        const allLitters = await response.json();
        const filteredLitters = allLitters.filter(
          (l: any) => l.motherId === motherId && l.fatherId === fatherId
        );
        setAvailableLitters(filteredLitters);
      }
    };
    fetchLitters();
  }, [form.watch('motherId'), form.watch('fatherId')]);

  useEffect(() => {
    if (dog) {
      const birthDate = parseApiDate(dog.birthDate);
      form.reset({
        ...dog,
        birthDate: formatInputDate(birthDate),
        motherId: dog.motherId || null,
        fatherId: dog.fatherId || null,
        litterId: dog.litterId || null,
        height: dog.height?.toString() || "",
        weight: dog.weight?.toString() || "",
        price: dog.price?.toString() || "",
        media: dog.media?.map(m => ({
          url: m.url,
          type: m.type as "image" | "video",
          fileName: m.fileName,
        })) || [],
      });

      const media = dog.media?.map(m => ({
        url: m.url,
        type: m.type as "image" | "video",
        fileName: m.fileName,
        isNew: false,
      })) || [];

      setMediaInputs(media);
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
      formData.append('file', blob, 'profile-picture.jpg');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload cropped image');
      }

      const data = await uploadRes.json();
      form.setValue("profileImageUrl", data.url);
      setShowCropper(false);

      URL.revokeObjectURL(croppedImageUrl);
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl("");

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully',
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
    try {
      const processedValues = {
        ...values,
        height: values.height ? parseFloat(values.height) || null : null,
        weight: values.weight ? parseFloat(values.weight) || null : null,
        price: values.price ? parseInt(values.price.replace(/\D/g, ''), 10) || null : null,
        motherId: values.motherId || null,
        fatherId: values.fatherId || null,
        litterId: values.litterId || null,
        breed: "Colorado Mountain Dogs"
      };

      const url = dog?.id ? `/api/dogs/${dog.id}` : '/api/dogs';
      const method = dog?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedValues),
      });

      if (!response.ok) {
        throw new Error('Failed to save dog');
      }

      toast({
        title: "Success",
        description: `Dog ${dog?.id ? 'updated' : 'created'} successfully`,
      });

      if (onSubmit) {
        await onSubmit(processedValues);
      }
    } catch (error) {
      console.error('Error saving dog:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save dog',
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitWrapper)} className="space-y-6">
        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormDescription>
                Upload a profile picture for the dog
              </FormDescription>
              <div className="flex items-center gap-4">
                <div 
                  className="relative h-24 w-24 cursor-pointer"
                  onClick={() => {
                    if (field.value) {
                      setCropImageUrl(field.value);
                      setShowCropper(true);
                    }
                  }}
                >
                  <div className="absolute inset-0 rounded-full border-2 border-muted bg-muted overflow-hidden hover:border-primary/50 transition-colors">
                    {field.value ? (
                      <img
                        src={field.value}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
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
                          handleProfilePictureSelect(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    {field.value ? 'Change Picture' : 'Upload Picture'}
                  </Button>
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => field.onChange('')}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove Picture
                    </Button>
                  )}
                </div>
              </div>
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
            aspect={1}
            circularCrop
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
          name="registrationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Name</FormLabel>
              <FormControl>
                <Input {...field} />
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

        <FormField
          control={form.control}
          name="motherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mother</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mother" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableMothers.map((mother) => (
                    <SelectItem key={mother.id} value={mother.id.toString()}>
                      {mother.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fatherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Father</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select father" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableFathers.map((father) => (
                    <SelectItem key={father.id} value={father.id.toString()}>
                      {father.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="litterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Litter</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select litter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableLitters.map((litter) => (
                    <SelectItem key={litter.id} value={litter.id.toString()}>
                      {format(new Date(litter.dueDate), 'MMM dd, yyyy')} Litter
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
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
                <div className="space-y-4">
                  <Textarea
                    {...field}
                    placeholder="Health certifications, testing results, etc."
                  />
                  <div className="space-y-2">
                    <Label>Health Documents & Media</Label>
                    <FileUpload
                      onFileSelect={(file) => handleDocumentUpload(file, 'health')}
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,video/*"
                    />
                    {healthDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(index, 'health')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pedigree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pedigree</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Textarea
                    {...field}
                    placeholder="Pedigree information and lineage details"
                  />
                  <div className="space-y-2">
                    <Label>Pedigree Documents & Media</Label>
                    <FileUpload
                      onFileSelect={(file) => handleDocumentUpload(file, 'pedigree')}
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,video/*"
                    />
                    {pedigreeDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span>{doc.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(index, 'pedigree')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </FormControl>
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
              name="puppy"
              render={({field }) => (
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
          {onCancel && (            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          {dog?.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Dog</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {dog.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/dogs/${dog.id}`, {
                          method: "DELETE",
                        });
                        if (!res.ok) throw new Error("Failed to delete dog");
                        toast({
                          title: "Success",
                          description: "Dog deleted successfully",
                        });
                        onCancel?.();
                      } catch (error) {
                        console.error('Error deleting dog:', error);
                        toast({
                          title: "Error",
                          description: "Failed to delete dog",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button type="submit" className="ml-auto">
            {dog ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
}