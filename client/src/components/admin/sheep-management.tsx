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
  const ewes = sheep.filter(s => s.gender === 'female' && !s.outsideBreeder && !s.lamb && !s.available && !s.sold);
  const rams = sheep.filter(s => s.gender === 'male' && !s.outsideBreeder && !s.lamb && !s.available && !s.sold);
  const lambs = sheep.filter(s => s.lamb && !s.sold);
  const availableSheep = sheep.filter(s => s.available && !s.lamb && !s.sold);
  const soldSheep = sheep.filter(s => s.sold && !s.outsideBreeder);
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

      {/* On The Farm Section */}
      <div className="mb-12 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
        <h3 className="text-2xl font-bold mb-8 text-green-800 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7V10C2 16 6 20.5 12 22C18 20.5 22 16 22 10V7L12 2Z"/>
          </svg>
          On The Farm
        </h3>
        
        {/* Rams Section */}
        {rams.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Rams</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {rams.map(sheep => (
                <div key={sheep.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderSheepCard(sheep)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ewes Section */}
        {ewes.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Ewes</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {ewes.map(sheep => (
                <div key={sheep.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderSheepCard(sheep)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lambs Section */}
        {lambs.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Lambs</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {lambs.map(sheep => (
                <div key={sheep.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderSheepCard(sheep)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Sheep Section */}
        {availableSheep.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-4 text-green-700">Available Sheep</h4>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {availableSheep.map(sheep => (
                <div key={sheep.id} className="border rounded-lg p-3 sm:p-4 bg-white">
                  {renderSheepCard(sheep)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sold Section */}
      {soldSheep.length > 0 && (
        <div className="mb-12 p-6 bg-rose-50 border-2 border-rose-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-8 text-rose-800 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            Sold
          </h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {soldSheep.map(sheep => (
              <div key={sheep.id} className="border rounded-lg p-3 sm:p-4 bg-white opacity-75">
                {renderSheepCard(sheep)}
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
            {outsideBreeders.map(sheep => (
              <div key={sheep.id} className="border rounded-lg p-3 sm:p-4 bg-white">
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