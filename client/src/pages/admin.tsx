import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  SiteContent,
  Dog,
  DogsHero,
  Litter,
  CarouselItem,
  Animal,
  Product,
  Principle,
  ContactInfo,
} from "@db/schema";
import DogForm from "@/components/forms/dog-form";
import DogCard from "@/components/cards/dog-card";
import {
  Save,
  GripVertical,
  X,
  Plus,
  Edit,
  LayoutDashboard,
  Image,
  Dog as DogIcon,
  Cat,
  ShoppingBag,
  Contact,
} from "lucide-react";
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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CMDContentForm } from "@/components/forms/cmd-content-form";
import DogManagement from "@/components/admin/dog-management";
import LitterManagement from "@/components/admin/litter-management";
import GoatManagement from "@/components/admin/goat-management";
import GoatLitterManagement from "@/components/admin/goat-litter-management";

interface ContentField {
  key: string;
  label: string;
  value: string;
  type: "text" | "textarea" | "image";
}

interface PuppyFormData {
  name: string | undefined;
  gender: "male" | "female" | undefined;
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("content");
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [showPuppyForm, setShowPuppyForm] = useState(false);
  const [litterFormMode, setLitterFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [editItem, setEditItem] = useState<
    Dog | CarouselItem | Animal | Product | null
  >(null);
  const [editLitter, setEditLitter] = useState<
    | (Litter & {
        mother?: Dog;
        father?: Dog;
        puppies?: Dog[];
      })
    | null
  >(null);
  const [pendingContent, setPendingContent] = useState<Record<string, string>>(
    {},
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingPrinciples, setPendingPrinciples] = useState<Principle[]>([]);
  const [pendingContactInfo, setPendingContactInfo] = useState<
    Partial<ContactInfo>
  >({});
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);

  // Data queries
  const {
    data: siteContent = [],
    isLoading: isLoadingSiteContent,
    error,
  } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
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

  const { data: principlesData = [], isLoading: isLoadingPrinciples } =
    useQuery<Principle[]>({
      queryKey: ["/api/principles"],
    });

