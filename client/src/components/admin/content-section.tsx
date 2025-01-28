import { useState, useRef, useEffect } from "react";
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

const PrincipleDropzone = ({
  onDrop,
  currentImageUrl,
}: {
  onDrop: (files: File[]) => void;
  currentImageUrl?: string;
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
        isDragActive && "border-primary bg-accent",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Upload className="h-10 w-10" />
        <p className="text-sm text-center">
          {isDragActive
            ? "Drop your image here..."
            : "Drag & drop an image here, or click to select"}
        </p>
      </div>
    </div>
  );
};

const AboutCardDropzone = ({ onDrop }: { onDrop: (file: File) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onDrop(files[0]),
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
        isDragActive && "border-primary bg-accent",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Upload className="h-10 w-10" />
        <p className="text-sm text-center">
          {isDragActive
            ? "Drop your image here..."
            : "Drag & drop an image here, or click to select"}
        </p>
      </div>
    </div>
  );
};

const CarouselItemDropzone = ({ onDrop }: { onDrop: (file: File) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onDrop(files[0]),
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
        isDragActive && "border-primary bg-accent",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Upload className="h-10 w-10" />
        <p className="text-sm text-center">
          {isDragActive
            ? "Drop your image here..."
            : "Drag & drop an image here, or click to select"}
        </p>
      </div>
    </div>
  );
};

const HeroDropzone = ({ onDrop }: { onDrop: (file: File) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && onDrop(files[0]),
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
  });
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors cursor-pointer",
        isDragActive && "border-primary bg-accent",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Upload className="h-10 w-10" />
        <p className="text-sm text-center">
          {isDragActive
            ? "Drop your image here..."
            : "Drag & drop an image here, or click to select"}
        </p>
      </div>
    </div>
  );
};

