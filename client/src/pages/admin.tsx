import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimalForm from "@/components/forms/animal-form";
import ProductForm from "@/components/forms/product-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Animal, Product, SiteContent, CarouselItem, Dog, DogsHero, Litter } from "@db/schema";
import AnimalCard from "@/components/cards/animal-card";
import ProductCard from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import CarouselForm from "@/components/forms/carousel-form";
import DogForm from "@/components/forms/dog-form";
import { formatDisplayDate } from "@/lib/date-utils";
import DogCard from "@/components/cards/dog-card";
import LitterForm from "@/components/forms/litter-form";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";

interface ContentField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'image';
}

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [editItem, setEditItem] = useState<Dog | Animal | Product | CarouselItem | null>(null);
  const [editLitter, setEditLitter] = useState<Litter | null>(null);
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});

  // Update queries with proper error handling and loading states
  const { data: siteContent = [], isLoading: isLoadingSiteContent, error } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
    staleTime: 0, // Ensure fresh data
    retry: 1,
    onSuccess: (data) => {
      console.log("Site Content Fetched Successfully:", data);
      // Initialize pendingContent with current values
      const initialContent: Record<string, string> = {};
      data.forEach((item) => {
        initialContent[item.key] = item.value;
      });
      setPendingContent(initialContent);
    },
    onError: (error) => {
      console.error("Failed to fetch site content:", error);
      toast({
        title: "Error",
        description: "Failed to load site content. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update site content mutation
  const updateSiteContent = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch(`/api/site-content/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update content");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to update content:", error);
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Effect to initialize pendingContent when siteContent changes
  useEffect(() => {
    if (siteContent?.length > 0) {
      const initialContent: Record<string, string> = {};
      siteContent.forEach((item) => {
        initialContent[item.key] = item.value;
      });
      setPendingContent(initialContent);
    }
  }, [siteContent]);

  const handleContentChange = (key: string, value: string) => {
    setPendingContent((prev) => ({ ...prev, [key]: value }));
    updateSiteContent.mutate({ key, value });
  };

  // Debug logging for site content
  console.log("Current Site Content:", siteContent);
  console.log("Pending Content:", pendingContent);

  // Other queries...
  const { data: carouselItems = [] } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"],
  });

  const { data: dogs = [] } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
  });

  const { data: dogsHero = [] } = useQuery<DogsHero[]>({
    queryKey: ["/api/dogs-hero"],
  });

  const { data: litters = [] } = useQuery<Litter[]>({
    queryKey: ["/api/litters"],
  });

  const { data: animals = [] } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const updateDogsHero = useMutation({
    mutationFn: async (data: Partial<DogsHero>) => {
      const res = await fetch("/api/dogs-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to update Dogs Hero");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs-hero"] });
      toast({
        title: "Success",
        description: "Dogs hero updated successfully",
      });
    },
    onError: (err) => {
      console.error("Failed to update Dogs Hero", err);
      toast({
        title: "Error",
        description: "Failed to update Dogs hero. Please try again.",
        variant: "destructive",
      });
    },
  });

  const contentFields: ContentField[] = [
    // Hero Section
    { key: "hero_text", label: "Hero Title", value: pendingContent["hero_text"] ?? siteContent.find(c => c.key === "hero_text")?.value ?? "", type: "text" },
    { key: "hero_subtitle", label: "Hero Subtitle", value: pendingContent["hero_subtitle"] ?? siteContent.find(c => c.key === "hero_subtitle")?.value ?? "", type: "text" },
    { key: "hero_cta", label: "Hero CTA Text", value: pendingContent["hero_cta"] ?? siteContent.find(c => c.key === "hero_cta")?.value ?? "", type: "text" },
    { key: "hero_background", label: "Hero Background", value: pendingContent["hero_background"] ?? siteContent.find(c => c.key === "hero_background")?.value ?? "", type: "image" },

    // About Section
    { key: "about_text", label: "About Text", value: pendingContent["about_text"] ?? siteContent.find(c => c.key === "about_text")?.value ?? "", type: "textarea" },
    { key: "mission_text", label: "Mission Text", value: pendingContent["mission_text"] ?? siteContent.find(c => c.key === "mission_text")?.value ?? "", type: "textarea" },

    // Animals Card
    { key: "animals_title", label: "Title", value: pendingContent["animals_title"] ?? siteContent.find(c => c.key === "animals_title")?.value ?? "", type: "text" },
    { key: "animals_description", label: "Description", value: pendingContent["animals_description"] ?? siteContent.find(c => c.key === "animals_description")?.value ?? "", type: "textarea" },
    { key: "animals_image", label: "Image", value: pendingContent["animals_image"] ?? siteContent.find(c => c.key === "animals_image")?.value ?? "", type: "image" },
    { key: "animals_cta", label: "CTA Text", value: pendingContent["animals_cta"] ?? siteContent.find(c => c.key === "animals_cta")?.value ?? "", type: "text" },
    { key: "animals_link", label: "Link", value: pendingContent["animals_link"] ?? siteContent.find(c => c.key === "animals_link")?.value ?? "", type: "text" },

    // Goats Card
    { key: "goats_title", label: "Title", value: pendingContent["goats_title"] ?? siteContent.find(c => c.key === "goats_title")?.value ?? "", type: "text" },
    { key: "goats_description", label: "Description", value: pendingContent["goats_description"] ?? siteContent.find(c => c.key === "goats_description")?.value ?? "", type: "textarea" },
    { key: "goats_image", label: "Image", value: pendingContent["goats_image"] ?? siteContent.find(c => c.key === "goats_image")?.value ?? "", type: "image" },
    { key: "goats_cta", label: "CTA Text", value: pendingContent["goats_cta"] ?? siteContent.find(c => c.key === "goats_cta")?.value ?? "", type: "text" },
    { key: "goats_link", label: "Link", value: pendingContent["goats_link"] ?? siteContent.find(c => c.key === "goats_link")?.value ?? "", type: "text" },

    // Products Card
    { key: "products_title", label: "Title", value: pendingContent["products_title"] ?? siteContent.find(c => c.key === "products_title")?.value ?? "", type: "text" },
    { key: "products_description", label: "Description", value: pendingContent["products_description"] ?? siteContent.find(c => c.key === "products_description")?.value ?? "", type: "textarea" },
    { key: "products_image", label: "Image", value: pendingContent["products_image"] ?? siteContent.find(c => c.key === "products_image")?.value ?? "", type: "image" },
    { key: "products_cta", label: "CTA Text", value: pendingContent["products_cta"] ?? siteContent.find(c => c.key === "products_cta")?.value ?? "", type: "text" },
    { key: "products_link", label: "Link", value: pendingContent["products_link"] ?? siteContent.find(c => c.key === "products_link")?.value ?? "", type: "text" },
  ];

  // Fix the DogCard syntax error
  const renderDogCard = (dog: Dog) => (
    <DogCard
      key={dog.id}
      dog={dog}
      isAdmin
      onEdit={() => {
        setEditItem(dog);
        setShowForm(true);
      }}
      onDelete={async (dog) => {
        if (!confirm("Are you sure you want to delete this dog?")) return;
        const res = await fetch(`/api/dogs/${dog.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
          toast({
            title: "Success",
            description: "Dog deleted successfully",
          });
        }
      }}
    />
  );

  // Loading state handling
  if (isLoadingSiteContent) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Content Management</h1>
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Content Management</h1>
        <p className="text-red-500">Error loading content. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Content Management</h1>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          {/* Hero Content Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Manage the main hero section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contentFields.slice(0, 4).map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="flex gap-4">
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        value={pendingContent[field.key] ?? field.value}
                        onChange={(e) => handleContentChange(field.key, e.target.value)}
                      />
                    ) : field.type === "image" ? (
                      <div className="flex-1">
                        <FileUpload
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(value) => handleContentChange(field.key, value)}
                          onFileSelect={async (file) => {
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                              const uploadRes = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                              });

                              if (!uploadRes.ok) throw new Error("Failed to upload image");
                              const { url } = await uploadRes.json();

                              handleContentChange(field.key, url);
                              updateSiteContent.mutate({ key: field.key, value: url });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to upload image",
                                variant: "destructive",
                              });
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        id={field.key}
                        value={pendingContent[field.key] ?? field.value}
                        onChange={(e) => handleContentChange(field.key, e.target.value)}
                      />
                    )}
                    {field.type === "image" && (pendingContent[field.key] ?? field.value) && (
                      <div className="w-40 h-40 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={pendingContent[field.key] ?? field.value}
                          alt={`${field.label} preview`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About Section</CardTitle>
              <CardDescription>Manage about and mission content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contentFields.slice(4, 6).map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="flex gap-4">
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        value={pendingContent[field.key] ?? field.value}
                        onChange={(e) => handleContentChange(field.key, e.target.value)}
                      />
                    ) : field.type === "image" ? (
                      <div className="flex-1">
                        <FileUpload
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(value) => handleContentChange(field.key, value)}
                          cropAspect={field.key === "hero_background" ? 16 / 9 : undefined}
                          onFileSelect={async (file) => {
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                              const uploadRes = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                              });

                              if (!uploadRes.ok) throw new Error("Failed to upload image");
                              const { url } = await uploadRes.json();

                              handleContentChange(field.key, url);
                              updateSiteContent.mutate({ key: field.key, value: url });
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to upload image",
                                variant: "destructive",
                              });
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <Input
                        id={field.key}
                        value={pendingContent[field.key] ?? field.value}
                        onChange={(e) => handleContentChange(field.key, e.target.value)}
                      />
                    )}
                    {field.type === "image" && (pendingContent[field.key] ?? field.value) && (
                      <div className="w-40 h-40 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={pendingContent[field.key] ?? field.value}
                          alt={`${field.label} preview`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feature Cards Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Feature Cards</CardTitle>
              <CardDescription>Manage the three main feature cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Animals Card */}
              <div className="space-y-6 pb-6 border-b">
                <h3 className="text-lg font-semibold">Animals Card</h3>
                {contentFields.slice(6, 11).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex gap-4">
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.key}
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(e) => handleContentChange(field.key, e.target.value)}
                        />
                      ) : field.type === "image" ? (
                        <div className="flex-1">
                          <FileUpload
                            value={pendingContent[field.key] ?? field.value}
                            onChange={(value) => handleContentChange(field.key, value)}
                            cropAspect={field.key === "hero_background" ? 16 / 9 : undefined}
                            onFileSelect={async (file) => {
                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                const uploadRes = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!uploadRes.ok) throw new Error("Failed to upload image");
                                const { url } = await uploadRes.json();

                                handleContentChange(field.key, url);
                                updateSiteContent.mutate({ key: field.key, value: url });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to upload image",
                                  variant: "destructive",
                                });
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <Input
                          id={field.key}
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(e) => handleContentChange(field.key, e.target.value)}
                        />
                      )}
                      {field.type === "image" && (pendingContent[field.key] ?? field.value) && (
                        <div className="w-40 h-40 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={pendingContent[field.key] ?? field.value}
                            alt={`${field.label} preview`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Goats Card */}
              <div className="space-y-6 pb-6 border-b">
                <h3 className="text-lg font-semibold">Goats Card</h3>
                {contentFields.slice(11, 16).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex gap-4">
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.key}
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(e) => handleContentChange(field.key, e.target.value)}
                        />
                      ) : field.type === "image" ? (
                        <div className="flex-1">
                          <FileUpload
                            value={pendingContent[field.key] ?? field.value}
                            onChange={(value) => handleContentChange(field.key, value)}
                            cropAspect={field.key === "hero_background" ? 16 / 9 : undefined}
                            onFileSelect={async (file) => {
                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                const uploadRes = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!uploadRes.ok) throw new Error("Failed to upload image");
                                const { url } = await uploadRes.json();

                                handleContentChange(field.key, url);
                                updateSiteContent.mutate({ key: field.key, value: url });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to upload image",
                                  variant: "destructive",
                                });
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <Input
                          id={field.key}
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(e) => handleContentChange(field.key, e.target.value)}
                        />
                      )}
                      {field.type === "image" && (pendingContent[field.key] ?? field.value) && (
                        <div className="w-40 h-40 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={pendingContent[field.key] ?? field.value}
                            alt={`${field.label} preview`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Products Card */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Products Card</h3>
                {contentFields.slice(16).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex gap-4">
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.key}
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(e) => handleContentChange(field.key, e.target.value)}
                        />
                      ) : field.type === "image" ? (
                        <div className="flex-1">
                          <FileUpload
                            value={pendingContent[field.key] ?? field.value}
                            onChange={(value) => handleContentChange(field.key, value)}
                            cropAspect={field.key === "hero_background" ? 16 / 9 : undefined}
                            onFileSelect={async (file) => {
                              const formData = new FormData();
                              formData.append("file", file);

                              try {
                                const uploadRes = await fetch("/api/upload", {
                                  method: "POST",
                                  body: formData,
                                });

                                if (!uploadRes.ok) throw new Error("Failed to upload image");
                                const { url } = await uploadRes.json();

                                handleContentChange(field.key, url);
                                updateSiteContent.mutate({ key: field.key, value: url });
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to upload image",
                                  variant: "destructive",
                                });
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <Input
                          id={field.key}
                          value={pendingContent[field.key] ?? field.value}
                          onChange={(e) => handleContentChange(field.key, e.target.value)}
                        />
                      )}
                      {field.type === "image" && (pendingContent[field.key] ?? field.value) && (
                        <div className="w-40 h-40 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={pendingContent[field.key] ?? field.value}
                            alt={`${field.label} preview`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Carousel Section */}
          <Card>
            <CardHeader>
              <CardTitle>Carousel Items</CardTitle>
              <CardDescription>Manage the homepage carousel content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => {
                  setEditItem(null);
                  setShowForm(true);
                }}>
                  Add New Carousel Item
                </Button>
              </div>

              {showForm && (
                <div className="mb-6">
                  <CarouselForm
                    item={editItem as CarouselItem}
                    onClose={() => setShowForm(false)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {carouselItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-6 flex gap-4">
                      <div className="w-40 h-40">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-stone-600 mb-4">{item.description}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => {
                            setEditItem(item);
                            setShowForm(true);
                          }}>
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              if (!confirm("Are you sure you want to delete this carousel item?")) return;
                              const res = await fetch(`/api/carousel/${item.id}`, {
                                method: "DELETE",
                              });
                              if (res.ok) {
                                queryClient.invalidateQueries({ queryKey: ["/api/carousel"] });
                                toast({
                                  title: "Success",
                                  description: "Carousel item deleted successfully",
                                });
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dogs">
          {/* Dogs Hero Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Dogs Hero Section</CardTitle>
              <CardDescription>Manage the hero content for the dogs page</CardDescription>
            </CardHeader>
            <CardContent>
              {dogsHero[0] && (
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={dogsHero[0].title ?? ""}
                      onChange={(e) => updateDogsHero.mutate({ title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input
                      value={dogsHero[0].subtitle ?? ""}
                      onChange={(e) => updateDogsHero.mutate({ subtitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <FileUpload
                          value={dogsHero[0].imageUrl ?? ""}
                          onChange={(url) => updateDogsHero.mutate({ imageUrl: url })}
                        />
                      </div>
                      {dogsHero[0].imageUrl && (
                        <div className="w-40 h-40 rounded overflow-hidden">
                          <img
                            src={dogsHero[0].imageUrl}
                            alt="Hero background"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dogs Management Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Dogs Management</CardTitle>
              <CardDescription>Add and manage dogs in the kennel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => {
                  setEditItem(null);
                  setShowForm(true);
                }}>
                  Add New Dog
                </Button>
              </div>

              <DogForm
                dog={editItem as Dog}
                open={showForm}
                onOpenChange={(open) => {
                  setShowForm(open);
                  if (!open) setEditItem(null);
                }}
              />

              {/* Females Section */}
              {dogs.filter(dog => dog.gender === 'female' && !dog.outsideBreeder).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-6">Females</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dogs
                      .filter(dog => dog.gender === 'female' && !dog.outsideBreeder)
                      .map((dog) => renderDogCard(dog))}
                  </div>
                </div>
              )}

              {/* Males Section */}
              {dogs.filter(dog => dog.gender === 'male' && !dog.outsideBreeder).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-6">Males</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dogs
                      .filter(dog => dog.gender === 'male' && !dog.outsideBreeder)
                      .map((dog) => renderDogCard(dog))}
                  </div>
                </div>
              )}

              {/* Outside Breeders Section */}
              {dogs.filter(dog => dog.outsideBreeder).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Outside Breeders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dogs
                      .filter(dog => dog.outsideBreeder)
                      .map((dog) => renderDogCard(dog))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Litters Management Section */}
          <Card>
            <CardHeader>
              <CardTitle>Litters Management</CardTitle>
              <CardDescription>Manage upcoming and current litters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => {
                  setEditLitter(null);
                  setShowLitterForm(true);
                }}>
                  Add New Litter
                </Button>
              </div>

              <LitterForm
                open={showLitterForm}
                onOpenChange={setShowLitterForm}
                dogs={dogs}
                editLitter={editLitter}
                onEditLitterChange={setEditLitter}
              />

              {/* Upcoming Litters List */}
              <div className="space-y-6">
                {litters.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming litters</p>
                ) : (
                  <div className="space-y-6">
                    {litters.map((litter) => (
                      <Card key={litter.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold">Expected Litter</h3>
                              <p className="text-muted-foreground">Due Date: {formatDisplayDate(new Date(litter.dueDate))}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={()=> {
                                  setEditLitter(litter);
                                  setShowLitterForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  if (!confirm("Are you sure you want to delete this litter?")) return;
                                  const res = await fetch(`/api/litters/${litter.id}`, {
                                    method: "DELETE",
                                  });
                                  if (res.ok) {
                                    queryClient.invalidateQueries({ queryKey: ["/api/litters"] });
                                    toast({
                                      title: "Success",
                                      description: "Litter deleted successfully",
                                    });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Parents */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                                  {litter.mother?.media?.[0] ? (
                                    <img
                                      src={litter.mother.media[0].url}
                                      alt={litter.mother.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-pink-500">♀</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">Mother</p>
                                  <p>{litter.mother?.name ?? ""}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                                  {litter.father?.media?.[0] ? (
                                    <img
                                      src={litter.father.media[0].url}
                                      alt={litter.father.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-blue-500">♂</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold">Father</p>
                                  <p>{litter.father?.name ?? ""}</p>
                                </div>
                              </div>
                            </div>

                            {/* Visibility Toggle */}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={litter.isVisible}
                                onCheckedChange={async (checked) => {
                                  const res = await fetch(`/api/litters/${litter.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ isVisible: checked }),
                                  });
                                  if (res.ok) {
                                    queryClient.invalidateQueries({ queryKey: ["/api/litters"] });
                                    toast({
                                      title: "Success",
                                      description: "Litter visibility updated",
                                    });
                                  }
                                }}
                              />
                              <Label>Show announcement banner</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keep the Animals and Products tabs as they are */}
        <TabsContent value="animals">
          <div className="mb-6">
            <Button onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}>
              Add New Animal
            </Button>
          </div>

          {showForm && (
            <AnimalForm
              animal={editItem as Animal}
              onClose={() => setShowForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                isAdmin
                onEdit={() => {
                  setEditItem(animal);
                  setShowForm(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="mb-6">
            <Button onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}>
              Add New Product
            </Button>
          </div>

          {showForm && (
            <ProductForm
              product={editItem as Product}
              onClose={() => setShowForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin
                onEdit={() => {
                  setEditItem(product);
                  setShowForm(true);
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}