import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Goat } from "@db/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";

const goatSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().optional(),
  breed: z.string().default("Nigerian Dwarf"),
  color: z.string().optional(),
  description: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  registrationName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  outsideBreeder: z.boolean().default(false),
  available: z.boolean().default(true),
  price: z.string().optional(),
  kid: z.boolean().default(false),
  motherId: z.number().optional(),
  fatherId: z.number().optional(),
  litterId: z.number().optional()
});

type GoatFormData = z.infer<typeof goatSchema>;

interface Props {
  goat?: Partial<Goat>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  fromLitter?: boolean;
}

export default function GoatForm({ goat, open, onOpenChange, mode, fromLitter }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GoatFormData>({
    resolver: zodResolver(goatSchema),
    defaultValues: {
      name: goat?.name || "",
      gender: (goat?.gender as "male" | "female") || "female",
      birthDate: goat?.birthDate || "",
      breed: goat?.breed || "Nigerian Dwarf",
      color: goat?.color || "",
      description: goat?.description || "",
      height: goat?.height?.toString() || "",
      weight: goat?.weight?.toString() || "",
      registrationName: goat?.registrationName || "",
      profileImageUrl: goat?.profileImageUrl || "",
      outsideBreeder: goat?.outsideBreeder || false,
      available: goat?.available || true,
      price: goat?.price?.toString() || "",
      kid: goat?.kid || false,
      motherId: goat?.motherId,
      fatherId: goat?.fatherId,
      litterId: goat?.litterId
    }
  });

  const onSubmit = async (data: GoatFormData) => {
    try {
      const endpoint = mode === 'create' ? '/api/goats' : `/api/goats/${goat?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          height: data.height ? parseFloat(data.height) : null,
          weight: data.weight ? parseFloat(data.weight) : null,
          price: data.price ? parseInt(data.price) : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save goat');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/goats'] });
      if (fromLitter) {
        queryClient.invalidateQueries({ queryKey: ['/api/goat-litters'] });
      }

      toast({
        title: "Success",
        description: `Goat ${mode === 'create' ? 'created' : 'updated'} successfully`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving goat:', error);
      toast({
        title: "Error",
        description: `Failed to ${mode} goat`,
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

        <FormField
          control={form.control}
          name="profileImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  accept="image/*"
                  maxSize={5242880}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="outsideBreeder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Outside Breeder</FormLabel>
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
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {mode === 'create' ? 'Create' : 'Update'} Goat
          </Button>
        </div>
      </form>
    </Form>
  );
}
