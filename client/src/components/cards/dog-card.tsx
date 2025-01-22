import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAge } from "@/lib/date-utils";
import { Dog, DogMedia } from "@db/schema";
import DogMediaCarousel from "./dog-media-carousel";
import { Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DogCardProps {
  dog: Dog & { media?: DogMedia[] };
  isAdmin?: boolean;
  onEdit?: (dog: Dog) => void;
  onDelete?: (dog: Dog) => void;
  onOrderChange?: (dogId: number, newOrder: number) => void;
}

export default function DogCard({ dog, isAdmin, onEdit, onDelete, onOrderChange }: DogCardProps) {
  const genderSymbol = dog.gender === 'male' ? (
    <span className="text-blue-500">♂</span>
  ) : (
    <span className="text-pink-500">♀</span>
  );

  const handleEditClick = (dog: Dog) => {
    onEdit?.(dog);
  };

  const handleDeleteClick = (dog: Dog) => {
    onDelete?.(dog);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>, dogId: number) => {
    const newOrder = parseInt(e.target.value);
    if (!isNaN(newOrder)) {
      onOrderChange?.(dogId, newOrder);
    }
  };

  return (
    <Card className="h-full">
      <Link href={`/dogs/${dog.name}`}>
        <div className="cursor-pointer">
          {dog.media && dog.media.length > 0 ? (
            <DogMediaCarousel media={dog.media} />
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <p className="text-gray-500">No media available</p>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="pt-6">
        {isAdmin ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <Link href={`/dogs/${dog.name}`}>
                <div className="cursor-pointer flex items-center gap-3">
                  {dog.profileImageUrl ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={dog.profileImageUrl} alt={dog.name} />
                      <AvatarFallback>{genderSymbol}</AvatarFallback>
                    </Avatar>
                  ) : (
                    genderSymbol
                  )}
                  <div>
                    <h3 className="text-xl font-bold">
                      {dog.name}
                    </h3>
                    {dog.registrationName && (
                      <p className="text-sm text-muted-foreground mt-0.5">{dog.registrationName}</p>
                    )}
                    <span className="text-stone-600">• {formatAge(new Date(dog.birthDate))}</span>
                  </div>
                </div>
              </Link>
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
                    onChange={e => handleOrderChange(e, dog.id)}
                  />
                </div>
              )}
            </div>
            <Link href={`/dogs/${dog.name}`}>
              <p className="text-stone-600 mb-4 cursor-pointer">{dog.description}</p>
            </Link>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => handleEditClick(dog)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteClick(dog)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Link href={`/dogs/${dog.name}`}>
            <div className="cursor-pointer">
              <div className="mb-4 flex items-center gap-3">
                {dog.profileImageUrl ? (
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={dog.profileImageUrl} alt={dog.name} />
                    <AvatarFallback>{genderSymbol}</AvatarFallback>
                  </Avatar>
                ) : (
                  genderSymbol
                )}
                <div>
                  <h3 className="text-xl font-bold">
                    {dog.name}
                  </h3>
                  {dog.registrationName && (
                    <p className="text-sm text-muted-foreground mt-0.5">{dog.registrationName}</p>
                  )}
                  <span className="text-stone-600">• {formatAge(new Date(dog.birthDate))}</span>
                </div>
              </div>
              <p className="text-stone-600 mb-4">{dog.description}</p>
            </div>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}