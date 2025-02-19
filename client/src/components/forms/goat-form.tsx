import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { X, ImageIcon, FileText, Upload } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageCrop } from "@/components/ui/image-crop";
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";

interface Document {
  id?: number;
  type: string;
  url: string;
  name: string;
  mimeType: string;
}

interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
}

const mediaSchema = z.object({
  url: z.string().min(1, "Media URL or file path is required"),
  type: z.enum(["image", "video"]),
  fileName: z.string().optional(),
});

const createGoatSchema = (isKid: boolean = false) => {
  const baseSchema = {
    name: z.string().min(1, "Name is required"),
    registrationName: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.enum(["male", "female"]),
    breed: z.string().default("Nigerian Dwarf"),
    color: z.string().optional(),
    description: z.string().optional(),
    narrativeDescription: z.string().optional(),
    healthData: z.string().optional(),
    height: z.string().optional().nullable(),
    weight: z.string().optional().nullable(),
    milkStars: z.string().optional(),
    laArScores: z.string().optional(),
    profileImageUrl: z.string().optional(),
    media: z.array(mediaSchema).optional(),
    outsideBreeder: z.boolean().default(false),
    kid: z.boolean().default(false),
    available: z.boolean().default(false),
    sold: z.boolean().default(false),
    motherId: z.number().optional().nullable(),
    fatherId: z.number().optional().nullable(),
    litterId: z.number().optional().nullable(),
    documents: z.array(z.object({
      type: z.string(),
      url: z.string(),
      name: z.string(),
      mimeType: z.string()
    })).optional()
  };

  return z.object(baseSchema);
};

interface GoatFormProps {
  goat?: any;
  mode?: 'create' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  fromLitter?: boolean;
}

