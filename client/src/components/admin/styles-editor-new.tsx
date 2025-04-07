import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HexColorPicker } from 'react-colorful';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Trash2, RefreshCw, Check, Eye } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type StyleSettings = {
  id: number;
  key: string;
  value: string;
  description?: string;
  category: string;
};

type StylesByCategory = {
  [key: string]: StyleSettings[];
};

// Style Preview Component
function StylePreview({ styles }: { styles: StyleSettings[] }) {
  // Find style values for specific keys
  const getStyleValue = (key: string, defaultValue: string = ''): string => {
    const style = styles.find(s => s.key === key);
    return style ? style.value : defaultValue;
  };

  // Extract common colors
  const primaryColor = getStyleValue('primaryColor', '#3f6f95');
  const secondaryColor = getStyleValue('secondaryColor', '#a3c4bc');
  const accentColor = getStyleValue('accentColor', '#f2b880');
  const backgroundColor = getStyleValue('backgroundColor', '#ffffff');
  const textColor = getStyleValue('textColor', '#333333');
  
  // Extract typography settings
  const headerFont = getStyleValue('headerFont', 'Montserrat');
  const bodyFont = getStyleValue('bodyFont', 'Open Sans');
  const baseFontSize = getStyleValue('baseFontSize', '16px');
  const headerFontSize = getStyleValue('h1FontSize', '2.5rem');
  const subheaderFontSize = getStyleValue('h2FontSize', '2rem');
  
  // Extract layout settings
  const borderRadius = getStyleValue('borderRadius', '8px');
  const contentWidth = getStyleValue('contentWidth', '1200px');
  const spacing = getStyleValue('baseSpacing', '16px');

  return (
    <div className="p-4 space-y-8 max-h-[70vh] overflow-y-auto">
      {/* Color Palette Section */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: headerFont }}>Color Palette</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex flex-col items-center">
            <div 
              className="h-20 w-20 rounded-md shadow-md mb-2" 
              style={{ backgroundColor: primaryColor }}
            />
            <div className="text-sm font-medium">Primary</div>
            <div className="text-xs text-muted-foreground">{primaryColor}</div>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="h-20 w-20 rounded-md shadow-md mb-2" 
              style={{ backgroundColor: secondaryColor }}
            />
            <div className="text-sm font-medium">Secondary</div>
            <div className="text-xs text-muted-foreground">{secondaryColor}</div>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="h-20 w-20 rounded-md shadow-md mb-2" 
              style={{ backgroundColor: accentColor }}
            />
            <div className="text-sm font-medium">Accent</div>
            <div className="text-xs text-muted-foreground">{accentColor}</div>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="h-20 w-20 rounded-md shadow-md mb-2 border" 
              style={{ backgroundColor: backgroundColor }}
            />
            <div className="text-sm font-medium">Background</div>
            <div className="text-xs text-muted-foreground">{backgroundColor}</div>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="h-20 w-20 rounded-md shadow-md mb-2 flex items-center justify-center" 
              style={{ backgroundColor: textColor, color: backgroundColor }}
            >
              <span className="text-xs">Text</span>
            </div>
            <div className="text-sm font-medium">Text</div>
            <div className="text-xs text-muted-foreground">{textColor}</div>
          </div>
        </div>
      </div>
      
      {/* Typography Preview Section */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: headerFont }}>Typography</h3>
        <div className="space-y-4">
          <div style={{ 
            fontFamily: headerFont, 
            fontSize: headerFontSize, 
            color: textColor 
          }}>
            Header Font: {headerFont}
          </div>
          <div style={{ 
            fontFamily: headerFont, 
            fontSize: subheaderFontSize, 
            color: textColor 
          }}>
            Subheader Example
          </div>
          <div style={{ 
            fontFamily: bodyFont, 
            fontSize: baseFontSize,
            color: textColor, 
            maxWidth: "600px" 
          }}>
            Body Font: {bodyFont} - This is an example paragraph showing how your body text would appear on the website. The paragraph showcases the selected font, size, and color settings.
          </div>
        </div>
      </div>
      
      {/* UI Components Preview */}
      <div>
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: headerFont }}>UI Components</h3>
        <div className="space-y-4">
          {/* Button Examples */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold" style={{ fontFamily: headerFont }}>Buttons</h4>
            <div className="flex flex-wrap gap-2">
              <button 
                className="px-4 py-2 shadow-sm"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: backgroundColor,
                  borderRadius: borderRadius,
                  fontFamily: bodyFont,
                }}
              >
                Primary Button
              </button>
              <button 
                className="px-4 py-2 shadow-sm"
                style={{ 
                  backgroundColor: secondaryColor, 
                  color: textColor,
                  borderRadius: borderRadius,
                  fontFamily: bodyFont,
                }}
              >
                Secondary Button
              </button>
              <button 
                className="px-4 py-2 shadow-sm"
                style={{ 
                  backgroundColor: accentColor, 
                  color: textColor,
                  borderRadius: borderRadius,
                  fontFamily: bodyFont,
                }}
              >
                Accent Button
              </button>
            </div>
          </div>
          
          {/* Card Example */}
          <div className="space-y-2">
            <h4 className="text-lg font-semibold" style={{ fontFamily: headerFont }}>Card</h4>
            <div 
              className="p-4 shadow-md max-w-md"
              style={{ 
                backgroundColor: backgroundColor,
                borderRadius: borderRadius,
                border: `1px solid ${secondaryColor}`,
              }}
            >
              <h5 
                className="text-xl mb-2"
                style={{ 
                  fontFamily: headerFont, 
                  color: primaryColor 
                }}
              >
                Card Title
              </h5>
              <p 
                className="mb-4"
                style={{ 
                  fontFamily: bodyFont, 
                  color: textColor, 
                  fontSize: baseFontSize 
                }}
              >
                This is an example card showing how content would appear with your current style settings.
              </p>
              <button 
                className="px-3 py-1"
                style={{ 
                  backgroundColor: primaryColor, 
                  color: backgroundColor,
                  borderRadius: borderRadius,
                  fontFamily: bodyFont,
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Style Card Component
function StyleCard({ 
  style, 
  onUpdate, 
  onDelete 
}: { 
  style: StyleSettings; 
  onUpdate: (style: StyleSettings) => void; 
  onDelete: (id: number) => void; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(style.value);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Reset local value when style changes
  useEffect(() => {
    setLocalValue(style.value);
  }, [style]);

  // Determine if this is a color value
  const isColorValue = /^#[0-9A-F]{6}$/i.test(style.value);

  // Handle save
  const handleSave = () => {
    onUpdate({
      ...style,
      value: localValue
    });
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-base font-medium">
            {style.key}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => onDelete(style.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {style.description && (
          <CardDescription>{style.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4">
          {isColorValue && (
            <div 
              className="h-10 w-10 rounded-md border" 
              style={{ backgroundColor: style.value }}
            />
          )}
          <div className="flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                {isColorValue ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <Input
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        className="font-mono"
                      />
                      <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className="flex-shrink-0">
                            <div
                              className="h-4 w-4 rounded-sm"
                              style={{ backgroundColor: localValue }}
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="end">
                          <HexColorPicker 
                            color={localValue} 
                            onChange={setLocalValue} 
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                ) : (
                  <Input
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="font-mono"
                  />
                )}
              </div>
            ) : (
              <code className="rounded bg-muted px-2 py-1">{style.value}</code>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end py-2">
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setLocalValue(style.value);
              setIsEditing(false);
            }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="mr-1 h-4 w-4" />
              Save
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function StylesEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>('colors');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newStyle, setNewStyle] = useState<{
    key: string;
    value: string;
    description: string;
    category: string;
  }>({
    key: '',
    value: '',
    description: '',
    category: 'custom',
  });

  // Fetch styles from API
  const { data: styles, isLoading, isError } = useQuery({
    queryKey: ['styles'],
    queryFn: async () => {
      const response = await fetch('/api/styles');
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      return response.json() as Promise<StyleSettings[]>;
    },
  });

  // Create a new style
  const createStyleMutation = useMutation({
    mutationFn: async (newStyleData: Omit<StyleSettings, 'id'>) => {
      const response = await fetch('/api/styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStyleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create style');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      setIsAddDialogOpen(false);
      setNewStyle({
        key: '',
        value: '',
        description: '',
        category: 'custom',
      });
      toast({
        title: 'Style created successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating style',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update a style
  const updateStyleMutation = useMutation({
    mutationFn: async ({ id, ...data }: StyleSettings) => {
      const response = await fetch(`/api/styles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update style');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast({
        title: 'Style updated successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating style',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete a style
  const deleteStyleMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/styles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete style');
      }
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['styles'] });
      toast({
        title: 'Style deleted successfully',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting style',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Group styles by category
  const stylesByCategory: StylesByCategory = {};
  
  if (styles) {
    styles.forEach(style => {
      if (!stylesByCategory[style.category]) {
        stylesByCategory[style.category] = [];
      }
      stylesByCategory[style.category].push(style);
    });
  }

  // Get unique categories
  const categories = styles ? Array.from(new Set(styles.map(style => style.category))) : [];

  // Function to handle style creation
  const handleCreateStyle = () => {
    createStyleMutation.mutate(newStyle);
  };

  // Function to handle style update
  const handleUpdateStyle = (style: StyleSettings) => {
    updateStyleMutation.mutate(style);
  };

  // Function to handle style deletion
  const handleDeleteStyle = (id: number) => {
    if (window.confirm('Are you sure you want to delete this style?')) {
      deleteStyleMutation.mutate(id);
    }
  };

  // Determine if a style value is a color (hex code)
  const isColorValue = (value: string) => {
    return /^#[0-9A-F]{6}$/i.test(value);
  };

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-4">Style Settings</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <LoadingSpinner />
        </div>
      ) : isError ? (
        <div className="text-red-500">
          Error loading styles. Please try again.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Customize site-wide style settings. Changes will affect the whole website appearance.
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Styles
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Style Preview</DialogTitle>
                    <DialogDescription>
                      This shows how your current style settings will appear on the website.
                    </DialogDescription>
                  </DialogHeader>
                  <StylePreview styles={styles || []} />
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Style
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Style</DialogTitle>
                    <DialogDescription>
                      Create a new custom style variable that can be used throughout the site.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="key" className="text-right">Key</Label>
                      <Input
                        id="key"
                        value={newStyle.key}
                        onChange={(e) => setNewStyle({ ...newStyle, key: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., buttonColor"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="value" className="text-right">Value</Label>
                      {isColorValue(newStyle.value) ? (
                        <div className="col-span-3 space-y-2">
                          <Input
                            id="value"
                            value={newStyle.value}
                            onChange={(e) => setNewStyle({ ...newStyle, value: e.target.value })}
                            className="mb-2"
                            placeholder="e.g., #ff5500"
                          />
                          <HexColorPicker
                            color={newStyle.value}
                            onChange={(color) => setNewStyle({ ...newStyle, value: color })}
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <Input
                          id="value"
                          value={newStyle.value}
                          onChange={(e) => setNewStyle({ ...newStyle, value: e.target.value })}
                          className="col-span-3"
                          placeholder="e.g., #ff5500 or 16px"
                        />
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Input
                        id="description"
                        value={newStyle.description}
                        onChange={(e) => setNewStyle({ ...newStyle, description: e.target.value })}
                        className="col-span-3"
                        placeholder="e.g., Color for primary buttons"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-2">
                      <Label htmlFor="category" className="text-right">Category</Label>
                      <Select
                        value={newStyle.category}
                        onValueChange={(value) => setNewStyle({ ...newStyle, category: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom">Custom</SelectItem>
                          {!categories.includes('colors') && <SelectItem value="colors">Colors</SelectItem>}
                          {!categories.includes('typography') && <SelectItem value="typography">Typography</SelectItem>}
                          {!categories.includes('layout') && <SelectItem value="layout">Layout</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={handleCreateStyle} 
                      disabled={createStyleMutation.isPending || !newStyle.key || !newStyle.value}
                    >
                      {createStyleMutation.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                      Create Style
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue={categories[0] || 'colors'} value={activeCategory} onValueChange={setActiveCategory}>
            <ScrollArea className="w-full whitespace-nowrap pb-3">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="rounded-none border-b-2 border-b-transparent py-3 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            {categories.map((category) => (
              <TabsContent key={category} value={category} className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stylesByCategory[category]?.map((style) => (
                    <StyleCard 
                      key={style.id}
                      style={style}
                      onUpdate={handleUpdateStyle}
                      onDelete={handleDeleteStyle}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}