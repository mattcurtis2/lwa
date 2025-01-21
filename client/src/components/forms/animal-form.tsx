import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
import { Animal } from "@db/schema";

const animalSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  breed: z.string().min(1),
  age: z.number().min(0),
  description: z.string(),
  imageUrl: z.string().url().optional().nullable(),
  isAvailable: z.boolean().default(true),
});

interface AnimalFormProps {
  animal?: Animal;
  onClose: () => void;
}

export default function AnimalForm({ animal, onClose }: AnimalFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(animalSchema),
    defaultValues: {
      name: animal?.name ?? "",
      type: animal?.type ?? "",
      breed: animal?.breed ?? "",
      age: animal?.age ?? 0,
      description: animal?.description ?? "",
      imageUrl: animal?.imageUrl ?? "",
      isAvailable: animal?.isAvailable ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof animalSchema>) => {
      const res = await fetch(animal ? `/api/animals/${animal.id}` : "/api/animals", {
        method: animal ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to save animal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      toast({
        title: "Success",
        description: `Animal ${animal ? "updated" : "created"} successfully`,
      });
      onClose();
    },
  });

  return (
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Breed</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value))} 
                  value={field.value || ""}
                />
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
                <Textarea {...field} value={field.value || ""} />
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
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}