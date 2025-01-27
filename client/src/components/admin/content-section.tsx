import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SiteContent = {
  id: number;
  key: string;
  value: string;
  type: string;
};

type Principle = {
  id: number;
  title: string;
  description: string;
  order: number;
};

type CarouselItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

export default function ContentSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hero");
  const [imageToUpload, setImageToUpload] = useState<string | null>(null);

  // Fetch all content
  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const { data: principles = [] } = useQuery<Principle[]>({
    queryKey: ["/api/principles"],
  });

  const { data: carouselItems = [] } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"],
  });

  // Update mutations
  const updateSiteContent = useMutation({
    mutationFn: async ({ key, value, file }: { key: string; value: string; file?: File }) => {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('value', value);

      const res = await fetch(`/api/site-content/${key}`, {
        method: "PUT",
        body: file ? formData : JSON.stringify({ value }),
        headers: file ? undefined : { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error("Failed to update content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Content updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update content", variant: "destructive" });
    },
  });

  const updatePrinciple = useMutation({
    mutationFn: async (principle: Principle) => {
      const res = await fetch(`/api/principles/${principle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(principle),
      });
      if (!res.ok) throw new Error("Failed to update principle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      toast({ title: "Principle updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update principle", variant: "destructive" });
    },
  });

  const updateCarouselItem = useMutation({
    mutationFn: async (item: CarouselItem) => {
      const res = await fetch(`/api/carousel/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to update carousel item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
      toast({ title: "Carousel item updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update carousel item", variant: "destructive" });
    },
  });

  // File upload handling
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        await updateSiteContent.mutateAsync({
          key: 'hero_background',
          value: '',
          file
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
  });

  // Helper function to get content value
  const getContentValue = (key: string) => {
    return siteContent.find(item => item.key === key)?.value || '';
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="principles">Principles</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="carousel">Carousel</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Title</Label>
                <Input
                  value={getContentValue('hero_text')}
                  onChange={(e) => updateSiteContent.mutate({
                    key: 'hero_text',
                    value: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Hero Subtitle</Label>
                <Textarea
                  value={getContentValue('hero_subtext')}
                  onChange={(e) => updateSiteContent.mutate({
                    key: 'hero_subtext',
                    value: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label>Hero Background Image</Label>
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
                    isDragActive && "border-primary bg-accent"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Upload className="h-10 w-10" />
                    <p className="text-sm text-center">
                      {isDragActive
                        ? "Drop your image here..."
                        : "Drag & drop an image here, or click to select"
                      }
                    </p>
                  </div>
                </div>
                {getContentValue('hero_background') && (
                  <img
                    src={getContentValue('hero_background')}
                    alt="Hero background"
                    className="mt-4 rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Principles Section */}
          <TabsContent value="principles" className="space-y-6">
            {principles.map((principle) => (
              <div key={principle.id} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={principle.title}
                    onChange={(e) => updatePrinciple.mutate({
                      ...principle,
                      title: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={principle.description}
                    onChange={(e) => updatePrinciple.mutate({
                      ...principle,
                      description: e.target.value
                    })}
                  />
                </div>
              </div>
            ))}
          </TabsContent>

          {/* About Section */}
          <TabsContent value="about" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>About Title</Label>
                <Input
                  value={getContentValue('about_title')}
                  onChange={(e) => updateSiteContent.mutate({
                    key: 'about_title',
                    value: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mission Text</Label>
                <Textarea
                  value={getContentValue('mission_text')}
                  onChange={(e) => updateSiteContent.mutate({
                    key: 'mission_text',
                    value: e.target.value
                  })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Carousel Section */}
          <TabsContent value="carousel" className="space-y-6">
            {carouselItems.map((item) => (
              <div key={item.id} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateCarouselItem.mutate({
                      ...item,
                      title: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateCarouselItem.mutate({
                      ...item,
                      description: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={item.imageUrl}
                    onChange={(e) => updateCarouselItem.mutate({
                      ...item,
                      imageUrl: e.target.value
                    })}
                  />
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="mt-2 rounded-lg max-h-48 object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}