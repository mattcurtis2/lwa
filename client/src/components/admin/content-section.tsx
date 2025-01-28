import { useState, useRef, useEffect } from 'react';
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
import { ImageCrop } from "@/components/ui/image-crop";
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

type AboutCardsData = {
  sectionTitle: string;
  sectionDescription: string;
  cards: {
    title: string;
    description: string;
    icon: string;
  }[];
};

const PrincipleDropzone = ({ onDrop, currentImageUrl }: { onDrop: (files: File[]) => void; currentImageUrl?: string }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });
  return (
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
  );
};

const AboutCardDropzone = ({ onDrop }: { onDrop: (file: File) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => files[0] && onDrop(files[0]),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });
  return (
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
  );
};

const CarouselItemDropzone = ({ onDrop }: { onDrop: (file: File) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => files[0] && onDrop(files[0]),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });
  return (
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
  );
};

const HeroDropzone = ({ onDrop }: { onDrop: (file: File) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => files[0] && onDrop(files[0]),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });
  return (
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
  );
};

export default function ContentSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState("global");
  const [activeTab, setActiveTab] = useState("hero");
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState('');
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    siteContent: {},
    principles: {},
    aboutCards: {},
    carouselItems: {},
  });
  const [pendingPrincipleId, setPendingPrincipleId] = useState<number | null>(null);
  const [pendingAboutCards, setPendingAboutCards] = useState<AboutCardsData | null>(null);

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const { data: principles = [] } = useQuery<Principle[]>({
    queryKey: ["/api/principles"],
  });

  const { data: aboutCards = [] } = useQuery<AboutCard[]>({
    queryKey: ["/api/about-cards-old"], //Use old endpoint for individual cards.
  });

  const { data: aboutCardsData = {sectionTitle: "", sectionDescription: "", cards: []} } = useQuery<AboutCardsData>({
    queryKey: ["/api/about-cards"],
  });

  const { data: carouselItems = [] } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"],
  });

  useEffect(() => {
    if (aboutCardsData) {
      setPendingAboutCards(aboutCardsData);
    }
  }, [aboutCardsData]);


  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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

  const updateAboutCards = useMutation({
    mutationFn: async (data: AboutCardsData) => {
      const res = await fetch("/api/about-cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update about cards");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about-cards"] });
      toast({ title: "About cards updated successfully" });
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
    }
  });

  const saveAllChanges = async () => {
    try {
      for (const [key, value] of Object.entries(pendingChanges.siteContent)) {
        await updateSiteContent.mutateAsync({ key, value });
      }

      for (const [id, changes] of Object.entries(pendingChanges.principles)) {
        const principle = principles.find(p => p.id === parseInt(id));
        if (principle) {
          await updatePrinciple.mutateAsync({ ...principle, ...changes });
        }
      }

      if (pendingAboutCards) {
        await updateAboutCards.mutateAsync(pendingAboutCards);
      } else {
        for (const [id, changes] of Object.entries(pendingChanges.aboutCards)) {
          const card = aboutCards.find(c => c.id === parseInt(id));
          if (card) {
            await updateAboutCard.mutateAsync({ ...card, ...changes });
          }
        }
      }

      for (const [id, changes] of Object.entries(pendingChanges.carouselItems)) {
        const item = carouselItems.find(i => i.id === parseInt(id));
        if (item) {
          await updateCarouselItem.mutateAsync({ ...item, ...changes });
        }
      }

      setPendingChanges({
        siteContent: {},
        principles: {},
        aboutCards: {},
        carouselItems: {},
      });
      setPendingAboutCards(null);

      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/about-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });

      toast({ title: "All changes saved successfully" });
    } catch (error) {
      toast({ title: "Failed to save changes", variant: "destructive" });
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    try {
      const imageUrl = await handleFileUpload(file);
      setPendingChanges(prev => ({
        ...prev,
        siteContent: {
          ...prev.siteContent,
          hero_background: imageUrl
        }
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePrincipleImageUpload = async (files: File[], principleId: number) => {
    if (!files.length) return;
    try {
      const imageUrl = await handleFileUpload(files[0]);
      setPendingChanges(prev => ({
        ...prev,
        principles: {
          ...prev.principles,
          [principleId]: {
            ...prev.principles[principleId],
            imageUrl
          }
        }
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleAboutCardImageUpload = async (file: File, cardId: number) => {
    try {
      const imageUrl = await handleFileUpload(file);
      setPendingChanges(prev => ({
        ...prev,
        aboutCards: {
          ...prev.aboutCards,
          [cardId]: {
            ...prev.aboutCards[cardId],
            imageUrl
          }
        }
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCarouselImageUpload = async (file: File, itemId: number) => {
    try {
      const imageUrl = await handleFileUpload(file);
      setPendingChanges(prev => ({
        ...prev,
        carouselItems: {
          ...prev.carouselItems,
          [itemId]: {
            ...prev.carouselItems[itemId],
            imageUrl
          }
        }
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getContentValue = (key: string) => {
    return pendingChanges.siteContent[key] ?? siteContent.find(item => item.key === key)?.value ?? '';
  };

  const handleContentChange = (key: string, value: string) => {
    setPendingChanges(prev => ({
      ...prev,
      siteContent: {
        ...prev.siteContent,
        [key]: value
      }
    }));
  };

  const handlePrincipleChange = (principleId: number, key: string, value: string | undefined) => {
    setPendingChanges(prev => ({
      ...prev,
      principles: {
        ...prev.principles,
        [principleId]: {
          ...prev.principles[principleId],
          [key]: value
        }
      }
    }));
  };

  const handleAboutCardChange = (index: number, field: string, value: string) => {
    if (!pendingAboutCards) return;

    setPendingAboutCards(prev => {
      if (!prev) return prev;
      const newCards = [...prev.cards];
      newCards[index] = {
        ...newCards[index],
        [field]: value,
      };
      return {
        ...prev,
        cards: newCards,
      };
    });
  };

  const hasPendingChanges = Object.keys(pendingChanges.siteContent).length > 0 ||
    Object.keys(pendingChanges.principles).length > 0 ||
    Object.keys(pendingChanges.aboutCards).length > 0 ||
    Object.keys(pendingChanges.carouselItems).length > 0 || pendingAboutCards !== null;

  return (
    <>
      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="w-full justify-start mb-4 border-b">
          <TabsTrigger value="global">Global Content</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
          <TabsTrigger value="goats">Goats</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        <TabsContent value="global">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Global Settings</Label>
                    <p className="text-sm text-muted-foreground">Configure global website settings here.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
              <HeroDropzone onDrop={handleHeroImageUpload} />
              {getContentValue('hero_background') && (
                <div className="relative group">
                  <img
                    src={getContentValue('hero_background')}
                    alt="Hero background"
                    className="mt-4 rounded-lg max-h-48 object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                    onClick={() => {
                      setCropImageUrl(getContentValue('hero_background'));
                      setShowCropper(true);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="principles" className="space-y-6">
          {principles.map((principle) => (
            <div key={principle.id} className="space-y-4 border rounded-lg p-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={pendingChanges.principles[principle.id]?.title ?? principle.title}
                  onChange={(e) => handlePrincipleChange(principle.id, 'title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={pendingChanges.principles[principle.id]?.description ?? principle.description}
                  onChange={(e) => handlePrincipleChange(principle.id, 'description', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <PrincipleDropzone
                  onDrop={(files) => handlePrincipleImageUpload(files, principle.id)}
                />
                {(pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl) && (
                  <div className="relative group">
                    <img
                      src={pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl}
                      alt="Principle Image Preview"
                      className="mt-4 rounded-lg max-h-48 object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                      onClick={() => {
                        const imageUrl = pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl;
                        if (imageUrl) {
                          setCropImageUrl(imageUrl);
                          setPendingPrincipleId(principle.id);
                          setShowCropper(true);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
          {showCropper && cropImageUrl && (
            <ImageCrop
              imageUrl={cropImageUrl}
              aspect={16 / 9}
              onCropComplete={(croppedImageUrl) => {
                if (pendingPrincipleId !== null) {
                  setPendingChanges((prev) => ({
                    ...prev,
                    principles: {
                      ...prev.principles,
                      [pendingPrincipleId]: {
                        ...prev.principles[pendingPrincipleId],
                        imageUrl: croppedImageUrl,
                      },
                    },
                  }));
                }
                setShowCropper(false);
                setCropImageUrl("");
                setPendingPrincipleId(null);
              }}
              onCancel={() => {
                setShowCropper(false);
                setCropImageUrl("");
                setPendingPrincipleId(null);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          {pendingAboutCards && (
            <div className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Section Title</Label>
                      <Input
                        value={pendingAboutCards.sectionTitle}
                        onChange={(e) =>
                          setPendingAboutCards(prev => prev ? {
                            ...prev,
                            sectionTitle: e.target.value,
                          } : prev)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Section Description</Label>
                      <Textarea
                        value={pendingAboutCards.sectionDescription}
                        onChange={(e) =>
                          setPendingAboutCards(prev => prev ? {
                            ...prev,
                            sectionDescription: e.target.value,
                          } : prev)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {pendingAboutCards.cards.map((card, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4">Card {index + 1}</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={card.title}
                          onChange={(e) => handleAboutCardChange(index, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={card.description}
                          onChange={(e) => handleAboutCardChange(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Input
                          value={card.icon}
                          onChange={(e) => handleAboutCardChange(index, 'icon', e.target.value)}
                          placeholder="Icon name (e.g., 'user' for a user icon)"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="carousel" className="space-y-6">
          {carouselItems.map((item) => (
            <div key={item.id} className="space-y-4 border rounded-lg p-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={pendingChanges.carouselItems[item.id]?.title ?? item.title}
                  onChange={(e) =>
                    setPendingChanges((prev) => ({
                      ...prev,
                      carouselItems: {
                        ...prev.carouselItems,
                        [item.id]: {
                          ...prev.carouselItems[item.id],
                          title: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={pendingChanges.carouselItems[item.id]?.description ?? item.description}
                  onChange={(e) =>
                    setPendingChanges((prev) => ({
                      ...prev,
                      carouselItems: {
                        ...prev.carouselItems,
                        [item.id]: {
                          ...prev.carouselItems[item.id],
                          description: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <CarouselItemDropzone onDrop={(file) => handleCarouselImageUpload(file, item.id)} />
                {(pendingChanges.carouselItems[item.id]?.imageUrl ?? item.imageUrl) && (
                  <img
                    src={pendingChanges.carouselItems[item.id]?.imageUrl ?? item.imageUrl}
                    alt={item.title}
                    className="mt-2 rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
      <TabsContent value="home">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="principles">Principles</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="carousel">Carousel</TabsTrigger>
            <TabsTrigger value="welcome">Welcome</TabsTrigger>
          </TabsList>

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
                <HeroDropzone onDrop={handleHeroImageUpload} />
                {getContentValue('hero_background') && (
                  <div className="relative group">
                    <img
                      src={getContentValue('hero_background')}
                      alt="Hero background"
                      className="mt-4 rounded-lg max-h-48 object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                      onClick={() => {
                        setCropImageUrl(getContentValue('hero_background'));
                        setShowCropper(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="principles" className="space-y-6">
            {principles.map((principle) => (
              <div key={principle.id} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={pendingChanges.principles[principle.id]?.title ?? principle.title}
                    onChange={(e) => handlePrincipleChange(principle.id, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={pendingChanges.principles[principle.id]?.description ?? principle.description}
                    onChange={(e) => handlePrincipleChange(principle.id, 'description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => handlePrincipleImageUpload(files, principle.id)}
                    currentImageUrl={principle.imageUrl}
                  />
                  {(pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl) && (
                    <div className="relative group">
                      <img
                        src={pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl}
                        alt="Principle Image Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover"
                      />
                      <div
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                        onClick={() => {
                          const imageUrl = pendingChanges.principles[principle.id]?.imageUrl ?? principle.imageUrl;
                          if (imageUrl) {
                            setCropImageUrl(imageUrl);
                            setPendingPrincipleId(principle.id);
                            setShowCropper(true);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            {pendingAboutCards && (
              <div className="space-y-8">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={pendingAboutCards.sectionTitle}
                          onChange={(e) =>
                            setPendingAboutCards(prev => prev ? {
                              ...prev,
                              sectionTitle: e.target.value,
                            } : prev)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Description</Label>
                        <Textarea
                          value={pendingAboutCards.sectionDescription}
                          onChange={(e) =>
                            setPendingAboutCards(prev => prev ? {
                              ...prev,
                              sectionDescription: e.target.value,
                            } : prev)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {pendingAboutCards.cards.map((card, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">Card {index + 1}</h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={card.title}
                            onChange={(e) => handleAboutCardChange(index, 'title', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={card.description}
                            onChange={(e) => handleAboutCardChange(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Input
                            value={card.icon}
                            onChange={(e) => handleAboutCardChange(index, 'icon', e.target.value)}
                            placeholder="Icon name (e.g., 'user' for a user icon)"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="carousel" className="space-y-6">
            {carouselItems.map((item) => (
              <div key={item.id} className="space-y-4 border rounded-lg p-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={pendingChanges.carouselItems[item.id]?.title ?? item.title}
                    onChange={(e) =>
                      setPendingChanges((prev) => ({
                        ...prev,
                        carouselItems: {
                          ...prev.carouselItems,
                          [item.id]: {
                            ...prev.carouselItems[item.id],
                            title: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={pendingChanges.carouselItems[item.id]?.description ?? item.description}
                    onChange={(e) =>
                      setPendingChanges((prev) => ({
                        ...prev,
                        carouselItems: {
                          ...prev.carouselItems,
                          [item.id]: {
                            ...prev.carouselItems[item.id],
                            description: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <CarouselItemDropzone onDrop={(file) => handleCarouselImageUpload(file, item.id)} />
                  {(pendingChanges.carouselItems[item.id]?.imageUrl ?? item.imageUrl) && (
                    <img
                      src={pendingChanges.carouselItems[item.id]?.imageUrl ?? item.imageUrl}
                      alt={item.title}
                      className="mt-2 rounded-lg max-h-48 object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="welcome" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Welcome Message</Label>
                    <Input
                      value={getContentValue('home_welcome')}
                      onChange={(e) => handleContentChange('home_welcome', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mission Statement</Label>
                    <Textarea
                      value={getContentValue('home_mission')}
                      onChange={(e) => handleContentChange('home_mission', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </TabsContent>

      <TabsContent value="dogs">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Breeding Program Description</Label>
                  <Textarea
                    value={getContentValue('dogs_breeding_program')}
                    onChange={(e) => handleContentChange('dogs_breeding_program', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Health Testing Information</Label>
                  <Textarea
                    value={getContentValue('dogs_health_testing')}
                    onChange={(e) => handleContentChange('dogs_health_testing', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="goats">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Breeding Program Description</Label>
                  <Textarea
                    value={getContentValue('goats_breeding_program')}
                    onChange={(e) => handleContentChange('goats_breeding_program', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Herd Management Information</Label>
                  <Textarea
                    value={getContentValue('goats_herd_management')}
                    onChange={(e) => handleContentChange('goats_herd_management', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="market">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Market Overview</Label>
                  <Textarea
                    value={getContentValue('market_overview')}
                    onChange={(e) => handleContentChange('market_overview', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Products Overview</Label>
                  <Textarea
                    value={getContentValue('market_products_overview')}
                    onChange={(e) => handleContentChange('market_products_overview', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="market">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Market Overview</Label>
                  <Textarea
                    value={getContentValue('market_overview')}
                    onChange={(e) => handleContentChange('market_overview', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Products Overview</Label>
                  <Textarea
                    value={getContentValue('market_products_overview')}
                    onChange={(e) => handleContentChange('market_products_overview', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    {hasPendingChanges && (
      <div className="fixed bottom-6 right-6">
        <Button onClick={saveAllChanges} className="shadow-lg" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    )}

    {showCropper && cropImageUrl && (
      <ImageCrop
        imageUrl={cropImageUrl}
        aspect={16 / 9}
        onCropComplete={(croppedImageUrl) => {
          if (pendingPrincipleId !== null) {
            handlePrincipleChange(pendingPrincipleId, 'imageUrl', croppedImageUrl);
          } else {
            handleContentChange('hero_background', croppedImageUrl);
          }
          setShowCropper(false);
          setCropImageUrl("");
          setPendingPrincipleId(null);
        }}
        onCancel={() => {
          setShowCropper(false);
          setCropImageUrl("");
          setPendingPrincipleId(null);
        }}
      />
    )}
  </>
);
}