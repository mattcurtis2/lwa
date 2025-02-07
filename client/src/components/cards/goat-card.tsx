
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/date-utils";
import { Link } from "wouter";
import type { Goat } from "@db/schema";

interface GoatCardProps {
  goat: Goat;
  isAdmin?: boolean;
  showPrice?: boolean;
  onEdit?: (goat: Goat) => void;
  onDelete?: (goat: Goat) => void;
  onOrderChange?: (goatId: number, newOrder: number) => void;
}

export function GoatCard({ goat, isAdmin, showPrice, onEdit, onDelete, onOrderChange }: GoatCardProps) {
  const genderSymbol = goat.gender === 'male' ? (
    <span className="text-blue-500">♂</span>
  ) : (
    <span className="text-pink-500">♀</span>
  );

  const handleEditClick = (goat: Goat) => {
    onEdit?.(goat);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>, goatId: number) => {
    const newOrder = parseInt(e.target.value);
    if (!isNaN(newOrder)) {
      onOrderChange?.(goatId, newOrder);
    }
  };

  return (
    <Card className="h-full">
      <Link href={`/goats/${goat.id}`}>
        <div className="cursor-pointer">
          <div className="relative group">
            {goat.profileImageUrl ? (
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={goat.profileImageUrl}
                  alt={goat.name}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
                {showPrice && goat.price && (
                  <div className="absolute top-0 left-0 right-0 bg-amber-600 py-2 px-4 flex items-center justify-center">
                    <p className="text-lg font-semibold text-white">
                      Available: ${parseInt(goat.price).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No media available</p>
              </div>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="pt-6">
        {isAdmin ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <Link href={`/goats/${goat.id}`}>
                <div className="cursor-pointer flex items-center gap-3">
                  {genderSymbol}
                  <div>
                    <h3 className="text-xl font-bold">
                      {goat.name}
                    </h3>
                    {goat.registrationName && (
                      <p className="text-sm text-muted-foreground mt-0.5">{goat.registrationName}</p>
                    )}
                    {goat.birthDate && (
                      <span className="text-stone-600">• {formatAge(new Date(goat.birthDate))}</span>
                    )}
                  </div>
                </div>
              </Link>
              {onOrderChange && (
                <div className="flex items-center gap-2">
                  <label htmlFor={`order-${goat.id}`} className="text-sm text-stone-600">
                    Order:
                  </label>
                  <input
                    id={`order-${goat.id}`}
                    type="number"
                    min="0"
                    className="w-20 h-8 px-2 border rounded"
                    value={goat.order}
                    onChange={e => handleOrderChange(e, goat.id)}
                  />
                </div>
              )}
            </div>
            <Link href={`/goats/${goat.id}`}>
              <p className="text-stone-600 mb-4 cursor-pointer">{goat.description}</p>
            </Link>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => handleEditClick(goat)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="destructive"
                  onClick={() => onDelete(goat)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Link href={`/goats/${goat.id}`}>
            <div className="cursor-pointer">
              <div className="mb-4 flex items-center gap-3">
                {genderSymbol}
                <div>
                  <h3 className="text-xl font-bold">
                    {goat.name}
                  </h3>
                  {goat.registrationName && (
                    <p className="text-sm text-muted-foreground mt-0.5">{goat.registrationName}</p>
                  )}
                  {goat.birthDate && (
                    <span className="text-stone-600">• {formatAge(new Date(goat.birthDate))}</span>
                  )}
                </div>
              </div>
              <p className="text-stone-600 mb-4">{goat.description}</p>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
