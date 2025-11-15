import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Sheep } from "@db/schema";
import { ImageCrop } from "@/components/ui/image-crop";
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/utils";
import { X, ImageIcon, Upload, Crop, FileText, ExternalLink } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";
import { formatApiDate } from "@/lib/date-utils";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadFileToS3 } from "@/lib/upload-utils";

interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
  file?: File;
  tempUrl?: string;
}

interface Document {
  id?: number;
  type: string;
  url: string;
  name: string;
  mimeType: string;
}

const mediaSchema = z.object({
  url: z.string().min(1, "Media URL or file path is required"),
  type: z.enum(["image", "video"]),
  fileName: z.string().optional(),
});

const sheepFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registrationName: z.string().optional(),
  breed: z.string().min(1, "Breed is required"),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().optional(),
  color: z.string().optional(),
  weight: z.number().optional(),
  description: z.string().optional(),
  healthData: z.string().optional().nullable(),
  pedigree: z.string().optional().nullable(),
  available: z.boolean().default(false),
  sold: z.boolean().default(false),
  died: z.boolean().default(false),
  profileImageUrl: z.string().optional(),
  display: z.boolean().default(true),
  media: z.array(mediaSchema).optional(),
  documents: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string(),
    mimeType: z.string()
  })).optional()
});

type SheepFormData = z.infer<typeof sheepFormSchema>;

interface SheepFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheep?: (Sheep & { media?: any[]; documents?: Document[] }) | null;
  mode: 'create' | 'edit';
  fromLitter?: boolean;
}

