import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SiteContent, Dog, DogsHero, Litter, CarouselItem, Animal, Product, Principle, ContactInfo } from "@db/schema";
import DogForm from "@/components/forms/dog-form";
import DogCard from "@/components/cards/dog-card";
import { Save, GripVertical, X, Plus } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { Sidebar } from "@/components/layout/sidebar";

// ... keep all interfaces and types ...

export default function Admin() {
  const [location] = useLocation();
  const section = location.split('?')[1]?.split('=')[1] || 'home';

  const { data: siteContent, isLoading: isLoadingSiteContent, error: errorSiteContent } = useQuery({ 
    queryKey: ["siteContent"], 
    queryFn: () => fetch("/api/site-content").then((res) => res.json()) 
  });
  const { data: principles, isLoading: isLoadingPrinciples, error: errorPrinciples } = useQuery({ 
    queryKey: ["principles"], 
    queryFn: () => fetch("/api/principles").then((res) => res.json()) 
  });
  const { data: carouselItems, isLoading: isLoadingCarousel, error: errorCarousel } = useQuery({ 
    queryKey: ["carousel"], 
    queryFn: () => fetch("/api/carousel").then((res) => res.json()) 
  });


  // ... keep all the existing state and handlers ...

  const renderSection = () => {
    switch (section) {
      case 'home':
        return renderHomeContent();
      case 'carousel':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Carousel Management</CardTitle>
                    <CardDescription>Manage carousel items and their order</CardDescription>
                  </div>
                  <Button onClick={() => { setShowForm(true); setEditItem(null); }}>
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {carouselItems?.map((item) => (
                      <Card key={item.id}>
                        <div className="aspect-video relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                          />
                        </div>
                        <CardContent className="pt-4">
                          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditItem(item);
                                setShowForm(true);
                              }}
                            >
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'dogs':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Dogs Management</CardTitle>
                    <CardDescription>Manage dogs, litters, and puppies</CardDescription>
                  </div>
                  <div className="space-x-2">
                    <Button onClick={() => { setShowDogForm(true); setSelectedDog(null); }}>
                      Add Dog
                    </Button>
                    <Button onClick={() => { setShowLitterForm(true); setEditLitter(null); }}>
                      Add Litter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dogs.filter(dog => dog.gender === 'female' && !dog.outsideBreeder).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-6">Females</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {dogs
                        .filter(dog => dog.gender === 'female' && !dog.outsideBreeder)
                        .map(renderDogCard)}
                    </div>
                  </div>
                )}

                {dogs.filter(dog => dog.gender === 'male' && !dog.outsideBreeder).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-6">Males</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {dogs
                        .filter(dog => dog.gender === 'male' && !dog.outsideBreeder)
                        .map(renderDogCard)}
                    </div>
                  </div>
                )}

                {dogs.filter(dog => dog.outsideBreeder).length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Outside Breeders</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {dogs
                        .filter(dog => dog.outsideBreeder)
                        .map(renderDogCard)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Litters section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Litters</CardTitle>
                    <CardDescription>Manage breeding pairs and litters</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {litters.map(renderLitterCard)}
              </CardContent>
            </Card>
          </div>
        );
      case 'animals':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Animals</CardTitle>
                    <CardDescription>Manage your animals</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditItem(null);
                    setShowForm(true);
                  }}>
                    Add Animal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        );
      case 'products':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your products</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditItem(null);
                    setShowForm(true);
                  }}>
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Manage your contact details and social media links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={pendingContactInfo.email || ''}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={pendingContactInfo.phone || ''}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={pendingContactInfo.facebook || ''}
                      onChange={(e) => handleContactChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={pendingContactInfo.instagram || ''}
                      onChange={(e) => handleContactChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/your-handle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const error = errorSiteContent || errorPrinciples || errorCarousel;

  if (isLoadingSiteContent || isLoadingPrinciples || isLoadingCarousel) {
    return (
      <div className="flex min-h-screen">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar className="w-64 border-r" />
        <div className="flex-1 p-8">
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle className="text-red-500">Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Error loading content. Please try refreshing the page.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar className="w-64 border-r" />
      <div className="flex-1">
        <div className="h-16 border-b px-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {section.charAt(0).toUpperCase() + section.slice(1)} Management
          </h1>
          {hasUnsavedChanges && (
            <Button onClick={handleSaveChanges}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
        <div className="p-8">
          {renderSection()}
        </div>
      </div>

      {showDogForm && (
        <Sheet open={showDogForm} onOpenChange={setShowDogForm}>
          <SheetContent className="w-[800px] sm:max-w-[800px]">
            <SheetHeader>
              <SheetTitle>{selectedDog?.id ? 'Edit Dog' : 'Add New Dog'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <DogForm initialDog={selectedDog} onClose={handleDogFormClose} />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {showPuppyForm && (
        <Sheet open={showPuppyForm} onOpenChange={setShowPuppyForm}>
          <SheetContent className="w-[800px] sm:max-w-[800px]">
            <SheetHeader>
              <SheetTitle>{selectedDog?.id ? 'Edit Puppy' : 'Add New Puppy'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <DogForm initialDog={selectedDog} onClose={() => {
                setShowPuppyForm(false);
                setSelectedDog(null);
              }} />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {showForm && (
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="w-[800px] sm:max-w-[800px]">
            <SheetHeader>
              <SheetTitle>
                {section === 'carousel' && 'Edit Carousel Item'}
                {section === 'animals' && 'Edit Animal'}
                {section === 'products' && 'Edit Product'}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {section === 'carousel' && (
                <CarouselForm item={editItem as CarouselItem} onClose={() => setShowForm(false)} />
              )}
              {section === 'animals' && (
                <AnimalForm animal={editItem as Animal} onClose={() => setShowForm(false)} />
              )}
              {section === 'products' && (
                <ProductForm product={editItem as Product} onClose={() => setShowForm(false)} />
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}