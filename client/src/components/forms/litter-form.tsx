import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Dog, Litter } from "@db/schema";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface LitterFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  litter?: Litter;
  dogs?: Dog[];
}

export default function LitterForm({ open, onOpenChange, litter, dogs }: LitterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        description: `Failed to ${litter ? 'update' : 'create'} litter`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[95vw] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{litter ? 'Edit' : 'Add'} Litter</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
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

          <div className="flex justify-end gap-2 mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}