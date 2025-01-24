
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { SiteContent, Principle, ContactInfo } from '@db/schema';

export function useContentManagement(
  siteContent: SiteContent[],
  principlesData: Principle[],
  contactInfo: ContactInfo
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pendingContent, setPendingContent] = useState<Record<string, string>>({});
  const [pendingPrinciples, setPendingPrinciples] = useState<Principle[]>([]);
  const [pendingContactInfo, setPendingContactInfo] = useState<Partial<ContactInfo>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (siteContent?.length > 0) {
      const initialContent: Record<string, string> = {};
      siteContent.forEach((item) => {
        initialContent[item.key] = item.value;
      });
      setPendingContent(initialContent);
    }
  }, [siteContent]);

  useEffect(() => {
    if (principlesData) {
      const sortedPrinciples = [...principlesData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setPendingPrinciples(sortedPrinciples);
    }
  }, [principlesData]);

  useEffect(() => {
    if (contactInfo) {
      setPendingContactInfo(contactInfo);
    }
  }, [contactInfo]);

  const updateSiteContent = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      const results = await Promise.all(
        updates.map(async ({ key, value }) => {
          const formData = new FormData();
          formData.append('value', value);

          const isImageContent = key === 'hero_background';
          const headers: Record<string, string> = {};
          
          if (!isImageContent) {
            headers['Content-Type'] = 'application/json';
          }

          const response = await fetch(`/api/site-content/${key}`, {
            method: "PUT",
            headers,
            body: isImageContent ? formData : JSON.stringify({ value }),
          });

          if (!response.ok) throw new Error(`Failed to update ${key}`);
          return response.json();
        })
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-content"] });
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    }
  });

  const handleContentChange = (key: string, value: string) => {
    setPendingContent(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handlePrincipleChange = (id: number, field: string, value: string) => {
    setPendingPrinciples(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
    setHasUnsavedChanges(true);
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    setPendingContactInfo(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  return {
    pendingContent,
    pendingPrinciples,
    pendingContactInfo,
    hasUnsavedChanges,
    updateSiteContent,
    handleContentChange,
    handlePrincipleChange,
    handleContactChange,
    setPendingPrinciples,
    setHasUnsavedChanges
  };
}
