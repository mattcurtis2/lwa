import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StyleSettings } from '@db/schema';

type StylesContextType = {
  styles: Record<string, string>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

const StylesContext = createContext<StylesContextType>({
  styles: {},
  isLoading: false,
  isError: false,
  refetch: () => {},
});

export const useStyles = () => useContext(StylesContext);

type StylesProviderProps = {
  children: ReactNode;
};

export const StylesProvider: React.FC<StylesProviderProps> = ({ children }) => {
  const [styleMap, setStyleMap] = useState<Record<string, string>>({});
  
  // Fetch styles from API
  const { data, isLoading, isError, refetch } = useQuery<StyleSettings[]>({
    queryKey: ['styles'],
    queryFn: async () => {
      const response = await fetch('/api/styles');
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      return response.json();
    },
  });
  
  // Apply styles when data changes
  useEffect(() => {
    if (data) {
      // Create a map of style keys to values for easy access
      const newStyleMap: Record<string, string> = {};
      data.forEach(style => {
        newStyleMap[style.key] = style.value;
      });
      setStyleMap(newStyleMap);
      
      // Apply the styles as CSS variables
      const styleEl = document.getElementById('global-styles') || document.createElement('style');
      styleEl.id = 'global-styles';
      
      let cssVars = `:root {\n`;
      data.forEach(style => {
        cssVars += `  --${style.key}: ${style.value};\n`;
      });
      cssVars += `}\n`;
      
      styleEl.innerHTML = cssVars;
      
      if (!document.getElementById('global-styles')) {
        document.head.appendChild(styleEl);
      }
    }
  }, [data]);
  
  return (
    <StylesContext.Provider
      value={{
        styles: styleMap,
        isLoading,
        isError,
        refetch,
      }}
    >
      {children}
    </StylesContext.Provider>
  );
};