import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Goat, GoatLitter } from "@db/schema";
import GoatForm from "@/components/forms/goat-form";
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
    editLitter,
    setEditLitter,
    createLitter,
    updateLitter
  } = useGoatLitterManagement();

  const { data: goats = [] } = useQuery<Goat[]>({
    queryKey: ["/api/goats"]
  });

  const { data: litters = [] } = useQuery<GoatLitter[]>({
    queryKey: ["/api/goat-litters"]
  });

  const handleAddKid = (litter: GoatLitter) => {
    const mother = goats.find(g => g.id === litter.motherId);
    const father = goats.find(g => g.id === litter.fatherId);

    const kidDefaults = {
      name: "",
      kid: true,
      litterId: litter.id,
      motherId: litter.motherId,
      fatherId: litter.fatherId,
      mother,
      father,
      birthDate: new Date(litter.dueDate).toISOString().split('T')[0],
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
    const mother = goats.find(g => g.id === litter.motherId);
    const father = goats.find(g => g.id === litter.fatherId);
    const litterKids = goats.filter(g => g.litterId === litter.id);

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
            Due Date: {formatDisplayDate(new Date(litter.dueDate))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Parents Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Mother */}
            <div className="flex items-center gap-3 p-2 rounded-lg">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
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
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
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
                  <AlertDialogAction onClick={async () => {
                    try {
                      await fetch(`/api/goat-litters/${litter.id}`, {
                        method: 'DELETE',
                      });
                      
                      // Refetch data
                      queryClient.invalidateQueries({ queryKey: ['/api/goat-litters'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/goats'] });
                      
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
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setShowLitterForm(false)}>
                  Cancel
                </Button>
                <Button onClick={litterFormMode === 'create' ? createLitter : updateLitter}>
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
