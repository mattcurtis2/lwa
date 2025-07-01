import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Upload, FileText, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatInputDate } from "@/lib/date-utils";
import type { Sheep } from "@db/schema";

const sheepFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registrationName: z.string().optional(),
  breed: z.string().min(1, "Breed is required"),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().min(1, "Birth date is required"),
  description: z.string().optional(),
  motherId: z.number().optional(),
  fatherId: z.number().optional(),
  damName: z.string().optional(),
  sireName: z.string().optional(),
  litterId: z.number().optional(),
  lamb: z.boolean().default(false),
  available: z.boolean().default(false),
  sold: z.boolean().default(false),
  display: z.boolean().default(true),
  price: z.string().optional(),
  ramPrice: z.string().optional(),
  wetherPrice: z.string().optional(),
  healthData: z.string().optional(),
  color: z.string().optional(),
  fleeceType: z.string().optional(),
  fleeceWeight: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  pedigree: z.string().optional(),
  narrativeDescription: z.string().optional(),
  order: z.number().default(0),
  outsideBreeder: z.boolean().default(false),
});

type SheepFormData = z.infer<typeof sheepFormSchema>;

interface SheepFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheep?: Sheep | null;
  mode: 'create' | 'edit';
  fromLitter?: boolean;
}

export default function SheepForm({ open, onOpenChange, sheep, mode, fromLitter = false }: SheepFormProps) {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [media, setMedia] = useState<{ url: string; type: string }[]>([]);
  const [documents, setDocuments] = useState<{ url: string; type: string; name: string; mimeType: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: allSheep = [] } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep", "admin"],
    queryFn: () => fetch("/api/sheep/admin").then(res => res.json()),
  });

  const form = useForm<SheepFormData>({
    resolver: zodResolver(sheepFormSchema),
    defaultValues: {
      name: "",
      registrationName: "",
      breed: "Katahdin",
      gender: "female",
      birthDate: "",
      description: "",
      damName: "",
      sireName: "",
      lamb: false,
      available: false,
      sold: false,
      display: true,
      price: "",
      ramPrice: "",
      wetherPrice: "",
      healthData: "",
      color: "",
      fleeceType: "",
      order: 0,
      outsideBreeder: false,
    },
  });

  // Reset form when sheep data changes
  useEffect(() => {
    if (sheep && mode === 'edit') {
      const birthDate = sheep.birthDate ? formatInputDate(new Date(sheep.birthDate)) : "";
      
      form.reset({
        name: sheep.name || "",
        registrationName: sheep.registrationName || "",
        breed: sheep.breed || "Katahdin",
        gender: sheep.gender as "male" | "female",
        birthDate,
        description: sheep.description || "",
        motherId: sheep.motherId || undefined,
        fatherId: sheep.fatherId || undefined,
        damName: sheep.damName || "",
        sireName: sheep.sireName || "",
        litterId: sheep.litterId || undefined,
        lamb: sheep.lamb || false,
        available: sheep.available || false,
        sold: sheep.sold || false,
        display: sheep.display !== false,
        price: sheep.price || "",
        ramPrice: sheep.ramPrice || "",
        wetherPrice: sheep.wetherPrice || "",
        healthData: sheep.healthData || "",
        color: sheep.color || "",
        fleeceType: sheep.fleeceType || "",
        fleeceWeight: sheep.fleeceWeight ? Number(sheep.fleeceWeight) : undefined,
        height: sheep.height ? Number(sheep.height) : undefined,
        weight: sheep.weight ? Number(sheep.weight) : undefined,
        pedigree: sheep.pedigree || "",
        narrativeDescription: sheep.narrativeDescription || "",
        order: sheep.order || 0,
        outsideBreeder: sheep.outsideBreeder || false,
      });

      // Set profile image preview
      if (sheep.profileImageUrl) {
        setProfileImagePreview(sheep.profileImageUrl);
      }

      // Set existing media
      if (sheep.media) {
        setMedia(sheep.media.map(m => ({ url: m.url, type: m.type })));
      }

      // Set existing documents
      if (sheep.documents) {
        setDocuments(sheep.documents.map(d => ({ 
          url: d.url, 
          type: d.type, 
          name: d.name, 
          mimeType: d.mimeType 
        })));
      }
    } else {
      // Reset for create mode
      form.reset({
        name: "",
        registrationName: "",
        breed: "Katahdin",
        gender: "female",
        birthDate: "",
        description: "",
        damName: "",
        sireName: "",
        lamb: false,
        available: false,
        sold: false,
        display: true,
        price: "",
        ramPrice: "",
        wetherPrice: "",
        healthData: "",
        color: "",
        fleeceType: "",
        order: 0,
        outsideBreeder: false,
      });
      setProfileImage(null);
      setProfileImagePreview("");
      setMedia([]);
      setDocuments([]);
    }
  }, [sheep, mode, form]);

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('file', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedFiles = await response.json();
        setMedia(prev => [...prev, ...uploadedFiles]);
        toast({
          title: "Success",
          description: "Media uploaded successfully",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('file', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedFiles = await response.json();
        const newDocuments = uploadedFiles.map((file: any) => ({
          url: file.url,
          type: 'health', // Default type
          name: file.originalName || 'Document',
          mimeType: file.mimeType || 'application/pdf'
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
        toast({
          title: "Success",
          description: "Documents uploaded successfully",
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SheepFormData) => {
    try {
      const formData = new FormData();
      
      // Add profile image if selected
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      // Add form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add media and documents as JSON
      formData.append('media', JSON.stringify(media));
      formData.append('documents', JSON.stringify(documents));

      const url = mode === 'edit' ? `/api/sheep/${sheep?.id}` : '/api/sheep';
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/sheep"] });
        queryClient.invalidateQueries({ queryKey: ["/api/sheep", "admin"] });
        toast({
          title: "Success",
          description: `Sheep ${mode === 'edit' ? 'updated' : 'created'} successfully`,
        });
        onOpenChange(false);
      } else {
        throw new Error('Failed to save sheep');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} sheep`,
        variant: "destructive",
      });
    }
  };

  if (!open) return null;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter sheep name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="registrationName">Registration Name</Label>
              <Input
                id="registrationName"
                {...form.register("registrationName")}
                placeholder="Enter registration name"
              />
            </div>

            <div>
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                {...form.register("breed")}
                placeholder="Enter breed"
              />
              {form.formState.errors.breed && (
                <p className="text-sm text-red-600">{form.formState.errors.breed.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select onValueChange={(value) => form.setValue("gender", value as "male" | "female")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate">Birth Date *</Label>
              <Input
                id="birthDate"
                type="date"
                {...form.register("birthDate")}
              />
              {form.formState.errors.birthDate && (
                <p className="text-sm text-red-600">{form.formState.errors.birthDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                {...form.register("color")}
                placeholder="Enter color"
              />
            </div>

            <div>
              <Label htmlFor="damName">Dam Name</Label>
              <Input
                id="damName"
                {...form.register("damName")}
                placeholder="Enter dam name"
              />
            </div>

            <div>
              <Label htmlFor="sireName">Sire Name</Label>
              <Input
                id="sireName"
                {...form.register("sireName")}
                placeholder="Enter sire name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter description"
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="physical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (inches)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                {...form.register("height", { valueAsNumber: true })}
                placeholder="Enter height"
              />
            </div>

            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                {...form.register("weight", { valueAsNumber: true })}
                placeholder="Enter weight"
              />
            </div>

            <div>
              <Label htmlFor="fleeceType">Fleece Type</Label>
              <Input
                id="fleeceType"
                {...form.register("fleeceType")}
                placeholder="Enter fleece type"
              />
            </div>

            <div>
              <Label htmlFor="fleeceWeight">Fleece Weight (lbs)</Label>
              <Input
                id="fleeceWeight"
                type="number"
                step="0.1"
                {...form.register("fleeceWeight", { valueAsNumber: true })}
                placeholder="Enter fleece weight"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="healthData">Health Information</Label>
            <Textarea
              id="healthData"
              {...form.register("healthData")}
              placeholder="Enter health information"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="narrativeDescription">About This Sheep</Label>
            <Textarea
              id="narrativeDescription"
              {...form.register("narrativeDescription")}
              placeholder="Enter detailed narrative description"
              rows={6}
            />
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                />
                {profileImagePreview && (
                  <div className="mt-4">
                    <img
                      src={profileImagePreview}
                      alt="Profile preview"
                      className="max-w-xs max-h-48 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  disabled={isUploading}
                />
                {media.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {media.map((item, index) => (
                      <div key={index} className="relative">
                        <img
                          src={item.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeMedia(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleDocumentUpload}
                  disabled={isUploading}
                />
                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{doc.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.type}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                {...form.register("price")}
                placeholder="Enter price"
              />
            </div>

            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                {...form.register("order", { valueAsNumber: true })}
                placeholder="Enter display order"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="lamb"
                checked={form.watch("lamb")}
                onCheckedChange={(checked) => form.setValue("lamb", checked)}
              />
              <Label htmlFor="lamb">Is Lamb</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={form.watch("available")}
                onCheckedChange={(checked) => form.setValue("available", checked)}
              />
              <Label htmlFor="available">Available for Sale</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="sold"
                checked={form.watch("sold")}
                onCheckedChange={(checked) => form.setValue("sold", checked)}
              />
              <Label htmlFor="sold">Sold</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="display"
                checked={form.watch("display")}
                onCheckedChange={(checked) => form.setValue("display", checked)}
              />
              <Label htmlFor="display">Display on Website</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="outsideBreeder"
                checked={form.watch("outsideBreeder")}
                onCheckedChange={(checked) => form.setValue("outsideBreeder", checked)}
              />
              <Label htmlFor="outsideBreeder">Outside Breeder</Label>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {mode === 'edit' ? 'Update' : 'Create'} Sheep
        </Button>
      </div>
    </form>
  );
}