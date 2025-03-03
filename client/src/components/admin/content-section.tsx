import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ui/image-upload";
import { SiteContent, ContactInfo } from "@db/schema";

// Form schema for site content
const formSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

// Form schema for contact info
const contactFormSchema = z.object({
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
});

export function ContentSection() {
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState("content");
  const [selectedContentKey, setSelectedContentKey] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Form for site content
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      value: "",
    },
  });

  // Form for contact information
  const contactForm = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      address: "",
      phone: "",
      email: "",
    },
  });

  // Query to fetch site content
  const { data: contentData = [], isLoading: contentLoading } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  // Query to fetch contact info
  const { data: contactInfo, isLoading: contactLoading } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  // Mutation to update site content
  const updateContentMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (editMode && selectedContentKey) {
        // Update existing content
        return axios.put(`/api/site-content/${selectedContentKey}`, values);
      } else {
        // Create new content
        return axios.post("/api/site-content", values);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast.success(editMode ? "Content updated successfully" : "Content added successfully");
      resetForm();
    },
    onError: (error) => {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    },
  });

  // Mutation to update contact info
  const updateContactMutation = useMutation({
    mutationFn: async (values: z.infer<typeof contactFormSchema>) => {
      return axios.post("/api/contact-info", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-info"] });
      toast.success("Contact information updated successfully");
    },
    onError: (error) => {
      console.error("Error saving contact info:", error);
      toast.error("Failed to save contact information");
    },
  });

  // Mutation to delete site content
  const deleteContentMutation = useMutation({
    mutationFn: async (key: string) => {
      return axios.delete(`/api/site-content/${key}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast.success("Content deleted successfully");
      resetForm();
    },
    onError: (error) => {
      console.error("Error deleting content:", error);
      toast.error("Failed to delete content");
    },
  });

  // Reset form and state
  const resetForm = () => {
    form.reset({
      key: "",
      value: "",
    });
    setSelectedContentKey(null);
    setEditMode(false);
  };

  // Handle form submission for site content
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateContentMutation.mutate(values);
  };

  // Handle form submission for contact info
  const onSubmitContact = (values: z.infer<typeof contactFormSchema>) => {
    updateContactMutation.mutate(values);
  };

  // Select a content item for editing
  const handleSelectContent = (item: SiteContent) => {
    setSelectedContentKey(item.key);
    setEditMode(true);
    form.reset({
      key: item.key,
      value: item.value,
    });
  };

  // Handle content deletion
  const handleDeleteContent = (key: string) => {
    if (window.confirm("Are you sure you want to delete this content?")) {
      deleteContentMutation.mutate(key);
    }
  };

  // Effect to update contact form when contact data is loaded
  useEffect(() => {
    if (contactInfo) {
      contactForm.reset({
        address: contactInfo.address || "",
        phone: contactInfo.phone || "",
        email: contactInfo.email || "",
      });
    }
  }, [contactInfo, contactForm]);

  return (
    <>
      <Toaster /> {/* Added Toaster component */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Site Content</TabsTrigger>
          <TabsTrigger value="contact">Contact Information</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Content List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Content Items</CardTitle>
                <CardDescription>
                  Click an item to edit it
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {contentLoading ? (
                    <p>Loading content...</p>
                  ) : contentData.length === 0 ? (
                    <p>No content items found</p>
                  ) : (
                    contentData.sort((a, b) => a.key.localeCompare(b.key)).map((item) => (
                      <div
                        key={item.key}
                        className={`p-2 border rounded cursor-pointer flex justify-between items-center ${
                          selectedContentKey === item.key
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => handleSelectContent(item)}
                      >
                        <div className="truncate flex-1">
                          <p className="font-medium">{item.key}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.value.substring(0, 30)}
                            {item.value.length > 30 ? "..." : ""}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContent(item.key);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="w-full"
                  >
                    Add New
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {editMode ? "Edit Content" : "Add New Content"}
                </CardTitle>
                <CardDescription>
                  Manage website content here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Key</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={editMode}
                              placeholder="e.g., hero_text, about_title"
                            />
                          </FormControl>
                          <FormDescription>
                            A unique identifier for this content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Value</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={5}
                              placeholder="The content text or URL"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={resetForm} type="button">
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editMode ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Update your farm's contact information displayed in the footer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactLoading ? (
                <p>Loading contact information...</p>
              ) : (
                <Form {...contactForm}>
                  <form
                    onSubmit={contactForm.handleSubmit(onSubmitContact)}
                    className="space-y-4"
                  >
                    <FormField
                      control={contactForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              placeholder="Your farm's address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., (555) 123-4567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="e.g., contact@yourfarm.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit">
                        Save Contact Information
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

// Add this default export to resolve the import issue
export default ContentSection;