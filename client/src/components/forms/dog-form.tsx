import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";

// UI imports
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageCrop } from "@/components/ui/image-crop";

// Icons & Utils
import { X, ImageIcon, FileText, ExternalLink, Edit, Upload } from "lucide-react";
import { formatInputDate, parseApiDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { uploadFileToS3 } from "../../lib/upload-utils";

// Other components
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useDropzone } from 'react-dropzone';
import { useLocation } from "wouter";

// Types
import { Dog, DogMedia } from "@db/schema";

interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
  file?: File;
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

const createDogSchema = (isPuppy: boolean = false) => {
  const baseSchema = {
    name: z.string().optional(),
    registrationName: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
    motherId: z.number().optional().nullable(),
    fatherId: z.number().optional().nullable(),
    litterId: z.number().optional().nullable(),
    description: z.string().optional().nullable(),
    profileImageUrl: z.string().optional(),
    healthData: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    dewclaws: z.string().optional().nullable(),
    furLength: z.string().optional().nullable(),
    height: z.string().optional().nullable(),
    weight: z.string().optional().nullable(),
    pedigree: z.string().optional().nullable(),
    narrativeDescription: z.string().optional(),
    media: z.array(mediaSchema).optional(),
    outsideBreeder: z.boolean().optional().default(false),
    puppy: z.boolean().optional().default(false),
    available: z.boolean().optional().default(false),
    price: z.string().optional(),
    breed: z.string().optional().default("Colorado Mountain Dogs"),
    documents: z.array(z.object({
      type: z.string(),
      url: z.string(),
      name: z.string(),
      mimeType: z.string()
    })).optional()
  };

  return z.object(baseSchema);
};

