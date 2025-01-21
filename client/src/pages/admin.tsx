import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AnimalForm from "@/components/forms/animal-form";
import ProductForm from "@/components/forms/product-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Animal, Product, SiteContent, CarouselItem, Dog, DogsHero } from "@db/schema";
import AnimalCard from "@/components/cards/animal-card";
import ProductCard from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import CarouselForm from "@/components/forms/carousel-form";
import DogForm from "@/components/forms/dog-form";
import { formatAge } from "@/lib/date-utils";

interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  value: string;
}

export default function Admin() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Animal | Product | CarouselItem | Dog | null>(null);
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});
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
    // Card 1 - Animals
    { key: "animals_title", label: "Card 1 Title", type: "text", value: siteContent?.find(c => c.key === "animals_title")?.value || "" },
    { key: "animals_text", label: "Card 1 Text", type: "textarea", value: siteContent?.find(c => c.key === "animals_text")?.value || "" },
    { key: "animals_image", label: "Card 1 Image URL", type: "image", value: siteContent?.find(c => c.key === "animals_image")?.value || "" },
    { key: "animals_button_text", label: "Card 1 Button Text", type: "text", value: siteContent?.find(c => c.key === "animals_button_text")?.value || "" },
    { key: "animals_redirect", label: "Card 1 Redirect URL", type: "text", value: siteContent?.find(c => c.key === "animals_redirect")?.value || "" },
    // Card 2 - Goats
    { key: "bakery_title", label: "Card 2 Title", type: "text", value: siteContent?.find(c => c.key === "bakery_title")?.value || "" },
    { key: "bakery_text", label: "Card 2 Text", type: "textarea", value: siteContent?.find(c => c.key === "bakery_text")?.value || "" },
    { key: "bakery_image", label: "Card 2 Image URL", type: "image", value: siteContent?.find(c => c.key === "bakery_image")?.value || "" },
    { key: "bakery_button_text", label: "Card 2 Button Text", type: "text", value: siteContent?.find(c => c.key === "bakery_button_text")?.value || "" },
    { key: "bakery_redirect", label: "Card 2 Redirect URL", type: "text", value: siteContent?.find(c => c.key === "bakery_redirect")?.value || "" },
    // Card 3 - Products
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

    // Update orders for all affected dogs
    const updates = items.map((dog, index) =>
      reorderDogs.mutate({ dogId: dog.id, newOrder: index })
    );

    await Promise.all(updates);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Content Management</h1>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <Card>
            <CardContent className="pt-6 space-y-6">
              {contentFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="flex gap-2">
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.key}
                        value={pendingContent[field.key] ?? field.value}
                        onChange={(e) => handleContentChange(field.key, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        value={pendingContent[field.key] ?? field.value}
                        onChange={(e) => handleContentChange(field.key, e.target.value)}
                      />
                    )}
                    {field.type === "image" && (pendingContent[field.key] ?? field.value) && (
                      <img
                        src={pendingContent[field.key] ?? field.value}
                        alt={`${field.label} preview`}
                        className="w-10 h-10 object-contain"
                      />
                    )}
                  </div>
                </div>
              ))}
              {Object.keys(pendingContent).length > 0 && (
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveAllContent}>
                    Save All Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel">
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
        </TabsContent>

        <TabsContent value="dogs">
          <Card className="mb-8">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Hero Section</h2>
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
                  <div>
                    <Label>Background Image URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={dogsHero[0].imageUrl}
                        onChange={(e) => updateDogsHero.mutate({ imageUrl: e.target.value })}
                      />
                      {dogsHero[0].imageUrl && (
                        <img
                          src={dogsHero[0].imageUrl}
                          alt="Hero background"
                          className="w-10 h-10 object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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

          <div className="flex flex-wrap gap-6">
            {dogs?.map((dog) => (
              <div
                key={dog.id}
                className={`w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]`}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{dog.name}</h3>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`order-${dog.id}`}>Order:</Label>
                        <Input
                          id={`order-${dog.id}`}
                          type="number"
                          min="0"
                          className="w-20"
                          value={dog.order}
                          onChange={async (e) => {
                            const newOrder = parseInt(e.target.value);
                            if (isNaN(newOrder)) return;

                            await reorderDogs.mutateAsync({
                              dogId: dog.id,
                              newOrder: newOrder
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="aspect-square relative">
                      <img
                        src={dog.imageUrl || ''}
                        alt={dog.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-stone-600 mb-2">
                        {dog.breed} • {formatAge(new Date(dog.birthDate))}
                      </p>
                      <p className="text-stone-600 mb-4">{dog.description}</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditItem(dog);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
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
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
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
      </Tabs>
    </div>
  );
}