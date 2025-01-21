import { Animal } from "@db/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AnimalCardProps {
  animal: Animal;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function AnimalCard({ animal, isAdmin, onEdit }: AnimalCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteAnimal = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/animals/${animal.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete animal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      toast({
        title: "Success",
        description: "Animal deleted successfully",
      });
    },
  });

  return (
    <Card>
      <div className="aspect-square relative">
        <img
          src={animal.imageUrl || "https://images.unsplash.com/photo-1586348323398-678d15d9e87f"}
          alt={animal.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-2">{animal.name}</h3>
        <p className="text-stone-600 mb-2">
          {animal.breed} • {animal.age} years old
        </p>
        <p className="text-stone-600">{animal.description}</p>
      </CardContent>
      {isAdmin && (
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>Edit</Button>
          <Button 
            variant="destructive" 
            onClick={() => deleteAnimal.mutate()}
          >
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
