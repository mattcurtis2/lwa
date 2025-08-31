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
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
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
                  <div className="space-y-2">
                    <Label>Breed Description Title</Label>
                    <Input
                      value={getContentValue("dogs_page_title")}
                      onChange={(e) => handleContentChange("dogs_page_title", e.target.value)}
                      placeholder="Colorado Mountain Dogs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Breed Description</Label>
                    <Textarea
                      value={getContentValue("dogs_page_description")}
                      onChange={(e) => handleContentChange("dogs_page_description", e.target.value)}
                      placeholder="Enter a description of the breed..."
                      className="min-h-[150px]"
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