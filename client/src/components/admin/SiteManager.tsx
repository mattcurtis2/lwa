import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Pencil, PlusCircle, Trash2 } from "lucide-react";

// Define site schema for form validation
const siteSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  domain: z.string().min(1, "Domain is required"),
  siteName: z.string().min(1, "Site display name is required"),
  siteDescription: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

type SiteFormValues = z.infer<typeof siteSchema>;

// Function to fetch sites
async function fetchSites() {
  const response = await fetch("/api/admin/sites");
  if (!response.ok) {
    throw new Error("Failed to fetch sites");
  }
  return response.json();
}

// Function to create a site
async function createSite(data: SiteFormValues) {
  const response = await fetch("/api/admin/sites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create site");
  }
  
  return response.json();
}

// Function to update a site
async function updateSite(data: SiteFormValues) {
  const response = await fetch(`/api/admin/sites/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update site");
  }
  
  return response.json();
}

// Function to delete a site
async function deleteSite(id: number) {
  const response = await fetch(`/api/admin/sites/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete site");
  }
  
  return response.json();
}

// Site form component
const SiteForm = ({ 
  onSubmit, 
  defaultValues = {
    name: "",
    domain: "",
    siteName: "",
    siteDescription: "",
    logoUrl: "",
    primaryColor: "",
    active: true,
  },
  mode = "create"
}: {
  onSubmit: (data: SiteFormValues) => void;
  defaultValues?: Partial<SiteFormValues>;
  mode?: "create" | "edit";
}) => {
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Internal Name</FormLabel>
              <FormControl>
                <Input placeholder="Little Way Acres" {...field} />
              </FormControl>
              <FormDescription>Internal name for this site (not displayed to users)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domain</FormLabel>
              <FormControl>
                <Input placeholder="littlewayacres.com" {...field} />
              </FormControl>
              <FormDescription>Domain name without http:// or www</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Little Way Acres" {...field} />
              </FormControl>
              <FormDescription>Name displayed to visitors</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="siteDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="A beautiful farm in the countryside..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormDescription>Brief description of the site (for SEO)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} value={field.value || ""} />
              </FormControl>
              <FormDescription>URL to the site logo</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="primaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Color</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input placeholder="#336699" {...field} value={field.value || ""} />
                </FormControl>
                {field.value && (
                  <div 
                    className="w-8 h-8 rounded-full border" 
                    style={{ backgroundColor: field.value || "#ffffff" }}
                  />
                )}
              </div>
              <FormDescription>Primary color for the site (hexadecimal)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  When active, this site will be visible to visitors
                </FormDescription>
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
        
        <div className="flex justify-end">
          <Button type="submit">
            {mode === "create" ? "Create Site" : "Update Site"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Main SiteManager component
const SiteManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SiteFormValues | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch sites
  const { data: sites = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/sites"],
    queryFn: fetchSites,
  });
  
  // Create site mutation
  const createMutation = useMutation({
    mutationFn: createSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Site created",
        description: "The site has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create site",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update site mutation
  const updateMutation = useMutation({
    mutationFn: updateSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      setIsEditDialogOpen(false);
      setSelectedSite(null);
      toast({
        title: "Site updated",
        description: "The site has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update site",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete site mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] });
      setSiteToDelete(null);
      toast({
        title: "Site deleted",
        description: "The site has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete site",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle create form submission
  const handleCreateSubmit = (data: SiteFormValues) => {
    createMutation.mutate(data);
  };
  
  // Handle edit form submission
  const handleEditSubmit = (data: SiteFormValues) => {
    updateMutation.mutate(data);
  };
  
  // Handle edit button click
  const handleEdit = (site: SiteFormValues) => {
    setSelectedSite(site);
    setIsEditDialogOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = (id: number) => {
    setSiteToDelete(id);
  };
  
  // Confirm delete
  const confirmDelete = () => {
    if (siteToDelete) {
      deleteMutation.mutate(siteToDelete);
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading sites: {(error as Error).message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/sites"] })} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Site Management</CardTitle>
              <CardDescription>Manage all sites in the platform</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Site
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Create New Site</DialogTitle>
                  <DialogDescription>
                    Add a new site to the platform. This will create a new tenant that can host content.
                  </DialogDescription>
                </DialogHeader>
                <SiteForm onSubmit={handleCreateSubmit} mode="create" />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <div className="text-center p-8">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground">No sites found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first site by clicking the "Add New Site" button above.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Site Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.map((site: SiteFormValues & { id: number }) => (
                    <TableRow key={site.id}>
                      <TableCell className="font-medium">{site.name}</TableCell>
                      <TableCell>{site.domain}</TableCell>
                      <TableCell>{site.siteName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${site.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {site.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(site)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(site.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the site
                                  "{site.name}" and all associated content.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
            <DialogDescription>
              Update site information.
            </DialogDescription>
          </DialogHeader>
          {selectedSite && (
            <SiteForm 
              onSubmit={handleEditSubmit} 
              defaultValues={selectedSite} 
              mode="edit" 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SiteManager;