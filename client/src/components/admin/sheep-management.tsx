import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import SheepCard from "@/components/sheep-card";
import SheepForm from "@/components/admin/sheep-form";
import type { Sheep } from "@db/schema";

export default function SheepManagement() {
  const [showSheepForm, setShowSheepForm] = useState(false);
  const [selectedSheep, setSelectedSheep] = useState<Sheep | null>(null);
  const queryClient = useQueryClient();

  const { data: sheep = [] } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep", "admin"],
    queryFn: () => fetch("/api/sheep/admin").then(res => res.json()),
  });

  const handleEditSheep = (sheep: Sheep) => {
    setSelectedSheep(sheep);
    setShowSheepForm(true);
  };

  const handleSheepFormClose = () => {
    setShowSheepForm(false);
    setSelectedSheep(null);
  };

  const renderSheepCard = (sheep: Sheep) => (
    <SheepCard
      key={sheep.id}
      sheep={sheep}
      isAdmin
      onEdit={() => handleEditSheep(sheep)}
      onDelete={async (sheep) => {
        if (!confirm("Are you sure you want to delete this sheep?")) return;
        const res = await fetch(`/api/sheep/${sheep.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["/api/sheep", "admin"] });
        }
      }}
    />
  );

  // Separate sheep into categories
  const ewes = sheep.filter(s => s.gender === 'female' && !s.outsideBreeder && !s.lamb && !s.available);
  const rams = sheep.filter(s => s.gender === 'male' && !s.outsideBreeder && !s.lamb && !s.available);
  const lambs = sheep.filter(s => s.lamb);
  const availableSheep = sheep.filter(s => s.available && !s.lamb);
  const outsideBreeders = sheep.filter(s => s.outsideBreeder);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Sheep Management</h2>
      <p className="text-muted-foreground mb-6">Manage your Katahdin sheep</p>
      <div className="mb-4">
        <Button onClick={() => {
          setSelectedSheep(null);
          setShowSheepForm(true);
        }}>
          Add New Sheep
        </Button>
      </div>

      {/* Rams Section */}
      {rams.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Rams</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rams.map(sheep => (
              <div key={sheep.id} className="border rounded-lg p-3 sm:p-4">
                {renderSheepCard(sheep)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ewes Section */}
      {ewes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Ewes</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {ewes.map(sheep => (
              <div key={sheep.id} className="border rounded-lg p-3 sm:p-4">
                {renderSheepCard(sheep)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lambs Section */}
      {lambs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Lambs</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {lambs.map(sheep => (
              <div key={sheep.id} className="border rounded-lg p-3 sm:p-4">
                {renderSheepCard(sheep)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Sheep Section */}
      {availableSheep.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Available Sheep</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {availableSheep.map(sheep => (
              <div key={sheep.id} className="border rounded-lg p-3 sm:p-4">
                {renderSheepCard(sheep)}
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
            {outsideBreeders.map(sheep => (
              <div key={sheep.id} className="border rounded-lg p-3 sm:p-4">
                {renderSheepCard(sheep)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sheep Form Sheet */}
      {showSheepForm && (
        <Sheet open={showSheepForm} onOpenChange={handleSheepFormClose}>
          <SheetContent side="right" className="w-[95vw] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedSheep?.id ? 'Edit Sheep' : 'Add New Sheep'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <SheepForm
                open={showSheepForm}
                onOpenChange={handleSheepFormClose}
                sheep={selectedSheep as Sheep}
                mode={selectedSheep?.id ? 'edit' : 'create'}
                fromLitter={true}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}