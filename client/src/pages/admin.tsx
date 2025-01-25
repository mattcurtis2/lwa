import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SiteContent, Dog, DogsHero, Litter, CarouselItem, Animal, Product, Principle, ContactInfo } from "@db/schema";
import DogForm from "@/components/forms/dog-form";
import DogCard from "@/components/cards/dog-card";
import { Save, GripVertical, X, Plus, Edit, LayoutDashboard, Image, Dog as DogIcon, Cat, ShoppingBag, Contact } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CMDContentForm } from "@/components/forms/cmd-content-form";
import DogManagement from "@/components/admin/dog-management";
import LitterManagement from "@/components/admin/litter-management";

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

function AdminDashboard() {
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
  const [activeTab, setActiveTab] = useState("content");

  // Data queries
  const { data: siteContent = [], isLoading: isLoadingSiteContent, error } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"]
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"]
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
  }, [siteContent]); // Only depend on siteContent

  useEffect(() => {
    if (principlesData) {
      const sortedPrinciples = [...principlesData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setPendingPrinciples(sortedPrinciples);
    }
  }, [principlesData]); // Only depend on principlesData

  useEffect(() => {
    if (contactInfo) {
      setPendingContactInfo(contactInfo);
    }
  }, [contactInfo]); // Only depend on contactInfo

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

  const handleContentChange = async (key: string, value: string | File) => {
    if (value instanceof File) {
      // For image uploads, we need to handle the file upload first
      const formData = new FormData();
      formData.append('file', value);

      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Failed to upload image');

        const { url } = await uploadRes.json();
        setPendingContent(prev => ({ ...prev, [key]: url }));
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }
    } else {
      setPendingContent(prev => ({ ...prev, [key]: value }));
      setHasUnsavedChanges(true);
    }
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
    { key: "animals_button_text", label: "Dogs Button Text", value: pendingContent["animals_button_text"] ?? siteContent?.find(c => c.key === "animals_button_text")?.value ?? "", type: "text" },
    { key: "animals_redirect", label: "Dogs Button Link", value: pendingContent["animals_redirect"] ?? siteContent?.find(c => c.key === "animals_redirect")?.value ?? "", type: "text" },

    { key: "bakery_title", label: "Goats Title", value: pendingContent["bakery_title"] ?? siteContent?.find(c => c.key === "bakery_title")?.value ?? "", type: "text" },
    { key: "bakery_text", label: "Goats Description", value: pendingContent["bakery_text"] ?? siteContent?.find(c => c.key === "bakery_text")?.value ?? "", type: "textarea" },
    { key: "bakery_image", label: "Goats Image", value: pendingContent["bakery_image"] ?? siteContent?.find(c => c.key === "bakery_image")?.value ?? "", type: "image" },
    { key: "bakery_button_text", label: "Goats Button Text", value: pendingContent["bakery_button_text"] ?? siteContent?.find(c => c.key === "bakery_button_text")?.value ?? "", type: "text" },
    { key: "bakery_redirect", label: "Goats Button Link", value: pendingContent["bakery_redirect"] ?? siteContent?.find(c => c.key === "bakery_redirect")?.value ?? "", type: "text" },

    { key: "products_title", label: "Products Title", value: pendingContent["products_title"] ?? siteContent?.find(c => c.key === "products_title")?.value ?? "", type: "text" },
    { key: "products_text", label: "Products Description", value: pendingContent["products_text"] ?? siteContent?.find(c => c.key === "products_text")?.value ?? "", type: "textarea" },
    { key: "products_image", label: "Products Image", value: pendingContent["products_image"] ?? siteContent?.find(c => c.key === "products_image")?.value ?? "", type: "image" },
    { key: "products_button_text", label: "Products Button Text", value: pendingContent["products_button_text"] ?? siteContent?.find(c => c.key === "products_button_text")?.value ?? "", type: "text" },
    { key: "products_redirect", label: "Products Button Link", value: pendingContent["products_redirect"] ?? siteContent?.find(c => c.key === "products_redirect")?.value ?? "", type: "text" },
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
      motherId: litter.motherId,
      fatherId: litter.fatherId,
      mother,
      father,
      birthDate: new Date(litter.dueDate).toISOString().split('T')[0],
      gender: 'male',
      available: false,
      breed: "Colorado Mountain Dogs",
      outsideBreeder: false
    });
    setShowDogForm(true);
  };

  const handleDogFormClose = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
    queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
    setShowDogForm(false);
    setSelectedDog(null);
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
              Edit Litter            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoadingSiteContent || isLoadingPrinciples || isLoadingCarousel) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 border-r bg-card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-24 bg-muted rounded" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-[200px] bg-muted rounded" />
          </div>
        </div>
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

  const sidebarItems = [
    { id: "content", label: "Content", icon: LayoutDashboard },
    { id: "dogs", label: "Dogs", icon: DogIcon },
    { id: "animals", label: "Animals", icon: Cat },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "contact", label: "Contact", icon: Contact },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div className="w-48 border-r bg-card">
        <div className="p-4">
          <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors mb-6 block">
            {siteContent?.find(content => content.key === "hero_text")?.value || "Dashboard"}
          </Link>
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="ml-3">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pl-5">
        <div className="container py-6">
          <div className="flex justify-end mb-6">
            {hasUnsavedChanges && (
              <Button onClick={handleSaveChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>

          {/* Content sections */}
          {activeTab === "content" && (
            <div className="space-y-6">
              <Tabs defaultValue="home" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="site">Site</TabsTrigger>
                  <TabsTrigger value="home">Home</TabsTrigger>
                  <TabsTrigger value="dogs">CMD</TabsTrigger>
                  <TabsTrigger value="goats">NDG</TabsTrigger>
                  <TabsTrigger value="market">Market</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                <TabsContent value="site" className="space-y-6 pb-20">
                  {hasUnsavedChanges && (
                    <Button
                      onClick={handleSaveChanges}
                      className="fixed bottom-6 right-6 shadow-lg z-50 px-6"
                    >
                      SAVE
                    </Button>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle>Branding</CardTitle>
                      <CardDescription>Manage your site's logo and favicon</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6">
                        <div>
                          <Label>Site Logo</Label>
                          <div className="flex flex-col gap-4">
                            <FileUpload
                              value={siteSettings?.logoUrl || ""}
                              onFileSelect={async (file) => {
                                const formData = new FormData();
                                formData.append('logo', file);
                                const res = await fetch('/api/site-settings', {
                                  method: 'PUT',
                                  body: formData
                                });
                                if (res.ok) {
                                  queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
                                  toast({
                                    title: "Success",
                                    description: "Logo updated successfully"
                                  });
                                }
                              }}
                            />
                            {siteSettings?.logoUrl && (
                              <div className="space-y-4">
                                <div className="p-4 border rounded-lg bg-muted/50">
                                  <img
                                    src={siteSettings.logoUrl}
                                    alt="Site Logo"
                                    className="h-12 object-contain"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label>Favicon</Label>
                          <div className="flex flex-col gap-4">
                            <FileUpload
                              value={siteSettings?.faviconUrl || ""}
                              onFileSelect={async (file) => {
                                const formData = new FormData();
                                formData.append('favicon', file);
                                const res = await fetch('/api/site-settings', {
                                  method: 'PUT',
                                  body: formData
                                });
                                if (res.ok) {
                                  queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
                                  toast({
                                    title: "Success",
                                    description: "Favicon updated successfully"
                                  });
                                }
                              }}
                            />
                            {pendingContent["favicon_url"] && (
                              <div className="p-4 border rounded-lg bg-muted/50 flex items-center gap-4">
                                <img
                                  src={pendingContent["favicon_url"]}
                                  alt="Favicon"
                                  className="h-8 w-8 object-contain"
                                />
                                <span className="text-sm text-muted-foreground">Preview of favicon at 32x32px</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="seo" className="space-y-6 pb-20">
                  {hasUnsavedChanges && (
                    <Button
                      onClick={handleSaveChanges}
                      className="fixed bottom-6 right-6 shadow-lg z-50 px-6"
                    >
                      SAVE
                    </Button>
                  )}
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO Settings</CardTitle>
                      <CardDescription>Manage search engine optimization and social sharing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6">
                        <div>
                          <Label>Site Title</Label>
                          <Input
                            value={pendingContent["site_title"] || ""}
                            onChange={(e) => handleContentChange("site_title", e.target.value)}
                            placeholder="Little Way Acres"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            The name of your site, displayed in browser tabs and search results
                          </p>
                        </div>

                        <div>
                          <Label>Site Description</Label>
                          <Textarea
                            value={pendingContent["site_description"] || ""}
                            onChange={(e) => handleContentChange("site_description", e.target.value)}
                            placeholder="Experience sustainable farming and meet our beloved animals at Little Way Acres"
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            A brief description of your site, shown in search results and social shares
                          </p>
                        </div>

                        <div>
                          <Label>Social Image</Label>
                          <div className="flex flex-col gap-4">
                            <FileUpload
                              value={pendingContent["og_image"] || ""}
                              onFileSelect={(file) => handleContentChange("og_image", file)}
                              onChange={(url) => {
                                if (typeof url === 'string') {
                                  handleContentChange("og_image", url);
                                }
                              }}
                            />
                            {pendingContent["og_image"] && (
                              <div className="p-4 border rounded-lg bg-muted/50">
                                <img
                                  src={pendingContent["og_image"]}
                                  alt="Social Preview"
                                  className="rounded-lg max-h-48 object-cover w-full"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                  This image will be shown when your site is shared on social media
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="home" className="space-y-6">
                  <Tabs defaultValue="hero">
                    <TabsList>
                      <TabsTrigger value="hero">Hero</TabsTrigger>
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="principles">Principles</TabsTrigger>
                      <TabsTrigger value="carousel">Carousel</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero" className="space-y-4 pt-4">
                      <div className="mt-8">
                        {contentFields
                          .filter(field =>
                            ['hero_text', 'hero_subtext', 'hero_background'].includes(field.key)
                          )
                          .map((field) => {
                            return (
                              <div key={field.key}>
                                <Label htmlFor={field.key}>{field.label}</Label>
                                {field.type === 'textarea' ? (
                                  <Textarea
                                    id={field.key}
                                    value={field.value}
                                    onChange={(e) => handleContentChange(field.key, e.target.value)}
                                    className="mt-1.5"
                                  />
                                ) : field.type === 'image' ? (
                                  <div className="mt-1.5 space-y-2">
                                    <FileUpload
                                      value={pendingContent[field.key] || field.value}
                                      onFileSelect={(file) => handleContentChange(field.key, file)}
                                      onChange={(url) => {
                                        if (typeof url === 'string') {
                                          handleContentChange(field.key, url);
                                        }
                                      }}
                                    />
                                    {(pendingContent[field.key] || field.value) && (
                                      <img
                                        src={pendingContent[field.key] || field.value}
                                        alt="Preview"
                                        className="mt-2 rounded-lg max-h-48 object-cover"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <Input
                                    id={field.key}
                                    value={field.value}
                                    onChange={(e) => handleContentChange(field.key, e.target.value)}
                                    className="mt-1.5"
                                  />
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </TabsContent>

                    <TabsContent value="about" className="space-y-4 pt-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>About Section</CardTitle>
                          <CardDescription>Manage the About section content</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* What We Offer Section */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">What We Offer</h3>
                            <div>
                              <Label htmlFor="about_title">Title</Label>
                              <Input
                                id="about_title"
                                value={pendingContent["about_title"] || ""}
                                onChange={(e) => handleContentChange("about_title", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="mission_text">Description</Label>
                              <Textarea
                                id="mission_text"
                                value={pendingContent["mission_text"] || ""}
                                onChange={(e) => handleContentChange("mission_text", e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Feature Cards Section */}
                          <div className="space-y-4 mt-6">
                            <h3 className="text-lg font-medium">Feature Cards</h3>

                            {/* Dogs Card */}
                            <div className="border p-4 rounded-lg space-y-4">
                              <h4 className="font-medium">Colorado Mountain Dogs</h4>
                              <div>
                                <Label htmlFor="animals_title">Title</Label>
                                <Input
                                  id="animals_title"
                                  value={pendingContent["animals_title"] || ""}
                                  onChange={(e) => handleContentChange("animals_title", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="animals_text">Description</Label>
                                <Textarea
                                  id="animals_text"
                                  value={pendingContent["animals_text"] || ""}
                                  onChange={(e) => handleContentChange("animals_text", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="animals_image">Image</Label>
                                <FileUpload
                                  value={pendingContent["animals_image"] || ""}
                                  onFileSelect={(file) => handleContentChange("animals_image", file)}
                                  onChange={(url) => {
                                    if (typeof url === 'string') {
                                      handleContentChange("animals_image", url);
                                    }
                                  }}
                                />
                                {pendingContent["animals_image"] && (
                                  <img
                                    src={pendingContent["animals_image"]}
                                    alt="Colorado Mountain Dogs"
                                    className="mt-2 rounded-lg max-h-48 object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <Label htmlFor="animals_button_text">Button Text</Label>
                                <Input
                                  id="animals_button_text"
                                  value={pendingContent["animals_button_text"] || ""}
                                  onChange={(e) => handleContentChange("animals_button_text", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="animals_redirect">Button Link</Label>
                                <Input
                                  id="animals_redirect"
                                  value={pendingContent["animals_redirect"] || ""}
                                  onChange={(e) => handleContentChange("animals_redirect", e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Goats Card */}
                            <div className="border p-4 rounded-lg space-y-4">
                              <h4 className="font-medium">Nigerian Dwarf Goats</h4>
                              <div>
                                <Label htmlFor="bakery_title">Title</Label>
                                <Input
                                  id="bakery_title"
                                  value={pendingContent["bakery_title"] || ""}
                                  onChange={(e) => handleContentChange("bakery_title", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="bakery_text">Description</Label>
                                <Textarea
                                  id="bakery_text"
                                  value={pendingContent["bakery_text"] || ""}
                                  onChange={(e) => handleContentChange("bakery_text", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="bakery_image">Image</Label>
                                <FileUpload
                                  value={pendingContent["bakery_image"] || ""}
                                  onFileSelect={(file) => handleContentChange("bakery_image", file)}
                                  onChange={(url) => {
                                    if (typeof url === 'string') {
                                      handleContentChange("bakery_image", url);
                                    }
                                  }}
                                />
                                {pendingContent["bakery_image"] && (
                                  <img
                                    src={pendingContent["bakery_image"]}
                                    alt="Nigerian Dwarf Goats"
                                    className="mt-2 rounded-lg max-h-48 object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <Label htmlFor="bakery_button_text">Button Text</Label>
                                <Input
                                  id="bakery_button_text"
                                  value={pendingContent["bakery_button_text"] || ""}
                                  onChange={(e) => handleContentChange("bakery_button_text", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="bakery_redirect">Button Link</Label>
                                <Input
                                  id="bakery_redirect"
                                  value={pendingContent["bakery_redirect"] || ""}
                                  onChange={(e) => handleContentChange("bakery_redirect", e.target.value)}
                                />
                              </div>
                            </div>

                            {/* Products Card */}
                            <div className="border p-4 rounded-lg space-y-4">
                              <h4 className="font-medium">Products</h4>
                              <div>
                                <Label htmlFor="products_title">Title</Label>
                                <Input
                                  id="products_title"
                                  value={pendingContent["products_title"] || ""}
                                  onChange={(e) => handleContentChange("products_title", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="products_text">Description</Label>
                                <Textarea
                                  id="products_text"
                                  value={pendingContent["products_text"] || ""}
                                  onChange={(e) => handleContentChange("products_text", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="products_image">Image</Label>
                                <FileUpload
                                  value={pendingContent["products_image"] || ""}
                                  onFileSelect={(file) => handleContentChange("products_image", file)}
                                  onChange={(url) => {
                                    if (typeof url === 'string') {
                                      handleContentChange("products_image", url);
                                    }
                                  }}
                                />
                                {pendingContent["products_image"] && (
                                  <img
                                    src={pendingContent["products_image"]}
                                    alt="Products"
                                    className="mt-2 rounded-lg max-h-48 object-cover"
                                  />
                                )}
                              </div>
                              <div>
                                <Label htmlFor="products_button_text">Button Text</Label>
                                <Input
                                  id="products_button_text"
                                  value={pendingContent["products_button_text"] || ""}
                                  onChange={(e) => handleContentChange("products_button_text", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="products_redirect">Button Link</Label>
                                <Input
                                  id="products_redirect"
                                  value={pendingContent["products_redirect"] || ""}
                                  onChange={(e) => handleContentChange("products_redirect", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="principles" className="space-y-4 pt-4">
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Principles Section Settings</CardTitle>
                          <CardDescription>Edit the main title and description for the principles section</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="principles_title">Section Title</Label>
                            <Input
                              id="principles_title"
                              value={pendingContent["principles_title"] || ""}
                              onChange={(e) => handleContentChange("principles_title", e.target.value)}
                              placeholder="Our Principles"
                            />
                          </div>
                          <div>
                            <Label htmlFor="principles_description">Section Description</Label>
                            <Textarea
                              id="principles_description"
                              value={pendingContent["principles_description"] || ""}
                              onChange={(e) => handleContentChange("principles_description", e.target.value)}
                              placeholder="These foundational principles guide our daily operations and long-term vision at Little Way Acres."
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <div className="flex justify-end mb-4">
                        <Button onClick={handleAddPrinciple}>
                          Add Principle
                        </Button>
                      </div>
                      {pendingPrinciples?.map((principle) => (
                        <div key={principle.id} className="space-y-4">
                          <Label>Title</Label>
                          <Input
                            value={principle.title}
                            onChange={(e) => handlePrincipleChange(principle.id, 'title', e.target.value)}
                          />
                          <Label>Description</Label>
                          <Textarea
                            value={principle.description}
                            onChange={(e) => handlePrincipleChange(principle.id, 'description', e.target.value)}
                          />
                          <Label>Image</Label>
                          <div className="space-y-2">
                            <FileUpload
                              value={principle.imageUrl}
                              onFileSelect={(file) => {
                                const formData = new FormData();
                                formData.append('file', file);
                                fetch('/api/upload', {
                                  method: 'POST',
                                  body: formData,
                                })
                                  .then(res => res.json())
                                  .then(data => {
                                    handlePrincipleChange(principle.id, 'imageUrl', data.url);
                                  })
                                  .catch(error => {
                                    console.error('Error uploading image:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to upload image",
                                      variant: "destructive",
                                    });
                                  });
                              }}
                              onChange={(url) => {
                                if (typeof url === 'string') {
                                  handlePrincipleChange(principle.id, 'imageUrl', url);
                                }
                              }}
                            />
                            {principle.imageUrl && (
                              <img
                                src={principle.imageUrl}
                                alt={principle.title}
                                className="mt-2 rounded-lg max-h-48 object-cover"
                              />
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="destructive"
                              onClick={() => handleDeletePrinciple(principle.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="carousel" className="space-y-4 pt-4">
                      <div className="mb-6">
                        <Button onClick={() => {
                          setEditItem(null);
                          setShowForm(true);
                        }}>
                          Add Carousel Item
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        {carouselItems?.map((item) => (
                          <Card key={item.id} className="cursor-pointer" onClick={() => {
                            setEditItem(item);
                            setShowForm(true);
                          }}>
                            <CardHeader>
                              <CardTitle>{item.title}</CardTitle>
                              <CardDescription>{item.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex justify-end mt-4">
                                <Button
                                  onClick={() => {
                                    setEditItem(item);
                                    setShowForm(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                <TabsContent value="dogs" className="space-y-6">
                  <CMDContentForm />
                </TabsContent>
                <TabsContent value="goats" className="space-y-6">
                  <div>Goats Content</div>
                </TabsContent>
                <TabsContent value="market" className="space-y-6">
                  <div>Market Content</div>
                </TabsContent>
                <TabsContent value="contact" className="space-y-6">
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
            </div>
          )}

          {activeTab === "dogs" && (
            <div className="space-y-6">
              <Tabs defaultValue="dogManagement">
                <TabsList>
                  <TabsTrigger value="dogManagement">Dog Management</TabsTrigger>
                  <TabsTrigger value="litterManagement">Litter Management</TabsTrigger>
                </TabsList>
                <TabsContent value="dogManagement">
                  <DogManagement />
                </TabsContent>
                <TabsContent value="litterManagement">
                  <LitterManagement />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === "animals" && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-6">
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
            </div>
          )}
        </div>
      </div>

      {/* Forms */}
      {showForm && (
        <Sheet open={showForm} onOpenChange={setShowForm}>
          <SheetContent className="sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>{editItem ? 'Edit' : 'Add New'}</SheetTitle>
            </SheetHeader>
            {activeTab === "carousel" && (
              <CarouselForm
                item={editItem as CarouselItem}
                onClose={() => {
                  setShowForm(false);
                  setEditItem(null);
                }}
              />
            )}
            {activeTab === "animals" && (
              <AnimalForm
                animal={editItem as Animal}
                onClose={() => setShowForm(false)}
              />
            )}
            {activeTab === "products" && (
              <ProductForm
                product={editItem as Product}
                onClose={() => setShowForm(false)}
              />
            )}
          </SheetContent>
        </Sheet>
      )}
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
                      weight: values.weight ? Number(values.weight) :null,
                      price: values.price ? Number(values.price) : null,                    };

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
    </div>
  );
}

export default AdminDashboard;