import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { uploadFileToS3 } from "../../lib/upload-utils"; //Import added here

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

const FileUpload = ({ onFileUpload }: { onFileUpload: (url: string) => void }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;
      try {
        const url = await uploadFileToS3(file);
        onFileUpload(url);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    multiple: false,
  });
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "relative overflow-hidden",
        isDragActive && "bg-accent"
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <Upload className="h-4 w-4 mr-2" />
      Upload
    </Button>
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

  const handleFileUpload = async (file: File): Promise<string> => {
    return uploadFileToS3(file); // Use the shared S3 upload function
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
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start mb-4 border-b flex-wrap md:flex-nowrap">
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="principles">Principles</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="carousel">Carousel</TabsTrigger>
            <TabsTrigger value="dogs">Dogs</TabsTrigger>
            <TabsTrigger value="goats">Goats</TabsTrigger>
            <TabsTrigger value="sheep">Sheep</TabsTrigger>
            <TabsTrigger value="bees">Bees</TabsTrigger>
            <TabsTrigger value="chickens">Chickens</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
          </TabsList>
        </div>

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
                          // Check if it's a local URL and handle accordingly
                          if (imageUrl.startsWith('/uploads/')) {
                            console.warn('Found local image URL. This should be migrated to S3.');
                          }
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
          {/* Sheep Card Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Katahdin Sheep Card</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={getContentValue("sheep_title")}
                    onChange={(e) => handleContentChange("sheep_title", e.target.value)}
                    placeholder="Enter sheep card title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={getContentValue("sheep_text")}
                    onChange={(e) => handleContentChange("sheep_text", e.target.value)}
                    placeholder="Enter sheep card description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Button Text</Label>
                  <Input
                    value={getContentValue("sheep_button_text")}
                    onChange={(e) => handleContentChange("sheep_button_text", e.target.value)}
                    placeholder="Enter button text"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Redirect URL</Label>
                  <Input
                    value={getContentValue("sheep_redirect")}
                    onChange={(e) => handleContentChange("sheep_redirect", e.target.value)}
                    placeholder="Enter redirect URL (e.g., /sheep)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("sheep_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("sheep_image")}
                  />
                  {getContentValue("sheep_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("sheep_image")}
                        alt="Sheep Card Image Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carousel Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Carousel Slides</h3>
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
          </div>
        </TabsContent>

        <TabsContent value="dogs" className="space-y-6">
          <div className="space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input
                    value={getContentValue("dog_hero_title") || "Colorado Mountain Dogs"}
                    onChange={(e) => handleContentChange("dog_hero_title", e.target.value)}
                    placeholder="Enter hero title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Subtitle</Label>
                  <Textarea
                    value={getContentValue("dog_hero_subtitle") || "Loyal guardians bred for livestock protection, combining strength with gentle temperament"}
                    onChange={(e) => handleContentChange("dog_hero_subtitle", e.target.value)}
                    placeholder="Enter hero subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Background Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("dog_hero_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("dog_hero_image")}
                  />
                  {getContentValue("dog_hero_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("dog_hero_image")}
                        alt="Dogs Hero Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                        onClick={() => {
                          setCropImageUrl(getContentValue("dog_hero_image"));
                          setShowCropper(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Why We Love Our Colorado Mountain Dogs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Why We Love Our Colorado Mountain Dogs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={getContentValue("dogs_why_love_title") || "Why We Love Our Colorado Mountain Dogs"}
                    onChange={(e) => handleContentChange("dogs_why_love_title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Main Description</Label>
                  <Textarea
                    value={getContentValue("dogs_why_love_description") || "Colorado Mountain Dogs represent the perfect balance of guardian instincts and family companionship. These remarkable dogs are gentle with children and livestock, yet fierce protectors when needed."}
                    onChange={(e) => handleContentChange("dogs_why_love_description", e.target.value)}
                    placeholder="Main description"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trait 1</Label>
                    <Input
                      value={getContentValue("dogs_trait_1") || "Loyal and devoted to family"}
                      onChange={(e) => handleContentChange("dogs_trait_1", e.target.value)}
                      placeholder="First trait"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trait 2</Label>
                    <Input
                      value={getContentValue("dogs_trait_2") || "Excellent with children"}
                      onChange={(e) => handleContentChange("dogs_trait_2", e.target.value)}
                      placeholder="Second trait"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trait 3</Label>
                    <Input
                      value={getContentValue("dogs_trait_3") || "Natural livestock guardians"}
                      onChange={(e) => handleContentChange("dogs_trait_3", e.target.value)}
                      placeholder="Third trait"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trait 4</Label>
                    <Input
                      value={getContentValue("dogs_trait_4") || "Athletic and agile"}
                      onChange={(e) => handleContentChange("dogs_trait_4", e.target.value)}
                      placeholder="Fourth trait"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Image 1</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("dogs_why_love_image_1", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("dogs_why_love_image_1")}
                    />
                    {getContentValue("dogs_why_love_image_1") && (
                      <img
                        src={getContentValue("dogs_why_love_image_1")}
                        alt="Why Love Image 1"
                        className="mt-2 rounded-lg max-h-32 object-cover"
                      />
                    )}
                    <Input
                      value={getContentValue("dogs_why_love_caption_1") || "Guardian & Family Companion"}
                      onChange={(e) => handleContentChange("dogs_why_love_caption_1", e.target.value)}
                      placeholder="Image 1 caption"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image 2</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("dogs_why_love_image_2", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("dogs_why_love_image_2")}
                    />
                    {getContentValue("dogs_why_love_image_2") && (
                      <img
                        src={getContentValue("dogs_why_love_image_2")}
                        alt="Why Love Image 2"
                        className="mt-2 rounded-lg max-h-32 object-cover"
                      />
                    )}
                    <Input
                      value={getContentValue("dogs_why_love_caption_2") || "Livestock Protection Expert"}
                      onChange={(e) => handleContentChange("dogs_why_love_caption_2", e.target.value)}
                      placeholder="Image 2 caption"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Little Way Acres Breeding Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle>Little Way Acres Breeding Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={getContentValue("dogs_breeding_goals_title") || "Little Way Acres Breeding Goals"}
                    onChange={(e) => handleContentChange("dogs_breeding_goals_title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                
                <div className="grid gap-6">
                  {/* Goal 1 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">Goal 1: Temperament Above Everything Else</h4>
                    <div className="space-y-2">
                      <Label>Goal 1 Title</Label>
                      <Input
                        value={getContentValue("dogs_goal_1_title") || "Temperament Above Everything Else"}
                        onChange={(e) => handleContentChange("dogs_goal_1_title", e.target.value)}
                        placeholder="Goal 1 title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Goal 1 Description</Label>
                      <Textarea
                        value={getContentValue("dogs_goal_1_description") || "We want our dogs to be your children's favorite pillow. A gentle, calm disposition is our highest priority in every breeding decision."}
                        onChange={(e) => handleContentChange("dogs_goal_1_description", e.target.value)}
                        placeholder="Goal 1 description"
                      />
                    </div>
                  </div>

                  {/* Goal 2 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">Goal 2: Teachable</h4>
                    <div className="space-y-2">
                      <Label>Goal 2 Title</Label>
                      <Input
                        value={getContentValue("dogs_goal_2_title") || "Teachable"}
                        onChange={(e) => handleContentChange("dogs_goal_2_title", e.target.value)}
                        placeholder="Goal 2 title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Goal 2 Description</Label>
                      <Textarea
                        value={getContentValue("dogs_goal_2_description") || "We want smart dogs that will follow your lead in how your farm is operated. Intelligence and willingness to learn are essential traits."}
                        onChange={(e) => handleContentChange("dogs_goal_2_description", e.target.value)}
                        placeholder="Goal 2 description"
                      />
                    </div>
                  </div>

                  {/* Goal 3 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">Goal 3: Seamless Adoption of New Animals</h4>
                    <div className="space-y-2">
                      <Label>Goal 3 Title</Label>
                      <Input
                        value={getContentValue("dogs_goal_3_title") || "Seamless Adoption of New Animals"}
                        onChange={(e) => handleContentChange("dogs_goal_3_title", e.target.value)}
                        placeholder="Goal 3 title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Goal 3 Description</Label>
                      <Textarea
                        value={getContentValue("dogs_goal_3_description") || "As a small farmer, we're experimenting with different animals. Our CMDRs are bred and trained to adopt any animal you bring on your farm."}
                        onChange={(e) => handleContentChange("dogs_goal_3_description", e.target.value)}
                        placeholder="Goal 3 description"
                      />
                    </div>
                  </div>

                  {/* Goal 4 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">Goal 4: Beautifully Athletic</h4>
                    <div className="space-y-2">
                      <Label>Goal 4 Title</Label>
                      <Input
                        value={getContentValue("dogs_goal_4_title") || "Beautifully Athletic"}
                        onChange={(e) => handleContentChange("dogs_goal_4_title", e.target.value)}
                        placeholder="Goal 4 title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Goal 4 Description</Label>
                      <Textarea
                        value={getContentValue("dogs_goal_4_description") || "Tall, lean, and ready to run. We prioritize physical fitness and graceful movement in our breeding program."}
                        onChange={(e) => handleContentChange("dogs_goal_4_description", e.target.value)}
                        placeholder="Goal 4 description"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Breeding Goals Side Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("dogs_breeding_goals_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("dogs_breeding_goals_image")}
                  />
                  {getContentValue("dogs_breeding_goals_image") && (
                    <img
                      src={getContentValue("dogs_breeding_goals_image")}
                      alt="Breeding Goals Image"
                      className="mt-2 rounded-lg max-h-48 object-cover"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Who is a Good Fit Section */}
            <Card>
              <CardHeader>
                <CardTitle>Who is a Good Fit for a CMDR?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={getContentValue("dogs_good_fit_title") || "Who is a Good Fit for a CMDR?"}
                    onChange={(e) => handleContentChange("dogs_good_fit_title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={getContentValue("dogs_good_fit_subtitle") || "Perfect for Small Farms"}
                    onChange={(e) => handleContentChange("dogs_good_fit_subtitle", e.target.value)}
                    placeholder="Subtitle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Main Description</Label>
                  <Textarea
                    value={getContentValue("dogs_good_fit_description") || "Colorado Mountain Dogs were specifically developed for small farm operations where traditional livestock guardians might be too large, loud, or roaming. They excel in environments where close family bonds and selective protection are essential."}
                    onChange={(e) => handleContentChange("dogs_good_fit_description", e.target.value)}
                    placeholder="Main description"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Good Fit Point 1</Label>
                    <Input
                      value={getContentValue("dogs_good_fit_point_1") || "Small to medium-sized farms (1-20 acres)"}
                      onChange={(e) => handleContentChange("dogs_good_fit_point_1", e.target.value)}
                      placeholder="First good fit point"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Good Fit Point 2</Label>
                    <Input
                      value={getContentValue("dogs_good_fit_point_2") || "Families with children"}
                      onChange={(e) => handleContentChange("dogs_good_fit_point_2", e.target.value)}
                      placeholder="Second good fit point"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Good Fit Point 3</Label>
                    <Input
                      value={getContentValue("dogs_good_fit_point_3") || "Goat, sheep, or poultry operations"}
                      onChange={(e) => handleContentChange("dogs_good_fit_point_3", e.target.value)}
                      placeholder="Third good fit point"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Good Fit Point 4</Label>
                    <Input
                      value={getContentValue("dogs_good_fit_point_4") || "Active rural or suburban households"}
                      onChange={(e) => handleContentChange("dogs_good_fit_point_4", e.target.value)}
                      placeholder="Fourth good fit point"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Good Fit Section Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("dogs_good_fit_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("dogs_good_fit_image")}
                  />
                  {getContentValue("dogs_good_fit_image") && (
                    <img
                      src={getContentValue("dogs_good_fit_image")}
                      alt="Good Fit Image"
                      className="mt-2 rounded-lg max-h-48 object-cover"
                    />
                  )}
                  <Input
                    value={getContentValue("dogs_good_fit_image_caption") || "Protecting our small farm operation"}
                    onChange={(e) => handleContentChange("dogs_good_fit_image_caption", e.target.value)}
                    placeholder="Image caption"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Explore Our Dogs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Explore Our Dogs Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={getContentValue("dogs_explore_title") || "Explore Our Dogs"}
                    onChange={(e) => handleContentChange("dogs_explore_title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Section Description</Label>
                  <Textarea
                    value={getContentValue("dogs_explore_description") || "Discover our breeding program and meet our Colorado Mountain Dogs"}
                    onChange={(e) => handleContentChange("dogs_explore_description", e.target.value)}
                    placeholder="Section description"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>FAQ Section Title</Label>
                  <Input
                    value={getContentValue("dogs_faq_title") || "Frequently Asked Questions"}
                    onChange={(e) => handleContentChange("dogs_faq_title", e.target.value)}
                    placeholder="FAQ section title"
                  />
                </div>
                
                <div className="grid gap-6">
                  {/* FAQ 1 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">FAQ 1: Size</h4>
                    <div className="space-y-2">
                      <Label>Question 1</Label>
                      <Input
                        value={getContentValue("dogs_faq_1_question") || "How big do Colorado Mountain Dogs get?"}
                        onChange={(e) => handleContentChange("dogs_faq_1_question", e.target.value)}
                        placeholder="FAQ question 1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer 1</Label>
                      <Textarea
                        value={getContentValue("dogs_faq_1_answer") || "CMDRs typically stand 26-34 inches at the shoulder and weigh 80-140 pounds. They have a tall, lean build that's athletic and agile, perfect for navigating rugged terrain while maintaining endurance."}
                        onChange={(e) => handleContentChange("dogs_faq_1_answer", e.target.value)}
                        placeholder="FAQ answer 1"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* FAQ 2 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">FAQ 2: Children</h4>
                    <div className="space-y-2">
                      <Label>Question 2</Label>
                      <Input
                        value={getContentValue("dogs_faq_2_question") || "Are CMDs good with children?"}
                        onChange={(e) => handleContentChange("dogs_faq_2_question", e.target.value)}
                        placeholder="FAQ question 2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer 2</Label>
                      <Textarea
                        value={getContentValue("dogs_faq_2_answer") || "Absolutely! Colorado Mountain Dogs are exceptionally good with children. They're bred to be gentle, patient, and protective family guardians. Their natural instinct is to watch over and protect their \"flock,\" which includes children. Many CMD owners report that their dogs are incredibly tolerant of children's behavior and form deep, protective bonds with kids in the family."}
                        onChange={(e) => handleContentChange("dogs_faq_2_answer", e.target.value)}
                        placeholder="FAQ answer 2"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* FAQ 3 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">FAQ 3: Other Pets</h4>
                    <div className="space-y-2">
                      <Label>Question 3</Label>
                      <Input
                        value={getContentValue("dogs_faq_3_question") || "Are they good with other pets?"}
                        onChange={(e) => handleContentChange("dogs_faq_3_question", e.target.value)}
                        placeholder="FAQ question 3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer 3</Label>
                      <Textarea
                        value={getContentValue("dogs_faq_3_answer") || "Yes! CMDRs are specifically bred to be gentle with family members, including other pets. They form strong bonds with their \"flock\" - whether that's livestock, family pets, or both. Their guardian instincts extend to protecting all members of their household."}
                        onChange={(e) => handleContentChange("dogs_faq_3_answer", e.target.value)}
                        placeholder="FAQ answer 3"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* FAQ 4 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">FAQ 4: Barking</h4>
                    <div className="space-y-2">
                      <Label>Question 4</Label>
                      <Input
                        value={getContentValue("dogs_faq_4_question") || "Do they bark a lot?"}
                        onChange={(e) => handleContentChange("dogs_faq_4_question", e.target.value)}
                        placeholder="FAQ question 4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer 4</Label>
                      <Textarea
                        value={getContentValue("dogs_faq_4_answer") || "Unlike some traditional livestock guardian breeds, CMDRs are bred for minimal unnecessary barking. They're discerning protectors - alert and vocal when there's a real threat, but generally quiet during normal daily activities."}
                        onChange={(e) => handleContentChange("dogs_faq_4_answer", e.target.value)}
                        placeholder="FAQ answer 4"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* FAQ 5 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">FAQ 5: Exercise</h4>
                    <div className="space-y-2">
                      <Label>Question 5</Label>
                      <Input
                        value={getContentValue("dogs_faq_5_question") || "How much exercise do they need?"}
                        onChange={(e) => handleContentChange("dogs_faq_5_question", e.target.value)}
                        placeholder="FAQ question 5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer 5</Label>
                      <Textarea
                        value={getContentValue("dogs_faq_5_answer") || "CMDRs are working dogs that thrive with regular activity and mental stimulation. They do best with access to space to patrol and explore, but don't require intense exercise like some high-energy breeds. A job to do is more important than miles of running."}
                        onChange={(e) => handleContentChange("dogs_faq_5_answer", e.target.value)}
                        placeholder="FAQ answer 5"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* FAQ 6 */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-semibold">FAQ 6: Grooming</h4>
                    <div className="space-y-2">
                      <Label>Question 6</Label>
                      <Input
                        value={getContentValue("dogs_faq_6_question") || "What's their grooming requirements?"}
                        onChange={(e) => handleContentChange("dogs_faq_6_question", e.target.value)}
                        placeholder="FAQ question 6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Answer 6</Label>
                      <Textarea
                        value={getContentValue("dogs_faq_6_answer") || "CMDRs have medium-length, weather-resistant white coats that are surprisingly low-maintenance. Regular brushing helps manage seasonal shedding, but their coats are designed to be self-cleaning and don't require frequent baths."}
                        onChange={(e) => handleContentChange("dogs_faq_6_answer", e.target.value)}
                        placeholder="FAQ answer 6"
                        className="min-h-[80px]"
                      />
                    </div>
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

            {/* Our Nigerian Dwarf Goats Program Section */}
            <Card>
              <CardHeader>
                <CardTitle>Our Nigerian Dwarf Goats Program Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Program Section Title</Label>
                  <Input
                    value={getContentValue("goats_program_title") || "Our Nigerian Dwarf Goats Program"}
                    onChange={(e) => handleContentChange("goats_program_title", e.target.value)}
                    placeholder="Enter program section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Program Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("goats_program_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("goats_program_image")}
                  />
                  {getContentValue("goats_program_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("goats_program_image")}
                        alt="Program Image Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                        onClick={() => {
                          setCropImageUrl(getContentValue("goats_program_image"));
                          setShowCropper(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  )}
                </div>

                {/* Program Card 1 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Program Card 1: Premium Milk Production</h4>
                  <div className="space-y-2">
                    <Label>Card 1 Icon</Label>
                    <Input
                      value={getContentValue("goats_program_card1_icon") || "🥛"}
                      onChange={(e) => handleContentChange("goats_program_card1_icon", e.target.value)}
                      placeholder="Enter icon (emoji)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 1 Title</Label>
                    <Input
                      value={getContentValue("goats_program_card1_title") || "Premium Milk Production"}
                      onChange={(e) => handleContentChange("goats_program_card1_title", e.target.value)}
                      placeholder="Enter card title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 1 Description</Label>
                    <Textarea
                      value={getContentValue("goats_program_card1_description") || "Nigerian Dwarf goats produce rich, creamy milk perfect for drinking, cheese making, and soap production with high butterfat content."}
                      onChange={(e) => handleContentChange("goats_program_card1_description", e.target.value)}
                      placeholder="Enter card description"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Program Card 2 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Program Card 2: Gentle Companions</h4>
                  <div className="space-y-2">
                    <Label>Card 2 Icon</Label>
                    <Input
                      value={getContentValue("goats_program_card2_icon") || "💚"}
                      onChange={(e) => handleContentChange("goats_program_card2_icon", e.target.value)}
                      placeholder="Enter icon (emoji)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 2 Title</Label>
                    <Input
                      value={getContentValue("goats_program_card2_title") || "Gentle Companions"}
                      onChange={(e) => handleContentChange("goats_program_card2_title", e.target.value)}
                      placeholder="Enter card title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 2 Description</Label>
                    <Textarea
                      value={getContentValue("goats_program_card2_description") || "Known for their friendly, docile temperaments, Nigerian Dwarf goats make excellent family pets and therapy animals."}
                      onChange={(e) => handleContentChange("goats_program_card2_description", e.target.value)}
                      placeholder="Enter card description"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Program Card 3 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Program Card 3: Small Space Friendly</h4>
                  <div className="space-y-2">
                    <Label>Card 3 Icon</Label>
                    <Input
                      value={getContentValue("goats_program_card3_icon") || "🏠"}
                      onChange={(e) => handleContentChange("goats_program_card3_icon", e.target.value)}
                      placeholder="Enter icon (emoji)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 3 Title</Label>
                    <Input
                      value={getContentValue("goats_program_card3_title") || "Small Space Friendly"}
                      onChange={(e) => handleContentChange("goats_program_card3_title", e.target.value)}
                      placeholder="Enter card title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 3 Description</Label>
                    <Textarea
                      value={getContentValue("goats_program_card3_description") || "Their compact size makes them perfect for small farms and homesteads, requiring less space while still providing excellent milk production."}
                      onChange={(e) => handleContentChange("goats_program_card3_description", e.target.value)}
                      placeholder="Enter card description"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Breeding Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle>Our Breeding Goals Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Goals Section Title</Label>
                  <Input
                    value={getContentValue("goats_goals_title") || "Our Breeding Goals"}
                    onChange={(e) => handleContentChange("goats_goals_title", e.target.value)}
                    placeholder="Enter goals section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Goals Section Description</Label>
                  <Textarea
                    value={getContentValue("goats_goals_description") || "We're developing a sustainable goat breeding program that prioritizes health, milk production, and gentle temperaments."}
                    onChange={(e) => handleContentChange("goats_goals_description", e.target.value)}
                    placeholder="Enter goals section description"
                    className="min-h-[80px]"
                  />
                </div>

                {/* Goal 1 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Goal 1: Superior Milk Quality</h4>
                  <div className="space-y-2">
                    <Label>Goal 1 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("goats_goal1_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("goats_goal1_image")}
                    />
                    {getContentValue("goats_goal1_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("goats_goal1_image")}
                          alt="Goal 1 Image Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("goats_goal1_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Title</Label>
                    <Input
                      value={getContentValue("goats_goal1_title") || "Superior Milk Quality"}
                      onChange={(e) => handleContentChange("goats_goal1_title", e.target.value)}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Description</Label>
                    <Textarea
                      value={getContentValue("goats_goal1_description") || "Breeding for goats that produce high-butterfat milk with excellent taste and nutritional value, perfect for artisan cheese and soap making."}
                      onChange={(e) => handleContentChange("goats_goal1_description", e.target.value)}
                      placeholder="Enter goal description"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Subtitle</Label>
                    <Input
                      value={getContentValue("goats_goal1_subtitle") || "Quality Genetics"}
                      onChange={(e) => handleContentChange("goats_goal1_subtitle", e.target.value)}
                      placeholder="Enter goal subtitle"
                    />
                  </div>
                </div>

                {/* Goal 2 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Goal 2: Health & Longevity</h4>
                  <div className="space-y-2">
                    <Label>Goal 2 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("goats_goal2_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("goats_goal2_image")}
                    />
                    {getContentValue("goats_goal2_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("goats_goal2_image")}
                          alt="Goal 2 Image Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("goats_goal2_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Title</Label>
                    <Input
                      value={getContentValue("goats_goal2_title") || "Health & Longevity"}
                      onChange={(e) => handleContentChange("goats_goal2_title", e.target.value)}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Description</Label>
                    <Textarea
                      value={getContentValue("goats_goal2_description") || "Selecting for robust health, disease resistance, and longevity to ensure our goats live happy, productive lives for many years."}
                      onChange={(e) => handleContentChange("goats_goal2_description", e.target.value)}
                      placeholder="Enter goal description"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Subtitle</Label>
                    <Input
                      value={getContentValue("goats_goal2_subtitle") || "Vitality & Wellness"}
                      onChange={(e) => handleContentChange("goats_goal2_subtitle", e.target.value)}
                      placeholder="Enter goal subtitle"
                    />
                  </div>
                </div>

                {/* Goal 3 */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Goal 3: Gentle Temperaments</h4>
                  <div className="space-y-2">
                    <Label>Goal 3 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("goats_goal3_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("goats_goal3_image")}
                    />
                    {getContentValue("goats_goal3_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("goats_goal3_image")}
                          alt="Goal 3 Image Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("goats_goal3_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Title</Label>
                    <Input
                      value={getContentValue("goats_goal3_title") || "Gentle Temperaments"}
                      onChange={(e) => handleContentChange("goats_goal3_title", e.target.value)}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Description</Label>
                    <Textarea
                      value={getContentValue("goats_goal3_description") || "Breeding for calm, friendly personalities that make our goats wonderful family companions and easy to handle for milking and care."}
                      onChange={(e) => handleContentChange("goats_goal3_description", e.target.value)}
                      placeholder="Enter goal description"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Subtitle</Label>
                    <Input
                      value={getContentValue("goats_goal3_subtitle") || "Family Friendly"}
                      onChange={(e) => handleContentChange("goats_goal3_subtitle", e.target.value)}
                      placeholder="Enter goal subtitle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explore Our Goats Navigation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Explore Our Goats Navigation Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Explore Section Title</Label>
                  <Input
                    value={getContentValue("goats_explore_title") || "Explore Our Goats"}
                    onChange={(e) => handleContentChange("goats_explore_title", e.target.value)}
                    placeholder="Enter explore section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Explore Section Description</Label>
                  <Textarea
                    value={getContentValue("goats_explore_description") || "Discover our Nigerian Dwarf goat breeding program and meet our herd"}
                    onChange={(e) => handleContentChange("goats_explore_description", e.target.value)}
                    placeholder="Enter explore section description"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sheep" className="space-y-6">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hero Title</Label>
                    <Input
                      value={getContentValue("sheep_hero_title") || "Katahdin Sheep"}
                      onChange={(e) => handleContentChange("sheep_hero_title", e.target.value)}
                      placeholder="Enter hero title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Subtitle</Label>
                    <Textarea
                      value={getContentValue("sheep_hero_subtitle") || "Discover our hardy Katahdin sheep, known for their natural shedding coat and excellent meat production."}
                      onChange={(e) => handleContentChange("sheep_hero_subtitle", e.target.value)}
                      placeholder="Enter hero subtitle"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Background Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("sheep_hero_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("sheep_hero_image")}
                    />
                    {getContentValue("sheep_hero_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("sheep_hero_image")}
                          alt="Sheep Hero Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("sheep_hero_image"));
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
                      value={getContentValue("sheep_description") || "Our Katahdin sheep are hardy, naturally shedding sheep known for their excellent mothering abilities and lean meat production."}
                      onChange={(e) => handleContentChange("sheep_description", e.target.value)}
                      placeholder="Enter page description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breeding Program Description</Label>
                    <Textarea
                      value={getContentValue("sheep_breeding_program") || "Our breeding program focuses on producing high-quality Katahdin sheep with excellent conformation, hardiness, and meat production capabilities."}
                      onChange={(e) => handleContentChange("sheep_breeding_program", e.target.value)}
                      placeholder="Enter breeding program description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Available Sheep Message</Label>
                    <Textarea
                      value={getContentValue("sheep_available_message") || "Check out our currently available Katahdin sheep. Contact us for more information about any of our available animals."}
                      onChange={(e) => handleContentChange("sheep_available_message", e.target.value)}
                      placeholder="Enter available sheep message"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Male Sheep (Rams) Description</Label>
                    <Textarea
                      value={getContentValue("sheep_rams_description") || "Meet our Katahdin rams. These hardy boys are carefully selected for their excellent genetics and strong conformation."}
                      onChange={(e) => handleContentChange("sheep_rams_description", e.target.value)}
                      placeholder="Enter rams description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Female Sheep (Ewes) Description</Label>
                    <Textarea
                      value={getContentValue("sheep_ewes_description") || "Meet our Katahdin ewes. These lovely ladies are the foundation of our flock, known for their excellent mothering abilities."}
                      onChange={(e) => handleContentChange("sheep_ewes_description", e.target.value)}
                      placeholder="Enter ewes description"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Katahdin Sheep Program Section */}
            <Card>
              <CardHeader>
                <CardTitle>Our Katahdin Sheep Program Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Program Section Title</Label>
                  <Input
                    value={getContentValue("sheep_program_title") || "Our Katahdin Sheep Program"}
                    onChange={(e) => handleContentChange("sheep_program_title", e.target.value)}
                    placeholder="Enter program section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Program Section Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("sheep_program_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("sheep_program_image")}
                  />
                  {getContentValue("sheep_program_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("sheep_program_image")}
                        alt="Sheep Program Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                        onClick={() => {
                          setCropImageUrl(getContentValue("sheep_program_image"));
                          setShowCropper(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  )}
                </div>

                {/* Program Card 1 */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Program Card 1</h4>
                  <div className="space-y-2">
                    <Label>Card 1 Icon</Label>
                    <Input
                      value={getContentValue("sheep_program_card1_icon") || "🐑"}
                      onChange={(e) => handleContentChange("sheep_program_card1_icon", e.target.value)}
                      placeholder="Enter card icon (emoji)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 1 Title</Label>
                    <Input
                      value={getContentValue("sheep_program_card1_title") || "No Shearing Required"}
                      onChange={(e) => handleContentChange("sheep_program_card1_title", e.target.value)}
                      placeholder="Enter card title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 1 Description</Label>
                    <Textarea
                      value={getContentValue("sheep_program_card1_description") || "Katahdin sheep naturally shed their coat each spring, eliminating the need for annual shearing and reducing maintenance costs."}
                      onChange={(e) => handleContentChange("sheep_program_card1_description", e.target.value)}
                      placeholder="Enter card description"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Program Card 2 */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Program Card 2</h4>
                  <div className="space-y-2">
                    <Label>Card 2 Icon</Label>
                    <Input
                      value={getContentValue("sheep_program_card2_icon") || "💪"}
                      onChange={(e) => handleContentChange("sheep_program_card2_icon", e.target.value)}
                      placeholder="Enter card icon (emoji)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 2 Title</Label>
                    <Input
                      value={getContentValue("sheep_program_card2_title") || "Hardy & Resilient"}
                      onChange={(e) => handleContentChange("sheep_program_card2_title", e.target.value)}
                      placeholder="Enter card title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 2 Description</Label>
                    <Textarea
                      value={getContentValue("sheep_program_card2_description") || "Known for their exceptional hardiness and disease resistance, Katahdin sheep thrive in various climates with minimal intervention."}
                      onChange={(e) => handleContentChange("sheep_program_card2_description", e.target.value)}
                      placeholder="Enter card description"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Program Card 3 */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Program Card 3</h4>
                  <div className="space-y-2">
                    <Label>Card 3 Icon</Label>
                    <Input
                      value={getContentValue("sheep_program_card3_icon") || "🥩"}
                      onChange={(e) => handleContentChange("sheep_program_card3_icon", e.target.value)}
                      placeholder="Enter card icon (emoji)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 3 Title</Label>
                    <Input
                      value={getContentValue("sheep_program_card3_title") || "Quality Meat Production"}
                      onChange={(e) => handleContentChange("sheep_program_card3_title", e.target.value)}
                      placeholder="Enter card title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Card 3 Description</Label>
                    <Textarea
                      value={getContentValue("sheep_program_card3_description") || "Katahdin sheep produce lean, flavorful meat with excellent marbling and tender texture, perfect for farm-to-table dining."}
                      onChange={(e) => handleContentChange("sheep_program_card3_description", e.target.value)}
                      placeholder="Enter card description"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Breeding Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle>Our Breeding Goals Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Goals Section Title</Label>
                  <Input
                    value={getContentValue("sheep_goals_title") || "Our Breeding Goals"}
                    onChange={(e) => handleContentChange("sheep_goals_title", e.target.value)}
                    placeholder="Enter goals section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Goals Section Description</Label>
                  <Textarea
                    value={getContentValue("sheep_goals_description") || "We're developing a sustainable sheep breeding program that prioritizes hardiness, mothering ability, and meat quality."}
                    onChange={(e) => handleContentChange("sheep_goals_description", e.target.value)}
                    placeholder="Enter goals section description"
                    className="min-h-[80px]"
                  />
                </div>

                {/* Goal 1 */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Goal 1</h4>
                  <div className="space-y-2">
                    <Label>Goal 1 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("sheep_goal1_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("sheep_goal1_image")}
                    />
                    {getContentValue("sheep_goal1_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("sheep_goal1_image")}
                          alt="Goal 1 Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("sheep_goal1_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Title</Label>
                    <Input
                      value={getContentValue("sheep_goal1_title") || "Superior Meat Quality"}
                      onChange={(e) => handleContentChange("sheep_goal1_title", e.target.value)}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Description</Label>
                    <Textarea
                      value={getContentValue("sheep_goal1_description") || "Breeding for sheep that produce lean, flavorful meat with excellent marbling and feed conversion efficiency for sustainable farming."}
                      onChange={(e) => handleContentChange("sheep_goal1_description", e.target.value)}
                      placeholder="Enter goal description"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Subtitle</Label>
                    <Input
                      value={getContentValue("sheep_goal1_subtitle") || "Premium Genetics"}
                      onChange={(e) => handleContentChange("sheep_goal1_subtitle", e.target.value)}
                      placeholder="Enter goal subtitle"
                    />
                  </div>
                </div>

                {/* Goal 2 */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Goal 2</h4>
                  <div className="space-y-2">
                    <Label>Goal 2 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("sheep_goal2_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("sheep_goal2_image")}
                    />
                    {getContentValue("sheep_goal2_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("sheep_goal2_image")}
                          alt="Goal 2 Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("sheep_goal2_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Title</Label>
                    <Input
                      value={getContentValue("sheep_goal2_title") || "Excellent Mothering"}
                      onChange={(e) => handleContentChange("sheep_goal2_title", e.target.value)}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Description</Label>
                    <Textarea
                      value={getContentValue("sheep_goal2_description") || "Selecting for ewes with strong maternal instincts, easy lambing, and excellent milk production to raise healthy, vigorous lambs."}
                      onChange={(e) => handleContentChange("sheep_goal2_description", e.target.value)}
                      placeholder="Enter goal description"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Subtitle</Label>
                    <Input
                      value={getContentValue("sheep_goal2_subtitle") || "Natural Mothers"}
                      onChange={(e) => handleContentChange("sheep_goal2_subtitle", e.target.value)}
                      placeholder="Enter goal subtitle"
                    />
                  </div>
                </div>

                {/* Goal 3 */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Goal 3</h4>
                  <div className="space-y-2">
                    <Label>Goal 3 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("sheep_goal3_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("sheep_goal3_image")}
                    />
                    {getContentValue("sheep_goal3_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("sheep_goal3_image")}
                          alt="Goal 3 Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("sheep_goal3_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Title</Label>
                    <Input
                      value={getContentValue("sheep_goal3_title") || "Climate Adaptability"}
                      onChange={(e) => handleContentChange("sheep_goal3_title", e.target.value)}
                      placeholder="Enter goal title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Description</Label>
                    <Textarea
                      value={getContentValue("sheep_goal3_description") || "Breeding sheep that thrive in Michigan's climate with natural parasite resistance and year-round hardiness for sustainable farming."}
                      onChange={(e) => handleContentChange("sheep_goal3_description", e.target.value)}
                      placeholder="Enter goal description"
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Subtitle</Label>
                    <Input
                      value={getContentValue("sheep_goal3_subtitle") || "Weather Resilience"}
                      onChange={(e) => handleContentChange("sheep_goal3_subtitle", e.target.value)}
                      placeholder="Enter goal subtitle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explore Our Sheep Navigation Section */}
            <Card>
              <CardHeader>
                <CardTitle>Explore Our Sheep Navigation Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Explore Section Title</Label>
                  <Input
                    value={getContentValue("sheep_explore_title") || "Explore Our Sheep"}
                    onChange={(e) => handleContentChange("sheep_explore_title", e.target.value)}
                    placeholder="Enter explore section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Explore Section Description</Label>
                  <Textarea
                    value={getContentValue("sheep_explore_description") || "Discover our Katahdin sheep breeding program and meet our flock"}
                    onChange={(e) => handleContentChange("sheep_explore_description", e.target.value)}
                    placeholder="Enter explore section description"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bees" className="space-y-6">
          <div className="space-y-6">
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <CardTitle>Bees Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input
                    value={getContentValue("bees_hero_title") || "Our Bees"}
                    onChange={(e) => handleContentChange("bees_hero_title", e.target.value)}
                    placeholder="Enter hero title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Description</Label>
                  <Textarea
                    value={getContentValue("bees_page_description") || "Our beekeeping program focuses on developing mite-resistant, winter-hardy Michigan bees while producing high-quality honey and supporting our farm's pollination needs."}
                    onChange={(e) => handleContentChange("bees_page_description", e.target.value)}
                    placeholder="Enter hero description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Background Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("bees_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("bees_image")}
                  />
                  {getContentValue("bees_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("bees_image")}
                        alt="Bees Hero Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                        onClick={() => {
                          setCropImageUrl(getContentValue("bees_image"));
                          setShowCropper(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Purpose Section */}
            <Card>
              <CardHeader>
                <CardTitle>Our Purpose Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Purpose Section Title</Label>
                  <Input
                    value={getContentValue("bees_purpose_title") || "Our Purpose"}
                    onChange={(e) => handleContentChange("bees_purpose_title", e.target.value)}
                    placeholder="Enter purpose section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purpose Image</Label>
                  <PrincipleDropzone
                    onDrop={(files) => {
                      if (files[0]) {
                        handleFileUpload(files[0]).then(imageUrl => {
                          handleContentChange("bees_purpose_image", imageUrl);
                        });
                      }
                    }}
                    currentImageUrl={getContentValue("bees_purpose_image")}
                  />
                  {getContentValue("bees_purpose_image") && (
                    <div className="relative group">
                      <img
                        src={getContentValue("bees_purpose_image")}
                        alt="Purpose Image Preview"
                        className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                        onClick={() => {
                          setCropImageUrl(getContentValue("bees_purpose_image"));
                          setShowCropper(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Honey Production - Title</Label>
                    <Input
                      value={getContentValue("bees_honey_title") || "Honey Production"}
                      onChange={(e) => handleContentChange("bees_honey_title", e.target.value)}
                      placeholder="Enter honey production title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Honey Production - Icon</Label>
                    <Input
                      value={getContentValue("bees_honey_icon") || "🍯"}
                      onChange={(e) => handleContentChange("bees_honey_icon", e.target.value)}
                      placeholder="Enter emoji icon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Honey Production - Description</Label>
                    <Textarea
                      value={getContentValue("bees_honey_description") || "To produce pure, raw honey that captures the essence of our local flora and provides natural sweetness for our community."}
                      onChange={(e) => handleContentChange("bees_honey_description", e.target.value)}
                      placeholder="Enter honey production description"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pollination Support - Title</Label>
                    <Input
                      value={getContentValue("bees_pollination_title") || "Pollination Support"}
                      onChange={(e) => handleContentChange("bees_pollination_title", e.target.value)}
                      placeholder="Enter pollination title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pollination Support - Icon</Label>
                    <Input
                      value={getContentValue("bees_pollination_icon") || "🌸"}
                      onChange={(e) => handleContentChange("bees_pollination_icon", e.target.value)}
                      placeholder="Enter emoji icon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pollination Support - Description</Label>
                    <Textarea
                      value={getContentValue("bees_pollination_description") || "To pollinate our fruit trees and garden, increasing yields and supporting the biodiversity of our farm ecosystem."}
                      onChange={(e) => handleContentChange("bees_pollination_description", e.target.value)}
                      placeholder="Enter pollination description"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bee Beautiful - Title</Label>
                    <Input
                      value={getContentValue("bees_beautiful_title") || "Bee Beautiful"}
                      onChange={(e) => handleContentChange("bees_beautiful_title", e.target.value)}
                      placeholder="Enter bee beautiful title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bee Beautiful - Icon</Label>
                    <Input
                      value={getContentValue("bees_beautiful_icon") || "🐝"}
                      onChange={(e) => handleContentChange("bees_beautiful_icon", e.target.value)}
                      placeholder="Enter emoji icon"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bee Beautiful - Description</Label>
                    <Textarea
                      value={getContentValue("bees_beautiful_description") || "To maintain healthy, thriving bee colonies that add beauty and wonder to our farm while contributing to environmental health."}
                      onChange={(e) => handleContentChange("bees_beautiful_description", e.target.value)}
                      placeholder="Enter bee beautiful description"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goals Section */}
            <Card>
              <CardHeader>
                <CardTitle>Our Beekeeping Goals Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Goals Section Title</Label>
                  <Input
                    value={getContentValue("bees_goals_title") || "Our Beekeeping Goals"}
                    onChange={(e) => handleContentChange("bees_goals_title", e.target.value)}
                    placeholder="Enter goals section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Goals Section Description</Label>
                  <Textarea
                    value={getContentValue("bees_goals_description") || "We're committed to developing sustainable, resilient bee colonies that thrive in Michigan's climate."}
                    onChange={(e) => handleContentChange("bees_goals_description", e.target.value)}
                    placeholder="Enter goals section description"
                  />
                </div>
                
                {/* Goal 1: Mite Resistance */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Goal 1: Mite Resistance Development</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Goal 1 Title</Label>
                      <Input
                        value={getContentValue("bees_goal1_title") || "Mite Resistance Development"}
                        onChange={(e) => handleContentChange("bees_goal1_title", e.target.value)}
                        placeholder="Enter goal 1 title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Goal 1 Subtitle</Label>
                      <Input
                        value={getContentValue("bees_goal1_subtitle") || "Building Natural Immunity"}
                        onChange={(e) => handleContentChange("bees_goal1_subtitle", e.target.value)}
                        placeholder="Enter goal 1 subtitle"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Description</Label>
                    <Textarea
                      value={getContentValue("bees_goal1_description") || "Develop and introduce mite-resistant genetics to create stronger, healthier bee colonies that can naturally defend against varroa mites and other pests."}
                      onChange={(e) => handleContentChange("bees_goal1_description", e.target.value)}
                      placeholder="Enter goal 1 description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 1 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("bees_goal1_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("bees_goal1_image")}
                    />
                  </div>
                </div>

                {/* Goal 2: Winter Hardy */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Goal 2: Winter Hardy Michigan Bees</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Goal 2 Title</Label>
                      <Input
                        value={getContentValue("bees_goal2_title") || "Winter Hardy Michigan Bees"}
                        onChange={(e) => handleContentChange("bees_goal2_title", e.target.value)}
                        placeholder="Enter goal 2 title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Goal 2 Subtitle</Label>
                      <Input
                        value={getContentValue("bees_goal2_subtitle") || "Cold Climate Adaptation"}
                        onChange={(e) => handleContentChange("bees_goal2_subtitle", e.target.value)}
                        placeholder="Enter goal 2 subtitle"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Description</Label>
                    <Textarea
                      value={getContentValue("bees_goal2_description") || "Select for winter-hardy traits that allow our bees to thrive in Michigan's harsh winters, reducing losses and building sustainable colonies."}
                      onChange={(e) => handleContentChange("bees_goal2_description", e.target.value)}
                      placeholder="Enter goal 2 description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 2 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("bees_goal2_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("bees_goal2_image")}
                    />
                  </div>
                </div>

                {/* Goal 3: Honey Production */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold">Goal 3: Honey Production Excellence</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Goal 3 Title</Label>
                      <Input
                        value={getContentValue("bees_goal3_title") || "Honey Production Excellence"}
                        onChange={(e) => handleContentChange("bees_goal3_title", e.target.value)}
                        placeholder="Enter goal 3 title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Goal 3 Subtitle</Label>
                      <Input
                        value={getContentValue("bees_goal3_subtitle") || "Premium Quality Focus"}
                        onChange={(e) => handleContentChange("bees_goal3_subtitle", e.target.value)}
                        placeholder="Enter goal 3 subtitle"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Description</Label>
                    <Textarea
                      value={getContentValue("bees_goal3_description") || "Produce hives that love building honey, focusing on genetics that promote strong honey production and efficient comb building."}
                      onChange={(e) => handleContentChange("bees_goal3_description", e.target.value)}
                      placeholder="Enter goal 3 description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Goal 3 Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("bees_goal3_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("bees_goal3_image")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Coming Soon Section */}
            <Card>
              <CardHeader>
                <CardTitle>Products Coming Soon Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Products Section Title</Label>
                  <Input
                    value={getContentValue("bees_products_title") || "Honey & Bee Products Coming Soon!"}
                    onChange={(e) => handleContentChange("bees_products_title", e.target.value)}
                    placeholder="Enter products section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Products Section Description</Label>
                  <Textarea
                    value={getContentValue("bees_products_description") || "We're currently establishing our hives and working toward our first honey harvest. Our raw, unfiltered honey and other bee products will be available at our farmers market soon."}
                    onChange={(e) => handleContentChange("bees_products_description", e.target.value)}
                    placeholder="Enter products section description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Products Footer Message</Label>
                  <Input
                    value={getContentValue("bees_products_footer") || "Check back soon or contact us for updates on our honey availability."}
                    onChange={(e) => handleContentChange("bees_products_footer", e.target.value)}
                    placeholder="Enter products footer message"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Badge 1</Label>
                  <Input
                    value={getContentValue("bees_product_badge_1") || "Raw Honey"}
                    onChange={(e) => handleContentChange("bees_product_badge_1", e.target.value)}
                    placeholder="Enter first product badge"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Badge 2</Label>
                  <Input
                    value={getContentValue("bees_product_badge_2") || "Beeswax"}
                    onChange={(e) => handleContentChange("bees_product_badge_2", e.target.value)}
                    placeholder="Enter second product badge"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Badge 3</Label>
                  <Input
                    value={getContentValue("bees_product_badge_3") || "Propolis"}
                    onChange={(e) => handleContentChange("bees_product_badge_3", e.target.value)}
                    placeholder="Enter third product badge"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Badge 4</Label>
                  <Input
                    value={getContentValue("bees_product_badge_4") || "Honey Comb"}
                    onChange={(e) => handleContentChange("bees_product_badge_4", e.target.value)}
                    placeholder="Enter fourth product badge"
                  />
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
                  <div className="space-y-2">
                    <Label>Hero Background Image</Label>
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

        <TabsContent value="chickens">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chickens Page Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hero Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Hero Section</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="chickens_hero_title">Hero Title</Label>
                      <Input
                        id="chickens_hero_title"
                        value={getContentValue("chickens_hero_title")}
                        onChange={(e) =>
                          handleContentChange("chickens_hero_title", e.target.value)
                        }
                        placeholder="Premium Heritage Chickens"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chickens_hero_subtitle">Hero Subtitle</Label>
                      <Input
                        id="chickens_hero_subtitle"
                        value={getContentValue("chickens_hero_subtitle")}
                        onChange={(e) =>
                          handleContentChange("chickens_hero_subtitle", e.target.value)
                        }
                        placeholder="Raising colorful heritage breeds..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_hero_description">Hero Description</Label>
                    <Textarea
                      id="chickens_hero_description"
                      value={getContentValue("chickens_hero_description")}
                      onChange={(e) =>
                        handleContentChange("chickens_hero_description", e.target.value)
                      }
                      placeholder="Discover our carefully selected heritage chicken breeds..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hero Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("chickens_hero_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("chickens_hero_image")}
                    />
                    {getContentValue("chickens_hero_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("chickens_hero_image")}
                          alt="Chickens Hero Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover cursor-pointer"
                          onClick={() => {
                            setCropImageUrl(getContentValue("chickens_hero_image"));
                            setShowCropper(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Our Purpose Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Our Purpose Section</h3>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_purpose_title">Purpose Title</Label>
                    <Input
                      id="chickens_purpose_title"
                      value={getContentValue("chickens_purpose_title")}
                      onChange={(e) =>
                        handleContentChange("chickens_purpose_title", e.target.value)
                      }
                      placeholder="Our Purpose"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_purpose_text">Purpose Text</Label>
                    <Textarea
                      id="chickens_purpose_text"
                      value={getContentValue("chickens_purpose_text")}
                      onChange={(e) =>
                        handleContentChange("chickens_purpose_text", e.target.value)
                      }
                      placeholder="Our chicken breeding program focuses on..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose Section Image</Label>
                    <PrincipleDropzone
                      onDrop={(files) => {
                        if (files[0]) {
                          handleFileUpload(files[0]).then(imageUrl => {
                            handleContentChange("chickens_purpose_image", imageUrl);
                          });
                        }
                      }}
                      currentImageUrl={getContentValue("chickens_purpose_image")}
                    />
                    {getContentValue("chickens_purpose_image") && (
                      <div className="relative group">
                        <img
                          src={getContentValue("chickens_purpose_image")}
                          alt="Chickens Purpose Preview"
                          className="mt-4 rounded-lg max-h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Purpose Cards */}
                  <div className="space-y-6 border-t pt-4">
                    <h4 className="font-medium text-green-800">Purpose Cards</h4>
                    
                    {/* Purpose Card 1 */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h5 className="font-medium">Card 1 - Fresh Farm Eggs</h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="chickens_purpose_card1_title">Card 1 Title</Label>
                          <Input
                            id="chickens_purpose_card1_title"
                            value={getContentValue("chickens_purpose_card1_title")}
                            onChange={(e) =>
                              handleContentChange("chickens_purpose_card1_title", e.target.value)
                            }
                            placeholder="Fresh Farm Eggs"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chickens_purpose_card1_icon">Card 1 Icon (Emoji)</Label>
                          <Input
                            id="chickens_purpose_card1_icon"
                            value={getContentValue("chickens_purpose_card1_icon")}
                            onChange={(e) =>
                              handleContentChange("chickens_purpose_card1_icon", e.target.value)
                            }
                            placeholder="🥚"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_purpose_card1_description">Card 1 Description</Label>
                        <Textarea
                          id="chickens_purpose_card1_description"
                          value={getContentValue("chickens_purpose_card1_description")}
                          onChange={(e) =>
                            handleContentChange("chickens_purpose_card1_description", e.target.value)
                          }
                          placeholder="Daily collection of fresh, nutritious eggs..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Purpose Card 2 */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h5 className="font-medium">Card 2 - Color Variety</h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="chickens_purpose_card2_title">Card 2 Title</Label>
                          <Input
                            id="chickens_purpose_card2_title"
                            value={getContentValue("chickens_purpose_card2_title")}
                            onChange={(e) =>
                              handleContentChange("chickens_purpose_card2_title", e.target.value)
                            }
                            placeholder="Color Variety"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chickens_purpose_card2_icon">Card 2 Icon (Emoji)</Label>
                          <Input
                            id="chickens_purpose_card2_icon"
                            value={getContentValue("chickens_purpose_card2_icon")}
                            onChange={(e) =>
                              handleContentChange("chickens_purpose_card2_icon", e.target.value)
                            }
                            placeholder="🌈"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_purpose_card2_description">Card 2 Description</Label>
                        <Textarea
                          id="chickens_purpose_card2_description"
                          value={getContentValue("chickens_purpose_card2_description")}
                          onChange={(e) =>
                            handleContentChange("chickens_purpose_card2_description", e.target.value)
                          }
                          placeholder="Breeding for beautiful color diversity..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Purpose Card 3 */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h5 className="font-medium">Card 3 - High Production</h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="chickens_purpose_card3_title">Card 3 Title</Label>
                          <Input
                            id="chickens_purpose_card3_title"
                            value={getContentValue("chickens_purpose_card3_title")}
                            onChange={(e) =>
                              handleContentChange("chickens_purpose_card3_title", e.target.value)
                            }
                            placeholder="High Production"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chickens_purpose_card3_icon">Card 3 Icon (Emoji)</Label>
                          <Input
                            id="chickens_purpose_card3_icon"
                            value={getContentValue("chickens_purpose_card3_icon")}
                            onChange={(e) =>
                              handleContentChange("chickens_purpose_card3_icon", e.target.value)
                            }
                            placeholder="📈"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_purpose_card3_description">Card 3 Description</Label>
                        <Textarea
                          id="chickens_purpose_card3_description"
                          value={getContentValue("chickens_purpose_card3_description")}
                          onChange={(e) =>
                            handleContentChange("chickens_purpose_card3_description", e.target.value)
                          }
                          placeholder="Selecting for hens that consistently lay..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breeding Goals Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Breeding Goals Section</h3>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_goals_title">Goals Title</Label>
                    <Input
                      id="chickens_goals_title"
                      value={getContentValue("chickens_goals_title")}
                      onChange={(e) =>
                        handleContentChange("chickens_goals_title", e.target.value)
                      }
                      placeholder="Our Breeding Goals"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_goals_subtitle">Goals Subtitle</Label>
                    <Input
                      id="chickens_goals_subtitle"
                      value={getContentValue("chickens_goals_subtitle")}
                      onChange={(e) =>
                        handleContentChange("chickens_goals_subtitle", e.target.value)
                      }
                      placeholder="We prioritize health, productivity, and genetic diversity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_goals_description">Goals Description</Label>
                    <Textarea
                      id="chickens_goals_description"
                      value={getContentValue("chickens_goals_description")}
                      onChange={(e) =>
                        handleContentChange("chickens_goals_description", e.target.value)
                      }
                      placeholder="Through careful breeding practices..."
                      rows={4}
                    />
                  </div>
                  
                  {/* Breeding Goal Cards */}
                  <div className="space-y-6 border-t pt-4">
                    <h4 className="font-medium text-green-800">Breeding Goal Cards</h4>
                    
                    {/* Goal 1 */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h5 className="font-medium">Goal 1 - Heritage Breed Preservation</h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="chickens_goal1_title">Goal 1 Title</Label>
                          <Input
                            id="chickens_goal1_title"
                            value={getContentValue("chickens_goal1_title")}
                            onChange={(e) =>
                              handleContentChange("chickens_goal1_title", e.target.value)
                            }
                            placeholder="Heritage Breed Preservation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chickens_goal1_subtitle">Goal 1 Subtitle</Label>
                          <Input
                            id="chickens_goal1_subtitle"
                            value={getContentValue("chickens_goal1_subtitle")}
                            onChange={(e) =>
                              handleContentChange("chickens_goal1_subtitle", e.target.value)
                            }
                            placeholder="Genetic Conservation"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_goal1_description">Goal 1 Description</Label>
                        <Textarea
                          id="chickens_goal1_description"
                          value={getContentValue("chickens_goal1_description")}
                          onChange={(e) =>
                            handleContentChange("chickens_goal1_description", e.target.value)
                          }
                          placeholder="Maintain and expand our collection..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Goal 1 Image</Label>
                        <PrincipleDropzone
                          onDrop={(files) => {
                            if (files[0]) {
                              handleFileUpload(files[0]).then(imageUrl => {
                                handleContentChange("chickens_goal1_image", imageUrl);
                              });
                            }
                          }}
                          currentImageUrl={getContentValue("chickens_goal1_image")}
                        />
                        {getContentValue("chickens_goal1_image") && (
                          <div className="relative group">
                            <img
                              src={getContentValue("chickens_goal1_image")}
                              alt="Goal 1 Preview"
                              className="mt-4 rounded-lg max-h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Goal 2 */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h5 className="font-medium">Goal 2 - Rainbow Egg Collection</h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="chickens_goal2_title">Goal 2 Title</Label>
                          <Input
                            id="chickens_goal2_title"
                            value={getContentValue("chickens_goal2_title")}
                            onChange={(e) =>
                              handleContentChange("chickens_goal2_title", e.target.value)
                            }
                            placeholder="Rainbow Egg Collection"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chickens_goal2_subtitle">Goal 2 Subtitle</Label>
                          <Input
                            id="chickens_goal2_subtitle"
                            value={getContentValue("chickens_goal2_subtitle")}
                            onChange={(e) =>
                              handleContentChange("chickens_goal2_subtitle", e.target.value)
                            }
                            placeholder="Color Diversity"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_goal2_description">Goal 2 Description</Label>
                        <Textarea
                          id="chickens_goal2_description"
                          value={getContentValue("chickens_goal2_description")}
                          onChange={(e) =>
                            handleContentChange("chickens_goal2_description", e.target.value)
                          }
                          placeholder="Develop flocks that produce eggs in a stunning array..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Goal 2 Image</Label>
                        <PrincipleDropzone
                          onDrop={(files) => {
                            if (files[0]) {
                              handleFileUpload(files[0]).then(imageUrl => {
                                handleContentChange("chickens_goal2_image", imageUrl);
                              });
                            }
                          }}
                          currentImageUrl={getContentValue("chickens_goal2_image")}
                        />
                        {getContentValue("chickens_goal2_image") && (
                          <div className="relative group">
                            <img
                              src={getContentValue("chickens_goal2_image")}
                              alt="Goal 2 Preview"
                              className="mt-4 rounded-lg max-h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Goal 3 */}
                    <div className="border rounded-lg p-4 space-y-3">
                      <h5 className="font-medium">Goal 3 - Sustainable Production</h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="chickens_goal3_title">Goal 3 Title</Label>
                          <Input
                            id="chickens_goal3_title"
                            value={getContentValue("chickens_goal3_title")}
                            onChange={(e) =>
                              handleContentChange("chickens_goal3_title", e.target.value)
                            }
                            placeholder="Sustainable Production"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="chickens_goal3_subtitle">Goal 3 Subtitle</Label>
                          <Input
                            id="chickens_goal3_subtitle"
                            value={getContentValue("chickens_goal3_subtitle")}
                            onChange={(e) =>
                              handleContentChange("chickens_goal3_subtitle", e.target.value)
                            }
                            placeholder="Productivity & Welfare"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_goal3_description">Goal 3 Description</Label>
                        <Textarea
                          id="chickens_goal3_description"
                          value={getContentValue("chickens_goal3_description")}
                          onChange={(e) =>
                            handleContentChange("chickens_goal3_description", e.target.value)
                          }
                          placeholder="Breed for consistent, high-volume egg production..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Goal 3 Image</Label>
                        <PrincipleDropzone
                          onDrop={(files) => {
                            if (files[0]) {
                              handleFileUpload(files[0]).then(imageUrl => {
                                handleContentChange("chickens_goal3_image", imageUrl);
                              });
                            }
                          }}
                          currentImageUrl={getContentValue("chickens_goal3_image")}
                        />
                        {getContentValue("chickens_goal3_image") && (
                          <div className="relative group">
                            <img
                              src={getContentValue("chickens_goal3_image")}
                              alt="Goal 3 Preview"
                              className="mt-4 rounded-lg max-h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Section */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">Products Section</h3>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_products_title">Products Title</Label>
                    <Input
                      id="chickens_products_title"
                      value={getContentValue("chickens_products_title")}
                      onChange={(e) =>
                        handleContentChange("chickens_products_title", e.target.value)
                      }
                      placeholder="What We Offer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_products_subtitle">Products Subtitle</Label>
                    <Input
                      id="chickens_products_subtitle"
                      value={getContentValue("chickens_products_subtitle")}
                      onChange={(e) =>
                        handleContentChange("chickens_products_subtitle", e.target.value)
                      }
                      placeholder="From our chicken program, we provide"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_products_description">Products Description</Label>
                    <Textarea
                      id="chickens_products_description"
                      value={getContentValue("chickens_products_description")}
                      onChange={(e) =>
                        handleContentChange("chickens_products_description", e.target.value)
                      }
                      placeholder="Our heritage chickens provide fresh eggs daily..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chickens_products_footer">Products Footer</Label>
                    <Input
                      id="chickens_products_footer"
                      value={getContentValue("chickens_products_footer")}
                      onChange={(e) =>
                        handleContentChange("chickens_products_footer", e.target.value)
                      }
                      placeholder="Contact us for availability..."
                    />
                  </div>
                  
                  {/* Product Badges */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-green-800">Product Badges</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="chickens_product_badge1">Product Badge 1</Label>
                        <Input
                          id="chickens_product_badge1"
                          value={getContentValue("chickens_product_badge1")}
                          onChange={(e) =>
                            handleContentChange("chickens_product_badge1", e.target.value)
                          }
                          placeholder="Fresh Eggs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_product_badge2">Product Badge 2</Label>
                        <Input
                          id="chickens_product_badge2"
                          value={getContentValue("chickens_product_badge2")}
                          onChange={(e) =>
                            handleContentChange("chickens_product_badge2", e.target.value)
                          }
                          placeholder="Heritage Chicks"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_product_badge3">Product Badge 3</Label>
                        <Input
                          id="chickens_product_badge3"
                          value={getContentValue("chickens_product_badge3")}
                          onChange={(e) =>
                            handleContentChange("chickens_product_badge3", e.target.value)
                          }
                          placeholder="Breeding Stock"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_product_badge4">Product Badge 4</Label>
                        <Input
                          id="chickens_product_badge4"
                          value={getContentValue("chickens_product_badge4")}
                          onChange={(e) =>
                            handleContentChange("chickens_product_badge4", e.target.value)
                          }
                          placeholder="Hatching Eggs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Cards */}
                <div className="space-y-6 border-t pt-4">
                  <h3 className="text-lg font-semibold">Product Cards</h3>
                  
                  {/* Fresh Eggs Card */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-green-800">Fresh Eggs</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="chickens_eggs_title">Eggs Title</Label>
                        <Input
                          id="chickens_eggs_title"
                          value={pendingContent.chickens_eggs_title || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_eggs_title", e.target.value)
                          }
                          placeholder="Fresh Eggs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_eggs_icon">Eggs Icon (Emoji)</Label>
                        <Input
                          id="chickens_eggs_icon"
                          value={pendingContent.chickens_eggs_icon || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_eggs_icon", e.target.value)
                          }
                          placeholder="🥚"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chickens_eggs_description">Eggs Description</Label>
                      <Textarea
                        id="chickens_eggs_description"
                        value={pendingContent.chickens_eggs_description || ""}
                        onChange={(e) =>
                          handleContentChange("chickens_eggs_description", e.target.value)
                        }
                        placeholder="Farm-fresh eggs collected daily..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Heritage Chicks Card */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-green-800">Heritage Chicks</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="chickens_chicks_title">Chicks Title</Label>
                        <Input
                          id="chickens_chicks_title"
                          value={pendingContent.chickens_chicks_title || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_chicks_title", e.target.value)
                          }
                          placeholder="Heritage Chicks"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_chicks_icon">Chicks Icon (Emoji)</Label>
                        <Input
                          id="chickens_chicks_icon"
                          value={pendingContent.chickens_chicks_icon || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_chicks_icon", e.target.value)
                          }
                          placeholder="🐣"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chickens_chicks_description">Chicks Description</Label>
                      <Textarea
                        id="chickens_chicks_description"
                        value={pendingContent.chickens_chicks_description || ""}
                        onChange={(e) =>
                          handleContentChange("chickens_chicks_description", e.target.value)
                        }
                        placeholder="Day-old heritage breed chicks..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Breeding Stock Card */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-green-800">Breeding Stock</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="chickens_breeding_title">Breeding Title</Label>
                        <Input
                          id="chickens_breeding_title"
                          value={pendingContent.chickens_breeding_title || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_breeding_title", e.target.value)
                          }
                          placeholder="Breeding Stock"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_breeding_icon">Breeding Icon (Emoji)</Label>
                        <Input
                          id="chickens_breeding_icon"
                          value={pendingContent.chickens_breeding_icon || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_breeding_icon", e.target.value)
                          }
                          placeholder="🐓"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chickens_breeding_description">Breeding Description</Label>
                      <Textarea
                        id="chickens_breeding_description"
                        value={pendingContent.chickens_breeding_description || ""}
                        onChange={(e) =>
                          handleContentChange("chickens_breeding_description", e.target.value)
                        }
                        placeholder="Carefully selected adult birds..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Hatching Eggs Card */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-green-800">Hatching Eggs</h4>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="chickens_hatching_title">Hatching Title</Label>
                        <Input
                          id="chickens_hatching_title"
                          value={pendingContent.chickens_hatching_title || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_hatching_title", e.target.value)
                          }
                          placeholder="Hatching Eggs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chickens_hatching_icon">Hatching Icon (Emoji)</Label>
                        <Input
                          id="chickens_hatching_icon"
                          value={pendingContent.chickens_hatching_icon || ""}
                          onChange={(e) =>
                            handleContentChange("chickens_hatching_icon", e.target.value)
                          }
                          placeholder="🪺"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chickens_hatching_description">Hatching Description</Label>
                      <Textarea
                        id="chickens_hatching_description"
                        value={pendingContent.chickens_hatching_description || ""}
                        onChange={(e) =>
                          handleContentChange("chickens_hatching_description", e.target.value)
                        }
                        placeholder="Fertile eggs from our breeding program..."
                        rows={3}
                      />
                    </div>
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