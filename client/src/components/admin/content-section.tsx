import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageCrop } from "@/components/ui/image-crop";

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
  imageUrl?: string;
  order: number;
};

type CarouselItem = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
};

type AboutCard = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  redirectUrl: string;
  order: number;
};

type PendingChanges = {
  siteContent: Record<string, string>;
  principles: Record<number, Partial<Principle>>;
  aboutCards: Record<number, Partial<AboutCard>>;
  carouselItems: Record<number, Partial<CarouselItem>>;
};

export default function ContentSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("hero");
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    siteContent: {},
    principles: {},
    aboutCards: {},
    carouselItems: {},
  });
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [cropTarget, setCropTarget] = useState<{ type: string; id?: number; key?: string } | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);

  // Fetch all content
  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const { data: principles = [] } = useQuery<Principle[]>({
    queryKey: ["/api/principles"],
  });

  const { data: aboutCards = [] } = useQuery<AboutCard[]>({
    queryKey: ["/api/about-cards"],
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
    }
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
    }
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
    }
  });

  const updateAboutCard = useMutation({
    mutationFn: async (card: AboutCard) => {
      const res = await fetch(`/api/about-cards/${card.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });
      if (!res.ok) throw new Error("Failed to update about card");
      return res.json();
    }
  });

  // Save all changes
  const saveAllChanges = async () => {
    try {
      // Update site content
      for (const [key, value] of Object.entries(pendingChanges.siteContent)) {
        await updateSiteContent.mutateAsync({ key, value });
      }

      // Update principles
      for (const [id, changes] of Object.entries(pendingChanges.principles)) {
        const principle = principles.find(p => p.id === parseInt(id));
        if (principle) {
          await updatePrinciple.mutateAsync({ ...principle, ...changes });
        }
      }

      // Update about cards
      for (const [id, changes] of Object.entries(pendingChanges.aboutCards)) {
        const card = aboutCards.find(c => c.id === parseInt(id));
        if (card) {
          await updateAboutCard.mutateAsync({ ...card, ...changes });
        }
      }

      // Update carousel items
      for (const [id, changes] of Object.entries(pendingChanges.carouselItems)) {
        const item = carouselItems.find(i => i.id === parseInt(id));
        if (item) {
          await updateCarouselItem.mutateAsync({ ...item, ...changes });
        }
      }

      // Clear pending changes
      setPendingChanges({
        siteContent: {},
        principles: {},
        aboutCards: {},
        carouselItems: {},
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/about-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });

      toast({ title: "All changes saved successfully" });
    } catch (error) {
      toast({ title: "Failed to save changes", variant: "destructive" });
    }
  };

  // File upload handling
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setTempImage(result);
      setShowImageCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Helper function to get content value
  const getContentValue = (key: string) => {
    return pendingChanges.siteContent[key] ?? siteContent.find(item => item.key === key)?.value ?? '';
  };

  // Handle content changes
  const handleContentChange = (key: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      siteContent: {
        ...prev.siteContent,
        [key]: value
      }
    }));
  };

  const handleCroppedImage = async (croppedImage: string) => {
    if (!cropTarget) return;

    if (cropTarget.type === 'hero') {
      handleContentChange('hero_background', croppedImage);
    } else if (cropTarget.type === 'principle' && cropTarget.id) {
      setPendingChanges(prev => ({
        ...prev,
        principles: {
          ...prev.principles,
          [cropTarget.id!]: {
            ...prev.principles[cropTarget.id!],
            imageUrl: croppedImage
          }
        }
      }));
    } else if (cropTarget.type === 'about' && cropTarget.id) {
      setPendingChanges(prev => ({
        ...prev,
        aboutCards: {
          ...prev.aboutCards,
          [cropTarget.id!]: {
            ...prev.aboutCards[cropTarget.id!],
            imageUrl: croppedImage
          }
        }
      }));
    } else if (cropTarget.type === 'carousel' && cropTarget.id) {
      setPendingChanges(prev => ({
        ...prev,
        carouselItems: {
          ...prev.carouselItems,
          [cropTarget.id!]: {
            ...prev.carouselItems[cropTarget.id!],
            imageUrl: croppedImage
          }
        }
      }));
    }

    setShowImageCrop(false);
    setCropTarget(null);
    setTempImage(null);
  };

  const hasPendingChanges = Object.keys(pendingChanges.siteContent).length > 0 ||
    Object.keys(pendingChanges.principles).length > 0 ||
    Object.keys(pendingChanges.aboutCards).length > 0 ||
    Object.keys(pendingChanges.carouselItems).length > 0;

  return (
    <>
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
                    onChange={(e) => handleContentChange('hero_text', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea
                    value={getContentValue('hero_subtext')}
                    onChange={(e) => handleContentChange('hero_subtext', e.target.value)}
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
                      className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                      onClick={() => {
                        setTempImage(getContentValue('hero_background'));
                        setCropTarget({ type: 'hero' });
                        setShowImageCrop(true);
                      }}
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
                      value={pendingChanges.principles[principle.id]?.title ?? principle.title}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        principles: {
                          ...prev.principles,
                          [principle.id]: {
                            ...prev.principles[principle.id],
                            title: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={pendingChanges.principles[principle.id]?.description ?? principle.description}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        principles: {
                          ...prev.principles,
                          [principle.id]: {
                            ...prev.principles[principle.id],
                            description: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image</Label>
                    <div {...getRootProps()} className={cn(
                      "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
                      isDragActive && "border-primary bg-accent"
                    )}>
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Upload className="h-10 w-10" />
                        <p className="text-sm text-center">
                          {isDragActive ? "Drop your image here..." : "Drag & drop an image here, or click to select"}
                        </p>
                      </div>
                    </div>
                    {(pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl) && (
                      <img
                        src={pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl}
                        alt={principle.title}
                        className="mt-2 rounded-lg max-h-48 object-cover cursor-pointer"
                        onClick={() => {
                          setTempImage(pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl);
                          setCropTarget({ type: 'principle', id: principle.id });
                          setShowImageCrop(true);
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* About Section */}
            <TabsContent value="about" className="space-y-6">
              {aboutCards.map((card) => (
                <div key={card.id} className="space-y-4 border rounded-lg p-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={pendingChanges.aboutCards[card.id]?.title ?? card.title}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        aboutCards: {
                          ...prev.aboutCards,
                          [card.id]: {
                            ...prev.aboutCards[card.id],
                            title: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={pendingChanges.aboutCards[card.id]?.description ?? card.description}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        aboutCards: {
                          ...prev.aboutCards,
                          [card.id]: {
                            ...prev.aboutCards[card.id],
                            description: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Button Text</Label>
                    <Input
                      value={pendingChanges.aboutCards[card.id]?.buttonText ?? card.buttonText}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        aboutCards: {
                          ...prev.aboutCards,
                          [card.id]: {
                            ...prev.aboutCards[card.id],
                            buttonText: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Redirect URL</Label>
                    <Input
                      value={pendingChanges.aboutCards[card.id]?.redirectUrl ?? card.redirectUrl}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        aboutCards: {
                          ...prev.aboutCards,
                          [card.id]: {
                            ...prev.aboutCards[card.id],
                            redirectUrl: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div {...getRootProps()} className={cn(
                    "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
                    isDragActive && "border-primary bg-accent"
                  )}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Upload className="h-10 w-10" />
                      <p className="text-sm text-center">
                        {isDragActive ? "Drop your image here..." : "Drag & drop an image here, or click to select"}
                      </p>
                    </div>
                  </div>
                  {(pendingChanges.aboutCards[card.id]?.imageUrl ?? card.imageUrl) && (
                    <img
                      src={pendingChanges.aboutCards[card.id]?.imageUrl ?? card.imageUrl}
                      alt={card.title}
                      className="mt-2 rounded-lg max-h-48 object-cover cursor-pointer"
                      onClick={() => {
                        setTempImage(pendingChanges.aboutCards[card.id]?.imageUrl ?? card.imageUrl);
                        setCropTarget({ type: 'about', id: card.id });
                        setShowImageCrop(true);
                      }}
                    />
                  )}
                </div>
              ))}
            </TabsContent>

            {/* Carousel Section */}
            <TabsContent value="carousel" className="space-y-6">
              {carouselItems.map((item) => (
                <div key={item.id} className="space-y-4 border rounded-lg p-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={pendingChanges.carouselItems[item.id]?.title ?? item.title}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        carouselItems: {
                          ...prev.carouselItems,
                          [item.id]: {
                            ...prev.carouselItems[item.id],
                            title: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={pendingChanges.carouselItems[item.id]?.description ?? item.description}
                      onChange={(e) => setPendingChanges(prev => ({
                        ...prev,
                        carouselItems: {
                          ...prev.carouselItems,
                          [item.id]: {
                            ...prev.carouselItems[item.id],
                            description: e.target.value
                          }
                        }
                      }))}
                    />
                  </div>
                  <div {...getRootProps()} className={cn(
                    "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
                    isDragActive && "border-primary bg-accent"
                  )}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Upload className="h-10 w-10" />
                      <p className="text-sm text-center">
                        {isDragActive ? "Drop your image here..." : "Drag & drop an image here, or click to select"}
                      </p>
                    </div>
                  </div>
                  {(pendingChanges.carouselItems[item.id]?.imageUrl ?? item.imageUrl) && (
                    <img
                      src={pendingChanges.carouselItems[item.id]?.imageUrl ?? item.imageUrl}
                      alt={item.title}
                      className="mt-2 rounded-lg max-h-48 object-cover cursor-pointer"
                      onClick={() => {
                        setTempImage(pendingChanges.carouselItems[item.id]?.imageUrl ?? item.imageUrl);
                        setCropTarget({ type: 'carousel', id: item.id });
                        setShowImageCrop(true);
                      }}
                    />
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Floating Save Button */}
      {hasPendingChanges && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={saveAllChanges}
            className="shadow-lg"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Image Crop Modal */}
      {showImageCrop && tempImage && (
        <ImageCrop
          imageUrl={tempImage}
          onCropComplete={handleCroppedImage}
          onCancel={() => {
            setShowImageCrop(false);
            setCropTarget(null);
            setTempImage(null);
          }}
        />
      )}
    </>
  );
}