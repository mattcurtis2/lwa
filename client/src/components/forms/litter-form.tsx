import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Dog, Litter } from "@db/schema";
import { Plus, X } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDisplayDate } from "@/lib/date-utils";

interface LitterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  litter?: Litter;
  mode?: 'create' | 'edit' | 'addPuppies';
}

interface PuppyFormData {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  color?: string;
  description?: string;
}

export default function LitterForm({ open, onOpenChange, litter, mode = 'create' }: LitterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [puppies, setPuppies] = useState<PuppyFormData[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'addPuppies' && puppies.length > 0) {
        // Create puppies
        for (const puppy of puppies) {
          const puppyData = {
            ...puppy,
            motherId: litter?.motherId,
            fatherId: litter?.fatherId,
            litterId: litter?.id,
          };

          const res = await fetch('/api/dogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(puppyData),
          });

          if (!res.ok) {
            const error = await res.text();
            throw new Error(error || 'Failed to create puppy');
          }
        }

        queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });
        toast({
          title: "Success",
          description: `${puppies.length} puppies added to the litter`,
        });
      } else {
        // Regular litter creation/update
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
      }
      onOpenChange(false);
      setPuppies([]); // Reset puppies after successful submission
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

  const addPuppy = () => {
    setPuppies(prev => [...prev, {
      name: '',
      gender: 'male',
      birthDate: new Date().toISOString().split('T')[0],
      color: '',
      description: '',
    }]);
  };

  const removePuppy = (index: number) => {
    setPuppies(prev => prev.filter((_, i) => i !== index));
  };

  const updatePuppy = (index: number, field: keyof PuppyFormData, value: string) => {
    setPuppies(prev => prev.map((puppy, i) => 
      i === index ? { ...puppy, [field]: value } : puppy
    ));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95vw] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === 'addPuppies' ? 'Add Puppies to Litter' : litter ? 'Edit Litter' : 'Add Litter'}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="father">Father</Label>
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
                  <h3 className="font-medium mb-1">Add Puppies</h3>
                  <p className="text-sm text-muted-foreground">
                    Add puppies to {litter?.mother?.name} x {litter?.father?.name}'s litter
                  </p>
                </div>
                <Button type="button" onClick={addPuppy} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Puppy
                </Button>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {puppies.map((puppy, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative bg-muted/50">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => removePuppy(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={puppy.name}
                          onChange={(e) => updatePuppy(index, 'name', e.target.value)}
                          placeholder="Puppy name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select
                          value={puppy.gender}
                          onValueChange={(value) => updatePuppy(index, 'gender', value as 'male' | 'female')}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Birth Date</Label>
                        <Input
                          type="date"
                          value={puppy.birthDate}
                          onChange={(e) => updatePuppy(index, 'birthDate', e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Color</Label>
                        <Input
                          value={puppy.color || ''}
                          onChange={(e) => updatePuppy(index, 'color', e.target.value)}
                          placeholder="Puppy color"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={puppy.description || ''}
                          onChange={(e) => updatePuppy(index, 'description', e.target.value)}
                          placeholder="Brief description of the puppy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {puppies.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Add Puppy" to start adding puppies to this litter
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (mode === 'addPuppies' && puppies.length === 0)}>
              {isLoading ? 'Saving...' : mode === 'addPuppies' ? 'Add Puppies' : 'Save'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}