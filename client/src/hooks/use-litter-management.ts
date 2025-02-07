import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { Dog, Litter } from '@db/schema';

export function useLitterManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLitterForm, setShowLitterForm] = useState(false);
  const [litterFormMode, setLitterFormMode] = useState<'create' | 'edit'>('create');
  const [editLitter, setEditLitter] = useState<Litter & {
    mother?: Dog;
    father?: Dog;
    puppies?: Dog[];
  } | null>(null);

  const createLitter = async () => {
    try {
      if (!editLitter?.dueDate || !editLitter.motherId || !editLitter.fatherId) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const formattedLitter = {
        ...editLitter,
        dueDate: editLitter.dueDate,
      };

      const res = await fetch('/api/litters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedLitter),
      });

      if (!res.ok) throw new Error('Failed to create litter');

      const newLitter = await res.json();
      queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
      toast({
        title: 'Success',
        description: 'Litter created successfully',
      });
      setLitterFormMode('edit');
      setEditLitter({ ...newLitter, puppies: [] });
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
      if (!editLitter) return;

      const { puppies, mother, father, ...litterData } = editLitter;

      const dueDate = new Date(litterData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date');
      }

      const formattedLitter = {
        ...litterData,
        dueDate: dueDate.toISOString(),
      };

      const existingPuppies = puppies?.filter(p => p.id) || [];
      const newPuppies = puppies?.filter(p => !p.id) || [];

      const processedPuppies = existingPuppies.map(puppy => {
        const birthDate = new Date(puppy.birthDate);
        if (isNaN(birthDate.getTime())) {
          throw new Error('Invalid birth date for puppy');
        }

        return {
          id: puppy.id,
          name: puppy.name,
          gender: puppy.gender,
          birthDate: birthDate.toISOString(),
          description: puppy.description || '',
          color: puppy.color || '',
          height: puppy.height ? parseFloat(puppy.height.toString()) : null,
          weight: puppy.weight ? parseFloat(puppy.weight.toString()) : null,
          price: puppy.price ? parseInt(puppy.price.toString(), 10) : null,
          puppy: true,
          motherId: formattedLitter.motherId,
          fatherId: formattedLitter.fatherId,
          litterId: formattedLitter.id,
          breed: puppy.breed || '',
          profileImageUrl: puppy.profileImageUrl || '',
        };
      });

      const res = await fetch(`/api/litters/${formattedLitter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formattedLitter,
          puppies: processedPuppies,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || 'Failed to update litter');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/litters'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dogs'] });

      toast({
        title: "Success",
        description: "Litter updated successfully",
      });

      setShowLitterForm(false);
    } catch (error: any) {
      console.error('Error updating litter:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to update litter',
        variant: "destructive",
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