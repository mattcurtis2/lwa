
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string(),
});

export function CMDContentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: heroContent } = useQuery({
    queryKey: ['/api/dogs-hero'],
    queryFn: async () => {
      const res = await fetch('/api/dogs-hero');
      if (!res.ok) throw new Error('Failed to fetch hero content');
      const data = await res.json();
      return data[0];
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: heroContent?.title || "",
      subtitle: heroContent?.subtitle || "",
      imageUrl: heroContent?.imageUrl || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await fetch(`/api/dogs-hero/${heroContent?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update content');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/dogs-hero'] });
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Title</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Subtitle</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Image</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  onFileSelect={(file) => field.onChange(file)}
                />
              </FormControl>
              {field.value && (
                <img
                  src={field.value}
                  alt="Hero"
                  className="mt-2 rounded-lg max-h-48 object-cover"
                />
              )}
            </FormItem>
          )}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
