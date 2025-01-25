import { Goat } from "@db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Props {
  goat: Goat;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: (goat: Goat) => void;
}

export default function GoatCard({ goat, isAdmin, onEdit, onDelete }: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        {goat.profileImageUrl ? (
          <img
            src={goat.profileImageUrl}
            alt={goat.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            goat.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'
          }`}>
            <span className={`text-6xl ${
              goat.gender === 'female' ? 'text-pink-500' : 'text-blue-500'
            }`}>
              {goat.gender === 'female' ? '♀' : '♂'}
            </span>
          </div>
        )}
        {goat.available && (
          <div className="absolute top-2 right-2">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Available
            </span>
          </div>
        )}
      </div>

      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{goat.name}</CardTitle>
            <CardDescription>
              {goat.breed}
            </CardDescription>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(goat)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm">
          {goat.color && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <span>{goat.color}</span>
            </div>
          )}
          {goat.registrationName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration:</span>
              <span>{goat.registrationName}</span>
            </div>
          )}
          {goat.height && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Height:</span>
              <span>{goat.height}" inches</span>
            </div>
          )}
          {goat.weight && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weight:</span>
              <span>{goat.weight} lbs</span>
            </div>
          )}
          {goat.price && (
            <div className="flex justify-between font-medium">
              <span>Price:</span>
              <span>${goat.price}</span>
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
