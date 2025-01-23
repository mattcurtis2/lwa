import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Save, GripVertical, X, Plus, Edit } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form } from "@/components/ui/form";

interface ContentField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'image';
}

interface PuppyFormData {
  name: string | undefined;
  gender: 'male' | 'female' | undefined;
  birthDate: string | undefined;
  color: string | undefined;
  description: string | undefined;
  narrativeDescription: string | undefined;
  healthData: string | undefined;
  height: string | null;
  weight: string | null;
  furLength: string | undefined;
  outsideBreeder: boolean;
  siresSire: string | undefined;
  siresDam: string | undefined;
  damsSire: string | undefined;
  damsDam: string | undefined;
  puppy: true;
  available: boolean;
  price: string | null;
  profileImageUrl: string | undefined;
  pedigreeUrl: string | undefined;
  healthClearancesUrl: string | undefined;
  registrationUrl: string | undefined;
  breed: string | undefined;
  pedigreeInformation: string | undefined;
  temperament: string | undefined;
  workingAbility: string | undefined;
  showHistory: string | undefined;
  breedingHistory: string | undefined;
  awards: string | undefined;
  motherLine: string | undefined;
  fatherLine: string | undefined;
  dietaryNeeds: string | undefined;
  exerciseRequirements: string | undefined;
  trainingStatus: string | undefined;
  specialNeeds: string | undefined;
  registrationName: string | undefined;
  media: any[];
  motherId?: number;
  fatherId?: number;
  litterId?: number;
  order?: number;
}


