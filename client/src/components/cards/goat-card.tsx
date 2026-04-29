
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatAge, parseApiDate } from "@/lib/date-utils";
import { Link } from "wouter";
import type { Goat } from "@db/schema";
import DogMediaCarousel from "./dog-media-carousel";

interface GoatCardProps {
  goat: Goat & {
    media?: { url: string; type: string }[];
  };
  isAdmin?: boolean;
  showPrice?: boolean;
  onEdit?: (goat: Goat) => void;
  onDelete?: (goat: Goat) => void;
  onOrderChange?: (goatId: number, newOrder: number) => void;
}

export function GoatCard({ goat, isAdmin, showPrice, onEdit, onDelete, onOrderChange }: GoatCardProps) {
  console.log('GoatCard rendered with:', { 
    goatId: goat.id,
    goatName: goat.name,
    available: goat.available, 
    price: goat.price, 
    showPrice 
  });
  
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
            {goat.media && goat.media.length > 0 ? (
              <div>
                <DogMediaCarousel media={goat.media} />
                {/* Removed price banner from image */}
              </div>
            ) : goat.profileImageUrl ? (
              <div>
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={goat.profileImageUrl} 
                    alt={goat.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Removed price banner from image */}
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No goat media available</p>
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
                      <span className="text-stone-600">• {formatAge(parseApiDate(goat.birthDate))}</span>
                    )}
                    {showPrice && goat.available && goat.price && !isNaN(parseInt(goat.price)) && (
                      <div className="mt-2">
                        <a 
                          href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary py-1 px-3 rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-sm font-semibold text-white">
                            Available: ${parseInt(goat.price).toLocaleString()}
                          </p>
                        </a>
                      </div>
                    )}
                    {showPrice && goat.available && goat.gender === "male" && goat.wetherPrice && !isNaN(parseInt(goat.wetherPrice)) && (
                      <div className="mt-2">
                        <a 
                          href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary py-1 px-3 rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-sm font-semibold text-white">
                            As Wether: ${parseInt(goat.wetherPrice).toLocaleString()}
                          </p>
                        </a>
                      </div>
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
                    <span className="text-stone-600">• {formatAge(parseApiDate(goat.birthDate))}</span>
                  )}
                  {showPrice && goat.available && goat.price && !isNaN(parseInt(goat.price)) && (
                    <div className="mt-2">
                      <a 
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary py-1 px-3 rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-sm font-semibold text-white">
                          Available: ${parseInt(goat.price).toLocaleString()}
                        </p>
                      </a>
                    </div>
                  )}
                  {showPrice && goat.available && goat.gender === "male" && goat.wetherPrice && !isNaN(parseInt(goat.wetherPrice)) && (
                    <div className="mt-2">
                      <a 
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary py-1 px-3 rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-sm font-semibold text-white">
                          As Wether: ${parseInt(goat.wetherPrice).toLocaleString()}
                        </p>
                      </a>
                    </div>
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
