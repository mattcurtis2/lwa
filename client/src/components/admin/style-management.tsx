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
  customColors?: {
    [key: string]: string;
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
      text: "hsl(222.2 47.4% 11.2%)",
      primary: "hsl(222.2 47.4% 11.2%)",
      secondary: "hsl(210 40% 96.1%)",
      accent: "hsl(210 40% 96.1%)",
    },
  });

  useEffect(() => {
    // Load current theme configuration
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
          {/* Theme Variant */}
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

          {/* Appearance */}
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

          {/* Border Radius */}
          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Input
              type="number"
              step="0.1"
              value={themeConfig.radius}
              onChange={(e) => handleChange("radius", parseFloat(e.target.value))}
            />
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Input
              value={themeConfig.fontFamily}
              onChange={(e) => handleChange("fontFamily", e.target.value)}
              placeholder="Inter, sans-serif"
            />
          </div>

          {/* Font Sizes */}
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

          {/* Custom Colors */}
          <div className="space-y-4">
            <Label>Colors</Label>
            <div className="grid gap-4">
              {Object.entries(themeConfig.customColors || {}).map(
                ([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4">
                    <Label className="flex items-center capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                    />
                  </div>
                ),
              )}
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
