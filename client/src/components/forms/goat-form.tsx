
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { UploadDropzone } from "@/components/ui/upload-dropzone";

const goatSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["male", "female"]).optional().default("female"),
  birthDate: z.string().optional(),
  breed: z.string().optional().default("Nigerian Dwarf"),
  color: z.string().optional(),
  description: z.string().optional(),
  narrativeDescription: z.string().optional(),
  healthData: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  registrationName: z.string().optional(),
  kid: z.boolean().optional().default(false),
  available: z.boolean().optional().default(false),
  outsideBreeder: z.boolean().optional().default(false),
  profileImageUrl: z.string().optional(),
  media: z.array(z.string()).optional().default([]),
  documents: z.array(z.string()).optional().default([]),
  litterId: z.number().optional(),
  motherId: z.number().optional(),
  fatherId: z.number().optional(),
  order: z.number().optional(),
});

type GoatFormData = z.infer<typeof goatSchema>;

interface GoatFormProps {
  goat?: any;
  mode?: 'create' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  fromLitter?: boolean;
}

export default function GoatForm({ goat, mode = 'create', open, onOpenChange, fromLitter }: GoatFormProps) {
  const { toast } = useToast();

  const form = useForm<GoatFormData>({
    resolver: zodResolver(goatSchema),
    defaultValues: {
      name: goat?.name || '',
      gender: goat?.gender || 'female',
      birthDate: goat?.birthDate || new Date().toISOString().split('T')[0],
      breed: goat?.breed || 'Nigerian Dwarf',
      color: goat?.color || '',
      description: goat?.description || '',
      narrativeDescription: goat?.narrativeDescription || '',
      healthData: goat?.healthData || '',
      height: goat?.height?.toString() || '',
      weight: goat?.weight?.toString() || '',
      registrationName: goat?.registrationName || '',
      kid: Boolean(goat?.kid),
      available: Boolean(goat?.available),
      outsideBreeder: Boolean(goat?.outsideBreeder),
      profileImageUrl: goat?.profileImageUrl || '',
      media: goat?.media || [],
      documents: goat?.documents || [],
      litterId: goat?.litterId,
      motherId: goat?.motherId,
      fatherId: goat?.fatherId,
      order: goat?.order,
    },
  });

  const onSubmit = async (values: GoatFormData) => {
    try {
      const processedValues = {
        ...values,
        height: values.height ? Number(values.height) : null,
        weight: values.weight ? Number(values.weight) : null,
      };

      const endpoint = goat?.id ? `/api/goats/${goat.id}` : '/api/goats';

      const res = await fetch(endpoint, {
        method: goat?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedValues),
      });

      if (!res.ok) throw new Error(await res.text());

      queryClient.invalidateQueries({ queryKey: ['/api/goats'] });

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

  const handleUpload = async (files: File[]) => {
    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      form.setValue('profileImageUrl', data.url);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: 'Failed to upload image',
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
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
                <Textarea {...field} />
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
        </div>

        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <UploadDropzone
                    onUpload={handleUpload}
                    accept="image/*"
                    maxFiles={1}
                  />
                  {field.value && (
                    <div className="relative w-40 h-40">
                      <img
                        src={field.value}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
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