  const { data: contactInfoData } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const { data: carouselItems = [], isLoading: isLoadingCarousel } = useQuery<
    CarouselItem[]
  >({
    queryKey: ["/api/carousel"],
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
      const sortedPrinciples = [...principlesData].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );
      setPendingPrinciples(sortedPrinciples);
    }
  }, [principlesData]);

  useEffect(() => {
    if (contactInfoData) {
      setPendingContactInfo(contactInfoData);
    }
  }, [contactInfoData]);

  const updateSiteContent = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      const results = await Promise.all(
        updates.map(({ key, value }) =>
          fetch(`/api/site-content/${key}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
          }).then((res) => {
            if (!res.ok) throw new Error(`Failed to update ${key}`);
            return res.json();
          }),
        ),
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
    },
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
            updatedAt: new Date().toISOString(),
          };

          return fetch(`/api/principles/${principle.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedPrinciple),
          }).then(async (res) => {
            const data = await res.json();
            if (!res.ok)
              throw new Error(
                data.message || `Failed to update principle ${principle.id}`,
              );
            return data;
          });
        }),
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
    },
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
          instagram: info.instagram?.trim() || null,
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
      console.error("Contact info update error:", error);
      toast({
        title: "Error",
        description:
          "Could not update contact information. All fields are optional - try again or contact support if the issue persists.",
        variant: "destructive",
      });
    },
  });

  const handleContentChange = async (key: string, value: string | File) => {
    if (value instanceof File) {
      // For image uploads, we need to handle the file upload first
      const formData = new FormData();
      formData.append("file", value);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Failed to upload image");

        const { url } = await uploadRes.json();
        setPendingContent((prev) => ({ ...prev, [key]: url }));
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }
    } else {
      setPendingContent((prev) => ({ ...prev, [key]: value }));
      setHasUnsavedChanges(true);
    }
  };

  const handlePrincipleChange = (id: number, field: string, value: string) => {
    setPendingPrinciples((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
    setHasUnsavedChanges(true);
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setPendingContactInfo((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      const hasContactChanges =
        JSON.stringify(pendingContactInfo) !== JSON.stringify(contactInfoData);
      if (hasContactChanges) {
        await updateContactInfo.mutateAsync(pendingContactInfo);
      }

      const contentUpdates = Object.entries(pendingContent)
        .filter(([key, value]) => {
          const currentContent = siteContent?.find((c) => c.key === key);
          return currentContent && currentContent.value !== value;
        })
        .map(([key, value]) => ({ key, value }));

      if (contentUpdates.length > 0) {
        await updateSiteContent.mutateAsync(contentUpdates);
      }

      const hasPrincipleChanges = pendingPrinciples.some(
        (pendingPrinciple, index) => {
          const originalPrinciple = principlesData[index];
          return (
            JSON.stringify(pendingPrinciple) !==
            JSON.stringify(originalPrinciple)
          );
        },
      );

      if (hasPrincipleChanges) {
        await updatePrinciples.mutateAsync(pendingPrinciples);
      }

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving changes:", error);
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
      order: index,
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
      updatedAt: new Date(),
    } as Principle;

    setPendingPrinciples([...pendingPrinciples, newPrinciple]);
    setHasUnsavedChanges(true);
  };

  const handleDeletePrinciple = async (id: number) => {
    try {
      if (!confirm("Are you sure you want to delete this principle?")) return;

      await fetch(`/api/principles/${id}`, {
        method: "DELETE",
      });

      setPendingPrinciples((prev) => prev.filter((p) => p.id !== id));
      queryClient.invalidateQueries({ queryKey: ["/api/principles"] });
      toast({
        title: "Success",
        description: "Principle deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting principle:", error);
      toast({
        title: "Error",
        description: "Failed to delete principle",
        variant: "destructive",
      });
    }
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
    {
      key: "hero_text",
      label: "Hero Title",
      value:
        pendingContent["hero_text"] ??
        siteContent?.find((c) => c.key === "hero_text")?.value ??
        "",
      type: "text",
    },
    {
      key: "hero_subtext",
      label: "Hero Subtitle",
      value:
        pendingContent["hero_subtext"] ??
        "Living out God's great plan in small ways, daily.",
      type: "textarea",
    },
    {
      key: "hero_background",
      label: "Hero Background",
      value:
        pendingContent["hero_background"] ??
        siteContent?.find((c) => c.key === "hero_background")?.value ??
        "",
      type: "image",
    },

    {
      key: "about_title",
      label: "About Title",
      value:
        pendingContent["about_title"] ??
        siteContent?.find((c) => c.key === "about_title")?.value ??
        "",
      type: "text",
    },
    {
      key: "mission_text",
      label: "About Text",
      value:
        pendingContent["mission_text"] ??
        siteContent?.find((c) => c.key === "mission_text")?.value ??
        "",
      type: "textarea",
    },

    {
      key: "animals_title",
      label: "Dogs Title",
      value:
        pendingContent["animals_title"] ??
        siteContent?.find((c) => c.key === "animals_title")?.value ??
        "",
      type: "text",
    },
    {
      key: "animals_text",
      label: "Dogs Description",
      value:
        pendingContent["animals_text"] ??
        siteContent?.find((c) => c.key === "animals_text")?.value ??
        "",
      type: "textarea",
    },
    {
      key: "animals_image",
      label: "Dogs Image",
      value:
        pendingContent["animals_image"] ??
        siteContent?.find((c) => c.key === "animals_image")?.value ??
        "",
      type: "image",
    },
    {
      key: "animals_button_text",
      label: "Dogs Button Text",
      value:
        pendingContent["animals_button_text"] ??
        siteContent?.find((c) => c.key === "animals_button_text")?.value ??
        "",
      type: "text",
    },
    {
      key: "animals_redirect",
      label: "Dogs Button Link",
      value:
        pendingContent["animals_redirect"] ??
        siteContent?.find((c) => c.key === "animals_redirect")?.value ??
        "",
      type: "text",
    },

    {
      key: "bakery_title",
      label: "Goats Title",
      value:
        pendingContent["bakery_title"] ??
        siteContent?.find((c) => c.key === "bakery_title")?.value ??
        "",
      type: "text",
    },
    {
      key: "bakery_text",
      label: "Goats Description",
      value:
        pendingContent["bakery_text"] ??
        siteContent?.find((c) => c.key === "bakery_text")?.value ??
        "",
      type: "textarea",
    },
    {
      key: "bakery_image",
      label: "Goats Image",
      value:
        pendingContent["bakery_image"] ??
        siteContent?.find((c) => c.key === "bakery_image")?.value ??
        "",
      type: "image",
    },
    {
      key: "bakery_button_text",
      label: "Goats Button Text",
      value:
        pendingContent["bakery_button_text"] ??
        siteContent?.find((c) => c.key === "bakery_button_text")?.value ??
        "",
      type: "text",
    },
    {
      key: "bakery_redirect",
      label: "Goats Button Link",
      value:
        pendingContent["bakery_redirect"] ??
        siteContent?.find((c) => c.key === "bakery_redirect")?.value ??
        "",
      type: "text",
    },

    {
      key: "products_title",
      label: "Products Title",
      value:
        pendingContent["products_title"] ??
        siteContent?.find((c) => c.key === "products_title")?.value ??
        "",
      type: "text",
    },
    {
      key: "products_text",
      label: "Products Description",
      value:
        pendingContent["products_text"] ??
        siteContent?.find((c) => c.key === "products_text")?.value ??
        "",
      type: "textarea",
    },
    {
      key: "products_image",
      label: "Products Image",
      value:
        pendingContent["products_image"] ??
        siteContent?.find((c) => c.key === "products_image")?.value ??
        "",
      type: "image",
    },
    {
      key: "products_button_text",
      label: "Products Button Text",
      value:
        pendingContent["products_button_text"] ??
        siteContent?.find((c) => c.key === "products_button_text")?.value ??
        "",
      type: "text",
    },
    {
      key: "products_redirect",
      label: "Products Button Link",
      value:
        pendingContent["products_redirect"] ??
        siteContent?.find((c) => c.key === "products_redirect")?.value ??
        "",
      type: "text",
    },
    {
      key: "market_title",
      label: "Market Title",
      value:
        pendingContent["market_title"] ??
        siteContent?.find((c) => c.key === "market_title")?.value ??
        "",
      type: "text",
    },
    {
      key: "market_text",
      label: "Market Description",
      value:
        pendingContent["market_text"] ??
        siteContent?.find((c) => c.key === "market_text")?.value ??
        "",
      type: "textarea",
    },
  ];

  const handleCreateLitter = async () => {
    try {
      const res = await fetch("/api/litters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editLitter),
      });

      if (!res.ok) throw new Error("Failed to create litter");

      const newLitter = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/litters"] });
      toast({
        title: "Success",
        description: "Litter created successfully",
      });
      setLitterFormMode("edit");
      setEditLitter({ ...newLitter, puppies: [] });
    } catch (error) {
      console.error("Error creating litter:", error);
      toast({
        title: "Error",
        description: "Failed to create litter",
        variant: "destructive",
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
        throw new Error("Invalid due date");
      }

      // Format the litter data, ensuring date is valid
      const formattedLitter = {
        ...litterData,
        dueDate: dueDate.toISOString(),
      };

      // Create a separate array for existing and new puppies
      const existingPuppies = puppies?.filter((p) => p.id) || [];
      const newPuppies = puppies?.filter((p) => !p.id) || [];

      // Process existing puppies
      const processedPuppies = existingPuppies.map((puppy) => {
        const birthDate = new Date(puppy.birthDate);
        if (isNaN(birthDate.getTime())) {
          throw new Error("Invalid birth date for puppy");
        }

        return {
          id: puppy.id,
          name: puppy.name,
          gender: puppy.gender,
          birthDate: birthDate.toISOString(),
          description: puppy.description || "",
          color: puppy.color || "",
          height: puppy.height ? parseFloat(puppy.height.toString()) : null,
          weight: puppy.weight ? parseFloat(puppy.weight.toString()) : null,
          price: puppy.price ? parseInt(puppy.price.toString(), 10) : null,
          puppy: true,
          motherId: formattedLitter.motherId,
          fatherId: formattedLitter.fatherId,
          litterId: formattedLitter.id,
          breed: puppy.breed || "",
          profileImageUrl: puppy.profileImageUrl || "",
        };
      });

      // Update the litter with processed data
      const res = await fetch(`/api/litters/${formattedLitter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formattedLitter,
          puppies: processedPuppies,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update litter");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/litters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });

      toast({
        title: "Success",
        description: "Litter updated successfully",
      });

      setShowLitterForm(false);
      setShowPuppyForm(false);
    } catch (error: any) {
      console.error("Error updating litter:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update litter",
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
          gender: puppy.gender as "male" | "female",
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
          media: puppy.media || [],
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
            <div
              className={`w-full h-full flex items-center justify-center ${
                puppy.gender === "female" ? "bg-pink-100" : "bg-blue-100"
              }`}
            >
              <span
                className={`text-xl ${
                  puppy.gender === "female" ? "text-pink-500" : "text-blue-500"
                }`}
              >
                {puppy.gender === "female" ? "♀" : "♂"}
              </span>
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">{puppy.name}</p>
          <p className="text-sm text-muted-foreground">
            {puppy.gender} • {puppy.color || "No color set"}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation(); // Prevent opening the edit form
          if (!confirm("Are you sure you want to remove this puppy?")) return;
          setEditLitter((prev) => ({
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
    const mother = dogs.find((d) => d.id === litter.motherId);
    const father = dogs.find((d) => d.id === litter.fatherId);

    setSelectedDog({
      puppy: true,
      litterId: litter.id,
      motherId: litter.motherId,
      fatherId: litter.fatherId,
      mother,
      father,
      birthDate: new Date(litter.dueDate).toISOString().split("T")[0],
      gender: "male",
      available: false,
      breed: "Colorado Mountain Dogs",
      outsideBreeder: false,
    });
    setShowDogForm(true);
  };

  const handleDogFormClose = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/dogs"] });
    queryClient.invalidateQueries({ queryKey: ["/api/litters"] });
    setShowDogForm(false);
    setSelectedDog(null);
  };

  const renderLitterCard = (
    litter: Litter & { mother?: Dog; father?: Dog; puppies?: Dog[] },
  ) => {
    const mother = dogs.find((d) => d.id === litter.motherId);
    const father = dogs.find((d) => d.id === litter.fatherId);
    const litterPuppies = dogs.filter((d) => d.litterId === litter.id);

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
                    src={mother.profileImageUrl}                    alt={mother.name}
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
                {litterPuppies.map((puppy) =>
                  renderPuppyCard(puppy, litterPuppies.indexOf(puppy)),
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setLitterFormMode("edit");
                setEditLitter({
                  ...litter,
                  mother,
                  father,
                  puppies: litterPuppies,
                });
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
        <p className="text-red-500">
          Error loading content. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const sidebarItems = [
    { id: "content", label: "Content", icon: LayoutDashboard },
    { id: "dogs", label: "Dogs", icon: DogIcon },
    { id: "goats", label: "Goats", icon: Cat },
    { id: "market", label: "Market", icon: ShoppingBag },
    { id: "contact", label: "Contact", icon: Contact },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="w-full"
      >
        <div className="w-64 border-r bg-card fixed h-screen overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">Admin Dashboard</h2>
            <TabsList className="flex-col w-full gap-2 bg-transparent p-0">
              <TabsTrigger
                value="content"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="dogs"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <DogIcon className="h-4 w-4 mr-2" />
                Dogs
              </TabsTrigger>
              <TabsTrigger
                value="goats"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <Cat className="h-4 w-4 mr-2" />
                Goats
              </TabsTrigger>
              <TabsTrigger
                value="market"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Market
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="w-full justify-start data-[state=active]:bg-muted"
              >
                <Contact className="h-4 w-4 mr-2" />
                Contact
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="flex-1 pl-64">
          <div className="container mx-auto p-6 max-w-6xl">
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>
                    Edit website content and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Tabs defaultValue="home" className="w-full">
                      <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="home">Home</TabsTrigger>
                        <TabsTrigger value="dogs">CMD</TabsTrigger>
                        <TabsTrigger value="goats">NDG</TabsTrigger>
                        <TabsTrigger value="market">Market</TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                      </TabsList>

                      <TabsContent value="home" className="space-y-6">
                        <Tabs defaultValue="hero">
                          <TabsList>
                            <TabsTrigger value="hero">Hero</TabsTrigger>
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="principles">
                              Principles
                            </TabsTrigger>
                            <TabsTrigger value="carousel">Carousel</TabsTrigger>
                          </TabsList>

                          <TabsContent value="hero" className="space-y-4 pt-4">
                            <div className="mt-8">
                              {contentFields
                                .filter((field) =>
                                  [
                                    "hero_text",
                                    "hero_subtext",
                                    "hero_background",
                                  ].includes(field.key),
                                )
                                .map((field) => {
                                  return (
                                    <div key={field.key}>
                                      <Label htmlFor={field.key}>
                                        {field.label}
                                      </Label>
                                      {field.type === "textarea" ? (
                                        <Textarea
                                          id={field.key}
                                          value={field.value}
                                          onChange={(e) =>
                                            handleContentChange(
                                              field.key,
                                              e.target.value,
                                            )
                                          }
                                          className="mt-1.5"
                                        />
                                      ) : field.type === "image" ? (
                                        <div className="mt-1.5 space-y-2">
                                          <FileUpload
                                            value={
                                              pendingContent[field.key] ||
                                              field.value
                                            }
                                            onFileSelect={(file) =>
                                              handleContentChange(
                                                field.key,
                                                file,
                                              )
                                            }
                                            onChange={(url) => {
                                              if (typeof url === "string") {
                                                handleContentChange(
                                                  field.key,
                                                  url,
                                                );
                                              }
                                            }}
                                            skipCrop={
                                              field.key === "hero_background"
                                                ? true
                                                : undefined
                                            }
                                          />
                                        </div>
                                      ) : (
                                        <Input
                                          id={field.key}
                                          value={field.value}
                                          onChange={(e) =>
                                            handleContentChange(
                                              field.key,
                                              e.target.value,
                                            )
                                          }
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
                                <CardDescription>
                                  Manage the About section content
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {/* What We Offer Section */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium">
                                    What We Offer
                                  </h3>
                                  <div>
                                    <Label htmlFor="about_title">Title</Label>
                                    <Input
                                      id="about_title"
                                      value={
                                        pendingContent["about_title"] || ""
                                      }
                                      onChange={(e) =>
                                        handleContentChange(
                                          "about_title",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="mission_text">
                                      Description
                                    </Label>
                                    <Textarea
                                      id="mission_text"
                                      value={
                                        pendingContent["mission_text"] || ""
                                      }
                                      onChange={(e) =>
                                        handleContentChange(
                                          "mission_text",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                {/* Feature Cards Section */}
                                <div className="space-y-4 mt-6">
                                  <h3 className="text-lg font-medium">
                                    Feature Cards
                                  </h3>

                                  {/* Dogs Card */}
                                  <div className="border p-4 rounded-lg space-y-4">
                                    <h4 className="font-medium">
                                      Colorado Mountain Dogs
                                    </h4>
                                    <div>
                                      <Label htmlFor="animals_title">
                                        Title
                                      </Label>
                                      <Input
                                        id="animals_title"
                                        value={
                                          pendingContent["animals_title"] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "animals_title",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="animals_text">
                                        Description
                                      </Label>
                                      <Textarea
                                        id="animals_text"
                                        value={
                                          pendingContent["animals_text"] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "animals_text",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="animals_image">
                                        Image
                                      </Label>
                                      <FileUpload
                                        value={
                                          pendingContent["animals_image"] || ""
                                        }
                                        onFileSelect={(file) =>
                                          handleContentChange(
                                            "animals_image",
                                            file,
                                          )
                                        }
                                        onChange={(url) => {
                                          if (typeof url === "string") {
                                            handleContentChange(
                                              "animals_image",
                                              url,
                                            );
                                          }
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="animals_button_text">
                                        Button Text
                                      </Label>
                                      <Input
                                        id="animals_button_text"
                                        value={
                                          pendingContent[
                                            "animals_button_text"
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "animals_button_text",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="animals_redirect">
                                        Button Link
                                      </Label>
                                      <Input
                                        id="animals_redirect"
                                        value={
                                          pendingContent["animals_redirect"] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "animals_redirect",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* Goats Card */}
                                  <div className="border p-4 rounded-lg space-y-4">
                                    <h4 className="font-medium">
                                      Nigerian Dwarf Goats
                                    </h4>
                                    <div>
                                      <Label htmlFor="bakery_title">
                                        Title
                                      </Label>
                                      <Input
                                        id="bakery_title"
                                        value={
                                          pendingContent["bakery_title"] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "bakery_title",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="bakery_text">
                                        Description
                                      </Label>
                                      <Textarea
                                        id="bakery_text"
                                        value={
                                          pendingContent["bakery_text"] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "bakery_text",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="bakery_image">
                                        Image
                                      </Label>
                                      <FileUpload
                                        value={pendingContent["bakery_image"] || ""}
                                        onFileSelect={async (file) => {
                                          const formData = new FormData();
                                          formData.append("file", file);
                                          
                                          try {
                                            const response = await fetch("/api/upload", {
                                              method: "POST",
                                              body: formData,
                                            });
                                            
                                            if (!response.ok) throw new Error("Upload failed");
                                            
                                            const data = await response.json();
                                            const uploadedFile = Array.isArray(data) ? data[0] : data;
                                            
                                            if (uploadedFile?.url) {
                                              handleContentChange("bakery_image", uploadedFile.url);
                                            }
                                          } catch (error) {
                                            console.error("Upload error:", error);
                                            toast({
                                              title: "Error",
                                              description: "Failed to upload image",
                                              variant: "destructive",
                                            });
                                          }
                                        }}
                                        onChange={(url) => {
                                          if (typeof url === "string") {
                                            handleContentChange("bakery_image", url);
                                          }
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="bakery_button_text">
                                        Button Text
                                      </Label>
                                      <Input
                                        id="bakery_button_text"
                                        value={
                                          pendingContent[
                                            "bakery_button_text"
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "bakery_button_text",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="bakery_redirect">
                                        Button Link
                                      </Label>
                                      <Input
                                        id="bakery_redirect"
                                        value={
                                          pendingContent["bakery_redirect"] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "bakery_redirect",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>

                                  {/* Products Card */}
                                  <div className="border p-4 rounded-lg space-y-4">
                                    <h4 className="font-medium">Products</h4>
                                    <div>
                                      <Label htmlFor="products_title">
                                        Title
                                      </Label>
                                      <Input
                                        id="products_title"
                                        value={
                                          pendingContent["products_title"] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "products_title",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="products_text">
                                        Description
                                      </Label>
                                      <Textarea
                                        id="products_text"
                                        value={
                                          pendingContent["products_text"] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "products_text",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="products_image">
                                        Image
                                      </Label>
                                      <FileUpload
                                        value={
                                          pendingContent["products_image"] || ""
                                        }
                                        onFileSelect={(file) =>
                                          handleContentChange(
                                            "products_image",
                                            file,
                                          )
                                        }
                                        onChange={(url) => {
                                          if (typeof url === "string") {
                                            handleContentChange(
                                              "products_image",
                                              url,
                                            );
                                          }
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="products_button_text">
                                        Button Text
                                      </Label>
                                      <Input
                                        id="products_button_text"
                                        value={
                                          pendingContent[
                                            "products_button_text"
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "products_button_text",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="products_redirect">
                                        Button Link
                                      </Label>
                                      <Input
                                        id="products_redirect"
                                        value={
                                          pendingContent["products_redirect"] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleContentChange(
                                            "products_redirect",
                                            e.target.value,
                                          )
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent
                            value="principles"
                            className="space-y-4 pt-4"
                          >
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
                                  onChange={(e) =>
                                    handlePrincipleChange(
                                      principle.id,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                />
                                <Label>Description</Label>
                                <Textarea
                                  value={principle.description}
                                  onChange={(e) =>
                                    handlePrincipleChange(
                                      principle.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                />
                                <Label>Image</Label>
                                <div className="space-y-2">
                                  <FileUpload
                                    value={principle.imageUrl}
                                    onFileSelect={(file) => {
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      fetch("/api/upload", {
                                        method: "POST",
                                        body: formData,
                                      })
                                        .then((res) => res.json())
                                        .then((data) => {
                                          handlePrincipleChange(
                                            principle.id,
                                            "imageUrl",
                                            data.url,
                                          );
                                        })
                                        .catch((error) => {
                                          console.error(
                                            "Error uploading image:",
                                            error,
                                          );
                                          toast({
                                            title: "Error",
                                            description:
                                              "Failed to upload image",
                                            variant: "destructive",
                                          });
                                        });
                                    }}
                                    onChange={(url) => {
                                      if (typeof url === "string") {
                                        handlePrincipleChange(
                                          principle.id,
                                          "imageUrl",
                                          url,
                                        );
                                      }
                                    }}
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleDeletePrinciple(principle.id)
                                    }
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                          <TabsContent
                            value="carousel"
                            className="space-y-4 pt-4"
                          >
                            <div className="mb-6">
                              <Button
                                onClick={() => {
                                  setEditItem(null);
                                  setShowForm(true);
                                }}
                              >
                                Add Carousel Item
                              </Button>
                            </div>
                            <div className="grid gap-4">
                              {carouselItems?.map((item) => (
                                <Card key={item.id}>
                                  <CardHeader>
                                    <CardTitle>{item.title}</CardTitle>
                                    <CardDescription>
                                      {item.description}
                                    </CardDescription>
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
                            <CardDescription>
                              Manage contact details and social media links
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                type="email"
                                value={pendingContactInfo.email ?? ""}
                                onChange={(e) =>
                                  handleContactChange("email", e.target.value)
                                }
                                placeholder="contact@littlewayacres.com"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={pendingContactInfo.phone ?? ""}
                                onChange={(e) =>
                                  handleContactChange("phone", e.target.value)
                                }
                                placeholder="(555) 123-4567"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="facebook">Facebook URL</Label>
                              <Input
                                id="facebook"
                                type="url"
                                value={pendingContactInfo.facebook ?? ""}
                                onChange={(e) =>
                                  handleContactChange(
                                    "facebook",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://facebook.com/littlewayacres"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="instagram">Instagram URL</Label>
                              <Input
                                id="instagram"
                                type="url"
                                value={pendingContactInfo.instagram ?? ""}
                                onChange={(e) =>
                                  handleContactChange(
                                    "instagram",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://instagram.com/littlewayacres"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dogs">
              <Card>
                <CardHeader>
                  <CardTitle>Dog Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                      <TabsTrigger value="overview">Dogs</TabsTrigger>
                      <TabsTrigger value="litters">Litters</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <DogManagement />
                    </TabsContent>
                    <TabsContent value="litters">
                      <LitterManagement />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goats">
              <Card>
                <CardHeader>
                  <CardTitle>Goat Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                      <TabsTrigger value="overview">Goats</TabsTrigger>
                      <TabsTrigger value="litters">Litters</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview">
                      <GoatManagement />
                    </TabsContent>
                    <TabsContent value="litters">
                      <GoatLitterManagement />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market">
              <Card>
                <CardHeader>
                  <CardTitle>Product Management</CardTitle>
                  <CardDescription>
                    Manage products and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Button
                      onClick={() => {
                        setEditItem(null);
                        setShowForm(true);
                      }}
                    >
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Manage contact details and social media links
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <Input
                        type="email"
                        value={contactInfoData?.email ?? ""}
                        placeholder="contact@example.com"
                        onChange={(e) =>
                          handleContactChange("email", e.target.value)
                        }
                      />
                    </FormItem>
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        type="tel"
                        value={contactInfoData?.phone ?? ""}
                        placeholder="(555) 123-4567"
                        onChange={(e) =>
                          handleContactChange("phone", e.target.value)
                        }
                      />
                    </FormItem>
                    <FormItem>
                      <FormLabel>Facebook URL</FormLabel>
                      <Input
                        type="url"
                        value={contactInfoData?.facebook ?? ""}
                        placeholder="https://facebook.com/littlewayacres"
                        onChange={(e) =>
                          handleContactChange("facebook", e.target.value)
                        }
                      />
                    </FormItem>
                    <FormItem>
                      <FormLabel>Instagram URL</FormLabel>
                      <Input
                        type="url"
                        value={contactInfoData?.instagram ?? ""}
                        placeholder="https://instagram.com/littlewayacres"
                        onChange={(e) =>
                          handleContactChange("instagram", e.target.value)
                        }
                      />
                    </FormItem>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}