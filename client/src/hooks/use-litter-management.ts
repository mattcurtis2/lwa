import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { Dog, Litter } from '@db/schema';
import { formatApiDate } from '@/lib/date-utils';

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

      const { dueDate, motherId, fatherId, isVisible, isCurrentLitter, isPastLitter, isPlannedLitter, expectedBreedingDate, expectedPickupDate, waitlistLink } = editLitter;
      const formattedLitter = {
        dueDate: formatApiDate(dueDate),
        motherId,
        fatherId,
        isVisible,
        isCurrentLitter: isCurrentLitter || false,
        isPastLitter: isPastLitter || false,
        isPlannedLitter: isPlannedLitter || false,
        expectedBreedingDate: expectedBreedingDate ? formatApiDate(expectedBreedingDate) : null,
        expectedPickupDate: expectedPickupDate ? formatApiDate(expectedPickupDate) : null,
        waitlistLink: waitlistLink || null
      };

      console.log('Sending litter data:', formattedLitter);

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
    try {
      if (!editLitter) return;

      const { puppies, mother, father, ...litterData } = editLitter;

      const dueDate = new Date(litterData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date');
      }

      const formattedLitter = {
        dueDate: formatApiDate(litterData.dueDate),
        motherId: litterData.motherId,
        fatherId: litterData.fatherId,
        isVisible: litterData.isVisible,
        isCurrentLitter: litterData.isCurrentLitter || false,
        isPastLitter: litterData.isPastLitter || false,
        isPlannedLitter: litterData.isPlannedLitter || false,
        expectedBreedingDate: litterData.expectedBreedingDate ? formatApiDate(litterData.expectedBreedingDate) : null,
        expectedPickupDate: litterData.expectedPickupDate ? formatApiDate(litterData.expectedPickupDate) : null,
        waitlistLink: litterData.waitlistLink || null
      };

      const res = await fetch(`/api/litters/${litterData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedLitter),
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