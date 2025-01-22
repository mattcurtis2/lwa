import { Dog, DogMedia } from "@db/schema";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import { formatDisplayDate } from "@/lib/date-utils";

interface DogProfileProps {
  dog: Dog & { media?: DogMedia[] };
}

export default function DogProfile({ dog }: DogProfileProps) {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative overflow-hidden bg-muted">
        {dog.media && dog.media.length > 0 ? (
          <img
            src={dog.media[0].url}
            alt={dog.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage 
              src={dog.profileImageUrl || (dog.media && dog.media[0]?.url)} 
              alt={dog.name}
            />
            <AvatarFallback>
              <ImageIcon className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="text-xl font-semibold">{dog.name}</h3>
            {dog.registrationName && (
              <p className="text-sm text-muted-foreground">{dog.registrationName}</p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p>{calculateAge(dog.birthDate)} years</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
              <p>{formatDisplayDate(new Date(dog.birthDate))}</p>
            </div>
            {dog.color && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Color</p>
                <p>{dog.color}</p>
              </div>
            )}
            {dog.furLength && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fur Length</p>
                <p>{dog.furLength}</p>
              </div>
            )}
            {dog.height && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Height</p>
                <p>{dog.height} inches</p>
              </div>
            )}
            {dog.weight && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weight</p>
                <p>{dog.weight} lbs</p>
              </div>
            )}
          </div>

          {dog.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">About</p>
              <p className="text-sm">{dog.description}</p>
            </div>
          )}

          {dog.narrativeDescription && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Details</p>
              <p className="text-sm">{dog.narrativeDescription}</p>
            </div>
          )}

          {dog.healthData && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Health Information</p>
              <p className="text-sm">{dog.healthData}</p>
            </div>
          )}
        </div>

        {dog.media && dog.media.length > 1 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Gallery</p>
            <div className="grid grid-cols-3 gap-2">
              {dog.media.slice(1).map((media, index) => (
                <div key={index} className="aspect-square relative overflow-hidden rounded-md bg-muted">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt={`${dog.name} gallery ${index + 2}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="absolute inset-0 w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
