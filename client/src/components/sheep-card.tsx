import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { Sheep } from "@db/schema";

interface SheepCardProps {
  sheep: Sheep;
  isAdmin?: boolean;
  onEdit?: (sheep: Sheep) => void;
  onDelete?: (sheep: Sheep) => void;
}

export default function SheepCard({ sheep, isAdmin = false, onEdit, onDelete }: SheepCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Scroll to sheep's section on the page
    const sheepId = sheep.name.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(sheepId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card 
      className="h-full cursor-pointer hover:shadow-md transition-shadow" 
      onClick={handleCardClick}
    >
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {sheep.name}
            {sheep.registrationName && (
              <span className="text-sm font-normal text-muted-foreground block">
                ({sheep.registrationName})
              </span>
            )}
          </CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(sheep);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(sheep);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {sheep.profileImageUrl && (
          <img
            src={sheep.profileImageUrl}
            alt={sheep.name}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        )}
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{sheep.breed}</Badge>
            <Badge variant={sheep.gender === 'male' ? 'default' : 'outline'}>
              {sheep.gender === 'male' ? 'Ram' : 'Ewe'}
            </Badge>
            {sheep.available && (
              <Badge variant="default" className="bg-green-600">
                Available
              </Badge>
            )}
            {sheep.sold && (
              <Badge variant="destructive">
                Sold
              </Badge>
            )}
          </div>
          
          {sheep.birthDate && (
            <p className="text-sm text-muted-foreground">
              Born: {new Date(sheep.birthDate).toLocaleDateString()}
            </p>
          )}
          
          {sheep.color && (
            <p className="text-sm text-muted-foreground">
              Color: {sheep.color}
            </p>
          )}
          
          {sheep.weight && (
            <p className="text-sm text-muted-foreground">
              Weight: {sheep.weight} lbs
            </p>
          )}
          
          {sheep.description && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {sheep.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}