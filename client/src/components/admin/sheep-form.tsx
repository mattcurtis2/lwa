import { useState, useEffect } from "react";
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
import ImageCrop from "@/components/image-crop";

const sheepFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  registrationName: z.string().optional(),
  breed: z.string().min(1, "Breed is required"),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().optional(),
  color: z.string().optional(),
  weight: z.number().optional(),
  description: z.string().optional(),
  available: z.boolean().default(false),
  sold: z.boolean().default(false),
  profileImageUrl: z.string().optional(),
  display: z.boolean().default(true),
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
  const [isLoading, setIsLoading] = useState(false);
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
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
      available: false,
      sold: false,
      profileImageUrl: "",
      display: true,
    },
  });

  useEffect(() => {
    if (sheep && mode === 'edit') {
      form.reset({
        name: sheep.name || "",
        registrationName: sheep.registrationName || "",
        breed: sheep.breed || "Katahdin",
        gender: sheep.gender || "female",
        birthDate: sheep.birthDate ? new Date(sheep.birthDate).toISOString().split('T')[0] : "",
        color: sheep.color || "",
        weight: sheep.weight || undefined,
        description: sheep.description || "",
        available: sheep.available || false,
        sold: sheep.sold || false,
        profileImageUrl: sheep.profileImageUrl || "",
        display: sheep.display !== false,
      });
      setProfileImageUrl(sheep.profileImageUrl || "");
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
        available: false,
        sold: false,
        profileImageUrl: "",
        display: true,
      });
      setProfileImageUrl("");
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

      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync(data);
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

              {/* Profile Image */}
              <div className="space-y-4">
                <Label>Profile Image</Label>
                {profileImageUrl && (
                  <div className="w-32 h-32 border rounded-lg overflow-hidden">
                    <img 
                      src={profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          imageFile={imageFile}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowImageCrop(false);
            setImageFile(null);
          }}
        />
      )}
    </>
  );
}