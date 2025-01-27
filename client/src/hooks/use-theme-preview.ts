import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ThemePreview {
  isPreviewMode: boolean;
  previewStyles: Record<string, string>;
}

export function useThemePreview(): ThemePreview {
  const [location] = useLocation();
  const [previewStyles, setPreviewStyles] = useState<Record<string, string>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const themeParams = Array.from(params.entries())
        .filter(([key]) => key.startsWith('theme-'))
        .reduce((acc, [key, value]) => {
          const cssKey = key.replace('theme-', '--').replace(/_/g, '-');
          return { ...acc, [cssKey]: value };
        }, {});

      setIsPreviewMode(Object.keys(themeParams).length > 0);
      setPreviewStyles(themeParams);
    } catch (error) {
      console.error('Error parsing theme preview parameters:', error);
      setIsPreviewMode(false);
      setPreviewStyles({});
    }
  }, [location]);

  return { isPreviewMode, previewStyles };
}
