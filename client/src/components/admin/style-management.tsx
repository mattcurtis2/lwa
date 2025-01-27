
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ThemeConfig {
  variant: "professional" | "tint" | "vibrant";
  primary: string;
  appearance: "light" | "dark" | "system";
  radius: number;
  fontFamily?: string;
  fontSize?: {
    base: string;
    headings: string;
  };
  customColors: {
    background: string;
    foreground: string;
    primary: string;
    "primary-foreground": string;
    secondary: string;
    "secondary-foreground": string;
    muted: string;
    "muted-foreground": string;
    accent: string;
    "accent-foreground": string;
    destructive: string;
    "destructive-foreground": string;
    card: string;
    "card-foreground": string;
    popover: string;
    "popover-foreground": string;
    border: string;
    input: string;
    ring: string;
    "sidebar-background": string;
    "sidebar-foreground": string;
    "sidebar-primary": string;
    "sidebar-primary-foreground": string;
    "sidebar-accent": string;
    "sidebar-accent-foreground": string;
    "sidebar-border": string;
    "sidebar-ring": string;
  };
}

export default function StyleManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    variant: "professional",
    primary: "hsl(222.2 47.4% 11.2%)",
    appearance: "light",
    radius: 0.5,
    fontFamily: "Inter, sans-serif",
    fontSize: {
      base: "16px",
      headings: "24px",
    },
    customColors: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 47.4% 11.2%)",
      primary: "hsl(222.2 47.4% 11.2%)",
      "primary-foreground": "hsl(210 40% 98%)",
      secondary: "hsl(210 40% 96.1%)",
      "secondary-foreground": "hsl(222.2 47.4% 11.2%)",
      muted: "hsl(210 40% 96.1%)",
      "muted-foreground": "hsl(215.4 16.3% 46.9%)",
      accent: "hsl(210 40% 96.1%)",
      "accent-foreground": "hsl(222.2 47.4% 11.2%)",
      destructive: "hsl(0 84.2% 60.2%)",
      "destructive-foreground": "hsl(210 40% 98%)",
      card: "hsl(0 0% 100%)",
      "card-foreground": "hsl(222.2 47.4% 11.2%)",
      popover: "hsl(0 0% 100%)",
      "popover-foreground": "hsl(222.2 47.4% 11.2%)",
      border: "hsl(214.3 31.8% 91.4%)",
      input: "hsl(214.3 31.8% 91.4%)",
      ring: "hsl(222.2 47.4% 11.2%)",
      "sidebar-background": "hsl(0 0% 100%)",
      "sidebar-foreground": "hsl(222.2 47.4% 11.2%)",
      "sidebar-primary": "hsl(222.2 47.4% 11.2%)",
      "sidebar-primary-foreground": "hsl(210 40% 98%)",
      "sidebar-accent": "hsl(210 40% 96.1%)",
      "sidebar-accent-foreground": "hsl(222.2 47.4% 11.2%)",
      "sidebar-border": "hsl(214.3 31.8% 91.4%)",
      "sidebar-ring": "hsl(222.2 47.4% 11.2%)",
    },
  });

  useEffect(() => {
    fetch("/api/theme")
      .then((res) => res.json())
      .then((data) => {
        setThemeConfig((prev) => ({ ...prev, ...data }));
      })
      .catch(console.error);
  }, []);

  const updateTheme = useMutation({
    mutationFn: async (newTheme: ThemeConfig) => {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTheme),
      });
      
      if (!res.ok) throw new Error("Failed to update theme");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme"] });
      toast({
        title: "Success",
        description: "Theme updated successfully. Refresh to see changes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (key: string, value: string | number) => {
    setThemeConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setThemeConfig((prev) => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [colorKey]: value,
      },
    }));
  };

  const handleSave = () => {
    updateTheme.mutate(themeConfig);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Theme Variant</Label>
            <Select
              value={themeConfig.variant}
              onValueChange={(value) =>
                handleChange("variant", value as ThemeConfig["variant"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="tint">Tint</SelectItem>
                <SelectItem value="vibrant">Vibrant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Appearance</Label>
            <Select
              value={themeConfig.appearance}
              onValueChange={(value) =>
                handleChange("appearance", value as ThemeConfig["appearance"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Input
              type="number"
              step="0.1"
              value={themeConfig.radius}
              onChange={(e) => handleChange("radius", parseFloat(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Input
              value={themeConfig.fontFamily}
              onChange={(e) => handleChange("fontFamily", e.target.value)}
              placeholder="Inter, sans-serif"
            />
          </div>

          <div className="space-y-4">
            <Label>Font Sizes</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Base Size</Label>
                <Input
                  value={themeConfig.fontSize?.base}
                  onChange={(e) =>
                    setThemeConfig((prev) => ({
                      ...prev,
                      fontSize: {
                        ...prev.fontSize!,
                        base: e.target.value,
                      },
                    }))
                  }
                  placeholder="16px"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Heading Size</Label>
                <Input
                  value={themeConfig.fontSize?.headings}
                  onChange={(e) =>
                    setThemeConfig((prev) => ({
                      ...prev,
                      fontSize: {
                        ...prev.fontSize!,
                        headings: e.target.value,
                      },
                    }))
                  }
                  placeholder="24px"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Colors</Label>
            <div className="grid gap-4">
              {Object.entries(themeConfig.customColors).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-4">
                  <Label className="flex items-center capitalize">
                    {key.replace(/([A-Z])/g, " $1").replace(/-/g, " ").trim()}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Input
                      type="color"
                      value={value.startsWith('hsl') ? `#${value.match(/[\d.]+/g)?.map(n => Math.round(parseFloat(n))).join('')}` : value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-12"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={updateTheme.isPending}>
            {updateTheme.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
