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
    queryKey: ["/api/dogs", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/dogs?admin=true");
      if (!response.ok) {
        throw new Error("Failed to fetch dogs");
      }
      return response.json();
    },
  });

  const handleEditDog = (dog: Dog) => {
    setSelectedDog(dog);
    setShowDogForm(true);
  };

  const handleDogFormClose = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/dogs', 'admin'] });
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
          queryClient.invalidateQueries({ queryKey: ["/api/dogs", "admin"] });
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

      {/* On The Farm Section */}
      <div className="mb-12 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
        <h3 className="text-2xl font-bold mb-8 text-green-800 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"/>
          </svg>
          On The Farm
        </h3>
        
        {/* Females Section */}
        {dogs.filter(dog => dog.gender === 'female' && !dog.outsideBreeder && !dog.sold && !dog.died).length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Females</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {dogs
                .filter(dog => dog.gender === 'female' && !dog.outsideBreeder && !dog.sold && !dog.died)
                .map((dog, index) => (
                  <div key={dog.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                    {renderDogCard(dog)}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Males Section */}
        {dogs.filter(dog => dog.gender === 'male' && !dog.outsideBreeder && !dog.sold && !dog.died).length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Males</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {dogs
                .filter(dog => dog.gender === 'male' && !dog.outsideBreeder && !dog.sold && !dog.died)
                .map((dog, index) => (
                  <div key={dog.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                    {renderDogCard(dog)}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Sold Section */}
      {dogs.filter(dog => dog.sold && !dog.outsideBreeder && !dog.died).length > 0 && (
        <div className="mb-12 p-6 bg-rose-50 border-2 border-rose-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-8 text-rose-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Sold
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {dogs
              .filter(dog => dog.sold && !dog.outsideBreeder && !dog.died)
              .map((dog, index) => (
                <div key={dog.id} className="border rounded-lg p-3 sm:p-4 bg-white opacity-75">
                  {renderDogCard(dog)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Outside Breeders Section */}
      {dogs.filter(dog => dog.outsideBreeder && !dog.died).length > 0 && (
        <div className="mb-12 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-8 text-yellow-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L18 7L16.74 12.26L22 14L16.74 15.74L18 21L13.09 19.74L12 26L10.91 19.74L6 21L7.26 15.74L2 14L7.26 12.26L6 7L10.91 8.26L12 2Z"/>
            </svg>
            Outside Breeders
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {dogs
              .filter(dog => dog.outsideBreeder && !dog.died)
              .map((dog, index) => (
                <div key={dog.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderDogCard(dog)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Died on the Farm Section */}
      {dogs.filter(dog => dog.died).length > 0 && (
        <div className="mb-12 p-6 bg-gray-50 border-2 border-gray-400 rounded-lg">
          <h3 className="text-2xl font-bold mb-8 text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Died on the Farm
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {dogs
              .filter(dog => dog.died)
              .map((dog, index) => (
                <div key={dog.id} className="border rounded-lg p-3 sm:p-4 bg-white opacity-60">
                  {renderDogCard(dog)}
                </div>
              ))}
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