
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { GoatLitter, Goat } from "@db/schema";

interface ExtendedGoatLitter extends GoatLitter {
  mother?: Goat;
  father?: Goat;
  kids?: Goat[];
}

export function useGoatLitterManagement() {
  const { toast } = useToast();
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [litterFormMode, setLitterFormMode] = useState<'create' | 'edit'>('create');
  const [editLitter, setEditLitter] = useState<ExtendedGoatLitter | null>(null);

  const createLitter = async () => {
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
          dueDate: editLitter.dueDate,
          isVisible: true
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
      setShowLitterForm(false);
      setEditLitter(null);
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
          dueDate: editLitter.dueDate,
          isVisible: editLitter.isVisible
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

  return {
    showLitterForm,
    setShowLitterForm,
    litterFormMode,
    setLitterFormMode,
    editLitter,
    setEditLitter,
    createLitter,
    updateLitter
  };
}
