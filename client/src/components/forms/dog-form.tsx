interface MediaInput {
  url: string;
  type: "image" | "video";
  fileName?: string;
  isNew?: boolean;
  file?: File;
}

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
import { useState, useEffect, useCallback } from "react";
import { X, ImageIcon, FileText, ExternalLink, Edit } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatInputDate, parseApiDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { StrictModeDroppable } from "@/components/ui/StrictModeDroppable";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { ImageCrop } from "@/components/ui/image-crop";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useNavigate } from "wouter";
import { uploadFileToS3 } from "../../lib/upload-utils";


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
    name: z.string().min(1, "Name is required"),
    registrationName: z.string().optional(),
    birthDate: z.string().optional(),
    gender: z.enum(["male", "female"]).optional(),
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
    pedigree: z.string().optional().nullable(),
    narrativeDescription: z.string().optional(),
    media: z.array(mediaSchema).optional(),
    outsideBreeder: z.boolean().default(false),
    puppy: z.boolean().default(false),
    available: z.boolean().default(false),
    price: z.string().optional(),
    breed: z.string().default("Colorado Mountain Dogs"),
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

  const handleCroppedImage = async (uploadedUrl: string) => {
    setIsUploading(true);
    try {
      if (uploadedUrl.startsWith('/uploads/')) {
        const timestampedUrl = `${uploadedUrl}?t=${Date.now()}`;
        if (tempMediaData) {
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
          form.setValue("profileImageUrl", timestampedUrl);
        }
        setShowCropper(false);
        setCropImageUrl("");
        setTempMediaData(null);
        setIsUploading(false);
        return;
      }

      if (uploadedUrl.startsWith('data:image/')) {
        const response = await fetch(uploadedUrl);
        const blob = await response.blob();
        const fileName = tempMediaData?.isProfileImage
          ? 'cropped-profile.jpg'
          : (tempMediaData?.file?.name || 'cropped-image.jpg');
        const newFile = new File([blob], fileName, { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', newFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status: ${uploadResponse.status}`);
        }

        const data = await uploadResponse.json();

        if (tempMediaData?.isProfileImage) {
          form.setValue("profileImageUrl", data.url);
        } else if (tempMediaData) {
          const updatedMedia = [...mediaInputs];
          updatedMedia[tempMediaData.index] = {
            url: data.url,
            type: 'image',
            fileName: fileName,
            isNew: true
          };
          setMediaInputs(updatedMedia);
          form.setValue("media", updatedMedia);
        }

        toast({ title: "Success", description: "Image cropped and uploaded successfully" });
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

  const handleMediaUpload = async (file: File, index: number) => {
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      setCropImageUrl(url);
      setTempMediaData({ file, index, isProfileImage: false });
      setShowCropper(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load image for cropping: ' + (error instanceof Error ? error.message : 'Unknown error'),
        variant: 'destructive',
      });
    }
  };

  const handleEditMedia = (index: number) => {
    const media = mediaInputs[index];
    if (media && media.type === "image") {
      // Create a proxy URL to handle CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(media.url)}`;
      setEditingMediaIndex(index);
      setCurrentMediaUrl(proxyUrl);
      setShowMediaCropDialog(true);
    }
  };

  const handleCroppedMediaImage = async (croppedImageUrl: string, cropData?: {x: number, y: number, width: number, height: number}) => {
    if (editingMediaIndex === null) return;

    try {
      setIsUploading(true);
      console.log('Starting image crop process with data:', cropData);

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = croppedImageUrl;
      });

      console.log('Image loaded with dimensions:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      if (cropData) {
        // Set canvas size to match crop dimensions
        canvas.width = cropData.width;
        canvas.height = cropData.height;

        console.log('Canvas dimensions set to:', {
          width: canvas.width,
          height: canvas.height
        });

        // Draw the cropped portion
        ctx.drawImage(
          img,
          cropData.x,         // Source X
          cropData.y,         // Source Y
          cropData.width,     // Source Width
          cropData.height,    // Source Height
          0,                  // Destination X
          0,                  // Destination Y
          cropData.width,     // Destination Width
          cropData.height     // Destination Height
        );

        console.log('Image drawn with crop coordinates:', {
          sourceX: cropData.x,
          sourceY: cropData.y,
          sourceWidth: cropData.width,
          sourceHeight: cropData.height
        });
      } else {
        console.warn('No crop data provided, using full image');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      }

      // Convert canvas to blob with high quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.95);
      });

      console.log('Canvas converted to blob, size:', blob.size);

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
      const uploadedUrl = Array.isArray(data) ? data[0].url : data.url;
      console.log('Image uploaded successfully:', uploadedUrl);

      const updatedMediaInputs = [...mediaInputs];
      updatedMediaInputs[editingMediaIndex] = {
        ...updatedMediaInputs[editingMediaIndex],
        url: uploadedUrl,
        isNew: true,
      };

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
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: "Failed to update image: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // ... rest of the component code ...

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitWrapper)} className="space-y-6">
        {/* ... other form fields ... */}

        {showMediaCropDialog && currentMediaUrl && (
          <Dialog open={showMediaCropDialog} onOpenChange={(open) => !open && setShowMediaCropDialog(false)}>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Edit Image</DialogTitle>
                <DialogDescription>
                  Adjust the crop area by dragging the corners. Click and drag inside to reposition.
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

        {/* ... rest of the form fields ... */}
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