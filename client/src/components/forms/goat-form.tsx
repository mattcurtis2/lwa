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
import { X, ImageIcon, FileText, Upload, Crop } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import ImageCrop from "@/components/ui/image-crop";
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
  file?: File; // Added file property
  tempUrl?: string; // Added temporary URL property
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
    pedigree: z.string().optional().nullable(),
    height: z.string().optional().nullable(),
    weight: z.string().optional().nullable(),
    milkStars: z.string().optional(),
    laArScores: z.string().optional(),
    damName: z.string().optional().nullable(),
    sireName: z.string().optional().nullable(),
    price: z.string().optional(),
    bucklingPrice: z.string().optional(),
    wetherPrice: z.string().optional(),
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
  const [tempMediaData, setTempMediaData] = useState<{ index: number; file: File | undefined; isProfileImage: boolean } | null>(null);


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
      pedigree: goat?.pedigree || "",
      height: goat?.height?.toString() || "",
      weight: goat?.weight?.toString() || "",
      milkStars: goat?.milkStars || "",
      laArScores: goat?.laArScores || "",
      damName: goat?.damName || "",
      sireName: goat?.sireName || "",
      price: goat?.price || "",
      bucklingPrice: goat?.bucklingPrice || "",
      wetherPrice: goat?.wetherPrice || "",
      profileImageUrl: goat?.profileImageUrl || "",
      media: goat?.media || [],
      outsideBreeder: Boolean(goat?.outsideBreeder),
      kid: Boolean(goat?.kid),
      available: Boolean(goat?.available),
      sold: Boolean(goat?.sold),
      display: goat?.display ?? true,
      motherId: goat?.motherId || null,
      fatherId: goat?.fatherId || null,
      litterId: goat?.litterId || null,
      documents: goat?.documents || []
    }
  });

  useEffect(() => {
    if (goat) {
      let media = goat.media?.map((m: any) => ({
        url: m.url,
        type: m.type as "image" | "video",
        fileName: m.fileName,
        isNew: false,
      })) || [];
      
      // If there's no media but there is a profileImageUrl, add it to the media array
      if (media.length === 0 && goat.profileImageUrl) {
        media = [{
          url: goat.profileImageUrl,
          type: "image",
          fileName: "profile-image.jpg",
          isNew: false,
        }];
      }

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
      console.log(`Goat Form - handleCroppedImage received URL: ${uploadedUrl.substring(0, 50)}...`);
      
      // Check if this is a media upload or profile image upload
      const isMediaUpload = tempMediaData !== null && !tempMediaData.isProfileImage;
      console.log(`Goat Form - isMediaUpload: ${isMediaUpload}, tempMediaData:`, tempMediaData);

      if (isMediaUpload) {
        // If it's a media upload, use applyCroppedMediaImage
        console.log('Goat Form - Using applyCroppedMediaImage for media upload');
        await applyCroppedMediaImage(uploadedUrl);
        return;
      }

      // If the URL is already a server URL or an S3 URL, use it directly
      if (uploadedUrl.startsWith('/uploads/') || uploadedUrl.includes('lwacontent') || uploadedUrl.includes('amazonaws.com')) {
        // Add a timestamp to prevent caching
        const timestampedUrl = `${uploadedUrl}?t=${Date.now()}`;
        console.log(`Goat Form - Using existing URL with timestamp: ${timestampedUrl.substring(0, 50)}...`);

        if (isMediaUpload && tempMediaData) {
          // Update media at the specific index
          console.log(`Goat Form - Updating media at index ${tempMediaData.index}`);
          const updatedMedia = [...mediaInputs];
          updatedMedia[tempMediaData.index] = {
            url: timestampedUrl,
            type: 'image',
            fileName: tempMediaData.file?.name || 'cropped-image.jpg',
            isNew: true
          };
          setMediaInputs(updatedMedia);
          form.setValue("media", updatedMedia);
        } else {
          // Update profile image
          console.log('Goat Form - Updating profile image URL');
          form.setValue("profileImageUrl", timestampedUrl);
        }
        setShowCropper(false);
        setCropImageUrl("");
        setTempMediaData(null);
        setIsUploading(false);
        return;
      }

      // For new cropped images from data URL
      if (uploadedUrl.startsWith('data:image/')) {
        console.log('Goat Form - Processing data URL image for upload');
        try {
          // Create a Blob from the data URL
          const response = await fetch(uploadedUrl);
          const blob = await response.blob();
          console.log(`Goat Form - Created blob from data URL, size: ${blob.size} bytes`);

          // Create a new File object from the Blob
          const fileName = isMediaUpload && tempMediaData?.file 
            ? tempMediaData.file.name 
            : 'goat-profile-image.jpg';  // More specific name
          console.log(`Goat Form - Using filename: ${fileName}`);

          const newFile = new File([blob], fileName, { type: 'image/jpeg' });
          console.log(`Goat Form - Created File object, size: ${newFile.size} bytes`);

          // Create form data for upload
          const formData = new FormData();
          formData.append('file', newFile);
          console.log('Goat Form - FormData created with file');

          // Upload the file
          console.log('Goat Form - Starting upload to /api/upload');
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          console.log(`Goat Form - Upload response status: ${uploadResponse.status}`);
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`Goat Form - Upload failed with status: ${uploadResponse.status}, response: ${errorText}`);
            throw new Error(`Upload failed with status: ${uploadResponse.status}. Server response: ${errorText}`);
          }

          const data = await uploadResponse.json();
          console.log('Goat Form - Upload successful, received data:', data);

          // Extract URL consistently whether it's an array or single object
          const uploadUrl = Array.isArray(data) ? data[0]?.url : data.url;
          console.log(`Goat Form - Extracted URL: ${uploadUrl}`);

          if (isMediaUpload && tempMediaData) {
            // Update media at the specific index
            console.log(`Goat Form - Updating media at index ${tempMediaData.index}`);
            const updatedMedia = [...mediaInputs];
            updatedMedia[tempMediaData.index] = {
              url: uploadUrl,
              type: 'image',
              fileName: fileName,
              isNew: true
            };
            setMediaInputs(updatedMedia);
            form.setValue("media", updatedMedia);
          } else {
            // Update profile image
            console.log('Goat Form - Updating profile image URL');
            form.setValue("profileImageUrl", uploadUrl);
          }

          toast({ title: "Success", description: "Image cropped and uploaded successfully" });
        } catch (uploadError) {
          console.error('Goat Form - Error during file upload:', uploadError);
          throw uploadError; // Re-throw to be caught by the outer catch block
        }
      } else {
        throw new Error("Invalid image format received from cropper");
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
      console.log("Document upload response:", data);
      
      // The API returns an array of uploaded files
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("Invalid response from upload API");
      }
      
      const fileData = data[0];
      const newDoc = {
        url: fileData.url,
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
      console.error("Document upload error:", error);
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

  const applyCroppedMediaImage = async (croppedImageUrl: string) => {
    setIsUploading(true);
    try {
      const { index, file, isProfileImage } = tempMediaData!;
      const updatedMedia = [...mediaInputs];
      const formData = new FormData();
      formData.append('file', await (await fetch(croppedImageUrl)).blob(), 'cropped-image.jpg');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
          throw new Error('Failed to upload image.');
      }

      const data = await res.json();
      const imageUrl = data[0].url;
      const timestampedUrl = `${imageUrl}?t=${Date.now()}`;

      updatedMedia[index] = {
        ...updatedMedia[index],
        url: imageUrl,
        file,
        tempUrl: timestampedUrl,
        type: 'image',
        isNew: true,
      };

      setMediaInputs(updatedMedia);
      form.setValue("media", updatedMedia);
      setTempMediaData(null);
      toast({ title: "Success", description: "Image cropped and uploaded successfully" });
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
  }

  const onSubmit = async (values: z.infer<typeof goatSchema>) => {
    try {
      // Handle price fields correctly
      const processEmptyPrice = (price: string | null | undefined) => {
        if (price === '' || price === null || price === undefined) {
          return null; // Explicitly set null for empty values
        } else if (price === '0' || price === 0) {
          return 0; // Keep 0 as a valid price
        } else {
          return price; // Keep other values as they are
        }
      };

      const priceValue = processEmptyPrice(values.price);
      const bucklingPriceValue = processEmptyPrice(values.bucklingPrice);
      const wetherPriceValue = processEmptyPrice(values.wetherPrice);
      
      const processedValues = {
        ...values,
        height: values.height ? parseFloat(values.height) : undefined,
        weight: values.weight ? parseFloat(values.weight) : undefined,
        price: priceValue, // Use our processed price value
        bucklingPrice: bucklingPriceValue, // Add processed buckling price
        wetherPrice: wetherPriceValue, // Add processed wether price
        sold: Boolean(values.sold),
        available: Boolean(values.available),
        kid: Boolean(values.kid),
        outsideBreeder: Boolean(values.outsideBreeder),
        display: Boolean(values.display),
        media: mediaInputs
          .filter(media => media && media.url)
          .map(media => ({
            url: media.url,
            type: media.type || 'image',
            fileName: media.fileName || ''
          })),
        documents: [
          ...healthDocuments.map(doc => ({ ...doc, type: 'health' })),
          ...pedigreeDocuments.map(doc => ({ ...doc, type: 'pedigree' }))
        ]
      };

      const url = goat?.id ? `/api/goats/${goat.id}` : '/api/goats';
      const method = goat?.id ? 'PUT' : 'POST';

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

      await queryClient.invalidateQueries({ queryKey: ['/api/goats'] });

      toast({
        title: "Success",
        description: `Goat ${goat?.id ? 'updated' : 'created'} successfully`,
      });

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save goat',
        variant: "destructive",
      });
    }
  };

  const handleMediaCrop = async (index: number) => {
    handleCropImage(index);
  };

  const handleCropImage = (index: number, file?: File, isProfileImage: boolean = false) => {
    const mediaItem = mediaInputs[index];
    if (mediaItem) {
      setTempMediaData({ index, file, isProfileImage });
      setCropImageUrl(mediaItem.url);
      setShowCropper(true);
    }
  };


  const processImageUrl = (url: string): string => {
    // Avoid double-proxying by checking if the URL already contains proxy-image
    if (url && url.includes('proxy-image')) {
      return url;
    }

    // Only proxy S3 URLs that are not already proxied
    if (url && (url.includes('lwacontent.s3') || url.startsWith('https://s3'))) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const handleRemoveMedia = (index: number) => {
    const updatedMedia = [...mediaInputs];
    updatedMedia.splice(index, 1);
    setMediaInputs(updatedMedia);
    form.setValue("media", updatedMedia);
  };

  const handleMediaRemove = (index: number) => {
    const updatedMedia = [...mediaInputs];
    updatedMedia.splice(index, 1);
    setMediaInputs(updatedMedia);
    form.setValue('media', updatedMedia);
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
                      setTempMediaData({ index: 0, file: undefined, isProfileImage: true }); //Added for consistency
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
                  {isUploading && (
                    <div className="flex items-center">
                      <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      <span>Uploading...</span>
                    </div>
                  )}
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      console.log('Goat Form - Remove Picture button clicked');
                      field.onChange('');
                      console.log('Goat Form - Profile picture field cleared');
                    }}
                    className="text-red-500 hover:text-red-600"
                  >
                    Remove Picture
                  </Button>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCropper && cropImageUrl && (
          <ImageCrop 
            imageUrl={processImageUrl(cropImageUrl)} // Apply proxy processing here
            aspect={1}
            circularCrop={false} // Modified: Set circularCrop to false
            onCropComplete={handleCroppedImage}
            onCancel={() => {
              setShowCropper(false);
              setCropImageUrl("");
              setTempMediaData(null);
            }}
            onSkip={async () => {
              setIsUploading(true);
              try {
                // If user skips cropping, upload the original image
                const response = await fetch(cropImageUrl);
                const blob = await response.blob();
                const formData = new FormData();
                formData.append('file', blob, 'original-image.jpg');

                const uploadRes = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData
                });

                if (!uploadRes.ok) {
                  throw new Error('Failed to upload image');
                }

                const data = await uploadRes.json();
                if (data && data.length > 0) {
                  // Update the form with the uploaded image URL
                  form.setValue('profileImageUrl', data[0].url, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                  form.trigger('profileImageUrl');
                }

                toast({
                  title: "Success",
                  description: "Image uploaded successfully",
                });
              } catch (error) {
                toast({
                  title: 'Error',
                  description: 'Failed to upload image',
                  variant: 'destructive',
                });
              } finally {
                setIsUploading(false);
                setShowCropper(false);
                setCropImageUrl("");
                setTempMediaData(null);
              }
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

        <FormField
          control={form.control}
          name="sireName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sire Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter sire's registration or farm name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="damName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dam Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter dam's registration or farm name" />
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
                  />
                  <div className="space-y-2">
                    <Label>Pedigree Documents</Label>
                    <FileUpload
                      onFileSelect={(file) => handleDocumentUpload(file, 'pedigree')}
                      accept="application/pdf,image/jpeg,image/png"
                      isUploading={isUploadingDoc}
                      skipCrop={true}
                    />
                    {pedigreeDocuments.length > 0 && (
                      <div className="space-y-2">
                        {pedigreeDocuments.map((doc, index) => (
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
                                onClick={() => removeDocument(index, 'pedigree')}
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
                  className="grid gridcols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
                            <>
                              <img
                                src={input.tempUrl || input.url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover cursorpointer transition-transform group-hover:scale-105"
                                onClick={() => handleMediaFileSelect(input.file as File, index)}
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div 
                                  className="bg-white/90 rounded-md py-1 px-3 cursor-pointer hover:bg-white"
                                  onClick={() => handleImageEdit(index)}
                                >
                                  Edit Image
                                </div>
                              </div>
                              <button 
                                type="button"
                                onClick={() => handleDeleteMedia(index)}
                                className="absolute top-2 right-2 bg-red-5000 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Delete media"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          ) : input.type === 'video' ? (
                            <>
                              <video
                                src={input.url}
                                className="w-full h-full object-cover"
                                controls
                              />
                              <button 
                                type="button"
                                onClick={() => handleDeleteMedia(index)}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                aria-label="Delete media"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          ) : null}
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
          
          <FormField
            control={form.control}
            name="display"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Display on Website</FormLabel>
                  <FormDescription className="text-xs">
                    When turned off, this goat will only be visible in the admin panel
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
        </div>

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter price" 
                  {...field} 
                  value={field.value === null ? '' : field.value}
                  onChange={(e) => {
                    // Allow empty string to clear the field
                    const value = e.target.value.trim() === '' ? null : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                {form.getValues("gender") === "male" 
                  ? "Optional general price for male goat (will be shown when marked as available)." 
                  : "Optional price for the goat (will be shown when marked as available). Leave empty to remove price."}
              </FormDescription>
            </FormItem>
          )}
        />

        {form.getValues("gender") === "male" && (
          <>
            <FormField
              control={form.control}
              name="bucklingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buckling Price</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter buckling price" 
                      {...field} 
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        // Allow empty string to clear the field
                        const value = e.target.value.trim() === '' ? null : e.target.value;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional price when sold as a buckling. Leave empty to remove price.
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wetherPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wether Price</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter wether price" 
                      {...field} 
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        // Allow empty string to clear the field
                        const value = e.target.value.trim() === '' ? null : e.target.value;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional price when sold as a wether. Leave empty to remove price.
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        )}
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