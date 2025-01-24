import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export function CMDContentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery(["/api/site-content/cmd-description"]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/site-content/cmd-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: values.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["/api/site-content/cmd-description"]);
      toast({
        title: "Success",
        description: "Content has been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    },
  });

  // Update form when data is loaded
  React.useEffect(() => {
    if (content) {
      form.reset({ content: content.value });
    }
  }, [content, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colorado Mountain Dogs Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  rows={10}
                  placeholder="Enter description for Colorado Mountain Dogs section..." 
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