export default function SheepForm({ open, onOpenChange, sheep, mode, fromLitter = false }: SheepFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [healthDocuments, setHealthDocuments] = useState<Document[]>([]);
  const [pedigreeDocuments, setPedigreeDocuments] = useState<Document[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [tempMediaData, setTempMediaData] = useState<{ index: number; file: File | undefined; isProfileImage: boolean } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SheepFormData>({
    resolver: zodResolver(sheepFormSchema),
    defaultValues: {
      name: "",
      registrationName: "",
      breed: "Katahdin",
      gender: "female",
      birthDate: "",
      color: "",
      weight: undefined,
      description: "",
      healthData: "",
      pedigree: "",
      available: false,
      sold: false,
      died: false,
      profileImageUrl: "",
      display: true,
      media: [],
      documents: [],
    },
  });

  useEffect(() => {
    if (sheep && mode === 'edit') {
      form.reset({
        name: sheep.name || "",
        registrationName: sheep.registrationName || "",
        breed: sheep.breed || "Katahdin",
        gender: sheep.gender as "male" | "female" || "female",
        birthDate: sheep.birthDate ? formatApiDate(sheep.birthDate) : "",
        color: sheep.color || "",
        weight: typeof sheep.weight === 'number' ? sheep.weight : undefined,
        description: sheep.description || "",
        healthData: sheep.healthData || "",
        pedigree: sheep.pedigree || "",
        available: sheep.available || false,
        sold: sheep.sold || false,
        died: sheep.died || false,
        profileImageUrl: sheep.profileImageUrl || "",
        display: sheep.display !== false,
        media: (sheep.media || []).map(m => ({
          url: m.url,
          type: m.type as "image" | "video",
          fileName: m.fileName || undefined
        })),
        documents: sheep.documents || [],
      });
      setProfileImageUrl(sheep.profileImageUrl || "");

      // Initialize media inputs from sheep data
      let media = sheep.media?.map((m: any) => ({
        url: m.url,
        type: m.type as "image" | "video",
        fileName: m.fileName,
        isNew: false,
      })) || [];
      
      // If there's no media but there is a profileImageUrl, add it to the media array
      if (media.length === 0 && sheep.profileImageUrl) {
        media = [{
          url: sheep.profileImageUrl,
          type: "image",
          fileName: "profile-image.jpg",
          isNew: false,
        }];
      }

      setMediaInputs(media);

      // Load documents
      if (sheep.documents) {
        const health = sheep.documents.filter(doc => doc.type === 'health');
        const pedigree = sheep.documents.filter(doc => doc.type === 'pedigree');
        setHealthDocuments(health);
        setPedigreeDocuments(pedigree);
      }
    } else {
      form.reset({
        name: "",
        registrationName: "",
        breed: "Katahdin",
        gender: "female",
        birthDate: "",
        color: "",
        weight: undefined,
        description: "",
        healthData: "",
        pedigree: "",
        available: false,
        sold: false,
        died: false,
        profileImageUrl: "",
        display: true,
        media: [],
        documents: [],
      });
      setProfileImageUrl("");
      setMediaInputs([]);
      setHealthDocuments([]);
      setPedigreeDocuments([]);
    }
  }, [sheep, mode, form]);

  const createMutation = useMutation({
    mutationFn: async (data: SheepFormData) => {
      const response = await fetch('/api/sheep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create sheep');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sheep'] });
      toast({ title: "Success", description: "Sheep created successfully" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SheepFormData) => {
      const response = await fetch(`/api/sheep/${sheep?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update sheep');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sheep'] });
      toast({ title: "Success", description: "Sheep updated successfully" });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = async (data: SheepFormData) => {
    console.log('Form submission started with values:', data);
    setIsLoading(true);
    
    try {
      // Update profile image URL if we have one
      if (profileImageUrl) {
        data.profileImageUrl = profileImageUrl;
      }

      // Process media
      const validMedia = mediaInputs
        .filter(media => media && media.url)
        .map(media => ({
          url: media.url,
          type: media.type || 'image',
          fileName: media.fileName || ''
        }));

      // Add media to the data
      const processedData = {
        ...data,
        media: validMedia,
      };

      // If no explicit profile image but we have media, use the first media item as profile
      if (!processedData.profileImageUrl && validMedia.length > 0) {
        processedData.profileImageUrl = validMedia[0].url;
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(processedData);
      } else {
        await updateMutation.mutateAsync(processedData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setShowImageCrop(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setProfileImageUrl(croppedImageUrl);
    setShowImageCrop(false);
    setImageFile(null);
    form.setValue('profileImageUrl', croppedImageUrl);
  };

  // Media handling functions (similar to goat form)
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
      setTempMediaData({ index: 0, file, isProfileImage: true });
      setShowCropper(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load image for cropping',
        variant: 'destructive',
      });
    }
  };

  const handleCroppedImage = async (uploadedUrl: string, cropData?: any) => {
    setIsUploading(true);
    try {
      console.log(`Sheep Form - handleCroppedImage received URL: ${uploadedUrl.substring(0, 50)}...`);
      
      // Check if this is a media upload or profile image upload
      const isMediaUpload = tempMediaData !== null && !tempMediaData.isProfileImage;
      console.log(`Sheep Form - isMediaUpload: ${isMediaUpload}, tempMediaData:`, tempMediaData);

      if (isMediaUpload) {
        // This is for media gallery
        const { index, file } = tempMediaData!;
        const updatedMedia = [...mediaInputs];
        
        updatedMedia[index] = {
          ...updatedMedia[index],
          url: uploadedUrl,
          file,
          type: 'image',
          isNew: true,
        };

        setMediaInputs(updatedMedia);
        form.setValue("media", updatedMedia);
        setTempMediaData(null);
        toast({ title: "Success", description: "Image cropped and uploaded successfully" });
      } else {
        // This is for profile image
        setProfileImageUrl(uploadedUrl);
        form.setValue('profileImageUrl', uploadedUrl);
        toast({ title: "Success", description: "Profile image updated successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload the cropped image: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setShowCropper(false);
      setCropImageUrl("");
      setTempMediaData(null);
    }
  };

  const handleDocumentUpload = async (file: File, type: 'health' | 'pedigree') => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file object');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size must be less than 50MB');
      }

      setIsUploadingDoc(true);

      const uploadedUrl = await uploadFileToS3(file);

      if (!uploadedUrl) {
        throw new Error('File upload failed - no URL returned');
      }

      const newDoc: Document = {
        type,
        url: uploadedUrl,
        name: file.name,
        mimeType: file.type
      };

      if (type === 'health') {
        setHealthDocuments(prev => [newDoc, ...prev]);
        const allDocs = [...healthDocuments, newDoc, ...pedigreeDocuments];
        form.setValue("documents", allDocs);
      } else {
        setPedigreeDocuments(prev => [newDoc, ...prev]);
        const allDocs = [...healthDocuments, ...pedigreeDocuments, newDoc];
        form.setValue("documents", allDocs);
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error) {
      let errorMessage = "Failed to upload document";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const removeDocument = (index: number, type: 'health' | 'pedigree') => {
    if (type === 'health') {
      const newHealthDocs = healthDocuments.filter((_, i) => i !== index);
      setHealthDocuments(newHealthDocs);
      form.setValue("documents", [...newHealthDocs, ...pedigreeDocuments]);
    } else {
      const newPedigreeDocs = pedigreeDocuments.filter((_, i) => i !== index);
      setPedigreeDocuments(newPedigreeDocs);
      form.setValue("documents", [...healthDocuments, ...newPedigreeDocs]);
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
          // Ensure type is explicitly 'image' or 'video' to satisfy TypeScript
          const fileType = file.type.startsWith('video/') ? 'video' as const : 'image' as const;

          const newMedia: MediaInput = {
            url: fileUrl,
            type: fileType,
            fileName: file.name,
            isNew: true,
            file, // Add file information
          };

          setMediaInputs(prev => [newMedia, ...prev]);
          const currentMedia = form.getValues("media") || [];
          form.setValue("media", [newMedia, ...currentMedia]);
        }
      } catch (error) {
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

  const handleMediaFileSelect = async (file: File, index: number) => {
    if (!file) return;

    // Set the temporary media data for use after cropping
    setTempMediaData({ file, index, isProfileImage: false });

    try {
      // Create a local object URL to avoid CORS issues
      const url = URL.createObjectURL(file);
      setCropImageUrl(url);
      setShowCropper(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load image for cropping: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMedia = (index: number) => {
    const updatedMedia = [...mediaInputs];
    updatedMedia.splice(index, 1);
    setMediaInputs(updatedMedia);
    form.setValue("media", updatedMedia);
  };

  const handleImageEdit = (index: number) => {
    setTempMediaData({index, file: mediaInputs[index].file, isProfileImage: false});
    setCropImageUrl(mediaInputs[index].url);
    setShowCropper(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Add New Sheep' : 'Edit Sheep'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter sheep name" {...field} />
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
                        <Input placeholder="Enter registration name" {...field} />
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
                      <FormLabel>Breed *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select breed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Katahdin">Katahdin</SelectItem>
                          <SelectItem value="Dorper">Dorper</SelectItem>
                          <SelectItem value="St. Croix">St. Croix</SelectItem>
                          <SelectItem value="Barbados Blackbelly">Barbados Blackbelly</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Ram</SelectItem>
                          <SelectItem value="female">Ewe</SelectItem>
                        </SelectContent>
                      </Select>
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
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter color" {...field} />
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
                        <Input 
                          type="number" 
                          placeholder="Enter weight"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter description"
                        className="min-h-[100px]"
                        {...field}
                      />
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
                      <div className="space-y-4">
                        <Textarea
                          {...field}
                          placeholder="Health certifications, testing results, etc."
                          className="min-h-[100px]"
                        />
                        <div className="space-y-2">
                          <Label>Health Documents</Label>
                          <FileUpload
                            onFileSelect={(file) => handleDocumentUpload(file, 'health')}
                            accept="application/pdf,image/jpeg,image/png,video/*"
                            isUploading={isUploadingDoc}
                            skipCrop={true}
                          />
                          {healthDocuments.length > 0 && (
                            <div className="space-y-2">
                              {healthDocuments.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex items-center gap-2">
                                    {doc.mimeType.startsWith('image/') ? (
                                      <img
                                        src={doc.url}
                                        alt={doc.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : doc.mimeType.startsWith('video/') ? (
                                      <video
                                        src={doc.url}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                    <span className="truncate max-w-[200px]">{doc.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      asChild
                                    >
                                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeDocument(index, 'health')}
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

              <FormField
                control={form.control}
                name="pedigree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pedigree Information</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Textarea
                          {...field}
                          placeholder="Family history and lineage information"
                          className="min-h-[100px]"
                        />
                        <div className="space-y-2">
                          <Label>Pedigree Documents</Label>
                          <FileUpload
                            onFileSelect={(file) => handleDocumentUpload(file, 'pedigree')}
                            accept="application/pdf,image/jpeg,image/png,video/*"
                            isUploading={isUploadingDoc}
                            skipCrop={true}
                          />
                          {pedigreeDocuments.length > 0 && (
                            <div className="space-y-2">
                              {pedigreeDocuments.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                  <div className="flex items-center gap-2">
                                    {doc.mimeType.startsWith('image/') ? (
                                      <img
                                        src={doc.url}
                                        alt={doc.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : doc.mimeType.startsWith('video/') ? (
                                      <video
                                        src={doc.url}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-muted-foreground" />
                                      </div>
                                    )}
                                    <span className="truncate max-w-[200px]">{doc.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      asChild
                                    >
                                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                      </a>
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeDocument(index, 'pedigree')}
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

              {/* Media Management Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Images & Videos</Label>
                  <span className="text-sm text-muted-foreground">
                    Drag to reorder
                  </span>
                </div>

                {/* Drag and Drop Upload Area */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                    isDragActive 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-300 hover:border-primary hover:bg-gray-50",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <input {...getInputProps()} disabled={isUploading} />
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  {isDragActive ? (
                    <p className="text-sm text-primary font-medium">Drop the files here...</p>
                  ) : (
                    <div>
                      <p className="text-sm font-medium">
                        {isUploading ? "Uploading..." : "Drag & drop images/videos here, or click to browse"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, MP4, MOV up to 10MB each
                      </p>
                    </div>
                  )}
                </div>

                {/* Media Items */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <StrictModeDroppable droppableId="media">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {mediaInputs.map((media, index) => (
                          <Draggable key={`${media.url}-${index}`} draggableId={`${media.url}-${index}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "bg-white border rounded-lg p-3 flex items-center space-x-3",
                                  snapshot.isDragging && "shadow-lg"
                                )}
                              >
                                <div {...provided.dragHandleProps} className="cursor-move">
                                  <div className="w-2 h-4 bg-gray-400 rounded-sm flex flex-col justify-center">
                                    <div className="w-full h-0.5 bg-white mb-0.5"></div>
                                    <div className="w-full h-0.5 bg-white mb-0.5"></div>
                                    <div className="w-full h-0.5 bg-white"></div>
                                  </div>
                                </div>

                                {media.type === 'image' ? (
                                  <img
                                    src={media.tempUrl || media.url}
                                    alt={media.fileName || 'Media'}
                                    className="w-12 h-12 object-cover rounded"
                                    onError={(e) => {
                                      // Fallback to original URL if tempUrl fails
                                      if (media.tempUrl && e.currentTarget.src !== media.url) {
                                        e.currentTarget.src = media.url;
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-gray-500" />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {media.fileName || `${media.type === 'video' ? 'Video' : 'Image'} ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">{media.type}</p>
                                </div>

                                <div className="flex space-x-1">
                                  {media.type === 'image' && (
                                    <>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleImageEdit(index)}
                                        disabled={isUploading}
                                      >
                                        <Crop className="h-3 w-3" />
                                      </Button>
                                      <input
                                        type="file"
                                        id={`media-${index}`}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleMediaFileSelect(file, index);
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById(`media-${index}`)?.click()}
                                        disabled={isUploading}
                                      >
                                        <Upload className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteMedia(index)}
                                    disabled={isUploading}
                                  >
                                    <X className="h-3 w-3" />
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

                {mediaInputs.length === 0 && !isUploading && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No media files added yet. Drag and drop or click above to add images and videos.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show as available for sale
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

                <FormField
                  control={form.control}
                  name="sold"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Sold</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mark as sold
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

                <FormField
                  control={form.control}
                  name="died"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-red-50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base text-red-700">Died on Farm</FormLabel>
                        <div className="text-sm text-red-600">
                          Mark if the sheep has died on the farm
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

                <FormField
                  control={form.control}
                  name="display"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Display</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show publicly on website
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
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : mode === 'create' ? 'Create Sheep' : 'Update Sheep'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Image Crop Modal */}
      {showImageCrop && imageFile && (
        <ImageCrop
          imageUrl={URL.createObjectURL(imageFile)}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowImageCrop(false);
            setImageFile(null);
          }}
        />
      )}

      {/* Media Crop Modal */}
      {showCropper && cropImageUrl && (
        <ImageCrop
          imageUrl={cropImageUrl}
          onCropComplete={handleCroppedImage}
          onCancel={() => {
            setShowCropper(false);
            setCropImageUrl("");
            setTempMediaData(null);
          }}
        />
      )}
    </>
  );
}