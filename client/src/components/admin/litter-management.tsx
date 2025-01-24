
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dog, Litter } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDisplayDate } from "@/lib/date-utils";
import { useLitterManagement } from "@/hooks/use-litter-management";
import { X } from "lucide-react";

export default function LitterManagement() {
  const {
    showLitterForm,
    setShowLitterForm,
    litterFormMode,
    editLitter,
    setEditLitter,
    createLitter,
    updateLitter
  } = useLitterManagement();

  const { data: dogs = [] } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
  });

  const { data: litters = [] } = useQuery<Litter[]>({
    queryKey: ["/api/litters"],
  });

  const renderLitterCard = (litter: Litter & { mother?: Dog; father?: Dog; puppies?: Dog[] }) => {
    const mother = dogs.find(d => d.id === litter.motherId);
    const father = dogs.find(d => d.id === litter.fatherId);
    const litterPuppies = dogs.filter(d => d.litterId === litter.id);

    return (
      <Card key={litter.id} className="mb-4">
        <CardContent className="p-6">
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {mother?.name} x {father?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Due Date: {formatDisplayDate(new Date(litter.dueDate))}
                </p>
              </div>
              <Button
                onClick={() => {
                  setEditLitter({ ...litter, mother, father, puppies: litterPuppies });
                  setShowLitterForm(true);
                }}
              >
                Edit
              </Button>
            </div>

            {litterPuppies.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Puppies</h4>
                <div className="grid gap-2">
                  {litterPuppies.map((puppy) => (
                    <div
                      key={puppy.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
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
                            <div className={`w-full h-full flex items-center justify-center ${
                              puppy.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                            }`}>
                              <span className={`text-xl ${
                                puppy.gender === 'female' ? 'text-pink-500' : 'text-blue-500'
                              }`}>
                                {puppy.gender === 'female' ? '♀' : '♂'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{puppy.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {puppy.gender} • {puppy.color || 'No color set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Litters Management</h2>
      <p className="text-muted-foreground mb-6">Manage upcoming and current litters</p>
      <div className="space-y-6">
        <Button onClick={() => {
          setEditLitter(null);
          setShowLitterForm(true);
        }}>
          Add New Litter
        </Button>

        <div className="grid gap-4">
          {litters?.map(renderLitterCard)}
        </div>

        <Sheet open={showLitterForm} onOpenChange={setShowLitterForm}>
          <SheetContent side="right" className="w-1/3">
            <SheetHeader>
              <SheetTitle>
                {litterFormMode === 'create' ? 'Create New Litter' : 'Edit Litter'}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Mother</Label>
                  <Select
                    value={editLitter?.motherId?.toString() || ""}
                    onValueChange={(value) => {
                      const mother = dogs.find(d => d.id === parseInt(value));
                      setEditLitter(prev => ({
                        ...prev!,
                        motherId: parseInt(value),
                        mother,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mother" />
                    </SelectTrigger>
                    <SelectContent>
                      {dogs
                        .filter(d => d.gender === 'female')
                        .map(dog => (
                          <SelectItem key={dog.id} value={dog.id.toString()}>
                            {dog.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Father</Label>
                  <Select
                    value={editLitter?.fatherId?.toString() || ""}
                    onValueChange={(value) => {
                      const father = dogs.find(d => d.id === parseInt(value));
                      setEditLitter(prev => ({
                        ...prev!,
                        fatherId: parseInt(value),
                        father,
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select father" />
                    </SelectTrigger>
                    <SelectContent>
                      {dogs
                        .filter(d => d.gender === 'male')
                        .map(dog => (
                          <SelectItem key={dog.id} value={dog.id.toString()}>
                            {dog.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={editLitter?.dueDate ? editLitter.dueDate.split('T')[0] : ""}
                    onChange={(e) => setEditLitter(prev => ({
                      ...prev!,
                      dueDate: e.target.value,
                    }))}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => {
                  setShowLitterForm(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={litterFormMode === 'create' ? createLitter : updateLitter}>
                  Save Litter
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
