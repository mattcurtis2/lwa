import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { GoatLitter, Goat } from "@db/schema";
import { formatApiDate } from "@/lib/date-utils";

interface ExtendedGoatLitter extends GoatLitter {
  mother?: Goat;
  father?: Goat;
  kids?: Goat[];
  waitlistLink?: string | null;
}

export function useGoatLitterManagement() {
  const { toast } = useToast();
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [litterFormMode, setLitterFormMode] = useState<'create' | 'edit'>('create');
  const [editLitter, setEditLitter] = useState<ExtendedGoatLitter | null>(null);
  
  // This effect will ensure the form state is properly reset when the form is closed
  useEffect(() => {
    if (!showLitterForm) {
      console.log("Form closed - Resetting form mode to 'create'");
      // We'll reset this on form close, not on form open with a litter
      setLitterFormMode('create');
    }
  }, [showLitterForm]);

  const createLitter = async () => {
    console.log("Creating litter with mode:", litterFormMode, "and data:", editLitter);
    try {
      if (!editLitter?.motherId || !editLitter?.fatherId || !editLitter?.dueDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch("/api/goat-litters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          motherId: editLitter.motherId,
          fatherId: editLitter.fatherId,
          dueDate: formatApiDate(editLitter.dueDate),
          isVisible: editLitter.isVisible ?? true,
          isCurrentLitter: editLitter.isCurrentLitter || false,
          isPastLitter: editLitter.isPastLitter || false,
          isPlannedLitter: editLitter.isPlannedLitter || false,
          expectedBreedingDate: editLitter.expectedBreedingDate ? formatApiDate(editLitter.expectedBreedingDate) : null,
          expectedPickupDate: editLitter.expectedPickupDate ? formatApiDate(editLitter.expectedPickupDate) : null,
          waitlistLink: editLitter.waitlistLink || null
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const newLitter = await res.json();
      queryClient.invalidateQueries({ queryKey: ['/api/goat-litters'] });
      toast({
        title: 'Success',
        description: 'Litter created successfully',
      });
      setLitterFormMode('edit');
      setEditLitter(null);
      setShowLitterForm(false);
    } catch (error) {
      console.error('Error creating litter:', error);
      toast({
        title: 'Error',
        description: 'Failed to create litter',
        variant: 'destructive',
      });
    }
  };

  const updateLitter = async () => {
    console.log("Updating litter with mode:", litterFormMode, "and data:", editLitter);
    try {
      if (!editLitter?.id || !editLitter?.motherId || !editLitter?.fatherId || !editLitter?.dueDate) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`/api/goat-litters/${editLitter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          motherId: editLitter.motherId,
          fatherId: editLitter.fatherId,
          dueDate: formatApiDate(editLitter.dueDate),
          isVisible: editLitter.isVisible,
          isCurrentLitter: editLitter.isCurrentLitter || false,
          isPastLitter: editLitter.isPastLitter || false,
          isPlannedLitter: editLitter.isPlannedLitter || false,
          expectedBreedingDate: editLitter.expectedBreedingDate ? formatApiDate(editLitter.expectedBreedingDate) : null,
          expectedPickupDate: editLitter.expectedPickupDate ? formatApiDate(editLitter.expectedPickupDate) : null,
          waitlistLink: editLitter.waitlistLink || null
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      queryClient.invalidateQueries({ queryKey: ['/api/goat-litters'] });
      toast({
        title: 'Success',
        description: 'Litter updated successfully',
      });
      setShowLitterForm(false);
      setEditLitter(null);
    } catch (error) {
      console.error('Error updating litter:', error);
      toast({
        title: 'Error',
        description: 'Failed to update litter',
        variant: 'destructive',
      });
    }
  };

  const deleteLitter = async (litterId: number) => {
    try {
      const res = await fetch(`/api/goat-litters/${litterId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

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
  };

  return {
    showLitterForm,
    setShowLitterForm,
    litterFormMode,
    setLitterFormMode,
    editLitter,
    setEditLitter,
    createLitter,
    updateLitter,
    deleteLitter
  };
}