import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Animal, Product, SiteContent, CarouselItem, Dog, DogsHero, Litter } from "@db/schema";
import AnimalCard from "@/components/cards/animal-card";
import ProductCard from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import CarouselForm from "@/components/forms/carousel-form";
import DogForm from "@/components/forms/dog-form";
import AnimalForm from "@/components/forms/animal-form";
import ProductForm from "@/components/forms/product-form";
import DogCard from "@/components/cards/dog-card";
import LitterForm from "@/components/forms/litter-form";
import { format } from 'date-fns';
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";

interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  value: string;
}

function Admin() {
  const [showForm, setShowForm] = useState(false);
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [editItem, setEditItem] = useState<Animal | Product | CarouselItem | Dog | null>(null);
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});
  const [editLitter, setEditLitter] = useState<Litter | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const { data: animals } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: carouselItems } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"],
  });

  const { data: dogsHero } = useQuery<DogsHero[]>({
    queryKey: ["/api/dogs-hero"],
  });

  const { data: dogs } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
  });

  const { data: litters } = useQuery<(Litter & { mother: Dog & { media?: any[] }, father: Dog & { media?: any[] } })[]>({
    queryKey: ["/api/litters"],
  });

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
      toast({
        title: "Success",
        description: "Site content updated successfully",
      });
    },
  });

  const updateDogsHero = useMutation({
    mutationFn: async (values: Partial<DogsHero>) => {
      const hero = dogsHero?.[0];
      if (!hero) throw new Error("No hero content found");

      const res = await fetch(`/api/dogs-hero/${hero.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update hero content");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs-hero"] });
      toast({
        title: "Success",
        description: "Hero content updated successfully",
      });
    },
  });

  const contentFields: ContentField[] = [
    { key: "logo", label: "Logo URL", type: "image", value: siteContent?.find(c => c.key === "logo")?.value || "" },
    { key: "hero_background", label: "Hero Background URL", type: "image", value: siteContent?.find(c => c.key === "hero_background")?.value || "" },
    { key: "hero_text", label: "Hero Title", type: "text", value: siteContent?.find(c => c.key === "hero_text")?.value || "" },
    { key: "hero_subtext", label: "Hero Subtitle", type: "textarea", value: siteContent?.find(c => c.key === "hero_subtext")?.value || "" },
    { key: "about_title", label: "About Section Title", type: "text", value: siteContent?.find(c => c.key === "about_title")?.value || "" },
    { key: "mission_text", label: "Mission Text", type: "textarea", value: siteContent?.find(c => c.key === "mission_text")?.value || "" },
    { key: "animals_title", label: "Card 1 Title", type: "text", value: siteContent?.find(c => c.key === "animals_title")?.value || "" },
    { key: "animals_text", label: "Card 1 Text", type: "textarea", value: siteContent?.find(c => c.key === "animals_text")?.value || "" },
    { key: "animals_image", label: "Card 1 Image URL", type: "image", value: siteContent?.find(c => c.key === "animals_image")?.value || "" },
    { key: "animals_button_text", label: "Card 1 Button Text", type: "text", value: siteContent?.find(c => c.key === "animals_button_text")?.value || "" },
    { key: "animals_redirect", label: "Card 1 Redirect URL", type: "text", value: siteContent?.find(c => c.key === "animals_redirect")?.value || "" },
    { key: "bakery_title", label: "Card 2 Title", type: "text", value: siteContent?.find(c => c.key === "bakery_title")?.value || "" },
    { key: "bakery_text", label: "Card 2 Text", type: "textarea", value: siteContent?.find(c => c.key === "bakery_text")?.value || "" },
    { key: "bakery_image", label: "Card 2 Image URL", type: "image", value: siteContent?.find(c => c.key === "bakery_image")?.value || "" },
    { key: "bakery_button_text", label: "Card 2 Button Text", type: "text", value: siteContent?.find(c => c.key === "bakery_button_text")?.value || "" },
    { key: "bakery_redirect", label: "Card 2 Redirect URL", type: "text", value: siteContent?.find(c => c.key === "bakery_redirect")?.value || "" },
    { key: "products_title", label: "Card 3 Title", type: "text", value: siteContent?.find(c => c.key === "products_title")?.value || "" },
    { key: "products_text", label: "Card 3 Text", type: "textarea", value: siteContent?.find(c => c.key === "products_text")?.value || "" },
    { key: "products_image", label: "Card 3 Image URL", type: "image", value: siteContent?.find(c => c.key === "products_image")?.value || "" },
    { key: "products_button_text", label: "Card 3 Button Text", type: "text", value: siteContent?.find(c => c.key === "products_button_text")?.value || "" },
    { key: "products_redirect", label: "Card 3 Redirect URL", type: "text", value: siteContent?.find(c => c.key === "products_redirect")?.value || "" },
  ];

  const handleContentChange = (key: string, value: string) => {
    setPendingContent(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAllContent = async () => {
    try {
      for (const [key, value] of Object.entries(pendingContent)) {
        await updateSiteContent.mutateAsync({ key, value });
      }
      setPendingContent({});
      toast({
        title: "Success",
        description: "All content updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update some content",
        variant: "destructive",
      });
    }
  };

  const reorderDogs = useMutation({
    mutationFn: async ({ dogId, newOrder }: { dogId: number; newOrder: number }) => {
      const res = await fetch(`/api/dogs/${dogId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });

      if (!res.ok) throw new Error("Failed to reorder dogs");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
      toast({
        title: "Success",
        description: "Dogs reordered successfully",
      });
    },
  });

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !dogs) return;

    const items = Array.from(dogs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((dog, index) =>
      reorderDogs.mutate({ dogId: dog.id, newOrder: index })
    );

    await Promise.all(updates);
  };

  const ContentField = ({ field }: { field: ContentField }) => {
    const value = pendingContent[field.key] ?? field.value;

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key}>{field.label}</Label>
        <div className="flex gap-4">
          {field.type === "textarea" ? (
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) => handleContentChange(field.key, e.target.value)}
            />
          ) : field.type === "image" ? (
            <div className="flex-1">
              <FileUpload
                value={value}
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
              value={value}
              onChange={(e) => handleContentChange(field.key, e.target.value)}
            />
          )}
          {field.type === "image" && value && (
            <div className="w-40 h-40 rounded overflow-hidden flex-shrink-0">
              <img
                src={value}
                alt={`${field.label} preview`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const AdminHomeContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {contentFields.slice(0, 4).map((field) => (
            <ContentField key={field.key} field={field} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {contentFields.slice(4, 6).map((field) => (
            <ContentField key={field.key} field={field} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Cards</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Card 1 - Animals</h3>
              {contentFields.slice(6, 11).map((field) => (
                <ContentField key={field.key} field={field} />
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Card 2 - Goats</h3>
              {contentFields.slice(11, 16).map((field) => (
                <ContentField key={field.key} field={field} />
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Card 3 - Products</h3>
              {contentFields.slice(16).map((field) => (
                <ContentField key={field.key} field={field} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Carousel Items</CardTitle>
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
            {carouselItems?.map((item) => (
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
    </div>
  );
};

const AdminDogsContent = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Dogs Hero Section</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {dogsHero?.[0] && (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={dogsHero[0].title}
                onChange={(e) => updateDogsHero.mutate({ title: e.target.value })}
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={dogsHero[0].subtitle}
                onChange={(e) => updateDogsHero.mutate({ subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Background Image</Label>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                          const uploadRes = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });

                          if (!uploadRes.ok) throw new Error("Failed to upload image");
                          const { url } = await uploadRes.json();

                          updateDogsHero.mutate({ imageUrl: url });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to upload image",
                            variant: "destructive",
                          });
                        }
                      }
                    }}
                  />
                  <div className="relative">
                    <Label>Or Enter Image URL</Label>
                    <Input
                      value={dogsHero[0].imageUrl}
                      onChange={(e) => updateDogsHero.mutate({ imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
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

    <Card>
      <CardHeader>
        <CardTitle>Dogs Management</CardTitle>
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

        {dogs && dogs.filter(dog => dog.gender === 'female' && !dog.outsideBreeder).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-stone-800">Meet Our Females</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogs
                .filter(dog => dog.gender === 'female' && !dog.outsideBreeder)
                .map((dog) => (
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
                    onOrderChange={async (dogId, newOrder) => {
                      await reorderDogs.mutateAsync({
                        dogId,
                        newOrder
                      });
                    }}
                  />
                ))}
            </div>
          </div>
        )}

        {dogs && dogs.filter(dog => dog.gender === 'male' && !dog.outsideBreeder).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-stone-800">Meet Our Males</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogs
                .filter(dog => dog.gender === 'male' && !dog.outsideBreeder)
                .map((dog) => (
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
                    onOrderChange={async (dogId, newOrder) => {
                      await reorderDogs.mutateAsync({
                        dogId,
                        newOrder
                      });
                    }}
                  />
                ))}
            </div>
          </div>
        )}

        {dogs && dogs.filter(dog => dog.outsideBreeder).length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-stone-800">Breeding Dogs from Outside Farms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dogs
                .filter(dog => dog.outsideBreeder)
                .map((dog) => (
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
                    onOrderChange={async (dogId, newOrder) => {
                      await reorderDogs.mutateAsync({
                        dogId,
                        newOrder
                      });
                    }}
                  />
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Litters Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button onClick={() => setShowLitterForm(true)}>
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

        <div className="space-y-6">
          {litters?.length === 0 ? (
            <p className="text-muted-foreground">No upcoming litters</p>
          ) : (
            <div className="space-y-6">
              {litters?.map((litter) => (
                <Card key={litter.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Expected Litter</h3>
                        <p className="text-muted-foreground">Due Date: {format(new Date(litter.dueDate), 'MMMM d, yyyy')}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
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
                            <p>{litter.mother?.name}</p>
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
                            <p>{litter.father?.name}</p>
                          </div>
                        </div>
                      </div>

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
  </div>
);

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

      <div className="mt-6">
        <TabsContent value="home">
          <AdminHomeContent />
          {Object.keys(pendingContent).length > 0 && (
            <div className="fixed bottom-4 right-4 z-50">
              <Button onClick={handleSaveAllContent}>
                Save All Changes
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="dogs">
          <AdminDogsContent />
        </TabsContent>

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
            {animals?.map((animal) => (
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
            {products?.map((product) => (
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
      </div>
    </Tabs>
  </div>
);
}

export default Admin;