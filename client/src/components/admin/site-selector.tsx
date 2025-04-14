import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSite } from "@/providers/site-provider";
import { Building, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SiteSelector() {
  const { sites, currentSiteId, setCurrentSiteId, isLoading } = useSite();

  const handleSiteChange = (value: string) => {
    setCurrentSiteId(parseInt(value));
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground animate-pulse">
        <Building className="h-4 w-4" />
        <span>Loading sites...</span>
      </div>
    );
  }
  
  if (!sites || sites.length < 1) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Building className="h-4 w-4" />
        <span>No sites available</span>
      </div>
    );
  }
  
  // If there's more than one site, always show the full selector UI
  const hasMultipleSites = sites.length > 1;

  const currentSite = sites.find(site => site.id === currentSiteId) || sites[0];

  return (
    <Card className={`${hasMultipleSites ? 'border-primary' : 'border-dashed border-primary/40'} hover:border-primary/80 transition-colors`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Site Manager
              {hasMultipleSites && (
                <Badge variant="outline" className="text-xs font-normal">
                  {sites.length} sites
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {hasMultipleSites 
                ? "Switch between different sites" 
                : "Managing " + currentSite.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            {hasMultipleSites ? "Select Site" : "Current Site"}
          </label>
          
          <Select
            value={currentSiteId.toString()}
            onValueChange={handleSiteChange}
          >
            <SelectTrigger 
              className={`w-full text-sm ${hasMultipleSites ? 'bg-primary/5 border-primary/30' : 'bg-background'}`}
            >
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  <div className="flex items-center">
                    {site.id === currentSiteId && (
                      <span className="mr-2 h-2 w-2 rounded-full bg-primary" />
                    )}
                    {site.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {currentSite && (
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>Domain:</span>
            <span className="font-medium truncate">{currentSite.domain}</span>
            <span>Site ID:</span>
            <span className="font-medium">{currentSite.id}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant={hasMultipleSites ? "secondary" : "outline"} 
          size="sm" 
          className="w-full text-xs" 
          disabled={true}
        >
          <PlusCircle className="h-3 w-3 mr-1" />
          Add New Site
        </Button>
      </CardFooter>
    </Card>
  );
}