export default function ContentSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mainTab, setMainTab] = useState("hero");
  const [activeTab, setActiveTab] = useState("hero");
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState("");
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    siteContent: {},
    principles: {},
    aboutCards: {},
    carouselItems: {},
  });
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});
  const [pendingAboutCards, setPendingAboutCards] = useState<AboutCardsData | null>(null);
  const [pendingPrincipleId, setPendingPrincipleId] = useState<number | null>(
    null,
  );


  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const { data: principles = [] } = useQuery<Principle[]>({
    queryKey: ["/api/principles"],
  });

  const { data: aboutCards = [] } = useQuery<AboutCard[]>({
    queryKey: ["/api/about-cards-old"], //Use old endpoint for individual cards.
  });

  const {
    data: aboutCardsData = {
      sectionTitle: "",
      sectionDescription: "",
      cards: [],
    },
  } = useQuery<AboutCardsData>({
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
    mutationFn: async ({
      key,
      value,
      file,
    }: {
      key: string;
      value: string;
      file?: File;
    }) => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("value", value);

      const res = await fetch(`/api/site-content/${key}`, {
        method: "PUT",
        body: file ? formData : JSON.stringify({ value }),
        headers: file ? undefined : { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to update content");
      return res.json();
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
    },
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
    },
  });

  const saveAllChanges = async () => {
    try {
      for (const [key, value] of Object.entries(pendingChanges.siteContent)) {
        await updateSiteContent.mutateAsync({ key, value });
      }

      for (const [id, changes] of Object.entries(pendingChanges.principles)) {
        const principle = principles.find((p) => p.id === parseInt(id));
        if (principle) {
          await updatePrinciple.mutateAsync({ ...principle, ...changes });
        }
      }

      if (pendingAboutCards) {
        await updateAboutCards.mutateAsync(pendingAboutCards);
      } else {
        for (const [id, changes] of Object.entries(pendingChanges.aboutCards)) {
          const card = aboutCards.find((c) => c.id === parseInt(id));
          if (card) {
            await updateAboutCard.mutateAsync({ ...card, ...changes });
          }
        }
      }

      for (const [id, changes] of Object.entries(
        pendingChanges.carouselItems,
      )) {
        const item = carouselItems.find((i) => i.id === parseInt(id));
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
      queryClient.invalidateQueries({ queryKey: ["/api/market"] }); //Invalidate market queries

      toast({ title: "All changes saved successfully" });
    } catch (error) {
      toast({ title: "Failed to save changes", variant: "destructive" });
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    try {
      const imageUrl = await handleFileUpload(file);
      setPendingChanges((prev) => ({
        ...prev,
        siteContent: {
          ...prev.siteContent,
          hero_background: imageUrl,
        },
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePrincipleImageUpload = async (
    files: File[],
    principleId: number,
  ) => {
    if (!files.length) return;
    try {
      const imageUrl = await handleFileUpload(files[0]);
      setPendingChanges((prev) => ({
        ...prev,
        principles: {
          ...prev.principles,
          [principleId]: {
            ...prev.principles[principleId],
            imageUrl,
          },
        },
      }));
    } catch (error) {
      console.error("Upload failed:", error);
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
      setPendingChanges((prev) => ({
        ...prev,
        aboutCards: {
          ...prev.aboutCards,
          [cardId]: {
            ...prev.aboutCards[cardId],
            imageUrl,
          },
        },
      }));
    } catch (error) {
      console.error("Upload failed:", error);
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
      setPendingChanges((prev) => ({
        ...prev,
        carouselItems: {
          ...prev.carouselItems,
          [itemId]: {
            ...prev.carouselItems[itemId],
            imageUrl,
          },
        },
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getContentValue = (key: string) => {
    return (
      pendingChanges.siteContent[key] ??
      siteContent.find((item) => item.key === key)?.value ??
      ""
    );
  };

  const handleContentChange = (key: string, value: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      siteContent: {
        ...prev.siteContent,
        [key]: value,
      },
    }));
  };

  const handlePrincipleChange = (
    principleId: number,
    key: string,
    value: string | undefined,
  ) => {
    setPendingChanges((prev) => ({
      ...prev,
      principles: {
        ...prev.principles,
        [principleId]: {
          ...prev.principles[principleId],
          [key]: value,
        },
      },
    }));
  };

  const handleAboutCardChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    if (!pendingAboutCards) return;

    setPendingAboutCards((prev) => {
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

  const hasPendingChanges =
    Object.keys(pendingChanges.siteContent).length > 0 ||
    Object.keys(pendingChanges.principles).length > 0 ||
    Object.keys(pendingChanges.aboutCards).length > 0 ||
    Object.keys(pendingChanges.carouselItems).length > 0 ||
    pendingAboutCards !== null;

  return (
    <>
      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="w-full justify-start mb-4 border-b">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
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
                    <p className="text-sm text-muted-foreground">
                      Configure global website settings here.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="home">
          <div className="space-y-6">
            {/* Home content here */}
          </div>
        </TabsContent>

        <TabsContent value="hero" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hero Title</Label>
              <Input
                value={getContentValue("hero_text")}
                onChange={(e) =>
                  handleContentChange("hero_text", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hero Subtitle</Label>
              <Textarea
                value={getContentValue("hero_subtext")}
                onChange={(e) =>
                  handleContentChange("hero_subtext", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Hero Background Image</Label>
              <HeroDropzone onDrop={handleHeroImageUpload} />
              {getContentValue("hero_background") && (
                <div className="relative group">
                  <img
                    src={getContentValue("hero_background")}
                    alt="Hero background"
                    className="mt-4 rounded-lg max-h-48 object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                    onClick={() => {
                      setCropImageUrl(getContentValue("hero_background"));
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
                  value={
                    pendingChanges.principles[principle.id]?.title ??
                    principle.title
                  }
                  onChange={(e) =>
                    handlePrincipleChange(principle.id, "title", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={
                    pendingChanges.principles[principle.id]?.description ??
                    principle.description
                  }
                  onChange={(e) =>
                    handlePrincipleChange(
                      principle.id,
                      "description",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <PrincipleDropzone
                  onDrop={(files) =>
                    handlePrincipleImageUpload(files, principle.id)
                  }
                />
                {(pendingChanges.principles[principle.id]?.imageUrl ??
                  principle.imageUrl) && (
                  <div className="relative group">
                    <img
                      src={
                        pendingChanges.principles[principle.id]?.imageUrl ??
                        principle.imageUrl
                      }
                      alt="Principle Image Preview"
                      className="mt-4 rounded-lg max-h-48 object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                      onClick={() => {
                        const imageUrl =
                          pendingChanges.principles[principle.id]?.imageUrl ??
                          principle.imageUrl;
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
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>About Title</Label>
                  <Input
                    value={getContentValue("about_title")}
                    onChange={(e) => handleContentChange("about_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mission Text</Label>
                  <Textarea
                    value={getContentValue("mission_text")}
                    onChange={(e) => handleContentChange("mission_text", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Animals Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Animals Card</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={getContentValue("animals_title")}
                    onChange={(e) => handleContentChange("animals_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={getContentValue("animals_text")}
                    onChange={(e) => handleContentChange("animals_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={getContentValue("animals_button_text")}
                    onChange={(e) => handleContentChange("animals_button_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redirect URL</Label>
                  <Input
                    value={getContentValue("animals_redirect")}
                    onChange={(e) => handleContentChange("animals_redirect", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("animals_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("animals_image")}
                  />
                  {getContentValue("animals_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("animals_image")}
                        alt="Animals Image Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goats Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Goats Card</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={getContentValue("bakery_title")}
                    onChange={(e) => handleContentChange("bakery_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={getContentValue("bakery_text")}
                    onChange={(e) => handleContentChange("bakery_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={getContentValue("bakery_button_text")}
                    onChange={(e) => handleContentChange("bakery_button_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redirect URL</Label>
                  <Input
                    value={getContentValue("bakery_redirect")}
                    onChange={(e) => handleContentChange("bakery_redirect", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("bakery_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("bakery_image")}
                  />
                  {getContentValue("bakery_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("bakery_image")}
                        alt="Goats Image Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Market Card</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={getContentValue("products_title")}
                    onChange={(e) => handleContentChange("products_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={getContentValue("products_text")}
                    onChange={(e) => handleContentChange("products_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={getContentValue("products_button_text")}
                    onChange={(e) => handleContentChange("products_button_text", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redirect URL</Label>
                  <Input
                    value={getContentValue("products_redirect")}
                    onChange={(e) => handleContentChange("products_redirect", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("products_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("products_image")}
                  />
                  {getContentValue("products_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("products_image")}
                        alt="Products Image Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel" className="space-y-6">
          {carouselItems.map((item) => (
            <div key={item.id} className="space-y-4 border rounded-lg p-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={
                    pendingChanges.carouselItems[item.id]?.title ?? item.title
                  }
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
                  value={
                    pendingChanges.carouselItems[item.id]?.description ??
                    item.description
                  }
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
                <CarouselItemDropzone
                  onDrop={(file) => handleCarouselImageUpload(file, item.id)}
                />
                {(pendingChanges.carouselItems[item.id]?.imageUrl ??
                  item.imageUrl) && (
                  <img
                    src={
                      pendingChanges.carouselItems[item.id]?.imageUrl ??
                      item.imageUrl
                    }
                    alt={item.title}
                    className="mt-2 rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="dogs" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dogs Page Title</Label>
                    <Input
                      value={getContentValue("dogs_page_title")}
                      onChange={(e) => handleContentChange("dogs_page_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dogs Page Description</Label>
                    <Textarea
                      value={getContentValue("dogs_page_description")}
                      onChange={(e) => handleContentChange("dogs_page_description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breeding Program Description</Label>
                    <Textarea
                      value={getContentValue("dogs_breeding_program")}
                      onChange={(e) => handleContentChange("dogs_breeding_program", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Available Dogs Message</Label>
                    <Textarea
                      value={getContentValue("dogs_available_message")}
                      onChange={(e) => handleContentChange("dogs_available_message", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goats" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={getContentValue("goat_hero_title") || "Nigerian Dwarf Goats"}
                      onChange={(e) => handleContentChange("goat_hero_title", e.target.value)}
                      placeholder="Enter hero title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Subtitle</Label>
                    <Textarea
                      value={getContentValue("goat_hero_subtitle") || "Discover our beloved Nigerian Dwarf goats, known for their friendly personalities and excellent milk production."}
                      onChange={(e) => handleContentChange("goat_hero_subtitle", e.target.value)}
                      placeholder="Enter hero subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Background Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("goat_hero_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("goat_hero_image")}
                    />
                    {getContentValue("goat_hero_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("goat_hero_image")}
                          alt="Goats Hero Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("goat_hero_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Page Description</Label>
                    <Textarea
                      value={getContentValue("goat_description") || "Our Nigerian Dwarf Goats are beloved members of our farm family. These charming, miniature dairy goats are known for their friendly personalities and rich milk production."}
                      onChange={(e) => handleContentChange("goat_description", e.target.value)}
                      placeholder="Enter page description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breeding Program Description</Label>
                    <Textarea
                      value={getContentValue("goat_breeding_program") || "Our breeding program focuses on producing high-quality Nigerian Dwarf goats with excellent conformation, temperament, and milk production capabilities."}
                      onChange={(e) => handleContentChange("goat_breeding_program", e.target.value)}
                      placeholder="Enter breeding program description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Available Goats Message</Label>
                    <Textarea
                      value={getContentValue("goat_available_message") || "Check out our currently available Nigerian Dwarf goats. Contact us for more information about any of our available animals."}
                      onChange={(e) => handleContentChange("goat_available_message", e.target.value)}
                      placeholder="Enter available goats message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Male Goats (Bucks) Description</Label>
                    <Textarea
                      value={getContentValue("goat_bucks_description") || "Meet our Nigerian Dwarf bucks. These handsome boys are carefully selected for their excellent genetics and conformation."}
                      onChange={(e) => handleContentChange("goat_bucks_description", e.target.value)}
                      placeholder="Enter bucks description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Female Goats (Does) Description</Label>
                    <Textarea
                      value={getContentValue("goat_does_description") || "Meet our Nigerian Dwarf does. These lovely ladies are the foundation of our breeding program, known for their excellent milk production."}
                      onChange={(e) => handleContentChange("goat_does_description", e.target.value)}
                      placeholder="Enter does description"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <div className="space-y-6">
            {/* Main Market Content */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Market Page Title</Label>
                    <Input
                      value={getContentValue("market_page_title") || "Market"}
                      onChange={(e) => handleContentChange("market_page_title", e.target.value)}
                      placeholder="Enter market page title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Market Description</Label>
                    <Textarea
                      value={getContentValue("market_description") || "Welcome to our market! Discover our fresh, locally sourced products."}
                      onChange={(e) => handleContentChange("market_description", e.target.value)}
                      placeholder="Enter market description"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Sections */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Sections</h3>

                {/* Bakery Section */}
                <div className="space-y-4 mb-8">
                  <h4 className="font-medium">Bakery Section</h4>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={getContentValue("market_bakery_title") || "Bakery"}
                      onChange={(e) => handleContentChange("market_bakery_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={getContentValue("market_bakery_description") || "Discover our freshly baked goods and treats."}
                      onChange={(e) => handleContentChange("market_bakery_description", e.target.value)}
                    />
                  </div>
                </div>

                {/* Market Garden Section */}
                <div className="space-y-4 mb-8">
                  <h4 className="font-medium">Market Garden Section</h4>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={getContentValue("market_garden_title") || "Market Garden"}
                      onChange={(e) => handleContentChange("market_garden_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={getContentValue("market_garden_description") || "Fresh vegetables and fruits from our garden."}
                      onChange={(e) => handleContentChange("market_garden_description", e.target.value)}
                    />
                  </div>
                </div>

                {/* Animal Products Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Animal Products Section</h4>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={getContentValue("market_animal_title") || "Animal Products"}
                      onChange={(e) => handleContentChange("market_animal_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={getContentValue("market_animal_description") || "Farm-fresh eggs and other animal products."}
                      onChange={(e) => handleContentChange("market_animal_description", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Schedule Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Schedule Section</h3>
                  <div className="space-y-2">
                    <Label>Schedule Title</Label>
                    <Input
                      value={getContentValue("market_schedule_title") || "Market Times & Locations"}
                      onChange={(e) => handleContentChange("market_schedule_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule Description</Label>
                    <Textarea
                      value={getContentValue("market_schedule_description") || "Find us at these locations throughout the week."}
                      onChange={(e) => handleContentChange("market_schedule_description", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Hero Image */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Hero Image</h3>
                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("market_hero_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("market_hero_image")}
                    />
                    {getContentValue("market_hero_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("market_hero_image")}
                          alt="Market Hero Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="welcome" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <Input
                    value={getContentValue("home_welcome")}
                    onChange={(e) =>
                      handleContentChange("home_welcome", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mission Statement</Label>
                  <Textarea
                    value={getContentValue("home_mission")}
                    onChange={(e) =>
                      handleContentChange("home_mission", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
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
              handlePrincipleChange(
                pendingPrincipleId,
                "imageUrl",
                croppedImageUrl,
              );
            } else if (activeTab === "goats") {
              handleContentChange("goat_hero_image", croppedImageUrl);
            } else {
              handleContentChange("hero_background", croppedImageUrl);
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