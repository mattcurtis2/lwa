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

  const currentSite = sites.find(site => site.id === currentSiteId) || sites[0];

  return (
    <Card className="border-dashed border-primary/40 hover:border-primary/70 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Site Manager</CardTitle>
          <Badge variant="outline" className="text-xs">
            {sites.length} site{sites.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Manage content across multiple sites
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Current Site</label>
          <Select
            value={currentSiteId.toString()}
            onValueChange={handleSiteChange}
          >
            <SelectTrigger className="w-full bg-background">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <SelectValue placeholder="Select site" />
              </div>
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
        {currentSite && (
          <div className="mt-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Domain:</span>
              <span className="font-medium">{currentSite.domain}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full text-xs" disabled={true}>
          <PlusCircle className="h-3 w-3 mr-1" />
          Add New Site
        </Button>
      </CardFooter>
    </Card>
  );
}