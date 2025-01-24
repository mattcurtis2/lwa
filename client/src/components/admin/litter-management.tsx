
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Dog, Litter } from "@db/schema";
import DogForm from "@/components/forms/dog-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDisplayDate } from "@/lib/date-utils";
import { useLitterManagement } from "@/hooks/use-litter-management";
import { X, Plus } from "lucide-react";

export default function LitterManagement() {
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);
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

  const handleAddPuppy = (litter: Litter) => {
    const mother = dogs.find(d => d.id === litter.motherId);
    const father = dogs.find(d => d.id === litter.fatherId);

    // Set selected dog with puppy defaults
    setSelectedDog({
      puppy: true,
      litterId: litter.id,
      motherId: litter.motherId,
      fatherId: litter.fatherId,
      mother,
      father,
      birthDate: new Date(litter.dueDate).toISOString().split('T')[0],
      gender: 'male',
      available: false,
      breed: "Colorado Mountain Dogs",
      outsideBreeder: false
    });
    setShowDogForm(true);
  };

  const onDogFormSubmit = async (values: any) => {
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create puppy');
      }

      // Refresh the dogs data
      await queryClient.invalidateQueries(['/api/dogs']);
      setShowDogForm(false);
      setSelectedDog(null);
    } catch (error) {
      console.error('Error creating puppy:', error);
    }
  };

  const renderLitterCard = (litter: Litter & { mother?: Dog; father?: Dog; puppies?: Dog[] }) => {
    const mother = dogs.find(d => d.id === litter.motherId);
    const father = dogs.find(d => d.id === litter.fatherId);
    const litterPuppies = dogs.filter(d => d.litterId === litter.id);

    return (
      <Card key={litter.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {mother?.name} x {father?.name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddPuppy(litter)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Puppy
            </Button>
          </div>
          <CardDescription>
            Due Date: {formatDisplayDate(new Date(litter.dueDate))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Parents Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Mother */}
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                {mother?.profileImageUrl ? (
                  <img
                    src={mother.profileImageUrl}
                    alt={mother.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                    <span className="text-2xl text-pink-500">♀</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{mother?.name}</p>
                <p className="text-sm text-muted-foreground">Mother</p>
              </div>
            </div>

            {/* Father */}
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                {father?.profileImageUrl ? (
                  <img
                    src={father.profileImageUrl}
                    alt={father.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl text-blue-500">♂</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">{father?.name}</p>
                <p className="text-sm text-muted-foreground">Father</p>
              </div>
            </div>
          </div>

          {/* Puppies Section */}
          {litterPuppies.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Puppies</h4>
              <div className="grid gap-4">
                {litterPuppies.map((puppy) => (
                  <div
                    key={puppy.id}
                    className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  >
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
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setEditLitter({ ...litter, mother, father, puppies: litterPuppies });
                setShowLitterForm(true);
              }}
            >
              Edit Litter
            </Button>
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

        {showDogForm && (
          <DogForm
            open={showDogForm}
            onOpenChange={() => {
              setShowDogForm(false);
              setSelectedDog(null);
            }}
            dog={selectedDog as Dog}
            mode={selectedDog?.id ? 'edit' : 'create'}
            fromLitter={true}
            onSubmit={onDogFormSubmit}
          />
        )}
      </div>
    </div>
  );
}
