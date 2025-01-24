
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dog } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DogForm from "@/components/forms/dog-form";
import DogCard from "@/components/cards/dog-card";

export default function DogManagement() {
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);
  const queryClient = useQueryClient();

  const { data: dogs = [] } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
  });

  const handleEditDog = (dog: Dog) => {
    setSelectedDog(dog);
    setShowDogForm(true);
  };

  const handleDogFormClose = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
    setShowDogForm(false);
    setSelectedDog(null);
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
        }
      }}
    />
  );

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Dogs Management</h2>
      <p className="text-muted-foreground mb-6">Manage your dogs</p>
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

      {/* Dog Form Sheet */}
      {showDogForm && (
        <Sheet open={showDogForm} onOpenChange={handleDogFormClose}>
          <SheetContent side="right" className="w-[95vw] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedDog?.id ? 'Edit Dog' : 'Add New Dog'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <DogForm
                open={showDogForm}
                onOpenChange={handleDogFormClose}
                dog={selectedDog as Dog}
                mode={selectedDog?.id ? 'edit' : 'create'}
                fromLitter={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
