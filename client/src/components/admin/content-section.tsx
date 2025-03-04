import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import ImageCrop from "@/components/ui/image-crop";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadFileToS3 } from "../../lib/upload-utils";

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

type AboutCardsData = {
  sectionTitle: string;
  sectionDescription: string;
  cards: AboutCard[];
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
  const [mainTab, setMainTab] = useState("content");
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
  const [pendingAboutCards, setPendingAboutCards] = useState<AboutCardsData | null>(
    null,
  );
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
    queryKey: ["/api/about-cards-old"],
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

  useEffect(() => {
    if (siteContent.length > 0) {
      const initialPendingContent: Record<string, string> = {};
      siteContent.forEach((item) => {
        initialPendingContent[item.key] = item.value;
      });
      setPendingContent(initialPendingContent);
    }
  }, [siteContent]);

  const updateSiteContent = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch(`/api/site-content/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Failed to update site content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({ title: "Content updated successfully" });
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

      for (const [id, changes] of Object.entries(pendingChanges.aboutCards)) {
        const card = aboutCards.find((c) => c.id === parseInt(id));
        if (card) {
          await updateAboutCard.mutateAsync({ ...card, ...changes });
        }
      }

      for (const [id, changes] of Object.entries(pendingChanges.carouselItems)) {
        const item = carouselItems.find((i) => i.id === parseInt(id));
        if (item) {
          await updateCarouselItem.mutateAsync({ ...item, ...changes });
        }
      }

      if (pendingAboutCards) {
        await updateAboutCards.mutateAsync(pendingAboutCards);
      }

      setPendingChanges({
        siteContent: {},
        principles: {},
        aboutCards: {},
        carouselItems: {},
      });
      toast({ title: "All changes saved successfully" });
    } catch (error) {
      console.error("Save failed:", error);
      toast({
        title: "Save failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
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

  const handlePrincipleChange = (id: number, field: string, value: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      principles: {
        ...prev.principles,
        [id]: {
          ...prev.principles[id],
          [field]: value,
        },
      },
    }));
  };

  const handleAboutCardChange = (id: number, field: string, value: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      aboutCards: {
        ...prev.aboutCards,
        [id]: {
          ...prev.aboutCards[id],
          [field]: value,
        },
      },
    }));
  };

  const handleNewAboutCardChange = (index: number, field: string, value: string) => {
    if (!pendingAboutCards) return;

    const updatedCards = [...pendingAboutCards.cards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    };

    setPendingAboutCards({
      ...pendingAboutCards,
      cards: updatedCards,
    });
  };

  const handleAboutSectionChange = (field: string, value: string) => {
    if (!pendingAboutCards) return;

    setPendingAboutCards({
      ...pendingAboutCards,
      [field]: value,
    });
  };

  const handleCarouselChange = (id: number, field: string, value: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      carouselItems: {
        ...prev.carouselItems,
        [id]: {
          ...prev.carouselItems[id],
          [field]: value,
        },
      },
    }));
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Upload direct to S3
      const imageUrl = await uploadFileToS3(file);
      return imageUrl;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const handleHeroImageUpload = async (file: File) => {
    try {
      const imageUrl = await handleFileUpload(file);
      handleContentChange("hero_background", imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleOGImageUpload = async (file: File) => {
    try {
      const imageUrl = await handleFileUpload(file);
      handleContentChange("og_image", imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const imageUrl = await handleFileUpload(file);
      handleContentChange("logo", imageUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handlePrincipleImageUpload = async (file: File, principleId: number) => {
    try {
      const imageUrl = await handleFileUpload(file);
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

  const handleCropComplete = (croppedImageUrl: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      principles: {
        ...prev.principles,
        [pendingPrincipleId!]: {
          ...prev.principles[pendingPrincipleId!],
          imageUrl: croppedImageUrl,
        },
      },
    }));
    setShowCropper(false);
    setCropImageUrl("");
    setPendingPrincipleId(null);
  };

  const getPrincipleValue = (id: number, field: keyof Principle) => {
    const pendingValue = pendingChanges.principles[id]?.[field];
    if (pendingValue !== undefined) return pendingValue;

    const principle = principles.find((p) => p.id === id);
    return principle?.[field] ?? "";
  };

  const getAboutCardValue = (id: number, field: keyof AboutCard) => {
    const pendingValue = pendingChanges.aboutCards[id]?.[field];
    if (pendingValue !== undefined) return pendingValue;

    const card = aboutCards.find((c) => c.id === id);
    return card?.[field] ?? "";
  };

  const getCarouselValue = (id: number, field: keyof CarouselItem) => {
    const pendingValue = pendingChanges.carouselItems[id]?.[field];
    if (pendingValue !== undefined) return pendingValue;

    const item = carouselItems.find((i) => i.id === id);
    return item?.[field] ?? "";
  };

  const sortedPrinciples = [...principles].sort((a, b) => a.order - b.order);
  const sortedCarouselItems = [...carouselItems].sort((a, b) => a.order - b.order);

  return (
    <>
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Site Content</TabsTrigger>
          <TabsTrigger value="principles">Principles</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="pt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex flex-wrap justify-start gap-2 h-auto pb-2">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="mission">Mission</TabsTrigger>
              <TabsTrigger value="about">About Cards</TabsTrigger>
              <TabsTrigger value="animals">Animal Cards</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="logo">Logo & Meta</TabsTrigger>
              <TabsTrigger value="carousel">Carousel</TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>
                    Update the main hero section of the site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={getContentValue("hero_text")}
                      onChange={(e) => handleContentChange("hero_text", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Subtitle</Label>
                    <Input
                      value={getContentValue("hero_subtext")}
                      onChange={(e) => handleContentChange("hero_subtext", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Background Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={getContentValue("hero_background")}
                        onChange={(e) =>
                          handleContentChange("hero_background", e.target.value)
                        }
                        className="flex-grow"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="hero-upload"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleHeroImageUpload(e.target.files[0]);
                            }
                          }}
                          accept="image/*"
                        />
                        <label
                          htmlFor="hero-upload"
                          className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </label>
                      </div>
                    </div>
                    {getContentValue("hero_background") && (
                      <div className="mt-2">
                        <img
                          src={getContentValue("hero_background")}
                          alt="Hero background"
                          className="max-h-40 rounded-md object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mission" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mission Section</CardTitle>
                  <CardDescription>
                    Update the mission statement section
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Mission Title</Label>
                    <Input
                      value={getContentValue("mission_title")}
                      onChange={(e) => handleContentChange("mission_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mission Text</Label>
                    <Textarea
                      value={getContentValue("mission_text")}
                      onChange={(e) => handleContentChange("mission_text", e.target.value)}
                      rows={6}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>About Section</CardTitle>
                  <CardDescription>Update the about section cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={pendingAboutCards?.sectionTitle ?? ""}
                      onChange={(e) => handleAboutSectionChange("sectionTitle", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea
                      value={pendingAboutCards?.sectionDescription ?? ""}
                      onChange={(e) =>
                        handleAboutSectionChange("sectionDescription", e.target.value)
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Cards</h3>
                    {pendingAboutCards?.cards.map((card, index) => (
                      <div key={index} className="space-y-4 border p-4 rounded-md">
                        <h4 className="font-medium">Card {index + 1}</h4>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={card.title}
                            onChange={(e) =>
                              handleNewAboutCardChange(index, "title", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={card.description}
                            onChange={(e) =>
                              handleNewAboutCardChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Input
                            value={card.imageUrl || ""}
                            onChange={(e) =>
                              handleNewAboutCardChange(index, "imageUrl", e.target.value)
                            }
                            placeholder="Icon class or URL"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="animals" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Animal Card Sections</CardTitle>
                  <CardDescription>
                    Update the animal cards on the homepage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Animals Card */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Animals Card</h3>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={getContentValue("animals_title")}
                        onChange={(e) => handleContentChange("animals_title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        value={getContentValue("animals_text")}
                        onChange={(e) => handleContentChange("animals_text", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={getContentValue("animals_image")}
                        onChange={(e) => handleContentChange("animals_image", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={getContentValue("animals_button_text")}
                        onChange={(e) =>
                          handleContentChange("animals_button_text", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Redirect URL</Label>
                      <Input
                        value={getContentValue("animals_redirect")}
                        onChange={(e) =>
                          handleContentChange("animals_redirect", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Bakery Card */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Bakery Card</h3>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={getContentValue("bakery_title")}
                        onChange={(e) => handleContentChange("bakery_title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        value={getContentValue("bakery_text")}
                        onChange={(e) => handleContentChange("bakery_text", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={getContentValue("bakery_image")}
                        onChange={(e) => handleContentChange("bakery_image", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={getContentValue("bakery_button_text")}
                        onChange={(e) =>
                          handleContentChange("bakery_button_text", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Redirect URL</Label>
                      <Input
                        value={getContentValue("bakery_redirect")}
                        onChange={(e) =>
                          handleContentChange("bakery_redirect", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Products Card */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h3 className="text-lg font-semibold">Products Card</h3>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={getContentValue("products_title")}
                        onChange={(e) => handleContentChange("products_title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Textarea
                        value={getContentValue("products_text")}
                        onChange={(e) => handleContentChange("products_text", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={getContentValue("products_image")}
                        onChange={(e) => handleContentChange("products_image", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Button Text</Label>
                      <Input
                        value={getContentValue("products_button_text")}
                        onChange={(e) =>
                          handleContentChange("products_button_text", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Redirect URL</Label>
                      <Input
                        value={getContentValue("products_redirect")}
                        onChange={(e) =>
                          handleContentChange("products_redirect", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold">Market Page Settings</h3>
                    <div className="space-y-2">
                      <Label>Hero Image</Label>
                      <Input 
                        value={getContentValue("market_hero_image")} 
                        onChange={(e) => handleContentChange("market_hero_image", e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Page Title</Label>
                      <Input 
                        value={getContentValue("market_page_title")} 
                        onChange={(e) => handleContentChange("market_page_title", e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Page Description</Label>
                      <Textarea 
                        value={getContentValue("market_description")} 
                        onChange={(e) => handleContentChange("market_description", e.target.value)} 
                      />
                    </div>
                  </div>

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

                      {/* Produce Section */}
                      <div className="space-y-4 mb-8">
                        <h4 className="font-medium">Produce Section</h4>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={getContentValue("market_produce_title") || "Produce"}
                            onChange={(e) => handleContentChange("market_produce_title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={getContentValue("market_produce_description") || "Fresh, seasonal produce from our garden."}
                            onChange={(e) => handleContentChange("market_produce_description", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Dairy Section */}
                      <div className="space-y-4 mb-8">
                        <h4 className="font-medium">Dairy Section</h4>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={getContentValue("market_dairy_title") || "Dairy"}
                            onChange={(e) => handleContentChange("market_dairy_title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={getContentValue("market_dairy_description") || "Farm-fresh milk, cheese, and other dairy products."}
                            onChange={(e) => handleContentChange("market_dairy_description", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Meats Section */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Meats Section</h4>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={getContentValue("market_meats_title") || "Meats"}
                            onChange={(e) => handleContentChange("market_meats_title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={getContentValue("market_meats_description") || "Ethically raised, grass-fed beef and other meats."}
                            onChange={(e) => handleContentChange("market_meats_description", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logo" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Logo & Meta Information</CardTitle>
                  <CardDescription>Update site logo and meta tags</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Logo Image URL</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={getContentValue("logo")}
                        onChange={(e) => handleContentChange("logo", e.target.value)}
                        className="flex-grow"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="logo-upload"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleLogoUpload(e.target.files[0]);
                            }
                          }}
                          accept="image/*"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </label>
                      </div>
                    </div>
                    {getContentValue("logo") && (
                      <div className="mt-2">
                        <img
                          src={getContentValue("logo")}
                          alt="Logo"
                          className="max-h-20 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Open Graph Image URL</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        value={getContentValue("og_image")}
                        onChange={(e) => handleContentChange("og_image", e.target.value)}
                        className="flex-grow"
                      />
                      <div className="relative">
                        <input
                          type="file"
                          id="og-upload"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleOGImageUpload(e.target.files[0]);
                            }
                          }}
                          accept="image/*"
                        />
                        <label
                          htmlFor="og-upload"
                          className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </label>
                      </div>
                    </div>
                    {getContentValue("og_image") && (
                      <div className="mt-2">
                        <img
                          src={getContentValue("og_image")}
                          alt="OG image"
                          className="max-h-40 rounded-md object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Site Description (Meta)</Label>
                    <Textarea
                      value={getContentValue("site_description")}
                      onChange={(e) => handleContentChange("site_description", e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carousel" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Carousel Items</CardTitle>
                  <CardDescription>Update the homepage carousel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sortedCarouselItems.map((item) => (
                      <div
                        key={item.id}
                        className="space-y-4 border p-4 rounded-md"
                      >
                        <h3 className="text-lg font-semibold">
                          Slide {item.order + 1}
                        </h3>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={getCarouselValue(item.id, "title")}
                            onChange={(e) =>
                              handleCarouselChange(item.id, "title", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={getCarouselValue(item.id, "description")}
                            onChange={(e) =>
                              handleCarouselChange(
                                item.id,
                                "description",
                                e.target.value,
                              )
                            }
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <div className="flex items-center gap-4">
                            <Input
                              value={getCarouselValue(item.id, "imageUrl")}
                              onChange={(e) =>
                                handleCarouselChange(
                                  item.id,
                                  "imageUrl",
                                  e.target.value,
                                )
                              }
                              className="flex-grow"
                            />
                            <div className="relative">
                              <input
                                type="file"
                                id={`carousel-upload-${item.id}`}
                                className="sr-only"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleCarouselImageUpload(
                                      e.target.files[0],
                                      item.id,
                                    );
                                  }
                                }}
                                accept="image/*"
                              />
                              <label
                                htmlFor={`carousel-upload-${item.id}`}
                                className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                              >
                                <Upload className="h-4 w-4" />
                                Upload
                              </label>
                            </div>
                          </div>
                          {getCarouselValue(item.id, "imageUrl") && (
                            <div className="mt-2">
                              <img
                                src={getCarouselValue(item.id, "imageUrl")}
                                alt={`Carousel item ${item.order}`}
                                className="max-h-40 rounded-md object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="principles" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Principles</CardTitle>
              <CardDescription>
                Update the core principles displayed on the site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedPrinciples.map((principle) => (
                  <div
                    key={principle.id}
                    className="space-y-4 border p-4 rounded-md"
                  >
                    <h3 className="text-lg font-semibold">
                      Principle {principle.order + 1}
                    </h3>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={getPrincipleValue(principle.id, "title")}
                        onChange={(e) =>
                          handlePrincipleChange(
                            principle.id,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={getPrincipleValue(principle.id, "description")}
                        onChange={(e) =>
                          handlePrincipleChange(
                            principle.id,
                            "description",
                            e.target.value,
                          )
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <div className="flex items-center gap-4">
                        <Input
                          value={getPrincipleValue(principle.id, "imageUrl") || ""}
                          onChange={(e) =>
                            handlePrincipleChange(
                              principle.id,
                              "imageUrl",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <div className="relative">
                          <input
                            type="file"
                            id={`principle-upload-${principle.id}`}
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePrincipleImageUpload(
                                  e.target.files[0],
                                  principle.id,
                                );
                              }
                            }}
                            accept="image/*"
                          />
                          <label
                            htmlFor={`principle-upload-${principle.id}`}
                            className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </label>
                        </div>
                      </div>
                      {getPrincipleValue(principle.id, "imageUrl") && (
                        <div className="mt-2">
                          <img
                            src={getPrincipleValue(principle.id, "imageUrl") as string}
                            alt={`Principle ${principle.order}`}
                            className="max-h-40 rounded-md object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={saveAllChanges} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      {showCropper && cropImageUrl && (
        <ImageCrop
          imageUrl={cropImageUrl}
          onComplete={handleCropComplete}
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