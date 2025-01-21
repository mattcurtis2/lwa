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
import { Dog } from "@db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";

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
  imageUrl: z.string().url("Must be a valid URL"),
  isAvailable: z.boolean().default(true),
});

interface DogFormProps {
  dog?: Dog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DogForm({ dog, open, onOpenChange }: DogFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof dogSchema>>({
    resolver: zodResolver(dogSchema),
    defaultValues: {
      name: "",
      birthDate: format(new Date(), 'MM/dd/yyyy'),
      description: "",
      imageUrl: "",
      isAvailable: true,
    },
  });

  // Reset form when editing a different dog
  useEffect(() => {
    if (dog) {
      form.reset({
        name: dog.name,
        birthDate: format(new Date(dog.birthDate), 'MM/dd/yyyy'),
        description: dog.description ?? "",
        imageUrl: dog.imageUrl ?? "",
        isAvailable: dog.isAvailable,
      });
    } else {
      form.reset({
        name: "",
        birthDate: format(new Date(), 'MM/dd/yyyy'),
        description: "",
        imageUrl: "",
        isAvailable: true,
      });
    }
  }, [dog, form]);

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof dogSchema>) => {
      // Parse the date string to ISO format for the API
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available</FormLabel>
                  </div>
                </FormItem>
              )}
            />

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