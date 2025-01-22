import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SiteContent, Dog, DogsHero, Litter, CarouselItem, Animal, Product, Principle } from "@db/schema";
import DogForm from "@/components/forms/dog-form";
import DogCard from "@/components/cards/dog-card";
import { Save, GripVertical } from "lucide-react";
import { useLocation } from "wouter";
import AnimalForm from "@/components/forms/animal-form";
import ProductForm from "@/components/forms/product-form";
import AnimalCard from "@/components/cards/animal-card";
import ProductCard from "@/components/cards/product-card";
import CarouselForm from "@/components/forms/carousel-form";
import { formatDisplayDate } from "@/lib/date-utils";
import LitterForm from "@/components/forms/litter-form";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface ContentField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'image';
}

export default function Admin() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [editItem, setEditItem] = useState<Dog | CarouselItem | Animal | Product | null>(null);
  const [editLitter, setEditLitter] = useState<Litter | null>(null);
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingPrinciples, setPendingPrinciples] = useState<Principle[]>([]);

  // Data queries
  const { data: siteContent = [], isLoading: isLoadingSiteContent, error } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"]
  });

  const { data: dogsHero = [] } = useQuery<DogsHero[]>({
    queryKey: ["/api/dogs-hero"],
  });

  const { data: dogs = [] } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
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

  const { data: principlesData = [], isLoading: isLoadingPrinciples } = useQuery<Principle[]>({
    queryKey: ["/api/principles"]
  });

  useEffect(() => {
    if (siteContent?.length > 0) {
      const initialContent: Record<string, string> = {};
      siteContent.forEach((item) => {
        initialContent[item.key] = item.value;
      });
      setPendingContent(initialContent);
    }
  }, [siteContent]);

  useEffect(() => {
    if (principlesData) {
      // Sort principles by order before setting state
      const sortedPrinciples = [...principlesData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setPendingPrinciples(sortedPrinciples);
    }
  }, [principlesData]);

  const updateSiteContent = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      const results = await Promise.all(
        updates.map(({ key, value }) =>
          fetch(`/api/site-content/${key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to update ${key}`);
            return res.json();
          })
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    }
  });

  const updatePrinciples = useMutation({
    mutationFn: async (principles: Principle[]) => {
      const results = await Promise.all(
        principles.map((principle) =>
          fetch(`/api/principles/${principle.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(principle),
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to update principle ${principle.id}`);
            return res.json();
          })
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      toast({
        title: "Success",
        description: "Principles updated successfully",
      });
    }
  });

  const handleContentChange = (key: string, value: string) => {
    setPendingContent(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handlePrincipleChange = (id: number, field: string, value: string) => {
    setPendingPrinciples(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    // Save site content changes
    const contentUpdates = Object.entries(pendingContent)
      .filter(([key, value]) => {
        const currentContent = siteContent?.find(c => c.key === key);
        return currentContent && currentContent.value !== value;
      })
      .map(([key, value]) => ({ key, value }));

    if (contentUpdates.length > 0) {
      await updateSiteContent.mutateAsync(contentUpdates);
    }

    // Save principles changes if there are any differences
    const hasPrincipleChanges = pendingPrinciples.some((pendingPrinciple, index) => {
      const originalPrinciple = principlesData[index];
      return JSON.stringify(pendingPrinciple) !== JSON.stringify(originalPrinciple);
    });

    if (hasPrincipleChanges) {
      await updatePrinciples.mutateAsync(pendingPrinciples);
    }

    setHasUnsavedChanges(false);
  };

  const handlePrincipleReorder = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(pendingPrinciples);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property for all items
    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setPendingPrinciples(reorderedItems);
    setHasUnsavedChanges(true);
  };

  const handleAddPrinciple = () => {
    const newPrinciple = {
      id: Date.now(), // Temporary ID
      title: "New Principle",
      description: "Principle description",
      imageUrl: "",
      order: pendingPrinciples.length,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Principle;

    setPendingPrinciples([...pendingPrinciples, newPrinciple]);
    setHasUnsavedChanges(true);
  };

  const handleDeletePrinciple = (id: number) => {
    if (!confirm("Are you sure you want to delete this principle?")) return;

    setPendingPrinciples(prev => prev.filter(p => p.id !== id));
    setHasUnsavedChanges(true);
  };

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

  const contentFields: ContentField[] = [
    // Hero Section
    { key: "hero_text", label: "Hero Title", value: pendingContent["hero_text"] ?? siteContent?.find(c => c.key === "hero_text")?.value ?? "", type: "text" },
    { key: "hero_subtext", label: "Hero Subtitle", value: pendingContent["hero_subtext"] ?? siteContent?.find(c => c.key === "hero_subtext")?.value ?? "", type: "textarea" },
    { key: "hero_background", label: "Hero Background", value: pendingContent["hero_background"] ?? siteContent?.find(c => c.key === "hero_background")?.value ?? "", type: "image" },

    // About Section
    { key: "about_title", label: "About Title", value: pendingContent["about_title"] ?? siteContent?.find(c => c.key === "about_title")?.value ?? "", type: "text" },
    { key: "mission_text", label: "About Text", value: pendingContent["mission_text"] ?? siteContent?.find(c => c.key === "mission_text")?.value ?? "", type: "textarea" },

    // Feature Cards Section
    { key: "animals_title", label: "Dogs Title", value: pendingContent["animals_title"] ?? siteContent?.find(c => c.key === "animals_title")?.value ?? "", type: "text" },
    { key: "animals_text", label: "Dogs Description", value: pendingContent["animals_text"] ?? siteContent?.find(c => c.key === "animals_text")?.value ?? "", type: "textarea" },

    { key: "bakery_title", label: "Goats Title", value: pendingContent["bakery_title"] ?? siteContent?.find(c => c.key === "bakery_title")?.value ?? "", type: "text" },
    { key: "bakery_text", label: "Goats Description", value: pendingContent["bakery_text"] ?? siteContent?.find(c => c.key === "bakery_text")?.value ?? "", type: "textarea" },

    { key: "products_title", label: "Products Title", value: pendingContent["products_title"] ?? siteContent?.find(c => c.key === "products_title")?.value ?? "", type: "text" },
    { key: "products_text", label: "Products Description", value: pendingContent["products_text"] ?? siteContent?.find(c => c.key === "products_text")?.value ?? "", type: "textarea" },
    { key: "market_title", label: "Market Title", value: pendingContent["market_title"] ?? siteContent?.find(c => c.key === "market_title")?.value ?? "", type: "text" },
    { key: "market_text", label: "Market Description", value: pendingContent["market_text"] ?? siteContent?.find(c => c.key === "market_text")?.value ?? "", type: "textarea" },
  ];

  if (isLoadingSiteContent || isLoadingPrinciples) {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Content Management</h1>
        {hasUnsavedChanges && (
          <Button onClick={handleSaveChanges} disabled={updateSiteContent.isPending || updatePrinciples.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          {/* Hero Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Manage the main hero section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contentFields.slice(0, 3).map((field) => (
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
                              console.error('Error uploading image:', error);
                              toast({
                                title: "Error",
                                description: "Failed to upload image",
                                variant: "destructive",
                              });
                            }
                          }}
                          onChange={(value) => handleContentChange(field.key, value)}
                        />
                      </div>
                    ) : (
                      <Input
                        id={field.key}
                        value={pendingContent[field.key] ?? field.value}
                        onChange={(e) => handleContentChange(field.key, e.target.value)}
                      />
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
              <CardDescription>Manage the about section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {contentFields.slice(3, 5).map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <div className="flex gap-4">
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
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Principles Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Principles</CardTitle>
              <CardDescription>Manage the principles section content and ordering</CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handlePrincipleReorder}>
                <Droppable droppableId="principles">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {pendingPrinciples.map((principle, index) => (
                        <Draggable
                          key={principle.id}
                          draggableId={principle.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 border rounded-lg space-y-4 mb-4"
                            >
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-5 w-5 text-stone-400" />
                                <Input
                                  value={principle.title}
                                  onChange={(e) => handlePrincipleChange(principle.id, 'title', e.target.value)}
                                  className="font-semibold"
                                  placeholder="Principle Title"
                                />
                              </div>
                              <Textarea
                                value={principle.description}
                                onChange={(e) => handlePrincipleChange(principle.id, 'description', e.target.value)}
                                placeholder="Principle Description"
                                className="min-h-[100px]"
                              />
                              <div className="space-y-2">
                                <Label>Image</Label>
                                <FileUpload
                                  value={principle.imageUrl}
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
                                      handlePrincipleChange(principle.id, 'imageUrl', url);
                                    } catch (error) {
                                      console.error('Error uploading image:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to upload image",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  onChange={(value) => handlePrincipleChange(principle.id, 'imageUrl', value)}
                                />
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeletePrinciple(principle.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              <Button
                onClick={handleAddPrinciple}
                className="w-full mt-4"
              >
                Add New Principle
              </Button>
            </CardContent>
          </Card>

          {/* Feature Cards Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Feature Cards</CardTitle>
              <CardDescription>Manage the three main feature cards</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Dogs Card */}
              <div className="space-y-6 pb-6 border-b">
                <h3 className="text-lg font-semibold">Dogs Card</h3>
                {contentFields.slice(5, 7).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex gap-4">
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
                    </div>
                  </div>
                ))}
              </div>

              {/* Goats Card */}
              <div className="space-y-6 pb-6 border-b">
                <h3 className="text-lg font-semibold">Goats Card</h3>
                {contentFields.slice(7, 9).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex gap-4">
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
                    </div>
                  </div>
                ))}
              </div>

              {/* Products Card */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Products Card</h3>
                {contentFields.slice(9).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    <div className="flex gap-4">
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
                    </div>
                  </div>
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