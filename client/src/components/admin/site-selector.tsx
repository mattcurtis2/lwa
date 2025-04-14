import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSite } from "@/providers/site-provider";
import { Building } from "lucide-react";

export default function SiteSelector() {
  const { sites, currentSiteId, setCurrentSiteId, isLoading } = useSite();

  const handleSiteChange = (value: string) => {
    setCurrentSiteId(parseInt(value));
  };

  if (isLoading || !sites || sites.length < 1) {
    return null;
  }

  // Only show selector if there are multiple sites
  if (sites.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Building className="h-4 w-4" />
        <span>{sites?.[0]?.name || "Little Way Acres"}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-muted-foreground">Current Site</label>
      <Select
        value={currentSiteId.toString()}
        onValueChange={handleSiteChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select site" />
        </SelectTrigger>
        <SelectContent>
          {sites.map((site) => (
            <SelectItem key={site.id} value={site.id.toString()}>
              {site.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}