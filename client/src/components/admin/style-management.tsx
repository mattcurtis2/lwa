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
import { ScrollArea } from "@/components/ui/scroll-area";

interface ThemeConfig {
  variant: "professional" | "tint" | "vibrant";
  primary: string;
  appearance: "light" | "dark" | "system";
  radius: number;
  colors?: {
    background: string;
    foreground: string;
    card: string;
    "card-foreground": string;
    popover: string;
    "popover-foreground": string;
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
    border: string;
    input: string;
    ring: string;
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
    colors: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(222.2 47.4% 11.2%)",
      card: "hsl(0 0% 100%)",
      "card-foreground": "hsl(222.2 47.4% 11.2%)",
      popover: "hsl(0 0% 100%)",
      "popover-foreground": "hsl(222.2 47.4% 11.2%)",
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
      border: "hsl(214.3 31.8% 91.4%)",
      input: "hsl(214.3 31.8% 91.4%)",
      ring: "hsl(222.2 47.4% 11.2%)",
    },
  });

  const [previewIframe, setPreviewIframe] = useState<HTMLIFrameElement | null>(null);

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
        description: "Theme updated successfully",
      });

      // Refresh the preview iframe
      if (previewIframe?.contentWindow) {
        previewIframe.contentWindow.location.reload();
      }
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
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const handleSave = () => {
    updateTheme.mutate(themeConfig);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* Colors */}
            <div className="space-y-4">
              <Label>Colors</Label>
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid gap-4">
                  {themeConfig.colors && Object.entries(themeConfig.colors).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-[1fr,auto] gap-4 items-center">
                      <div>
                        <Label className="capitalize text-sm">
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </Label>
                        <div 
                          className="h-8 w-full rounded-md border mt-1"
                          style={{ backgroundColor: value }}
                        />
                      </div>
                      <Input
                        type="text"
                        value={value}
                        className="font-mono text-xs"
                        onChange={(e) => handleColorChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button onClick={handleSave} disabled={updateTheme.isPending}>
              {updateTheme.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-video rounded-lg border overflow-hidden">
              <iframe
                ref={setPreviewIframe}
                src="/"
                className="w-full h-full"
                title="Website Preview"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}