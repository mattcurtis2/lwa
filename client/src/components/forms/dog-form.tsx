import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { format, parse } from "date-fns";
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
import { Dog, DogMedia } from "@db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const mediaSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["image", "video"]),
});

const dogSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthDate: z.string().refine((date) => {
    try {
      const parsedDate = parse(date, 'MM/dd/yyyy', new Date());
      return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
    } catch {
      return false;
    }
  }, "Please enter a valid date in MM/DD/YYYY format"),
  description: z.string(),
  media: z.array(mediaSchema),
});

interface DogFormProps {
  dog?: Dog & { media?: DogMedia[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DogForm({ dog, open, onOpenChange }: DogFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mediaInputs, setMediaInputs] = useState<{ url: string; type: "image" | "video" }[]>([]);

  const form = useForm<z.infer<typeof dogSchema>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      birthDate: format(new Date(), 'MM/dd/yyyy'),
      description: "",
      media: [],
    },
  });

  // Reset form when editing a different dog
  useEffect(() => {
    if (dog) {
      form.reset({
        name: dog.name,
        birthDate: format(new Date(dog.birthDate), 'MM/dd/yyyy'),
        description: dog.description ?? "",
        media: dog.media ?? [],
      });
      setMediaInputs(dog.media ?? []);
    } else {
      form.reset({
        name: "",
        birthDate: format(new Date(), 'MM/dd/yyyy'),
        description: "",
        media: [],
      });
      setMediaInputs([]);
    }
  }, [dog, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof dogSchema>) => {
      const parsedDate = parse(values.birthDate, 'MM/dd/yyyy', new Date());
      const formattedValues = {
        ...values,
        breed: "Colorado Mountain Dog",
        birthDate: format(parsedDate, 'yyyy-MM-dd'),
      };

      const res = await fetch(dog ? `/api/dogs/${dog.id}` : "/api/dogs", {
        method: dog ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
      toast({
        title: "Success",
        description: `Dog ${dog ? "updated" : "created"} successfully`,
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addMediaInput = () => {
    setMediaInputs([...mediaInputs, { url: "", type: "image" }]);
  };

  const removeMediaInput = (index: number) => {
    const newInputs = [...mediaInputs];
    newInputs.splice(index, 1);
    setMediaInputs(newInputs);
    form.setValue("media", newInputs);
  };

  const handleMediaChange = (index: number, field: "url" | "type", value: string) => {
    const newInputs = [...mediaInputs];
    newInputs[index] = {
      ...newInputs[index],
      [field]: value,
    };
    setMediaInputs(newInputs);
    form.setValue("media", newInputs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dog ? "Edit Dog" : "Add New Dog"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-6">
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
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Date (MM/DD/YYYY)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="MM/DD/YYYY" />
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Media</FormLabel>
                <Button type="button" variant="outline" onClick={addMediaInput}>
                  Add Media
                </Button>
              </div>

              {mediaInputs.map((input, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={input.url}
                      onChange={(e) => handleMediaChange(index, "url", e.target.value)}
                      placeholder="Media URL"
                    />
                    <select
                      value={input.type}
                      onChange={(e) => handleMediaChange(index, "type", e.target.value as "image" | "video")}
                      className="px-2 py-1 border rounded"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMediaInput(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button type="submit">Save</Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}