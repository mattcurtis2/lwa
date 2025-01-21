import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimalForm from "@/components/forms/animal-form";
import ProductForm from "@/components/forms/product-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Animal, Product, SiteContent } from "@db/schema";
import AnimalCard from "@/components/cards/animal-card";
import ProductCard from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  value: string;
}

export default function Admin() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Animal | Product | null>(null);
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

  const contentFields: ContentField[] = [
    { key: "logo", label: "Logo URL", type: "image", value: siteContent?.find(c => c.key === "logo")?.value || "" },
    { key: "hero_background", label: "Hero Background URL", type: "image", value: siteContent?.find(c => c.key === "hero_background")?.value || "" },
    { key: "hero_text", label: "Hero Title", type: "text", value: siteContent?.find(c => c.key === "hero_text")?.value || "" },
    { key: "hero_subtext", label: "Hero Subtitle", type: "textarea", value: siteContent?.find(c => c.key === "hero_subtext")?.value || "" },
    { key: "about_title", label: "About Section Title", type: "text", value: siteContent?.find(c => c.key === "about_title")?.value || "" },
    { key: "mission_title", label: "Mission Card Title", type: "text", value: siteContent?.find(c => c.key === "mission_title")?.value || "" },
    { key: "mission_text", label: "Mission Card Text", type: "textarea", value: siteContent?.find(c => c.key === "mission_text")?.value || "" },
    { key: "animals_title", label: "Animals Card Title", type: "text", value: siteContent?.find(c => c.key === "animals_title")?.value || "" },
    { key: "animals_text", label: "Animals Card Text", type: "textarea", value: siteContent?.find(c => c.key === "animals_text")?.value || "" },
    { key: "market_title", label: "Market Card Title", type: "text", value: siteContent?.find(c => c.key === "market_title")?.value || "" },
    { key: "market_text", label: "Market Card Text", type: "textarea", value: siteContent?.find(c => c.key === "market_text")?.value || "" },
  ];

  const handleContentChange = (key: string, value: string) => {
    setPendingContent(prev => ({ ...prev, [key]: value }));
  };

  const handleContentSave = async (key: string) => {
    if (pendingContent[key] === undefined) return;

    try {
      await updateSiteContent.mutateAsync({
        key,
        value: pendingContent[key],
      });
      // Clear the pending content for this field after successful save
      setPendingContent(prev => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Content Management</h1>

      <Tabs defaultValue="site">
        <TabsList>
          <TabsTrigger value="site">Site Content</TabsTrigger>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="site">
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
                    <Button 
                      onClick={() => handleContentSave(field.key)}
                      disabled={pendingContent[field.key] === undefined}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
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