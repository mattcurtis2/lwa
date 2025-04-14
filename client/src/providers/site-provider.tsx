import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface Site {
  id: number;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

interface SiteContextType {
  currentSiteId: number;
  setCurrentSiteId: (id: number) => void;
  sites: Site[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [currentSiteId, setCurrentSiteId] = useState<number>(1); // Default to first site (Little Way Acres)
  
  const { data: sites, isLoading, error } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
    retry: 1,
  });

  // If sites are loaded and we have a saved preference, use it
  useEffect(() => {
    const savedSiteId = localStorage.getItem("currentSiteId");
    if (savedSiteId && sites?.some(site => site.id === parseInt(savedSiteId))) {
      setCurrentSiteId(parseInt(savedSiteId));
    }
  }, [sites]);

  // When site changes, save preference
  useEffect(() => {
    if (currentSiteId) {
      localStorage.setItem("currentSiteId", currentSiteId.toString());
    }
  }, [currentSiteId]);

  return (
    <SiteContext.Provider 
      value={{ 
        currentSiteId, 
        setCurrentSiteId, 
        sites, 
        isLoading, 
        error: error as Error | null 
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}