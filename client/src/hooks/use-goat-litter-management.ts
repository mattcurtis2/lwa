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
  const [editLitter, setEditLitter] = useState<ExtendedGoatLitter | null>(null);

  const litterFormMode = editLitter?.id ? 'edit' : 'create';

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
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      queryClient.invalidateQueries({ queryKey: ["/api/goat-litters"] });
      setShowLitterForm(false);
      setEditLitter(null);

      toast({
        title: "Success",
        description: "Litter created successfully",
      });
    } catch (error) {
      console.error("Error creating litter:", error);
      toast({
        title: "Error",
        description: "Failed to create litter",
        variant: "destructive",
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
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      queryClient.invalidateQueries({ queryKey: ["/api/goat-litters"] });
      setShowLitterForm(false);
      setEditLitter(null);

      toast({
        title: "Success",
        description: "Litter updated successfully",
      });
    } catch (error) {
      console.error("Error updating litter:", error);
      toast({
        title: "Error",
        description: "Failed to update litter",
        variant: "destructive",
      });
    }
  };

  return {
    showLitterForm,
    setShowLitterForm,
    editLitter,
    setEditLitter,
    litterFormMode,
    createLitter,
    updateLitter,
  };
}
