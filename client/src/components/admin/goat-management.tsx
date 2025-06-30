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
  const does = goats.filter(goat => goat.gender === 'female' && !goat.outsideBreeder && !goat.kid && !goat.available);
  const bucks = goats.filter(goat => goat.gender === 'male' && !goat.outsideBreeder && !goat.kid && !goat.available);
  const kids = goats.filter(goat => goat.kid);
  const availableGoats = goats.filter(goat => goat.available && !goat.kid);
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

      {/* Does Section */}
      {does.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Does</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {does.map(goat => (
              <div key={goat.id} className="border rounded-lg p-3 sm:p-4">
                {renderGoatCard(goat)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bucks Section */}
      {bucks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Bucks</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {bucks.map(goat => (
              <div key={goat.id} className="border rounded-lg p-3 sm:p-4">
                {renderGoatCard(goat)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kids Section */}
      {kids.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Kids</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {kids.map(goat => (
              <div key={goat.id} className="border rounded-lg p-3 sm:p-4">
                {renderGoatCard(goat)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Goats Section */}
      {availableGoats.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Available Goats</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {availableGoats.map(goat => (
              <div key={goat.id} className="border rounded-lg p-3 sm:p-4">
                {renderGoatCard(goat)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outside Breeders Section */}
      {outsideBreeders.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6">Outside Breeders</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {outsideBreeders.map(goat => (
              <div key={goat.id} className="border rounded-lg p-3 sm:p-4">
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
