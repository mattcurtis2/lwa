import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Goat } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import GoatForm from "@/components/forms/goat-form";
import { GoatCard } from "@/components/cards/goat-card";

export default function GoatManagement() {
  const [showGoatForm, setShowGoatForm] = useState(false);
  const [selectedGoat, setSelectedGoat] = useState<Partial<Goat> | null>(null);
  const queryClient = useQueryClient();

  const { data: goats = [] } = useQuery<Goat[]>({
    queryKey: ["/api/goats", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/goats?admin=true");
      if (!response.ok) {
        throw new Error("Failed to fetch goats");
      }
      return response.json();
    },
  });

  const handleEditGoat = (goat: Goat) => {
    setSelectedGoat(goat);
    setShowGoatForm(true);
  };

  const handleGoatFormClose = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/goats', 'admin'] });
    setShowGoatForm(false);
    setSelectedGoat(null);
  };

  const renderGoatCard = (goat: Goat) => (
    <GoatCard
      key={goat.id}
      goat={goat}
      isAdmin
      onEdit={() => handleEditGoat(goat)}
      onDelete={async (goat) => {
        if (!confirm("Are you sure you want to delete this goat?")) return;
        const res = await fetch(`/api/goats/${goat.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["/api/goats", "admin"] });
        }
      }}
    />
  );

  // Separate goats into categories
  const does = goats.filter(goat => goat.gender === 'female' && !goat.outsideBreeder && !goat.kid && !goat.available && !goat.sold);
  const bucks = goats.filter(goat => goat.gender === 'male' && !goat.outsideBreeder && !goat.kid && !goat.available && !goat.sold);
  const kids = goats.filter(goat => goat.kid && !goat.sold);
  const availableGoats = goats.filter(goat => goat.available && !goat.kid && !goat.sold);
  const soldGoats = goats.filter(goat => goat.sold && !goat.outsideBreeder);
  const outsideBreeders = goats.filter(goat => goat.outsideBreeder);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Goats Management</h2>
      <p className="text-muted-foreground mb-6">Manage your Nigerian Dwarf goats</p>
      <div className="mb-4">
        <Button onClick={() => {
          setSelectedGoat(null);
          setShowGoatForm(true);
        }}>
          Add New Goat
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
        
        {/* Does Section */}
        {does.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Does</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {does.map(goat => (
                <div key={goat.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderGoatCard(goat)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bucks Section */}
        {bucks.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Bucks</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {bucks.map(goat => (
                <div key={goat.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderGoatCard(goat)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kids Section */}
        {kids.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Kids</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {kids.map(goat => (
                <div key={goat.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderGoatCard(goat)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Goats Section */}
        {availableGoats.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Available Goats</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {availableGoats.map(goat => (
                <div key={goat.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderGoatCard(goat)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sold Section */}
      {soldGoats.length > 0 && (
        <div className="mb-12 p-6 bg-rose-50 border-2 border-rose-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-8 text-rose-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Sold
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {soldGoats.map(goat => (
              <div key={goat.id} className="border rounded-lg p-3 sm:p-4 bg-white opacity-75">
                {renderGoatCard(goat)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outside Breeders Section */}
      {outsideBreeders.length > 0 && (
        <div className="mb-12 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-8 text-yellow-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L18 7L16.74 12.26L22 14L16.74 15.74L18 21L13.09 19.74L12 26L10.91 19.74L6 21L7.26 15.74L2 14L7.26 12.26L6 7L10.91 8.26L12 2Z"/>
            </svg>
            Outside Breeders
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {outsideBreeders.map(goat => (
              <div key={goat.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                {renderGoatCard(goat)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goat Form Sheet */}
      {showGoatForm && (
        <Sheet open={showGoatForm} onOpenChange={handleGoatFormClose}>
          <SheetContent side="right" className="w-[95vw] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedGoat?.id ? 'Edit Goat' : 'Add New Goat'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <GoatForm
                open={showGoatForm}
                onOpenChange={handleGoatFormClose}
                goat={selectedGoat as Goat}
                mode={selectedGoat?.id ? 'edit' : 'create'}
                fromLitter={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
