import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/date-utils";
import { Dog } from "@db/schema";

interface DogCardProps {
  dog: Dog;
  isAdmin?: boolean;
  onEdit?: (dog: Dog) => void;
  onDelete?: (dog: Dog) => void;
  onOrderChange?: (dogId: number, newOrder: number) => void;
}

export default function DogCard({ dog, isAdmin, onEdit, onDelete, onOrderChange }: DogCardProps) {
  return (
    <Card className="h-full">
      <div className="aspect-square relative">
        <img
          src={dog.imageUrl || ''}
          alt={dog.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <CardContent className="pt-6">
        {isAdmin ? (
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold inline-block">{dog.name}</h3>
              <span className="text-stone-600 ml-2">• {formatAge(new Date(dog.birthDate))}</span>
            </div>
            {onOrderChange && (
              <div className="flex items-center gap-2">
                <label htmlFor={`order-${dog.id}`} className="text-sm text-stone-600">
                  Order:
                </label>
                <input
                  id={`order-${dog.id}`}
                  type="number"
                  min="0"
                  className="w-20 h-8 px-2 border rounded"
                  value={dog.order}
                  onChange={(e) => {
                    const newOrder = parseInt(e.target.value);
                    if (!isNaN(newOrder)) {
                      onOrderChange(dog.id, newOrder);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="text-xl font-bold inline-block">{dog.name}</h3>
            <span className="text-stone-600 ml-2">• {formatAge(new Date(dog.birthDate))}</span>
          </div>
        )}
        <p className="text-stone-600 mb-4">{dog.description}</p>
        {isAdmin && (
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(dog)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(dog)}>
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}