interface DogFormProps {
  dog?: Dog & { media?: DogMedia[]; documents?: Document[] };
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
  const [mediaInputs, setMediaInputs] = useState<MediaInput[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [inputMethod, setInputMethod] = useState<"url" | "upload">("url");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [healthDocuments, setHealthDocuments] = useState<Document[]>([]);
  const [pedigreeDocuments, setPedigreeDocuments] = useState<Document[]>([]);
  const [availableMothers, setAvailableMothers] = useState<Dog[]>([]);
  const [availableFathers, setAvailableFathers] = useState<Dog[]>([]);
  const [availableLitters, setAvailableLitters] = useState<any[]>([]);
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [tempMediaData, setTempMediaData] = useState<{ index: number; file: File; isProfileImage: boolean } | null>(null);
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);
  const [showMediaCropDialog, setShowMediaCropDialog] = useState(false);
  const [currentMediaUrl, setCurrentMediaUrl] = useState("");
  const [completedCrop, setCompletedCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(null);


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
      outsideBreeder: defaultValues?.outsideBreeder ?? false,
      puppy: defaultValues?.puppy ?? isPuppy,
      available: defaultValues?.available ?? false,
      sold: Boolean(defaultValues?.sold),
      price: defaultValues?.price || "",
      breed: defaultValues?.breed || "Colorado Mountain Dogs",
      documents: defaultValues?.documents || []
    }
  });

  useEffect(() => {
    if (!fromLitter) {
      const fetchParents = async () => {
        const response = await fetch('/api/dogs');
        const dogs = await response.json();

        const mothers = dogs.filter((d: Dog) => d.gender === 'female');
        const fathers = dogs.filter((d: Dog) => d.gender === 'male');

        setAvailableMothers(mothers);
        setAvailableFathers(fathers);
      };
      fetchParents();
    }
  }, [fromLitter]);

  useEffect(() => {
    if (!fromLitter) {
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
    }
  }, [form.watch('motherId'), form.watch('fatherId'), fromLitter]);

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
        documents: dog.documents || []
      });

      const media = dog.media?.map(m => ({
        url: m.url,
        type: m.type as "image" | "video",
        fileName: m.fileName,
        isNew: false,
      })) || [];

      setMediaInputs(media);

      if (dog.documents) {
        const health = dog.documents.filter(doc => doc.type === 'health');
        const pedigree = dog.documents.filter(doc => doc.type === 'pedigree');
        setHealthDocuments(health);
        setPedigreeDocuments(pedigree);
      }
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
    try {
      const url = await uploadFileToS3(file);

      const fileType = file.type.startsWith('video/') ? 'video' : 'image';

      const newMedia = {
        url: url,
        type: fileType,
        fileName: file.name,
        isNew: true,
        file: file,
      };

      const newInputs = [newMedia, ...mediaInputs];
      setMediaInputs(newInputs);
      form.setValue("media", newInputs);
      setShowAddMedia(false);
    } catch (error) {
      console.error('Upload error:', error);
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
      setTempMediaData({ file, isProfileImage: true });
      setShowCropper(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load image for cropping',
        variant: 'destructive',
      });
    }
  };

  const handleCroppedImage = async (croppedImageUrl: string, cropData: { x: number; y: number; width: number; height: number }) => {
    try {
      console.log('[DogForm] Handle cropped image started');
      console.log('[DogForm] Crop data:', cropData);
      console.log('[DogForm] Cropped image URL length:', croppedImageUrl.length);

      setIsUploadingProfile(true);

      // Convert data URL to blob
      const byteString = atob(croppedImageUrl.split(',')[1]);
      const mimeType = croppedImageUrl.split(',')[0].split(':')[1].split(';')[0];

      console.log('[DogForm] Converting data URL to blob with type:', mimeType);

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);

      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeType });
      console.log('[DogForm] Blob created with size:', blob.size);

      // Create form data and upload
      const formData = new FormData();
      formData.append('file', blob, 'cropped-image.jpg');

      console.log('[DogForm] Uploading cropped image...');
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(`Failed to upload image: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      const data = await uploadRes.json();
      console.log('[DogForm] Upload response:', data);

      const imageUrl = Array.isArray(data) ? data[0].url : data.url;
      console.log('[DogForm] Setting profile image URL to:', imageUrl);

      form.setValue("profileImageUrl", imageUrl);
      toast({
        title: "Image cropped and uploaded",
        description: "Profile image has been updated.",
      });
    } catch (error) {
      console.error('[DogForm] Error cropping image:', error);
      toast({
        title: "Error",
        description: "Failed to crop image: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfile(false);
      setShowCropper(false);
      setCropImageUrl("");
    }
  };


  const handleDocumentUpload = async (file: File, type: 'health' | 'pedigree') => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error('Invalid file object');
      }

      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File too large');
      }

      setIsUploadingDoc(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 30000);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Upload failed');
        }

        const data = await res.json();

        if (!data || (!Array.isArray(data) && !data.url)) {
          throw new Error('Invalid response format from server');
        }

        const uploadedFile = Array.isArray(data) ? data[0] : data;

        if (!uploadedFile?.url) {
          throw new Error('Missing URL in upload response');
        }

        const newDoc = {
          url: uploadedFile.url,
          type,
          name: file.name,
          mimeType: file.type,
          isNew: true,
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
          if (error.name === 'AbortError') {
            errorMessage = "Upload timed out - please try again";
          } else {
            errorMessage = error.message;
          }
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsUploadingDoc(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
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

  const formatDisplayDate = (date: Date) => format(date, 'yyyy-MM-dd');

  const onSubmitWrapper = async (values: any) => {
    try {
      const processedValues = {
        ...values,
        height: values.height ? parseFloat(values.height) : null,
        weight: values.weight ? parseFloat(values.weight) : null,
        price: values.price && values.price !== "" ? parseInt(values.price.replace(/,/g, '')) : null,
        motherId: values.motherId || null,
        fatherId: values.fatherId || null,
        litterId: values.litterId || null,
        breed: "Colorado Mountain Dogs",
        available: Boolean(values.available),
        puppy: Boolean(values.puppy),
        outsideBreeder: Boolean(values.outsideBreeder),
        documents: [
          ...healthDocuments.map(doc => ({ ...doc, type: 'health' })),
          ...pedigreeDocuments.map(doc => ({ ...doc, type: 'pedigree' }))
        ],
        description: values.description || null,
        narrativeDescription: values.narrativeDescription || null,
        healthData: values.healthData || null,
        color: values.color || null,
        dewclaws: values.dewclaws || null,
        furLength: values.furLength || null,
        pedigree: values.pedigree || null,
        registrationName: values.registrationName || null,
        media: values.media || []
      };

      Object.keys(processedValues).forEach(key => {
        if (processedValues[key] === undefined) {
          delete processedValues[key];
        }
      });

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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save dog');
      }

      const savedDog = await response.json();

      toast({
        title: "Success",
        description: `Dog ${dog?.id ? 'updated' : 'created'} successfully`,
      });

      if (onSubmit) {
        await onSubmit(savedDog);
      }

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
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
    maxSize: 10485760,
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      try {
        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Upload failed");
          }

          const data = await res.json();
          if (data && data[0]?.url) {
            const fileType = file.type.startsWith('video/') ? 'video' : 'image';
            const newMedia = {
              url: data[0].url,
              type: fileType,
              fileName: file.name,
              isNew: true,
              file: file,
            };

            setMediaInputs(prev => [newMedia, ...prev]);
            form.setValue("media", [newMedia, ...form.getValues("media")]);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload one or more files",
          variant: "destructive",
        });
      }
    }, [form, toast]),
    onDropRejected: (rejectedFiles) => {
      toast({
        title: "Error",
        description: "Some files were rejected. Please check the file type and size.",
        variant: "destructive",
      });
    }
  });

  const handleMediaFileSelect = async (file: File, index: number) => {
    if (!file) return;

    setTempMediaData({ file, index, isProfileImage: false });

    try {
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

  const applyCroppedMediaImage = async (croppedImageUrl: string) => {
    if (tempMediaData) {
      try {
        const formData = new FormData();
        const res = await fetch(croppedImageUrl);
        const blob = await res.blob();
        const croppedFile = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        formData.append('file', croppedFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await uploadRes.json();
        const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;

        const updatedMediaInputs = [...mediaInputs];
        updatedMediaInputs[mediaInputs.indexOf(tempMediaData)] = {...tempMediaData, url: uploadedUrl};
        setMediaInputs(updatedMediaInputs);
        form.setValue("media", updatedMediaInputs);

        setShowCropper(false);
        setCropImageUrl("");
        setTempMediaData(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload cropped image: " + (error instanceof Error ? error.message : "Unknown error"),
          variant: "destructive",
        });
        setShowCropper(false);
        setCropImageUrl("");
        setTempMediaData(null);
      }
    }
  };

  const processMediaCrop = async (croppedImageUrl: string) => {
    if (!tempMediaData) return;
    setIsUploading(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = tempMediaData.file ? URL.createObjectURL(tempMediaData.file) : croppedImageUrl;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], tempMediaData.file.name || 'cropped-image.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status: ${uploadResponse.status}`);
        }

        const data = await uploadResponse.json();
        const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;

        const updatedMediaInputs = [...mediaInputs];
        updatedMediaInputs[tempMediaData.index] = { ...updatedMediaInputs[tempMediaData.index], url: uploadedUrl };
        setMediaInputs(updatedMediaInputs);
        form.setValue("media", updatedMediaInputs);

        toast({ title: "Success", description: "Image cropped and uploaded successfully" });

      } else {
        throw new Error("Failed to get 2D context from canvas");
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

  const handleEditMedia = (index: number) => {
    const media = mediaInputs[index];
    if (media && media.type === "image") {
      console.log('[DogForm] Editing media at index:', index, 'Media:', media);
      // Create a proxy URL to handle CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(media.url)}`;
      console.log('[DogForm] Created proxy URL:', proxyUrl);
      setEditingMediaIndex(index);
      setCurrentMediaUrl(proxyUrl);
      setShowMediaCropDialog(true);
    }
  };

  const handleCroppedMediaImage = async (croppedImageUrl: string, cropData: { x: number; y: number; width: number; height: number }) => {
    if (editingMediaIndex === null) return;
    console.log('[DogForm] Starting image crop process');
    console.log('[DogForm] Crop data received:', cropData);

    try {
      setIsUploading(true);

      // Convert data URL to blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      // Create form data and upload
      console.log('[DogForm] Creating form data for upload');
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
      console.log('[DogForm] Upload response:', data);
      const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;

      // Update the media inputs with the new cropped image
      const updatedMediaInputs = [...mediaInputs];
      updatedMediaInputs[editingMediaIndex] = {
        ...updatedMediaInputs[editingMediaIndex],
        url: uploadedUrl,
        isNew: true,
      };

      console.log('[DogForm] Updating media inputs with new URL:', uploadedUrl);
      setMediaInputs(updatedMediaInputs);
      form.setValue("media", updatedMediaInputs);

      setShowMediaCropDialog(false);
      setEditingMediaIndex(null);
      setCurrentMediaUrl("");

      toast({
        title: "Success",
        description: "Image updated successfully",
      });
    } catch (error) {
      console.error('[DogForm] Error updating image:', error);
      toast({
        title: "Error",
        description: "Failed to update image: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitWrapper)} className="space-y-6">
        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field}) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormDescription>
                Upload a profile picture for the dog              </FormDescription>
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => field.onChange('')}
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
            imageUrl={cropImageUrl}
            onCropComplete={handleCroppedImage}
            onCancel={() => {
              setShowCropper(false);
              setCropImageUrl("");
              setTempMediaData(null);
            }}
            onSkip={async () => {
              const formData = new FormData();
              const response = awaitfetch(cropImageUrl);
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

              if (cropImageUrl === form.getValues("profileImageUrl")) {
                form.setValue("profileImageUrl", uploadedUrl);
              } else {
                const updatedMediaInputs = [...mediaInputs, {
                  url: uploadedUrl,
                  type: 'image' as const,
                  fileName: 'image.jpg',
                  isNew: true,
                  file: new File([blob], 'image.jpg', { type: 'image/jpeg' })
                }];
                setMediaInputs(updatedMediaInputs);
                form.setValue("media", updatedMediaInputs);
              }

              setShowCropper(false);
              setCropImageUrl("");
            }}
            aspect={cropImageUrl === form.getValues("profileImageUrl") ? 1 : undefined}
            circularCrop={cropImageUrl === form.getValues("profileImageUrl")}
          />
        )}
        {showMediaCropDialog && currentMediaUrl && (
          <Dialog open={showMediaCropDialog} onOpenChange={(open) => !open && setShowMediaCropDialog(false)}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Edit Image</DialogTitle>
                <DialogDescription>
                  Adjust the crop area by dragging the corners. Click and drag inside the crop area to reposition.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <ImageCrop
                  imageUrl={currentMediaUrl}
                  onCropComplete={(croppedImageUrl, cropData) => handleCroppedMediaImage(croppedImageUrl, cropData)}
                  onCancel={() => {
                    setShowMediaCropDialog(false);
                    setEditingMediaIndex(null);
                    setCurrentMediaUrl("");
                  }}
                  aspect={16/9}
                />
              </div>
            </DialogContent>
          </Dialog>
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
        {!fromLitter && !defaultValues?.motherId && !defaultValues?.fatherId && (
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
                    }}
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
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      const newValue = value === "none" ? null : parseInt(value);
                      field.onChange(newValue);
                    }}
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
                    value={field.value?.toString() || ""}
                    onValueChange={(value) => {
                      const newValue = value === "none" ? null : parseInt(value);
                      field.onChange(newValue);
                    }}
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
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormControl>
                  <Input {...field} defaultValue="Colorado Mountain Dogs" readOnly />
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
                    placeholder="Family history and lineage information" />
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
            <StrictModeDroppable droppableId="media-list">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {mediaInputs.map((media, index) => (
                    <Draggable key={`media-${index}`} draggableId={`media-${index}`} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="relative group aspect-video bg-muted rounded-lg overflow-hidden"
                        >
                          {media.type === "image" ? (
                            <div className="relative w-full h-full">
                              <img
                                src={media.url}
                                alt={media.fileName || `Media ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                                <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleEditMedia(index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeMediaInput(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full h-full">
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                controls
                              />
                              <div className="absolute top-2 right-2">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeMediaInput(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
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
              name="sold"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Sold</FormLabel>
                    <FormDescription>
                      Mark this if the dog has been sold
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
                        const value = e.target.value.replace(/[^\d]/g, '');
                        const formattedValue = value ? parseInt(value).toLocaleString() : '';
                        field.onChange(formattedValue);
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
  file?: File;
}