import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dog, DogMedia, Litter } from "@db/schema";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import DogForm from "@/components/forms/dog-form";
import { Plus, Edit } from "lucide-react";

export default function UpcomingLitters() {
  const [_, navigate] = useLocation();
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);

  const { data: litters, isLoading } = useQuery<(Litter & {
    mother: Dog & { media?: DogMedia[] },
    father: Dog & { media?: DogMedia[] },
    puppies?: Dog[]
  })[]>({
    queryKey: ["/api/litters"],
    select: (data) => {
      // Add debug logging
      console.log('Fetched litters:', data);
      return data;
    }
  });

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Current Litters</h1>
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr,2fr] gap-6">
                  <div>
                    <div className="bg-muted h-6 w-32 rounded-full mb-3" />
                    <div className="bg-muted h-4 w-48 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-muted" />
                        <div className="space-y-2">
                          <div className="bg-muted h-4 w-24 rounded" />
                          <div className="bg-muted h-3 w-16 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentLitters = litters?.filter(litter => {
    console.log('Checking litter:', litter.id, 'puppies:', litter.puppies);
    // Show litter if it has any available puppies
    return litter.puppies?.some(puppy => {
      console.log('Checking puppy:', puppy.id, 'available:', puppy.available);
      return puppy.available;
    }) ?? false;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  console.log('Filtered current litters:', currentLitters);

  if (!currentLitters?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Current Litters</h1>
        <p className="text-muted-foreground">
          We currently don't have any available puppies.
          Please check back later or contact us for more information.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Current Litters</h1>
        <div className="grid gap-8">
          {currentLitters.map((litter) => (
            <Card
              key={litter.id}
              className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => navigate(`/dogs/litters/${litter.id}`)}
            >
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr,2fr] gap-6">
                  <div>
                    <div className="bg-primary py-2 px-4 rounded-full text-white text-sm font-semibold mb-3 inline-block">
                      {litter.puppies?.filter(p => p.available).length} Available {
                        litter.puppies?.filter(p => p.available).length === 1 ? "Puppy" : "Puppies"
                      }
                    </div>

                    <p className="text-muted-foreground text-sm mt-2">
                      Click to view detailed information about this litter
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-2 rounded-lg">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {litter.mother.profileImageUrl ? (
                          <img
                            src={litter.mother.profileImageUrl.startsWith('http') ? litter.mother.profileImageUrl : litter.mother.profileImageUrl.startsWith('/') ? litter.mother.profileImageUrl : `/${litter.mother.profileImageUrl}`}
                            alt={litter.mother.name}
                            className="w-full h-full object-cover"
                          />
                        ) : litter.mother.media && litter.mother.media.length > 0 && litter.mother.media[0].type === 'image' ? (
                          <img
                            src={litter.mother.media[0].url.startsWith('http') ? litter.mother.media[0].url : litter.mother.media[0].url.startsWith('/') ? litter.mother.media[0].url : `/${litter.mother.media[0].url}`}
                            alt={litter.mother.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                            <span className="text-3xl text-pink-500">♀</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{litter.mother.name}</p>
                        <p className="text-sm text-muted-foreground">Mother</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-2 rounded-lg">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {litter.father.profileImageUrl ? (
                          <img
                            src={litter.father.profileImageUrl.startsWith('http') ? litter.father.profileImageUrl : litter.father.profileImageUrl.startsWith('/') ? litter.father.profileImageUrl : `/${litter.father.profileImageUrl}`}
                            alt={litter.father.name}
                            className="w-full h-full object-cover"
                          />
                        ) : litter.father.media && litter.father.media.length > 0 && litter.father.media[0].type === 'image' ? (
                          <img
                            src={litter.father.media[0].url.startsWith('http') ? litter.father.media[0].url : litter.father.media[0].url.startsWith('/') ? litter.father.media[0].url : `/${litter.father.media[0].url}`}
                            alt={litter.father.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                            <span className="text-3xl text-blue-500">♂</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{litter.father.name}</p>
                        <p className="text-sm text-muted-foreground">Father</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dog Form Modal */}
      {showDogForm && (
        <DogForm
          open={showDogForm}
          onOpenChange={setShowDogForm}
          dog={selectedDog as Dog}
          mode={selectedDog?.id ? 'edit' : 'create'}
          fromLitter={true}
        />
      )}
    </>
  );
}