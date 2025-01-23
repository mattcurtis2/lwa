import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dog, DogMedia } from "@db/schema";
import { useState } from "react";
import { X, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDropzone } from 'react-dropzone';

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
  onSubmit?: (values: any) => Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<z.infer<ReturnType<typeof createDogSchema>>>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: 'edit' | 'create';
  fromLitter?: boolean;
}

export default function DogForm({
  dog,
  isPuppy = false,
  onSubmit,
  onCancel,
  defaultValues,
  open,
  onOpenChange,
  mode = 'create',
  fromLitter = false
}: DogFormProps) {
  const { toast } = useToast();
  const [availableMothers, setAvailableMothers] = useState<Dog[]>([]);
  const [availableFathers, setAvailableFathers] = useState<Dog[]>([]);
  const [availableLitters, setAvailableLitters] = useState<any[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);
  const [isLoadingLitters, setIsLoadingLitters] = useState(false);
  const [hasLoadedParents, setHasLoadedParents] = useState(false);

  const dogSchema = createDogSchema(isPuppy);

  const form = useForm<z.infer<typeof dogSchema>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      registrationName: defaultValues?.registrationName || "",
      birthDate: defaultValues?.birthDate || new Date().toISOString().split('T')[0],
      gender: defaultValues?.gender || "male",
      description: defaultValues?.description || "",
      motherId: defaultValues?.motherId || null,
      fatherId: defaultValues?.fatherId || null,
      litterId: defaultValues?.litterId || null,
      profileImageUrl: defaultValues?.profileImageUrl || "",
      healthData: defaultValues?.healthData || "",
      color: defaultValues?.color || "",
      dewclaws: defaultValues?.dewclaws || "",
      furLength: defaultValues?.furLength || "",
      height: defaultValues?.height || "",
      weight: defaultValues?.weight || "",
      pedigree: defaultValues?.pedigree || "",
      narrativeDescription: defaultValues?.narrativeDescription || "",
      media: defaultValues?.media || [],
      outsideBreeder: defaultValues?.outsideBreeder || false,
      puppy: defaultValues?.puppy || isPuppy,
      available: defaultValues?.available || false,
      price: defaultValues?.price || "",
      breed: defaultValues?.breed || "Colorado Mountain Dogs",
    },
  });

  const fetchParents = async () => {
    if (!hasLoadedParents && !fromLitter) {
      setIsLoadingParents(true);
      try {
        const response = await fetch('/api/dogs');
        const dogs = await response.json();
        setAvailableMothers(dogs.filter((d: Dog) => d.gender === 'female'));
        setAvailableFathers(dogs.filter((d: Dog) => d.gender === 'male'));
        setHasLoadedParents(true);
      } catch (error) {
        console.error('Error fetching parents:', error);
        toast({
          title: "Error",
          description: "Failed to load parent options",
          variant: "destructive",
        });
      } finally {
        setIsLoadingParents(false);
      }
    }
  };

  const fetchLitters = async () => {
    if (!fromLitter) {
      setIsLoadingLitters(true);
      try {
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
      } catch (error) {
        console.error('Error fetching litters:', error);
        toast({
          title: "Error",
          description: "Failed to load litter options",
          variant: "destructive",
        });
      } finally {
        setIsLoadingLitters(false);
      }
    }
  };

  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>(defaultValues?.media || []);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [inputMethod, setInputMethod] = useState<"url" | "upload">("url");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [healthDocuments, setHealthDocuments] = useState<any[]>([]);
  const [pedigreeDocuments, setPedigreeDocuments] = useState<any[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");


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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxSize: 10485760, // 10MB
    onDrop: async (acceptedFiles) => {
      try {
        for (const file of acceptedFiles) {
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
          const fileType = file.type.startsWith('video/') ? 'video' : 'image';

          const newMedia = {
            url: data.url,
            type: fileType,
            fileName: file.name,
            isNew: true,
          };

          setMediaInputs(prev => [newMedia, ...prev]);
          form.setValue("media", [newMedia, ...form.getValues("media")]);
        }

        toast({
          title: "Success",
          description: `${acceptedFiles.length} file(s) uploaded successfully`,
        });
      } catch (error) {
        console.error('Error uploading files:', error);
        toast({
          title: "Error",
          description: "Failed to upload one or more files",
          variant: "destructive",
        });
      }
    },
    onDropRejected: (rejectedFiles) => {
      toast({
        title: "Error",
        description: "Some files were rejected. Please check the file type and size.",
        variant: "destructive",
      });
    }
  });

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
            aspect={cropImageUrl === form.getValues("profileImageUrl") ? 1 : undefined}
            circularCrop={cropImageUrl === form.getValues("profileImageUrl")}
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

        {!fromLitter && (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="motherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother</FormLabel>
                  <Select
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      const newValue = value === "none" ? null : parseInt(value);
                      field.onChange(newValue);
                      if (newValue && form.getValues('fatherId')) {
                        fetchLitters();
                      }
                    }}
                    onOpenChange={(open) => {
                      if (open) fetchParents();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mother" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingParents ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <SelectItem value="none">None</SelectItem>
                          {availableMothers.map((mother) => (
                            <SelectItem key={mother.id} value={mother.id.toString()}>
                              {mother.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
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
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      const newValue = value === "none" ? null : parseInt(value);
                      field.onChange(newValue);
                      if (newValue && form.getValues('motherId')) {
                        fetchLitters();
                      }
                    }}
                    onOpenChange={(open) => {
                      if (open) fetchParents();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select father" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingParents ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <SelectItem value="none">None</SelectItem>
                          {availableFathers.map((father) => (
                            <SelectItem key={father.id} value={father.id.toString()}>
                              {father.name}
                            </SelectItem>
                          ))}
                        </>
                      )}
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
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      const newValue = value === "none" ? null : parseInt(value);
                      field.onChange(newValue);
                    }}
                    onOpenChange={(open) => {
                      if (open && form.getValues('motherId') && form.getValues('fatherId')) {
                        fetchLitters();
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select litter" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingLitters ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <SelectItem value="none">None</SelectItem>
                          {availableLitters.map((litter) => (
                            <SelectItem key={litter.id} value={litter.id.toString()}>
                              {format(new Date(litter.dueDate), 'MMM dd, yyyy')} Litter
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

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
          </div>

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              "hover:border-primary hover:bg-primary/5 cursor-pointer"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-muted-foreground">
                <p className="text-sm font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-xs">                  Supports images and videos up to 10MB
                </p>
              </div>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <StrictModeDroppable droppableId="droppable-media-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
                          className="relative group aspect-video rounded-lg overflow-hidden bg-muted"
                        >
                          {input.type === 'image' ? (
                            <img
                              src={input.url}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                              onClick={() =>{
                                setCropImageUrl(input.url);
                                setShowCropper(true);
                              }}
                            />
                          ) : (
                            <video
                              src={input.url}
                              className="w-full h-full object-cover"
                              controls
                            />
                          )}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeMediaInput(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
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
              render={({ field}) => (
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
            {mode === 'edit' ? 'Save Changes' : 'Create Dog'}
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