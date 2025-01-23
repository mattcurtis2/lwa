import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Dog, Litter } from "@db/schema";
import { Plus, X, Upload, Edit } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDisplayDate } from "@/lib/date-utils";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import DogForm from "./dog-form"; // Import the shared dog form component

interface LitterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  litter?: Litter;
  mode?: 'create' | 'edit' | 'addPuppies';
}

export default function LitterForm({ open, onOpenChange, litter, mode = 'create' }: LitterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dogs } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
  });

  const [formData, setFormData] = useState<Partial<Litter>>({
    dueDate: litter?.dueDate || "",
    motherId: litter?.motherId || 0,
    fatherId: litter?.fatherId || 0,
    isVisible: litter?.isVisible ?? true,
  });

  const females = dogs?.filter(dog => dog.gender === 'female') || [];
  const males = dogs?.filter(dog => dog.gender === 'male') || [];

  const handleEditDog = (dog: Dog) => {
    setSelectedDog(dog);
    setShowDogForm(true);
  };

  const handleAddNewPuppy = () => {
    setSelectedDog({
      // Pre-fill puppy information
      puppy: true,
      litterId: litter?.id,
      motherId: litter?.motherId,
      fatherId: litter?.fatherId,
      birthDate: new Date().toISOString().split('T')[0],
      gender: 'male', // Default gender
      available: false,
    });
    setShowDogForm(true);
  };

  const handleDogFormClose = () => {
    setShowDogForm(false);
    setSelectedDog(null);
    // Refresh the dogs data
    queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = litter ? `/api/litters/${litter.id}` : '/api/litters';
      const method = litter ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save litter');

      queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
      toast({
        title: "Success",
        description: `Litter ${litter ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[95vw] sm:max-w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {mode === 'addPuppies' ? 'Manage Puppies' : litter ? 'Edit Litter' : 'Add Litter'}
            </SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            {mode !== 'addPuppies' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mother">Mother</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.motherId?.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, motherId: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mother" />
                      </SelectTrigger>
                      <SelectContent>
                        {females.map((dog) => (
                          <SelectItem key={dog.id} value={dog.id.toString()}>
                            {dog.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.motherId ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditDog(females.find(d => d.id === formData.motherId)!)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="father">Father</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.fatherId?.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, fatherId: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select father" />
                      </SelectTrigger>
                      <SelectContent>
                        {males.map((dog) => (
                          <SelectItem key={dog.id} value={dog.id.toString()}>
                            {dog.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.fatherId ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditDog(males.find(d => d.id === formData.fatherId)!)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVisible"
                    checked={formData.isVisible ?? false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
                  />
                  <Label htmlFor="isVisible">Show announcement banner</Label>
                </div>
              </>
            )}

            {mode === 'addPuppies' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium mb-1">Manage Puppies</h3>
                    <p className="text-sm text-muted-foreground">
                      Add or edit puppies in this litter
                    </p>
                  </div>
                  <Button type="button" onClick={handleAddNewPuppy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Puppy
                  </Button>
                </div>

                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {dogs?.filter(dog => dog.litterId === litter?.id).map((puppy) => (
                      <div key={puppy.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {puppy.profileImageUrl && (
                              <img
                                src={puppy.profileImageUrl}
                                alt={puppy.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-medium">{puppy.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {puppy.gender}, Born: {formatDisplayDate(new Date(puppy.birthDate))}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditDog(puppy)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-8">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Dog Form Modal */}
      {showDogForm && (
        <DogForm
          open={showDogForm}
          onOpenChange={handleDogFormClose}
          dog={selectedDog}
          mode={selectedDog?.id ? 'edit' : 'create'}
          isPuppy={true}
          defaultValues={selectedDog}
          onSubmit={async (values) => {
            console.log('LitterForm - Starting puppy submission with values:', values);
            try {
              const url = selectedDog?.id ? `/api/dogs/${selectedDog.id}` : '/api/dogs';
              const method = selectedDog?.id ? 'PUT' : 'POST';

              const submissionData = {
                ...values,
                litterId: litter?.id,
                motherId: litter?.motherId,
                fatherId: litter?.fatherId,
              };

              console.log('LitterForm - Submitting puppy data:', submissionData);
              console.log('LitterForm - API URL:', url);
              console.log('LitterForm - Method:', method);

              const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
              });

              if (!res.ok) {
                const errorText = await res.text();
                console.error('LitterForm - API Error Response:', {
                  status: res.status,
                  statusText: res.statusText,
                  body: errorText
                });
                throw new Error(`Failed to save puppy: ${errorText}`);
              }

              const responseData = await res.json();
              console.log('LitterForm - API Success Response:', responseData);

              queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
              toast({
                title: "Success",
                description: `Puppy ${selectedDog?.id ? 'updated' : 'created'} successfully`,
              });
              handleDogFormClose();
            } catch (error) {
              console.error('LitterForm - Error in puppy submission:', error);
              toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to save puppy',
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </>
  );
}