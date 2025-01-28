import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface AboutCard {
  title: string;
  description: string;
  icon: string;
}

interface AboutCardsData {
  sectionTitle: string;
  sectionDescription: string;
  cards: AboutCard[];
}

export default function AboutCardsEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AboutCardsData>({
    queryKey: ["/api/about-cards"],
  });

  const [formData, setFormData] = useState<AboutCardsData>(
    data || {
      sectionTitle: "",
      sectionDescription: "",
      cards: Array(3).fill({ title: "", description: "", icon: "" }),
    }
  );

  const updateMutation = useMutation({
    mutationFn: async (data: AboutCardsData) => {
      const response = await fetch("/api/about-cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update about cards");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about-cards"] });
      toast({
        title: "Success",
        description: "About cards updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const updateCard = (index: number, field: keyof AboutCard, value: string) => {
    setFormData((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, [field]: value } : card
      ),
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Section Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sectionTitle">Section Title</Label>
            <Input
              id="sectionTitle"
              value={formData.sectionTitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sectionTitle: e.target.value,
                }))
              }
              placeholder="What We Offer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sectionDescription">Section Description</Label>
            <Textarea
              id="sectionDescription"
              value={formData.sectionDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sectionDescription: e.target.value,
                }))
              }
              placeholder="Discover our range of services"
            />
          </div>
        </CardContent>
      </Card>

      {formData.cards.map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>Card {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`card${index}Title`}>Title</Label>
              <Input
                id={`card${index}Title`}
                value={card.title}
                onChange={(e) => updateCard(index, "title", e.target.value)}
                placeholder={`Card ${index + 1} Title`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`card${index}Description`}>Description</Label>
              <Textarea
                id={`card${index}Description`}
                value={card.description}
                onChange={(e) => updateCard(index, "description", e.target.value)}
                placeholder={`Card ${index + 1} Description`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`card${index}Icon`}>Icon (Lucide Icon Name)</Label>
              <Input
                id={`card${index}Icon`}
                value={card.icon}
                onChange={(e) => updateCard(index, "icon", e.target.value)}
                placeholder="heart"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="submit"
        disabled={updateMutation.isPending}
        className="w-full"
      >
        {updateMutation.isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