export default function Admin() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [showPuppyForm, setShowPuppyForm] = useState(false);
  const [litterFormMode, setLitterFormMode] = useState<'create' | 'edit'>('create');
  const [editItem, setEditItem] = useState<Dog | CarouselItem | Animal | Product | null>(null);
  const [editLitter, setEditLitter] = useState<Litter & {
    mother?: Dog;
    father?: Dog;
    puppies?: Dog[];
  } | null>(null);
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingPrinciples, setPendingPrinciples] = useState<Principle[]>([]);
  const [pendingContactInfo, setPendingContactInfo] = useState<Partial<ContactInfo>>({});
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);


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

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const { data: carouselItems = [], isLoading: isLoadingCarousel } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"]
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
      const sortedPrinciples = [...principlesData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setPendingPrinciples(sortedPrinciples);
    }
  }, [principlesData]);

  useEffect(() => {
    if (contactInfo) {
      setPendingContactInfo(contactInfo);
    }
  }, [contactInfo]);

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
        principles.map((principle) => {
          const updatedPrinciple = {
            id: principle.id,
            title: principle.title,
            description: principle.description,
            imageUrl: principle.imageUrl,
            order: principle.order,
            updatedAt: new Date().toISOString()
          };

          return fetch(`/api/principles/${principle.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPrinciple),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `Failed to update principle ${principle.id}`);
            return data;
          });
        })
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      toast({
        title: "Success",
        description: "Principles updated successfully",
      });
      setHasUnsavedChanges(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update principles",
        variant: "destructive",
      });
    }
  });

  const updateContactInfo = useMutation({
    mutationFn: async (info: Partial<ContactInfo>) => {
      const res = await fetch("/api/contact-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: info.email?.trim() || null,
          phone: info.phone?.trim() || null,
          facebook: info.facebook?.trim() || null,
          instagram: info.instagram?.trim() || null
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update contact info");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact-info"] });
      toast({
        title: "Success",
        description: "Contact information updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error('Contact info update error:', error);
      toast({
        title: "Error",
        description: "Could not update contact information. All fields are optional - try again or contact support if the issue persists.",
        variant: "destructive",
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

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setPendingContactInfo(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      const hasContactChanges = JSON.stringify(pendingContactInfo) !== JSON.stringify(contactInfo);
      if (hasContactChanges) {
        await updateContactInfo.mutateAsync(pendingContactInfo);
      }

      const contentUpdates = Object.entries(pendingContent)
        .filter(([key, value]) => {
          const currentContent = siteContent?.find(c => c.key === key);
          return currentContent && currentContent.value !== value;
        })
        .map(([key, value]) => ({ key, value }));

      if (contentUpdates.length > 0) {
        await updateSiteContent.mutateAsync(contentUpdates);
      }

      const hasPrincipleChanges = pendingPrinciples.some((pendingPrinciple, index) => {
        const originalPrinciple = principlesData[index];
        return JSON.stringify(pendingPrinciple) !== JSON.stringify(originalPrinciple);
      });

      if (hasPrincipleChanges) {
        await updatePrinciples.mutateAsync(pendingPrinciples);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save some changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePrincipleReorder = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(pendingPrinciples);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setPendingPrinciples(reorderedItems);
    setHasUnsavedChanges(true);
  };

  const handleAddPrinciple = () => {
    const newPrinciple = {
      id: Date.now(),
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
      onEdit={() => handleEditDog(dog)}
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
    { key: "hero_text", label: "Hero Title", value: pendingContent["hero_text"] ?? siteContent?.find(c => c.key === "hero_text")?.value ?? "", type: "text" },
    { key: "hero_subtext", label: "Hero Subtitle", value: pendingContent["hero_subtext"] ?? siteContent?.find(c => c.key === "hero_subtext")?.value ?? "", type: "textarea" },
    { key: "hero_background", label: "Hero Background", value: pendingContent["hero_background"] ?? siteContent?.find(c => c.key === "hero_background")?.value ?? "", type: "image" },

    { key: "about_title", label: "About Title", value: pendingContent["about_title"] ?? siteContent?.find(c => c.key === "about_title")?.value ?? "", type: "text" },
    { key: "mission_text", label: "About Text", value: pendingContent["mission_text"] ?? siteContent?.find(c => c.key === "mission_text")?.value ?? "", type: "textarea" },

    { key: "animals_title", label: "Dogs Title", value: pendingContent["animals_title"] ?? siteContent?.find(c => c.key === "animals_title")?.value ?? "", type: "text" },
    { key: "animals_text", label: "Dogs Description", value: pendingContent["animals_text"] ?? siteContent?.find(c => c.key === "animals_text")?.value ?? "", type: "textarea" },
    { key: "animals_image", label: "Dogs Image", value: pendingContent["animals_image"] ?? siteContent?.find(c => c.key === "animals_image")?.value ?? "", type: "image" },

    { key: "bakery_title", label: "Goats Title", value: pendingContent["bakery_title"] ?? siteContent?.find(c => c.key === "bakery_title")?.value ?? "", type: "text" },
    { key: "bakery_text", label: "Goats Description", value: pendingContent["bakery_text"] ?? siteContent?.find(c => c.key === "bakery_text")?.value ?? "", type: "textarea" },
    { key: "bakery_image", label: "Goats Image", value: pendingContent["bakery_image"] ?? siteContent?.find(c => c.key === "bakery_image")?.value ?? "", type: "image" },

    { key: "products_title", label: "Products Title", value: pendingContent["products_title"] ?? siteContent?.find(c => c.key === "products_title")?.value ?? "", type: "text" },
    { key: "products_text", label: "Products Description", value: pendingContent["products_text"] ?? siteContent?.find(c => c.key === "products_text")?.value ?? "", type: "textarea" },
    { key: "products_image", label: "Products Image", value: pendingContent["products_image"] ?? siteContent?.find(c => c.key === "products_image")?.value ?? "", type: "image" },
    { key: "market_title", label: "Market Title", value: pendingContent["market_title"] ?? siteContent?.find(c => c.key === "market_title")?.value ?? "", type: "text" },
    { key: "market_text", label: "Market Description", value: pendingContent["market_text"] ?? siteContent?.find(c => c.key === "market_text")?.value ?? "", type: "textarea" },
  ];

  const handleCreateLitter = async () => {
    try {
      const res = await fetch('/api/litters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editLitter),
      });

      if (!res.ok) throw new Error('Failed to create litter');

      const newLitter = await res.json();
      queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
      toast({
        title: 'Success',
        description: 'Litter created successfully',
      });
      setLitterFormMode('edit');
      setEditLitter({ ...newLitter, puppies: [] });
    } catch (error) {
      console.error('Error creating litter:', error);
      toast({
        title: 'Error',
        description: 'Failed to create litter',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateLitter = async () => {
    try {
      if (!editLitter) return;

      const { puppies, mother, father, ...litterData } = editLitter;

      // Ensure dueDate is a valid date before converting to ISO string
      const dueDate = new Date(litterData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date');
      }

      // Format the litter data, ensuring date is valid
      const formattedLitter = {
        ...litterData,
        dueDate: dueDate.toISOString(),
      };

      // Create a separate array for existing and new puppies
      const existingPuppies = puppies?.filter(p => p.id) || [];
      const newPuppies = puppies?.filter(p => !p.id) || [];

      // Process existing puppies
      const processedPuppies = existingPuppies.map(puppy => {
        const birthDate = new Date(puppy.birthDate);
        if (isNaN(birthDate.getTime())) {
          throw new Error('Invalid birth date for puppy');
        }

        return {
          id: puppy.id,
          name: puppy.name,
          gender: puppy.gender,
          birthDate: birthDate.toISOString(),
          description: puppy.description || '',
          color: puppy.color || '',
          height: puppy.height ? parseFloat(puppy.height.toString()) : null,
          weight: puppy.weight ? parseFloat(puppy.weight.toString()) : null,
          price: puppy.price ? parseInt(puppy.price.toString(), 10) : null,
          puppy: true,
          motherId: formattedLitter.motherId,
          fatherId: formattedLitter.fatherId,
          litterId: formattedLitter.id,
          breed: puppy.breed || '',
          profileImageUrl: puppy.profileImageUrl || '',
        };
      });

      // Update the litter with processed data
      const res = await fetch(`/api/litters/${formattedLitter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formattedLitter,
          puppies: processedPuppies,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to update litter');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });

      toast({
        title: "Success",
        description: "Litter updated successfully",
      });

      setShowLitterForm(false);
      setShowPuppyForm(false);
    } catch (error: any) {
      console.error('Error updating litter:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update litter',
        variant: "destructive",
      });
    }
  };

  const renderPuppyCard = (puppy: Dog, index: number) => (
    <div
      key={puppy.id || index}
      className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => {
        // Ensure numerical fields are properly converted to strings for form inputs
        const selectedPuppy: PuppyFormData = {
          name: puppy.name,
          gender: puppy.gender as 'male' | 'female',
          birthDate: puppy.birthDate,
          color: puppy.color || undefined,
          description: puppy.description || undefined,
          narrativeDescription: puppy.narrativeDescription || undefined,
          healthData: puppy.healthData || undefined,
          height: puppy.height?.toString() || null,
          weight: puppy.weight?.toString() || null,
          furLength: puppy.furLength || undefined,
          outsideBreeder: Boolean(puppy.outsideBreeder),
          siresSire: puppy.siresSire || undefined,
          siresDam: puppy.siresDam || undefined,
          damsSire: puppy.damsSire || undefined,
          damsDam: puppy.damsDam || undefined,
          puppy: true,
          available: Boolean(puppy.available),
          price: puppy.price?.toString(),
          profileImageUrl: puppy.profileImageUrl || undefined,
          pedigreeUrl: puppy.pedigreeUrl || undefined,
          healthClearancesUrl: puppy.healthClearancesUrl || undefined,
          registrationUrl: puppy.registrationUrl || undefined,
          breed: puppy.breed || undefined,
          pedigreeInformation: puppy.pedigreeInformation || undefined,
          temperament: puppy.temperament || undefined,
          workingAbility: puppy.workingAbility || undefined,
          showHistory: puppy.showHistory || undefined,
          breedingHistory: puppy.breedingHistory || undefined,
          awards: puppy.awards || undefined,
          motherLine: puppy.motherLine || undefined,
          fatherLine: puppy.fatherLine || undefined,
          dietaryNeeds: puppy.dietaryNeeds || undefined,
          exerciseRequirements: puppy.exerciseRequirements || undefined,
          trainingStatus: puppy.trainingStatus || undefined,
          specialNeeds: puppy.specialNeeds || undefined,
          registrationName: puppy.registrationName || undefined,
          media: puppy.media || []
        };
        setEditItem(selectedPuppy);
        setShowPuppyForm(true);
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
          {puppy.profileImageUrl ? (
            <img
              src={puppy.profileImageUrl}
              alt={puppy.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              puppy.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
            }`}>
              <span className={`text-xl ${
                puppy.gender === 'female' ? 'text-pink-500' : 'text-blue-500'
              }`}>
                {puppy.gender === 'female' ? '♀' : '♂'}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">{puppy.name}</p>
          <p className="text-sm text-muted-foreground">
            {puppy.gender} • {puppy.color || 'No color set'}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation(); // Prevent opening the edit form
          if (!confirm('Are you sure you want to remove this puppy?')) return;
          setEditLitter(prev => ({
            ...prev!,
            puppies: prev!.puppies!.filter((_, i) => i !== index),
          }));
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );

  const handleEditDog = (dog: Dog) => {
    setSelectedDog(dog);
    setShowDogForm(true);
  };

  const handleAddPuppy = (litter: Litter) => {
    const mother = dogs.find(d => d.id === litter.motherId);
    const father = dogs.find(d => d.id === litter.fatherId);
    
    setSelectedDog({
      puppy: true,
      litterId: litter.id,
      motherId: litter.motherId || undefined,
      fatherId: litter.fatherId || undefined,
      mother: mother || undefined,
      father: father || undefined,
      birthDate: new Date().toISOString().split('T')[0],
      gender: 'male', // Default gender
      available: false,
      breed: "Colorado Mountain Dogs",
      outsideBreeder: false
    });
    setShowDogForm(true);
  };

  const handleDogFormClose = () => {
    setShowDogForm(false);
    setSelectedDog(null);
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
  };

  const renderLitterCard = (litter: Litter & { mother?: Dog; father?: Dog; puppies?: Dog[] }) => {
    const mother = dogs.find(d => d.id === litter.motherId);
    const father = dogs.find(d => d.id === litter.fatherId);
    const litterPuppies = dogs.filter(d => d.litterId === litter.id);

    return (
      <Card key={litter.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {mother?.name} x {father?.name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddPuppy(litter)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Puppy
            </Button>
          </div>
          <CardDescription>
            Due Date: {formatDisplayDate(new Date(litter.dueDate))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Parents Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Mother */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
              onClick={() => mother && handleEditDog(mother)}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center relative group-hover:ring-2 ring-primary/20">
                {mother?.profileImageUrl ? (
                  <img
                    src={mother.profileImageUrl}
                    alt={mother.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                    <span className="text-2xl text-pink-500">♀</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{mother?.name}</p>
                <p className="text-sm text-muted-foreground">Mother</p>
              </div>
            </div>

            {/* Father */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
              onClick={() => father && handleEditDog(father)}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center relative group-hover:ring-2 ring-primary/20">
                {father?.profileImageUrl ? (
                  <img
                    src={father.profileImageUrl}
                    alt={father.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl text-blue-500">♂</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{father?.name}</p>
                <p className="text-sm text-muted-foreground">Father</p>
              </div>
            </div>
          </div>

          {/* Puppies Section */}
          {litterPuppies.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Puppies</h4>
              <div className="grid gap-4">
                {litterPuppies.map((puppy) => (
                  <div
                    key={puppy.id}
                    className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleEditDog(puppy)}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                      {puppy.profileImageUrl ? (
                        <img
                          src={puppy.profileImageUrl}
                          alt={puppy.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          puppy.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                        }`}>
                          <span className={`text-xl ${
                            puppy.gender === 'female' ? 'text-pink-500' : 'text-blue-500'
                          }`}>
                            {puppy.gender === 'female' ? '♀' : '♂'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{puppy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {puppy.gender} • {puppy.color || 'No color set'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setLitterFormMode('edit');
                setEditLitter({ ...litter, mother, father, puppies: litterPuppies });
                setShowLitterForm(true);
              }}
            >
              Edit Litter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoadingSiteContent || isLoadingPrinciples || isLoadingCarousel) {
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
      </div>

      <Tabs defaultValue="home">
        <TabsList>
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="dogs">Dogs</TabsTrigger>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="home">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Manage the main hero section content</CardDescription>
            </CardHeader>            <CardContent className="space-y-6">
              {/* Content fields rendering section */}
              {contentFields.slice(0, 3).map((field) =>(
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
                      <div className="flex-1 space-y-2">
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
                        {(pendingContent[field.key] || field.value) && (
                          <div className="w-40 h-40 rounded-lg overflow-hidden border">
                            <img
                              src={pendingContent[field.key] || field.value}
                              alt={field.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
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

          <Card className="mb-8">
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
                                  onChange={(e) =>handlePrincipleChange(principle.id, 'title', e.target.value)}
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
                                <div className="flex gap-4 items-start">
                                  <div className="flex-1">
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
                                  {principle.imageUrl && (
                                    <div className="w-40 h-40 rounded-lg overflow-hidden border">
                                      <img
                                        src={principle.imageUrl}
                                        alt={principle.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
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

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Feature Cards</CardTitle>
              <CardDescription>Manage the three main feature cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 pb-6 border-b">
                <h3 className="text-lg font-semibold">Dogs Card</h3>
                {contentFields.slice(5, 8).map((field) => (
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
                        <div className="flex-1 space-y-2">
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
                          {(pendingContent[field.key] || field.value) && (
                            <div className="w-40 h-40 rounded-lg overflow-hidden border">
                              <img
                                src={pendingContent[field.key] || field.value}
                                alt={field.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
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
              </div>

              <div className="space-y-6 pb-6 border-b">
                <h3 className="text-lg font-semibold">Goats Card</h3>
                {contentFields.slice(8, 11).map((field) => (
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
                        <div className="flex-1 space-y-2">
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
                          {(pendingContent[field.key] || field.value) && (
                            <div className="w-40 h-40 rounded-lg overflow-hidden border">
                              <img
                                src={pendingContent[field.key] || field.value}
                                alt={field.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
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
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Products Card</h3>
                {contentFields.slice(11).map((field) => (
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
                        <div className="flex-1 space-y-2">
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
                                  description: "Failed toupload image",
                                  variant: "destructive",
                                });
                              }
                            }}
                            onChange={(value) => handleContentChange(field.key, value)}
                          />
                          {(pendingContent[field.key] || field.value) && (
                            <div className="w-40 h-40 rounded-lg overflow-hidden border">
                              <img
                                src={pendingContent[field.key] || field.value}
                                alt={field.label}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carousel">
          <Card>
            <CardHeader>
              <CardTitle>Carousel Management</CardTitle>
              <CardDescription>Manage the carousel items that appear on the home page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => {
                  setEditItem(null);
                  setShowForm(true);
                }}>
                  Add Carousel Item
                </Button>

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

          <Sheet open={showForm} onOpenChange={setShowForm}>
            <SheetContent className="max-w-2xl">
              <SheetHeader>
                <SheetTitle>{editItem ? "Edit Carousel Item" : "Add Carousel Item"}</SheetTitle>
              </SheetHeader>
              <CarouselForm
                item={editItem as CarouselItem}
                onClose={() => {
                  setShowForm(false);
                  setEditItem(null);
                }}
              />
            </SheetContent>
          </Sheet>
        </TabsContent>

        <TabsContent value="dogs">
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
              <CardDescription>Manage your dogs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button onClick={() => {
                  setSelectedDog(null);
                  setShowDogForm(true);
                }}>
                  Add New Dog
                </Button>
              </div>

              {/* Females Section */}
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

              {/* Males Section */}
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

              {/* Outside Breeders Section */}
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

          {/* Dog Form Sheet */}
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
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Litters Management</CardTitle>
              <CardDescription>Manage upcoming and current litters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button onClick={() => {
                    setEditLitter(null);
                    setShowLitterForm(true);
                  }}>
                    Add New Litter
                  </Button>
                </div>

                {/* Litter Form Sheet */}
                <Sheet open={showLitterForm} onOpenChange={setShowLitterForm}>
                  <SheetContent side="right" className="w-1/3">
                    <SheetHeader>
                      <SheetTitle>
                        {litterFormMode === 'create' ? 'Create New Litter' : 'Edit Litter'}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      {/* Litter Form Section */}
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label>Mother</Label>
                            <Select
                              value={editLitter?.motherId?.toString() || ""}
                              onValueChange={(value) => {
                                const mother = dogs.find(d => d.id === parseInt(value));
                                setEditLitter(prev => ({
                                  ...prev!,
                                  motherId: parseInt(value),
                                  mother,
                                }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select mother" />
                              </SelectTrigger>
                              <SelectContent>
                                {dogs
                                  .filter(d => d.gender === 'female')
                                  .map(dog => (
                                    <SelectItem key={dog.id} value={dog.id.toString()}>
                                      {dog.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Father</Label>
                            <Select
                              value={editLitter?.fatherId?.toString() || ""}
                              onValueChange={(value) => {
                                const father = dogs.find(d => d.id === parseInt(value));
                                setEditLitter(prev => ({
                                  ...prev!,
                                  fatherId: parseInt(value),
                                  father,
                                }));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select father" />
                              </SelectTrigger>
                              <SelectContent>
                                {dogs
                                  .filter(d => d.gender === 'male')
                                  .map(dog => (
                                    <SelectItem key={dog.id} value={dog.id.toString()}>
                                      {dog.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              value={editLitter?.dueDate ? editLitter.dueDate.split('T')[0] : ""}
                              onChange={(e) => setEditLitter(prev => ({
                                ...prev!,
                                dueDate: e.target.value,
                              }))}
                            />
                          </div>
                        </div>

                        {editLitter?.puppies && editLitter.puppies.length > 0 && (
                          <div className="space-y-4 mt-8">
                            <h3 className="text-lg font-medium">Current Puppies</h3>
                            <div className="grid gap-4">
                              {editLitter.puppies.map((puppy, index) => (
                                <div
                                  key={puppy.id || index}
                                  className="flex items-center justify-between p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => {
                                    setEditItem(puppy);
                                    setShowPuppyForm(true);
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                                      {puppy.profileImageUrl ? (
                                        <img
                                          src={puppy.profileImageUrl}
                                          alt={puppy.name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className={`w-full h-full flex items-center justify-center ${
                                          puppy.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                                        }`}>
                                          <span className={`text-xl ${
                                            puppy.gender === 'female' ? 'text-pink-500' : 'text-blue-500'
                                          }`}>
                                            {puppy.gender === 'female' ? '♀' : '♂'}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">{puppy.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {puppy.gender} • {puppy.color || 'No color set'}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent opening the edit form
                                      if (!confirm('Are you sure you want to remove this puppy?')) return;
                                      setEditLitter(prev => ({
                                        ...prev!,
                                        puppies: prev!.puppies!.filter((_, i) => i !== index),
                                      }));
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between pt-4">
                          <Button variant="outline" onClick={() => {
                            setShowLitterForm(false);
                            setEditItem(null);
                          }}>
                            Cancel
                          </Button>
                          <Button onClick={litterFormMode === 'create' ? handleCreateLitter : handleUpdateLitter}>
                            Save Litter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="grid gap-4">
                  {litters?.map(renderLitterCard)}
                </div>
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
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Manage contact details and social media links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={pendingContactInfo.email ?? ''}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="contact@littlewayacres.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={pendingContactInfo.phone ?? ''}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL</Label>
                <Input
                  id="facebook"
                  type="url"
                  value={pendingContactInfo.facebook ?? ''}
                  onChange={(e) => handleContactChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/littlewayacres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram URL</Label>
                <Input
                  id="instagram"
                  type="url"
                  value={pendingContactInfo.instagram ?? ''}
                  onChange={(e) => handleContactChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/littlewayacres"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={handleSaveChanges}
            disabled={updateSiteContent.isPending || updatePrinciples.isPending || updateContactInfo.isPending}
            className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}

      {/* Puppy Form Sheet */}
      {showPuppyForm && (
        <Sheet open={showPuppyForm} onOpenChange={(open) => {
          setShowPuppyForm(open);
          // Don't close the litter form when closing puppy dialog
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

      {/* Dog Form Sheet */}
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
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}