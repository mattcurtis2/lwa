import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sheep, SheepLitter } from "@db/schema";
import SheepForm from "@/components/admin/sheep-form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatApiDate, parseApiDate } from "@/lib/date-utils";
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
import { useSheepLitterManagement } from "@/hooks/use-sheep-litter-management";
import { X, Plus } from "lucide-react";

export default function SheepLitterManagement() {
  const { toast } = useToast();
  const [showSheepForm, setShowSheepForm] = useState(false);
  const [selectedSheep, setSelectedSheep] = useState<Partial<Sheep> | null>(null);
  const {
    showLitterForm,
    setShowLitterForm,
    litterFormMode,
    setLitterFormMode,
    editLitter,
    setEditLitter,
    createLitter,
    updateLitter,
    deleteLitter
  } = useSheepLitterManagement();

  const { data: sheep = [] } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep"]
  });

  const { data: litters = [] } = useQuery<SheepLitter[]>({
    queryKey: ["/api/sheep-litters"]
  });

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url === 'data:,' || url === 'data:') return false;
    return true;
  };



  const handleAddLamb = (litter: SheepLitter & { mother?: Sheep; father?: Sheep; lambs?: Sheep[] }) => {
    const mother = litter.mother;
    const father = litter.father;

    const lambDefaults = {
      name: "",
      lamb: true,
      litterId: litter.id,
      motherId: litter.motherId,
      fatherId: litter.fatherId,
      mother,
      father,
      birthDate: formatApiDate(litter.dueDate),
      gender: 'female',
      available: false,
      breed: "Katahdin",
      outsideBreeder: false,
      registrationName: "",
      description: "",
      profileImageUrl: "",
      media: [],
      documents: []
    };

    setSelectedSheep(lambDefaults);
    setShowSheepForm(true);
  };

  const renderLitterCard = (litter: SheepLitter & { mother?: Sheep; father?: Sheep; lambs?: Sheep[] }) => {
    const mother = litter.mother;
    const father = litter.father;
    // Use lambs from litter data and ensure uniqueness by ID to prevent any duplicates
    const rawLambs = litter.lambs || [];
    const litterLambs = rawLambs.filter((lamb, index, array) => 
      array.findIndex(l => l.id === lamb.id) === index
    );
    


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
              onClick={() => handleAddLamb(litter)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lamb
            </Button>
          </div>
          <CardDescription>
            Due Date: {formatDisplayDate(parseApiDate(litter.dueDate))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Parents Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Mother */}
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {isValidImageUrl(mother?.profileImageUrl) ? (
                  <img
                    src={mother.profileImageUrl}
                    alt={mother.name}
                    className="w-full h-full object-cover"
                  />
                ) : mother?.media && mother.media.length > 0 && mother.media[0].type === 'image' ? (
                  <img
                    src={mother.media[0].url}
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
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {isValidImageUrl(father?.profileImageUrl) ? (
                  <img
                    src={father.profileImageUrl}
                    alt={father.name}
                    className="w-full h-full object-cover"
                  />
                ) : father?.media && father.media.length > 0 && father.media[0].type === 'image' ? (
                  <img
                    src={father.media[0].url}
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

          {/* Lambs Section */}
          {litterLambs.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Lambs</h4>
              <div className="grid gap-4">
                {litterLambs.map((lamb) => (
                  <div
                    key={lamb.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        {lamb.profileImageUrl ? (
                          <img
                            src={lamb.profileImageUrl}
                            alt={lamb.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            lamb.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                          }`}>
                            <span className={`text-xl ${
                              lamb.gender === 'female' ? 'text-pink-500' : 'text-blue-500'
                            }`}>
                              {lamb.gender === 'female' ? '♀' : '♂'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{lamb.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lamb.gender} • {lamb.color || 'No color set'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSheep(lamb);
                        setShowSheepForm(true);
                      }}
                    >
                      Edit Lamb
                    </Button>
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
                    This will permanently delete this litter and all associated lambs. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteLitter(litter.id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              onClick={() => {
                setLitterFormMode('edit');
                setEditLitter({ ...litter, mother, father, lambs: litterLambs });
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
      <h2 className="text-2xl font-semibold mb-2">Sheep Litters Management</h2>
      <p className="text-muted-foreground mb-6">Manage upcoming and current sheep litters</p>
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
            waitlistLink: null,
            createdAt: null,
            updatedAt: null
          });
          setShowLitterForm(true);
        }}>
          Add New Litter
        </Button>

        <div className="grid gap-4">
          {litters?.map((litter) => renderLitterCard(litter))}
        </div>

        <Sheet 
          open={showLitterForm} 
          onOpenChange={(open) => {
            if (!open) {
              // Just close the form - the useEffect in the hook 
              // will handle the reset of form state
              setShowLitterForm(false);
            }
          }}>
          <SheetContent side="right" className="w-1/3 max-w-[95vw] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {litterFormMode === 'create' ? 'Create New Litter' : 'Edit Litter'}
              </SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6 pb-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Mother</Label>
                  <Select
                    value={editLitter?.motherId?.toString() || ""}
                    onValueChange={(value) => {
                      const mother = sheep.find(s => s.id === parseInt(value));
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
                      {sheep
                        .filter(s => s.gender === 'female' && !s.lamb)
                        .map(animal => (
                          <SelectItem key={animal.id} value={animal.id.toString()}>
                            {animal.name}
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
                      const father = sheep.find(s => s.id === parseInt(value));
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
                      {sheep
                        .filter(s => s.gender === 'male' && !s.lamb)
                        .map(animal => (
                          <SelectItem key={animal.id} value={animal.id.toString()}>
                            {animal.name}
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
                    <Label htmlFor="isVisible">Is Visible</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isCurrentLitter" 
                      checked={editLitter?.isCurrentLitter} 
                      onCheckedChange={(checked) => 
                        setEditLitter(prev => ({
                          ...prev!,
                          isCurrentLitter: !!checked,
                          // If marking as current, uncheck planned and past
                          isPlannedLitter: checked ? false : prev!.isPlannedLitter,
                          isPastLitter: checked ? false : prev!.isPastLitter,
                        }))
                      } 
                    />
                    <Label htmlFor="isCurrentLitter">Current Litter</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isPastLitter" 
                      checked={editLitter?.isPastLitter} 
                      onCheckedChange={(checked) => 
                        setEditLitter(prev => ({
                          ...prev!,
                          isPastLitter: !!checked,
                          // If marking as past, uncheck current and planned
                          isCurrentLitter: checked ? false : prev!.isCurrentLitter,
                          isPlannedLitter: checked ? false : prev!.isPlannedLitter,
                        }))
                      } 
                    />
                    <Label htmlFor="isPastLitter">Past Litter</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isPlannedLitter" 
                      checked={editLitter?.isPlannedLitter} 
                      onCheckedChange={(checked) => 
                        setEditLitter(prev => ({
                          ...prev!,
                          isPlannedLitter: !!checked,
                          // If marking as planned, uncheck current and past
                          isCurrentLitter: checked ? false : prev!.isCurrentLitter,
                          isPastLitter: checked ? false : prev!.isPastLitter,
                        }))
                      } 
                    />
                    <Label htmlFor="isPlannedLitter">Planned Litter</Label>
                  </div>
                </div>

                {editLitter?.isPlannedLitter && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-medium">Planned Litter Details</h4>
                    <div className="space-y-2">
                      <Label>Expected Breeding Month</Label>
                      <Input
                        type="month"
                        value={editLitter?.expectedBreedingDate ? editLitter.expectedBreedingDate.substring(0, 7) : ""}
                        onChange={(e) => setEditLitter(prev => ({
                          ...prev!,
                          expectedBreedingDate: e.target.value ? `${e.target.value}-01` : null,
                          expectedPickupDate: e.target.value ? `${e.target.value}-01` : null, // Use same month for both
                        }))}
                      />
                      <p className="text-xs text-muted-foreground">This will be used for both breeding and expected lamb availability</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Waitlist Sign-up Link</Label>
                      <Input
                        type="url"
                        placeholder="https://docs.google.com/forms/..."
                        value={editLitter?.waitlistLink || ""}
                        onChange={(e) => setEditLitter(prev => ({
                          ...prev!,
                          waitlistLink: e.target.value || null,
                        }))}
                      />
                      <p className="text-xs text-muted-foreground">Link where visitors can sign up for the litter waitlist</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 sticky bottom-0 bg-background border-t mt-6 py-4 -mx-6 px-6">
                <Button variant="outline" onClick={() => {
                  // Just close the form - the useEffect in the hook 
                  // will handle resetting the state
                  setShowLitterForm(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  console.log("Save button clicked, form mode:", litterFormMode);
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

        {/* Sheep Form Sheet */}
        {showSheepForm && (
          <Sheet open={showSheepForm} onOpenChange={() => setShowSheepForm(false)}>
            <SheetContent side="right" className="w-[95vw] sm:max-w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{selectedSheep?.id ? 'Edit Lamb' : 'Add New Lamb'}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <SheepForm
                  open={showSheepForm}
                  onOpenChange={() => setShowSheepForm(false)}
                  sheep={selectedSheep as Sheep}
                  mode={selectedSheep?.id ? 'edit' : 'create'}
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