export default function GoatForm({ goat, mode = 'create', open, onOpenChange, fromLitter = false }: GoatFormProps) {
  const { toast } = useToast();
  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [healthDocuments, setHealthDocuments] = useState<Document[]>([]);
  const [pedigreeDocuments, setPedigreeDocuments] = useState<Document[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");

  const goatSchema = createGoatSchema(Boolean(goat?.kid));

  const form = useForm<z.infer<typeof goatSchema>>({
    resolver: zodResolver(goatSchema),
    defaultValues: {
      name: goat?.name || "",
      registrationName: goat?.registrationName || "",
      birthDate: goat?.birthDate ? goat.birthDate.split('T')[0] : new Date().toISOString().split('T')[0],
      gender: goat?.gender || "female",
      breed: goat?.breed || "Nigerian Dwarf",
      color: goat?.color || "",
      description: goat?.description || "",
      narrativeDescription: goat?.narrativeDescription || "",
      healthData: goat?.healthData || "",
      height: goat?.height?.toString() || "",
      weight: goat?.weight?.toString() || "",
      milkStars: goat?.milkStars || "",
      laArScores: goat?.laArScores || "",
      profileImageUrl: goat?.profileImageUrl || "",
      media: goat?.media || [],
      outsideBreeder: Boolean(goat?.outsideBreeder),
      kid: Boolean(goat?.kid),
      available: Boolean(goat?.available),
      sold: Boolean(goat?.sold),
      motherId: goat?.motherId || null,
      fatherId: goat?.fatherId || null,
      litterId: goat?.litterId || null,
      documents: goat?.documents || []
    }
  });

  useEffect(() => {
    if (goat) {
      const media = goat.media?.map((m: any) => ({
        url: m.url,
        type: m.type as "image" | "video",
        fileName: m.fileName,
        isNew: false,
      })) || [];

      setMediaInputs(media);

      if (goat.documents) {
        const health = goat.documents.filter((doc: Document) => doc.type === 'health');
        const pedigree = goat.documents.filter((doc: Document) => doc.type === 'pedigree');
        setHealthDocuments(health);
        setPedigreeDocuments(pedigree);
      }
    }
  }, [goat]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(mediaInputs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setMediaInputs(items);
    form.setValue("media", items);
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
    if (!file) return;

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
      console.error('Error uploading document:', error);
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxSize: 10485760, // 10MB
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true);
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
          const fileUrl = Array.isArray(data) ? data[0].url : data.url;
          const fileType = file.type.startsWith('video/') ? 'video' : 'image';

          const newMedia = {
            url: fileUrl,
            type: fileType,
            fileName: file.name,
            isNew: true,
          };

          setMediaInputs(prev => [newMedia, ...prev]);
          const currentMedia = form.getValues("media") || [];
          form.setValue("media", [newMedia, ...currentMedia]);
        }
      } catch (error) {
        console.error('Error uploading files:', error);
        toast({
          title: "Error",
          description: "Failed to upload one or more files",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }, [form, toast]),
  });

  const onSubmit = async (values: z.infer<typeof goatSchema>) => {
    try {
      console.log('Form submission started with values:', values);
      const processedValues = {
        ...values,
        height: values.height ? parseFloat(values.height) : null,
        weight: values.weight ? parseFloat(values.weight) : null,
        sold: Boolean(values.sold),
        available: Boolean(values.available),
        kid: Boolean(values.kid),
        outsideBreeder: Boolean(values.outsideBreeder),
        media: mediaInputs,
        documents: [
          ...healthDocuments.map(doc => ({ ...doc, type: 'health' })),
          ...pedigreeDocuments.map(doc => ({ ...doc, type: 'pedigree' }))
        ]
      };
      console.log('Processed values:', processedValues);

      const url = goat?.id ? `/api/goats/${goat.id}` : '/api/goats';
      const method = goat?.id ? 'PUT' : 'POST';

      console.log(`Making ${method} request to ${url}`);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedValues),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to save goat');
      }

      const savedGoat = await response.json();
      console.log('Goat saved successfully:', savedGoat);

      await queryClient.invalidateQueries({ queryKey: ['/api/goats'] });

      toast({
        title: "Success",
        description: `Goat ${goat?.id ? 'updated' : 'created'} successfully`,
      });

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error saving goat:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save goat',
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormDescription>
                Upload a profile picture for the goat
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

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Brief description of the goat" />
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

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <FormControl>
                <Input {...field} defaultValue="Nigerian Dwarf" readOnly />
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
                <Input {...field} placeholder="e.g., Black and white" />
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
                  <Input type="number" step="0.1" {...field} />
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
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="milkStars"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Milk Stars</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 5*M" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="laArScores"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LA/AR Scores</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., LA90 AR90" />
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
                    <Label>Health Documents</Label>
                    <FileUpload
                      onFileSelect={(file) => handleDocumentUpload(file, 'health')}
                      accept="application/pdf,image/jpeg,image/png"
                      isUploading={isUploadingDoc}
                      skipCrop={true}
                    />
                    {healthDocuments.length > 0 && (
                      <div className="space-y-2">
                        {healthDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-6 w-6 text-muted-foreground" />
                              <span className="truncate max-w-[200px]">{doc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(index, 'health')}
                                className="text-red-500 hover:text-red-600"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                <p className="text-xs">
                  Supports images and videos up to 10MB
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
                  {mediaInputs.filter(input => input?.url).map((input, index) => (
                    <Draggable
                      key={input.url || `media-${index}`}
                      draggableId={input.url || `media-${index}`}
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
                              onClick={() => {
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
                              onClick={() => {
                                const newInputs = [...mediaInputs];
                                newInputs.splice(index, 1);
                                setMediaInputs(newInputs);
                                form.setValue("media", newInputs);
                              }}
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Available</FormLabel>
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
            name="sold"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Sold</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="outsideBreeder"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Outside Breeder</FormLabel>
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
          name="kid"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Kid</FormLabel>
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

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'create' ? 'Create Goat' : 'Update Goat'}
          </Button>
        </div>
      </form>
    </Form>
  );
}