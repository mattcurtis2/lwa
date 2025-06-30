import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dog, Litter } from "@db/schema";
import DogForm from "@/components/forms/dog-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDisplayDate } from "@/lib/date-utils";
import { useLitterManagement } from "@/hooks/use-litter-management";
import { X, Plus } from "lucide-react";

export default function LitterManagement() {
  const { toast } = useToast();
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);
  const {
    showLitterForm,
    setShowLitterForm,
    litterFormMode,
    setLitterFormMode,
    editLitter,
    setEditLitter,
    createLitter,
    updateLitter
  } = useLitterManagement();

  const { data: dogs = [] } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
    onSuccess: (data) => {
      console.log('Dogs loaded:', data);
    },
    onError: (error) => {
      console.error('Error loading dogs:', error);
    }
  });

  const { data: litters = [] } = useQuery<Litter[]>({
    queryKey: ["/api/litters"],
    onSuccess: (data) => {
      console.log('Litters loaded:', data);
    },
    onError: (error) => {
      console.error('Error loading litters:', error);
    }
  });

  const handleAddPuppy = (litter: Litter) => {
    console.log('handleAddPuppy called with litter:', litter);
    const mother = dogs.find(d => d.id === litter.motherId);
    const father = dogs.find(d => d.id === litter.fatherId);
    console.log('Found parents:', { mother, father });

    const puppyDefaults = {
      name: "",
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
      outsideBreeder: false,
      registrationName: "",
      description: "",
      profileImageUrl: "",
      media: [],
      documents: []
    };

    console.log('Setting puppy defaults:', puppyDefaults);
    setSelectedDog(puppyDefaults);
    console.log('Setting showDogForm to true');
    setShowDogForm(true);
  };

  const onDogFormSubmit = async (savedDog: Dog) => {
    try {
      console.log('onDogFormSubmit called with:', savedDog);
      
      const litter = litters.find(l => l.id === savedDog.litterId);
      if (!litter) {
        console.error('No matching litter found for dog:', savedDog);
        return;
      }

      // Force an immediate refetch of the data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/dogs'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/litters'] })
      ]);
      
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/dogs'] }),
        queryClient.refetchQueries({ queryKey: ['/api/litters'] })
      ]);
      
      console.log('Data refetched successfully');
      
      setShowDogForm(false);
      setSelectedDog(null);
    } catch (error) {
      console.error('Error in onDogFormSubmit:', error);
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
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Litter</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Litter</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this litter and all associated puppies. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    try {
                      await fetch(`/api/litters/${litter.id}`, {
                        method: 'DELETE',
                      });
                      
                      // Refetch data
                      queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
                      
                      toast({
                        title: 'Success',
                        description: 'Litter deleted successfully',
                      });
                    } catch (error) {
                      console.error('Error deleting litter:', error);
                      toast({
                        title: 'Error',
                        description: 'Failed to delete litter',
                        variant: 'destructive',
                      });
                    }
                  }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={() => {
                setEditLitter({ ...litter, mother, father, puppies: litterPuppies });
                setLitterFormMode('edit');
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

  const handleDogFormClose = () => {
    setShowDogForm(false);
    setSelectedDog(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Litters Management</h2>
      <p className="text-muted-foreground mb-6">Manage upcoming and current litters</p>
      <div className="space-y-6">
        <Button onClick={() => {
          setLitterFormMode('create');
          setEditLitter({
            id: 0,
            siteId: 1,
            motherId: 0,
            fatherId: 0,
            dueDate: new Date().toISOString().split('T')[0],
            isVisible: true,
            isCurrentLitter: false,
            isPastLitter: false,
            isPlannedLitter: false,
            expectedBreedingDate: null,
            expectedPickupDate: null,
            createdAt: null,
            updatedAt: null
          });
          setShowLitterForm(true);
        }}>
          Add New Litter
        </Button>

        <div className="grid gap-4">
          {litters?.map(renderLitterCard)}
        </div>

        <Sheet open={showLitterForm} onOpenChange={(open) => {
          setShowLitterForm(open);
          if (!open) {
            setLitterFormMode('create');
            setEditLitter(null);
          }
        }}>
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

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isVisible" 
                        checked={editLitter?.isVisible} 
                        onCheckedChange={(checked) => 
                          setEditLitter(prev => ({
                            ...prev!,
                            isVisible: !!checked,
                          }))
                        } 
                      />
                      <Label htmlFor="isVisible">Visible in Public Listings</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">Controls whether this litter appears in any public pages</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isCurrentLitter" 
                        checked={editLitter?.isCurrentLitter} 
                        onCheckedChange={(checked) => 
                          setEditLitter(prev => ({
                            ...prev!,
                            isCurrentLitter: !!checked,
                          }))
                        } 
                      />
                      <Label htmlFor="isCurrentLitter">Show Banner on Dogs Page</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">Shows the "New Litter Coming Soon!" banner on the dogs page</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isPastLitter" 
                        checked={editLitter?.isPastLitter} 
                        onCheckedChange={(checked) => 
                          setEditLitter(prev => ({
                            ...prev!,
                            isPastLitter: !!checked,
                          }))
                        } 
                      />
                      <Label htmlFor="isPastLitter">Display as Past Litter</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">Shows this litter in the past litters section</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isPlannedLitter" 
                        checked={editLitter?.isPlannedLitter} 
                        onCheckedChange={(checked) => 
                          setEditLitter(prev => ({
                            ...prev!,
                            isPlannedLitter: !!checked,
                          }))
                        } 
                      />
                      <Label htmlFor="isPlannedLitter">Planned Litter</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">This is a future litter for waitlist management</p>
                  </div>
                </div>

                {editLitter?.isPlannedLitter && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-medium">Planned Litter Details</h4>
                    <div className="space-y-2">
                      <Label>Expected Breeding Date</Label>
                      <Input
                        type="date"
                        value={editLitter?.expectedBreedingDate ? editLitter.expectedBreedingDate.split('T')[0] : ""}
                        onChange={(e) => setEditLitter(prev => ({
                          ...prev!,
                          expectedBreedingDate: e.target.value,
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Puppy Pickup Date</Label>
                      <Input
                        type="date"
                        value={editLitter?.expectedPickupDate ? editLitter.expectedPickupDate.split('T')[0] : ""}
                        onChange={(e) => setEditLitter(prev => ({
                          ...prev!,
                          expectedPickupDate: e.target.value,
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => {
                  setShowLitterForm(false);
                  setLitterFormMode('create');
                  setEditLitter(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  console.log("Save button clicked, form mode:", litterFormMode);
                  console.log("Edit litter data:", editLitter);
                  if (litterFormMode === 'create') {
                    console.log("Calling createLitter()");
                    createLitter();
                  } else {
                    console.log("Calling updateLitter()");
                    updateLitter();
                  }
                }}>
                  Save Litter
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

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
    </div>
  );
}