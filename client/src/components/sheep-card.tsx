import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Calendar, Ruler, Weight } from "lucide-react";
import { formatDisplayDate, parseISO } from "@/lib/date-utils";
import type { Sheep } from "@db/schema";

interface SheepCardProps {
  sheep: Sheep;
  isAdmin?: boolean;
  onEdit?: (sheep: Sheep) => void;
  onDelete?: (sheep: Sheep) => void;
}

export default function SheepCard({ sheep, isAdmin = false, onEdit, onDelete }: SheepCardProps) {
  const genderSymbol = sheep.gender === 'male' ? '♂' : '♀';
  const genderClass = sheep.gender === 'male' ? 'text-blue-600' : 'text-pink-600';

  return (
    <Card className="overflow-hidden shadow-sm">
      {/* Image Section */}
      {sheep.profileImageUrl && (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={sheep.profileImageUrl}
            alt={sheep.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold text-stone-800 leading-tight">
              {sheep.name}
            </CardTitle>
            {isAdmin && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(sheep)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(sheep)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant={sheep.available ? "default" : "secondary"} className="text-xs">
              {sheep.available ? (sheep.sold ? "Sold" : "Available") : (sheep.lamb ? "Lamb" : sheep.gender === 'male' ? "Ram" : "Ewe")}
            </Badge>
            {sheep.price && sheep.available && !sheep.sold && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                ${sheep.price}
              </Badge>
            )}
            {sheep.outsideBreeder && (
              <Badge variant="outline" className="text-xs">
                Outside Breeder
              </Badge>
            )}
            {!sheep.display && isAdmin && (
              <Badge variant="destructive" className="text-xs">
                Hidden
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="font-medium">Breed:</span> {sheep.breed}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Gender:</span> 
            {sheep.gender.charAt(0).toUpperCase() + sheep.gender.slice(1)}
            <span className={genderClass}>{genderSymbol}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span className="font-medium">Born:</span> 
            {formatDisplayDate(parseISO(sheep.birthDate))}
          </div>
          
          {(sheep.height || sheep.weight) && (
            <div className="flex gap-3">
              {sheep.height && (
                <div className="flex items-center gap-1">
                  <Ruler className="h-3 w-3" />
                  <span className="text-xs">{sheep.height}"</span>
                </div>
              )}
              {sheep.weight && (
                <div className="flex items-center gap-1">
                  <Weight className="h-3 w-3" />
                  <span className="text-xs">{sheep.weight} lbs</span>
                </div>
              )}
            </div>
          )}
          
          {sheep.color && (
            <div>
              <span className="font-medium">Color:</span> {sheep.color}
            </div>
          )}
          
          {(sheep.damName || sheep.sireName) && (
            <div className="space-y-1">
              {sheep.sireName && (
                <div><span className="font-medium">Sire:</span> {sheep.sireName}</div>
              )}
              {sheep.damName && (
                <div><span className="font-medium">Dam:</span> {sheep.damName}</div>
              )}
            </div>
          )}
        </div>

        {sheep.description && (
          <div className="text-sm text-stone-600 leading-relaxed line-clamp-3">
            {sheep.description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}