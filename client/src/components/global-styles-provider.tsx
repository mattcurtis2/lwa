import { useQuery } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";

interface StyleSettings {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GlobalStylesProviderProps {
  children: ReactNode;
}

export default function GlobalStylesProvider({ children }: GlobalStylesProviderProps) {
  // Fetch styles from API
  const { data: styles, refetch } = useQuery({
    queryKey: ['global-styles'],
    queryFn: async () => {
      const response = await fetch('/api/styles');
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      return response.json() as Promise<StyleSettings[]>;
    },
    // Refresh styles every 30 seconds to detect changes from other users/tabs
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (styles && styles.length > 0) {
      // Apply styles as CSS variables
      const root = document.documentElement;

      // Apply all styles as CSS variables
      styles.forEach(style => {
        const cssVarName = `--${style.key}`;
        root.style.setProperty(cssVarName, style.value);
      });

      // Apply specific styles that affect theme.json colors
      const primaryColor = styles.find(s => s.key === 'primaryColor')?.value || '';
      const secondaryColor = styles.find(s => s.key === 'secondaryColor')?.value || '';
      const accentColor = styles.find(s => s.key === 'accentColor')?.value || '';
      const backgroundColor = styles.find(s => s.key === 'backgroundColor')?.value || '';
      const textColor = styles.find(s => s.key === 'textColor')?.value || '';

      // These variables are used in Tailwind CSS and are already defined
      if (primaryColor) root.style.setProperty('--primary', primaryColor);
      if (secondaryColor) root.style.setProperty('--secondary', secondaryColor);
      if (accentColor) root.style.setProperty('--accent', accentColor);
      if (backgroundColor) root.style.setProperty('--background', backgroundColor);
      if (textColor) root.style.setProperty('--foreground', textColor);
      
      console.log('Applied global styles from database:', styles.map(s => `${s.key}: ${s.value}`).join(', '));
    }
  }, [styles]);

  // Force refresh styles when page visibility changes (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  return <>{children}</>;
}