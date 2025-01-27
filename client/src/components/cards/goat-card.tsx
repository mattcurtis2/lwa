import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatDisplayDate } from "@/lib/date-utils";
import type { Goat } from "@db/schema";

interface GoatCardProps {
  goat: Goat;
  isAdmin?: boolean;
  onEdit?: (goat: Goat) => void;
  onDelete?: (goat: Goat) => void;
}

export function GoatCard({ goat, isAdmin, onEdit, onDelete }: GoatCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        {goat.profileImageUrl ? (
          <img
            src={goat.profileImageUrl}
            alt={goat.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-pink-100">
            <span className="text-4xl text-pink-500">
              {goat.gender === 'female' ? '♀' : '♂'}
            </span>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{goat.name}</CardTitle>
          {isAdmin && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(goat)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(goat)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Breed</span>
            <span>{goat.breed}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Gender</span>
            <span className="capitalize">{goat.gender}</span>
          </div>
          {goat.birthDate && (
            <div className="flex justify-between text-muted-foreground">
              <span>Birth Date</span>
              <span>{formatDisplayDate(new Date(goat.birthDate))}</span>
            </div>
          )}
          {goat.color && (
            <div className="flex justify-between text-muted-foreground">
              <span>Color</span>
              <span>{goat.color}</span>
            </div>
          )}
          {goat.available !== null && (
            <div className="flex justify-between text-muted-foreground">
              <span>Status</span>
              <span>{goat.available ? 'Available' : 'Not Available'}</span>
            </div>
          )}
        </div>
        {goat.description && (
          <p className="mt-4 text-sm text-muted-foreground">
            {goat.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}