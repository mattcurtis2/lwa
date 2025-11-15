import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Goat, GoatLitter } from "@db/schema";
import GoatForm from "@/components/forms/goat-form";
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
import { useGoatLitterManagement } from "@/hooks/use-goat-litter-management";
import { X, Plus } from "lucide-react";

export default function GoatLitterManagement() {
  const { toast } = useToast();
  const [showGoatForm, setShowGoatForm] = useState(false);
  const [selectedGoat, setSelectedGoat] = useState<Partial<Goat> | null>(null);
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
  } = useGoatLitterManagement();

  const { data: goats = [] } = useQuery<Goat[]>({
    queryKey: ["/api/goats"]
  });

  const { data: litters = [] } = useQuery<GoatLitter[]>({
    queryKey: ["/api/goat-litters"]
  });

  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url === 'data:,' || url === 'data:') return false;
    return true;
  };

  const handleAddKid = (litter: GoatLitter & { mother?: Goat; father?: Goat; kids?: Goat[] }) => {
    const mother = litter.mother;
    const father = litter.father;

    const kidDefaults = {
      name: "",
      kid: true,
      litterId: litter.id,
      motherId: litter.motherId,
      fatherId: litter.fatherId,
      mother,
      father,
      birthDate: formatApiDate(litter.dueDate),
      gender: 'female',
      available: false,
      breed: "Nigerian Dwarf",
      outsideBreeder: false,
      registrationName: "",
      description: "",
      profileImageUrl: "",
      media: [],
      documents: []
    };

    setSelectedGoat(kidDefaults);
    setShowGoatForm(true);
  };

  const renderLitterCard = (litter: GoatLitter & { mother?: Goat; father?: Goat; kids?: Goat[] }) => {
    const mother = litter.mother;
    const father = litter.father;
    // Use kids from litter data and ensure uniqueness by ID to prevent any duplicates
    const rawKids = litter.kids || [];
    const litterKids = rawKids.filter((kid, index, array) => 
      array.findIndex(k => k.id === kid.id) === index
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
              onClick={() => handleAddKid(litter)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Kid
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

          {/* Kids Section */}
          {litterKids.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Kids</h4>
              <div className="grid gap-4">
                {litterKids.map((kid) => (
                  <div
                    key={kid.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                        {kid.profileImageUrl ? (
                          <img
                            src={kid.profileImageUrl}
                            alt={kid.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${
                            kid.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
                          }`}>
                            <span className={`text-xl ${
                              kid.gender === 'female' ? 'text-pink-500' : 'text-blue-500'
                            }`}>
                              {kid.gender === 'female' ? '♀' : '♂'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{kid.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {kid.gender} • {kid.color || 'No color set'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedGoat(kid);
                        setShowGoatForm(true);
                      }}
                    >
                      Edit Kid
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
                    This will permanently delete this litter and all associated kids. This action cannot be undone.
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
                setEditLitter({ ...litter, mother, father, kids: litterKids });
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
      <h2 className="text-2xl font-semibold mb-2">Goat Litters Management</h2>
      <p className="text-muted-foreground mb-6">Manage upcoming and current goat litters</p>
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
                      const mother = goats.find(g => g.id === parseInt(value));
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
                      {goats
                        .filter(g => g.gender === 'female' && !g.kid)
                        .map(goat => (
                          <SelectItem key={goat.id} value={goat.id.toString()}>
                            {goat.name}
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
                      const father = goats.find(g => g.id === parseInt(value));
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
                      {goats
                        .filter(g => g.gender === 'male' && !g.kid)
                        .map(goat => (
                          <SelectItem key={goat.id} value={goat.id.toString()}>
                            {goat.name}
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
                      <p className="text-xs text-muted-foreground">This will be used for both breeding and expected kid availability</p>
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

        {/* Goat Form Sheet */}
        {showGoatForm && (
          <Sheet open={showGoatForm} onOpenChange={() => setShowGoatForm(false)}>
            <SheetContent side="right" className="w-[95vw] sm:max-w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{selectedGoat?.id ? 'Edit Kid' : 'Add New Kid'}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <GoatForm
                  open={showGoatForm}
                  onOpenChange={() => setShowGoatForm(false)}
                  goat={selectedGoat as Goat}
                  mode={selectedGoat?.id ? 'edit' : 'create'}
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
