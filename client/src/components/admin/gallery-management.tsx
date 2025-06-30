import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Edit, Trash2, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dog, DogMedia, Goat, GoatMedia, CarouselItem, SiteContent, GalleryPhoto } from "@db/schema";

const galleryPhotoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isVisible: z.boolean(),
});

type GalleryPhotoForm = z.infer<typeof galleryPhotoSchema>;

interface PhotoItem {
  id: string;
  url: string;
  title: string;
  category: 'dogs' | 'goats' | 'farm' | 'carousel';
  description?: string;
  animalName?: string;
  animalId?: number;
  date?: string | Date | null;
  linkTo?: string;
  entityType?: 'dog' | 'goat' | 'carousel' | 'site-content' | 'gallery';
  isVisible?: boolean | null;
  canToggle?: boolean; // Whether visibility can be controlled
}

export default function GalleryManagement() {
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all data sources for photos
  const { data: dogs = [] } = useQuery<(Dog & { media?: DogMedia[] })[]>({
    queryKey: ['/api/dogs'],
  });

  const { data: goats = [] } = useQuery<(Goat & { media?: GoatMedia[] })[]>({
    queryKey: ['/api/goats'],
  });

  const { data: carousel = [] } = useQuery<CarouselItem[]>({
    queryKey: ['/api/carousel'],
  });

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ['/api/site-content'],
  });

  const { data: galleryPhotos = [] } = useQuery<GalleryPhoto[]>({
    queryKey: ['/api/gallery-photos'],
  });

  // Mutations for gallery photos
  const updateGalleryPhotoMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<GalleryPhoto> }) => {
      const response = await fetch(`/api/gallery-photos/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) throw new Error('Failed to update gallery photo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-photos'] });
      toast({ title: "Photo updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update photo", variant: "destructive" });
    },
  });

  const deleteGalleryPhotoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/gallery-photos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete gallery photo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-photos'] });
      toast({ title: "Photo deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete photo", variant: "destructive" });
    },
  });

  const createGalleryPhotoMutation = useMutation({
    mutationFn: async (data: Omit<GalleryPhoto, 'id' | 'createdAt' | 'updatedAt' | 'siteId'>) => {
      const response = await fetch('/api/gallery-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create gallery photo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gallery-photos'] });
      toast({ title: "Photo added successfully" });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to add photo", variant: "destructive" });
    },
  });

  // Process all photos into a unified format for display
  const allPhotos: PhotoItem[] = [
    // Dog photos
    ...dogs.flatMap(dog => {
      const photos: PhotoItem[] = [];
      
      // Profile image
      if (dog.profileImageUrl) {
        photos.push({
          id: `dog-profile-${dog.id}`,
          url: dog.profileImageUrl,
          title: dog.name,
          category: 'dogs',
          description: `${dog.name} - ${dog.breed}`,
          animalName: dog.name,
          animalId: dog.id,
          date: dog.createdAt,
          linkTo: `/dogs#${dog.name.toLowerCase().replace(/\s+/g, '-')}`,
          entityType: 'dog',
          isVisible: dog.display || true, // Use display field if available
          canToggle: false, // Can't toggle individual animal photos
        });
      }
      
      // Additional media
      if (dog.media) {
        dog.media
          .filter(media => media.type === 'image')
          .forEach((media, index) => {
            photos.push({
              id: `dog-media-${dog.id}-${media.id}`,
              url: media.url,
              title: dog.name,
              category: 'dogs',
              description: `${dog.name} - Photo ${index + 1}`,
              animalName: dog.name,
              animalId: dog.id,
              date: media.createdAt || dog.createdAt,
              linkTo: `/dogs#${dog.name.toLowerCase().replace(/\s+/g, '-')}`,
              entityType: 'dog',
              isVisible: dog.display || true,
              canToggle: true,
            });
          });
      }
      
      return photos;
    }),
    
    // Goat photos
    ...goats.flatMap(goat => {
      const photos: PhotoItem[] = [];
      
      // Profile image
      if (goat.profileImageUrl) {
        photos.push({
          id: `goat-profile-${goat.id}`,
          url: goat.profileImageUrl,
          title: goat.name,
          category: 'goats',
          description: `${goat.name} - ${goat.breed}`,
          animalName: goat.name,
          animalId: goat.id,
          date: goat.createdAt,
          linkTo: `/goats#${goat.name.toLowerCase().replace(/\s+/g, '-')}`,
          entityType: 'goat',
          isVisible: goat.display || true,
          canToggle: true,
        });
      }
      
      // Additional media
      if (goat.media) {
        goat.media
          .filter(media => media.type === 'image')
          .forEach((media, index) => {
            photos.push({
              id: `goat-media-${goat.id}-${media.id}`,
              url: media.url,
              title: goat.name,
              category: 'goats',
              description: `${goat.name} - Photo ${index + 1}`,
              animalName: goat.name,
              animalId: goat.id,
              date: media.createdAt || goat.createdAt,
              linkTo: `/goats#${goat.name.toLowerCase().replace(/\s+/g, '-')}`,
              entityType: 'goat',
              isVisible: goat.display || true,
              canToggle: true,
            });
          });
      }
      
      return photos;
    }),
    
    // Carousel photos
    ...carousel.map(item => ({
      id: `carousel-${item.id}`,
      url: item.imageUrl,
      title: item.title,
      category: 'farm' as const,
      description: item.description,
      date: item.createdAt,
      linkTo: '/',
      entityType: 'carousel' as const,
      isVisible: true,
      canToggle: true,
    })),
    
    // Site content images
    ...siteContent
      .filter(content => content.type === 'image' && content.value)
      .map(content => ({
        id: `site-${content.id}`,
        url: content.value,
        title: content.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        category: 'farm' as const,
        description: `Farm image: ${content.key}`,
        date: content.updatedAt,
        linkTo: '/',
        entityType: 'site-content' as const,
        isVisible: true,
        canToggle: true,
      })),

    // Gallery photos
    ...galleryPhotos.map(photo => ({
      id: `gallery-${photo.id}`,
      url: photo.imageUrl,
      title: photo.title,
      category: 'farm' as const,
      description: photo.description || photo.title,
      date: photo.createdAt,
      linkTo: '/gallery',
      entityType: 'gallery' as const,
      isVisible: photo.isVisible ?? true,
      canToggle: true, // Gallery photos can be toggled
    })),
  ]
  // Sort by date (newest first)
  .sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<GalleryPhotoForm>({
    resolver: zodResolver(galleryPhotoSchema),
    defaultValues: {
      title: '',
      description: '',
      isVisible: true,
    },
  });

  const onSubmit = async (data: GalleryPhotoForm) => {
    if (editingPhoto) {
      updateGalleryPhotoMutation.mutate({
        id: editingPhoto.id,
        updates: data,
      });
      setEditingPhoto(null);
    } else {
      if (!selectedFile) {
        toast({ title: "Please select an image file", variant: "destructive" });
        return;
      }

      setUploading(true);
      try {
        // Upload file first
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('File upload failed');
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);
        
        // Create gallery photo with uploaded image URL  
        const photoData = {
          title: data.title,
          description: data.description || null,
          imageUrl: uploadResult[0]?.url || uploadResult.url, // Handle both response formats
          category: 'farm',
          order: 0, // Default order since we sort by date
          isVisible: data.isVisible,
        };
        console.log('Creating gallery photo with data:', photoData);
        
        createGalleryPhotoMutation.mutate(photoData);
      } catch (error) {
        toast({ title: "Failed to upload image", variant: "destructive" });
      } finally {
        setUploading(false);
      }
    }
  };

  const togglePhotoVisibility = (photo: PhotoItem) => {
    if (photo.entityType === 'gallery' && photo.canToggle) {
      const galleryPhoto = galleryPhotos.find(gp => gp.id === parseInt(photo.id.replace('gallery-', '')));
      if (galleryPhoto) {
        updateGalleryPhotoMutation.mutate({
          id: galleryPhoto.id,
          updates: { isVisible: !galleryPhoto.isVisible },
        });
      }
    }
  };

  const deletePhoto = (photo: PhotoItem) => {
    if (photo.entityType === 'gallery') {
      const galleryPhoto = galleryPhotos.find(gp => gp.id === parseInt(photo.id.replace('gallery-', '')));
      if (galleryPhoto) {
        deleteGalleryPhotoMutation.mutate(galleryPhoto.id);
      }
    }
  };

  const editPhoto = (photo: PhotoItem) => {
    if (photo.entityType === 'gallery') {
      const galleryPhoto = galleryPhotos.find(gp => gp.id === parseInt(photo.id.replace('gallery-', '')));
      if (galleryPhoto) {
        setEditingPhoto(galleryPhoto);
        form.reset({
          title: galleryPhoto.title,
          description: galleryPhoto.description || '',
          isVisible: galleryPhoto.isVisible ?? true,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gallery Management</h2>
          <p className="text-muted-foreground">
            Manage photo visibility and add new farm photos to the gallery
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Farm Photo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="relative aspect-square">
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {photo.canToggle && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => togglePhotoVisibility(photo)}
                  >
                    {photo.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
                {photo.entityType === 'gallery' && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => editPhoto(photo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePhoto(photo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant="secondary" className="capitalize">
                  {photo.category}
                </Badge>
                {photo.entityType && (
                  <Badge variant="outline">
                    {photo.entityType}
                  </Badge>
                )}
                {!photo.isVisible && (
                  <Badge variant="destructive">
                    Hidden
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm truncate">{photo.title}</h3>
              {photo.description && (
                <p className="text-xs text-stone-600 truncate">{photo.description}</p>
              )}
              {photo.date && (
                <p className="text-xs text-stone-500 mt-1">
                  {new Date(photo.date).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Photo Dialog */}
      <Dialog open={showAddDialog || !!editingPhoto} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingPhoto(null);
          setSelectedFile(null);
          form.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPhoto ? 'Edit Farm Photo' : 'Add Farm Photo'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
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

              {!editingPhoto && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Photo File</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                    required={!editingPhoto}
                  />
                  {selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Visible in Gallery</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddDialog(false);
                    setEditingPhoto(null);
                    setSelectedFile(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPhoto ? 'Update' : 'Add'} Photo
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}