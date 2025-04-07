import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StyleSettings } from '@db/schema';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { HexColorPicker } from "react-colorful";
import { useMobile } from '@/hooks/use-mobile';

// Simple loading spinner component
function LoadingSpinner({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = 
    size === 'sm' ? 'h-4 w-4 border-2' :
    size === 'md' ? 'h-8 w-8 border-4' :
    'h-12 w-12 border-4';
    
  return (
    <div className="flex justify-center items-center py-4">
      <div className={`${sizeClass} rounded-full border-t-transparent border-primary animate-spin`}></div>
    </div>
  );
}

type StylesByCategory = {
  colors: StyleSettings[];
  typography: StyleSettings[];
  layout: StyleSettings[];
  other: StyleSettings[];
};

export default function StylesEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useMobile();
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [localStyles, setLocalStyles] = useState<StyleSettings[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [stylesByCategory, setStylesByCategory] = useState<StylesByCategory>({
    colors: [],
    typography: [],
    layout: [],
    other: []
  });

  // Fetch styles
  const { data: styles, isLoading, isError } = useQuery<StyleSettings[]>({
    queryKey: ['styles'],
    queryFn: async () => {
      const response = await fetch('/api/styles');
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      return response.json();
    },
  });

  // Update styles mutation
  const updateStylesMutation = useMutation({
    mutationFn: async (styles: StyleSettings[]) => {
      const response = await fetch('/api/styles/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ styles }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update styles');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast({
        title: 'Success',
        description: 'Styles updated successfully',
        variant: 'default',
      });
      setPreviewMode(false); // Exit preview mode after saving
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Organize styles by category once data is loaded
  useEffect(() => {
    if (styles) {
      setLocalStyles(styles);
      
      // Group styles by category
      const grouped: StylesByCategory = {
        colors: [],
        typography: [],
        layout: [],
        other: []
      };
      
      styles.forEach(style => {
        const category = style.category || 'other';
        if (category === 'colors') {
          grouped.colors.push(style);
        } else if (category === 'typography') {
          grouped.typography.push(style);
        } else if (category === 'layout') {
          grouped.layout.push(style);
        } else {
          grouped.other.push(style);
        }
      });
      
      setStylesByCategory(grouped);
    }
  }, [styles]);

  // Handle style value change
  const handleStyleChange = (key: string, value: string) => {
    console.log('Style change:', key, value);
    setLocalStyles(prev => {
      const updated = prev.map(style => 
        style.key === key ? { ...style, value } : style
      );
      console.log('Updated styles:', updated);
      return updated;
    });
  };

  // Preview changes (apply without saving to database)
  const handlePreview = () => {
    setPreviewMode(true);
    
    // Format style values for preview
    const formattedStyles = localStyles.map(style => {
      let formattedValue = style.value;
      
      // For color values, ensure they have the # prefix
      if (style.category === 'colors' && formattedValue && !formattedValue.startsWith('#')) {
        formattedValue = `#${formattedValue}`;
      }
      
      return {
        ...style,
        value: formattedValue
      };
    });
    
    // Apply styles using the utility function
    const styleEl = document.getElementById('global-styles');
    if (styleEl) {
      let cssVars = `:root {\n`;
      formattedStyles.forEach(style => {
        cssVars += `  --${style.key}: ${style.value};\n`;
      });
      cssVars += `}\n`;
      console.log('Preview CSS variables:', cssVars);
      styleEl.innerHTML = cssVars;
    }
  };

  // Save changes to database
  const handleSave = () => {
    // Format color values to ensure they have proper format
    const formattedStyles = localStyles.map(style => {
      let formattedValue = style.value;
      
      // For color values, ensure they have the # prefix
      if (style.category === 'colors' && formattedValue && !formattedValue.startsWith('#')) {
        formattedValue = `#${formattedValue}`;
      }
      
      console.log('Saving style:', style.key, 'with value:', formattedValue);
      
      return {
        ...style,
        value: formattedValue
      };
    });
    
    console.log('Sending formatted styles to server:', formattedStyles);
    updateStylesMutation.mutate(formattedStyles);
  };

  // Reset changes to original
  const handleReset = () => {
    if (styles) {
      setLocalStyles(styles);
      setPreviewMode(false);
      // Revert to original styles
      const styleEl = document.getElementById('global-styles');
      if (styleEl && styles) {
        let cssVars = `:root {\n`;
        styles.forEach(style => {
          cssVars += `  --${style.key}: ${style.value};\n`;
        });
        cssVars += `}\n`;
        styleEl.innerHTML = cssVars;
      }
    }
  };

  // Helper function to render a color picker
  const renderColorPicker = (style: StyleSettings) => {
    // Find the actual local style value from localStyles array to ensure we're using the most up-to-date value
    const localStyle = localStyles.find(s => s.key === style.key) || style;
    
    // Get the style value, ensuring it has a valid format for the color picker
    const styleValue = localStyle.value?.startsWith('#') ? localStyle.value : `#${localStyle.value}`;
    
    return (
      <div key={style.key} className="mb-4">
        <div className="flex items-center mb-2">
          <div 
            className="w-6 h-6 rounded-full mr-2 border border-gray-300 cursor-pointer" 
            style={{ backgroundColor: styleValue }}
            onClick={() => setActiveColor(activeColor === style.key ? null : style.key)}
          ></div>
          <Label htmlFor={style.key} className="flex-1">{style.description || style.key}</Label>
          <Input
            id={style.key}
            type="text"
            value={localStyle.value}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log('Input change:', style.key, newValue);
              handleStyleChange(style.key, newValue);
            }}
            className="w-28 ml-2"
          />
        </div>
        {activeColor === style.key && (
          <div className={`${isMobile ? 'w-full' : 'w-64'} mt-2`}>
            <HexColorPicker
              color={styleValue}
              onChange={(color) => {
                console.log('Color picker change:', style.key, color);
                handleStyleChange(style.key, color);
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // Helper function to render a text input
  const renderTextInput = (style: StyleSettings) => {
    // Find the actual local style value from localStyles array to ensure we're using the most up-to-date value
    const localStyle = localStyles.find(s => s.key === style.key) || style;
    
    return (
      <div key={style.key} className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center mb-2">
          <Label htmlFor={style.key} className="mb-1 md:mb-0 md:flex-1">
            {style.description || style.key}
          </Label>
          <Input
            id={style.key}
            type="text"
            value={localStyle.value}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log('Text input change:', style.key, newValue);
              handleStyleChange(style.key, newValue);
            }}
            className="md:w-64"
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Failed to load styles. Please try again later.</div>;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Site Styles</CardTitle>
          <CardDescription>
            Customize the look and feel of your website
            {previewMode && (
              <span className="ml-2 text-green-500 font-semibold">
                (Preview Mode)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors">
            <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              {stylesByCategory.other.length > 0 && (
                <TabsTrigger value="other">Other</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="colors" className="space-y-4">
              {stylesByCategory.colors.map(style => renderColorPicker(style))}
            </TabsContent>
            
            <TabsContent value="typography" className="space-y-4">
              {stylesByCategory.typography.map(style => renderTextInput(style))}
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-4">
              {stylesByCategory.layout.map(style => renderTextInput(style))}
            </TabsContent>
            
            {stylesByCategory.other.length > 0 && (
              <TabsContent value="other" className="space-y-4">
                {stylesByCategory.other.map(style => renderTextInput(style))}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleReset}
            disabled={updateStylesMutation.isPending}
          >
            Reset
          </Button>
          <div className="space-x-2">
            <Button
              variant="secondary"
              onClick={handlePreview}
              disabled={updateStylesMutation.isPending}
            >
              Preview
            </Button>
            <Button 
              onClick={handleSave}
              disabled={updateStylesMutation.isPending}
            >
              {updateStylesMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}