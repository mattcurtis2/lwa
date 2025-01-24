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
    father: Dog & { media?: DogMedia[] }
  })[]>({
    queryKey: ["/api/litters"],
  });


  const handleDogFormClose = () => {
    setShowDogForm(false);
    setSelectedDog(null);
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Upcoming Litters</h1>
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

  const upcomingLitters = litters?.filter(litter => {
    const dueDate = new Date(litter.dueDate);
    const today = new Date();
    return dueDate > today;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (!upcomingLitters?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Upcoming Litters</h1>
        <p className="text-muted-foreground">
          We currently don't have any upcoming litters planned.
          Please check back later or contact us for more information.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Upcoming Litters</h1>
        <div className="grid gap-8">
          {upcomingLitters.map((litter) => (
            <Card
              key={litter.id}
              className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => navigate(`/dogs/litters/${litter.id}`)}
            >
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr,2fr] gap-6">
                  <div>
                    <div className="bg-amber-200/80 backdrop-blur-sm px-3 py-1 rounded-full text-amber-800 text-sm font-semibold mb-3 inline-block">
                      Expected {formatDisplayDate(new Date(litter.dueDate))}
                    </div>

                    <p className="text-muted-foreground text-sm mt-2">
                      Click to view detailed information about this upcoming litter
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg group"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                        {litter.mother.profileImageUrl ? (
                          <img
                            src={litter.mother.profileImageUrl}
                            alt={litter.mother.name}
                            className="w-full h-full object-cover"
                          />
                        ) : litter.mother.media && litter.mother.media.length > 0 && litter.mother.media[0].type === 'image' ? (
                          <img
                            src={litter.mother.media[0].url}
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

                    <div
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg group"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                        {(litter.father.profileImageUrl || (litter.father.media?.[0]?.type === 'image' && litter.father.media[0].url)) ? (
                          <img
                            src={litter.father.profileImageUrl || litter.father.media[0].url}
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
          onOpenChange={handleDogFormClose}
          dog={selectedDog as Dog}
          mode={selectedDog?.id ? 'edit' : 'create'}
          fromLitter={true} // Add this prop when opening from litter
        />
      )}
    </>
  );
}