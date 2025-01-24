import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { Sidebar } from "@/components/layout/sidebar";

// ... keep all the interfaces and types ...

export default function Admin() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // ... keep all the other state variables ...

  // Extract section from URL using URLSearchParams
  const getSection = () => {
    if (location.includes('?')) {
      const params = new URLSearchParams(location.split('?')[1]);
      return params.get('section') || 'home';
    }
    return 'home';
  };

  const section = getSection();

  // ... keep all your existing queries ...

  const handleSectionChange = (newSection: string) => {
    setLocation(`/admin?section=${newSection}`);
  };

  // ... keep all your existing handlers and render functions ...

  if (isLoadingSiteContent || isLoadingPrinciples || isLoadingCarousel) {
    return (
      <div className="flex min-h-screen">
        <Sidebar className="w-64" onNavigate={handleSectionChange} />
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
        <Sidebar className="w-64" onNavigate={handleSectionChange} />
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
      <Sidebar className="w-64" onNavigate={handleSectionChange} />
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
          {renderContent()}
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
        <Sheet open={showPuppyForm} onOpenChange={(open) => {
          setShowPuppyForm(open);
          if (!open) setEditLitter(prev => ({ ...prev, puppies: [] }));
        }}>
          <SheetContent side="right" className="w-[95vw] sm:max-w-[600px]">
            <SheetHeader>
              <SheetTitle>
                {editItem?.id ? 'Edit Puppy' : 'Add New Puppy'}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <Form
                isPuppy={true}
                defaultValues={{
                  name: editItem?.name || '',
                  gender: editItem?.gender as 'male' | 'female' || 'male',
                  birthDate: editItem?.birthDate || new Date().toISOString().split('T')[0],
                  breed: editItem?.breed || 'Colorado Mountain Dog',
                  color: editItem?.color || '',
                  description: editItem?.description || '',
                  narrativeDescription: editItem?.narrativeDescription || '',
                  healthData: editItem?.healthData || '',
                  height: editItem?.height?.toString() || '',
                  weight: editItem?.weight?.toString() || '',
                  furLength: editItem?.furLength || '',
                  registrationName: editItem?.registrationName || '',
                  profileImageUrl: editItem?.profileImageUrl || '',
                  media: editItem?.media || [],
                  outsideBreeder: Boolean(editItem?.outsideBreeder),
                  available: Boolean(editItem?.available),
                  price: editItem?.price?.toString() || '',
                }}
                onSubmit={async (values) => {
                  try {
                    const processedValues = {
                      ...values,
                      height: values.height ? Number(values.height) : null,
                      weight: values.weight ? Number(values.weight) : null,
                      price: values.price ? Number(values.price) : null,
                    };

                    const res = await fetch(editItem?.id ? `/api/dogs/${editItem.id}` : '/api/dogs', {
                      method: editItem?.id ? 'PUT' : 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(processedValues),
                    });

                    if (!res.ok) throw new Error('Failed to save puppy');

                    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
                    toast({
                      title: "Success",
                      description: `Puppy ${editItem?.id ? 'updated' : 'created'} successfully`,
                    });
                    setShowPuppyForm(false);
                  } catch (error) {
                    console.error('Error saving puppy:', error);
                    toast({
                      title: "Error",
                      description: error instanceof Error ? error.message : 'Failed to save puppy',
                      variant: "destructive",
                    });
                  }
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
      {showDogForm && (
        <Sheet open={showDogForm} onOpenChange={handleDogFormClose}>
          <SheetContent side="right" className="w-[95vw] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedDog?.id ? 'Edit Dog' : 'Add New Dog'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <DogForm
                dog={selectedDog as Dog}
                mode={selectedDog?.id ? 'edit' : 'create'}
                onSubmit={handleDogFormClose}
                onCancel={handleDogFormClose}
                fromLitter={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}