import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Litter, Dog, DogMedia } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface LitterWithRelations extends Litter {
  mother: Dog & { media?: DogMedia[] };
  father: Dog & { media?: DogMedia[] };
}

export default function DogFutureLitters() {
  const [, navigate] = useLocation();
  const { data: litters, isLoading } = useQuery<LitterWithRelations[]>({
    queryKey: ['/api/litters/list/future'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-8"></div>
            {[1, 2].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!litters?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Future Litters Planned</h1>
        <p className="text-muted-foreground mb-8">
          We don't have any future litters planned at this time. Check back soon for updates!
        </p>
        <Button onClick={() => navigate('/dogs')}>
          View Our Dogs
        </Button>
      </div>
    );
  }
  
  // Sort litters by due date (soonest first)
  const sortedLitters = [...litters].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Future Litters</h1>
        <p className="text-muted-foreground mb-8">
          Planned breeding pairs and expected litters. Join our waitlist to be notified when puppies become available.
        </p>
        
        <div className="grid gap-8">
          {sortedLitters.map((litter) => (
            <Card
              key={litter.id}
              className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => navigate(`/dogs/litters/${litter.id}`)}
            >
              {/* Header banner for future litters */}
              <div className="bg-amber-50 p-4 border-b border-amber-100">
                <span className="bg-amber-100 px-3 py-1 rounded-full text-amber-800 text-sm font-semibold">
                  Future Litter
                </span>
                <h3 className="text-xl font-semibold mt-2">
                  Planned Breeding
                </h3>
                <p className="text-muted-foreground">
                  Expected: {format(new Date(litter.dueDate), 'MMM d, yyyy')}
                </p>
                {litter.expectedBreedingDate && (
                  <p className="text-muted-foreground text-sm">
                    Expected breeding/availability: {format(new Date(litter.expectedBreedingDate), 'MMM yyyy')}
                  </p>
                )}
                {litter.expectedPickupDate && (
                  <p className="text-muted-foreground text-sm">
                    Expected pickup: {format(new Date(litter.expectedPickupDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  
                  {/* Parent information and images */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {litter.mother?.name || "Unknown Dam"} × {litter.father?.name || "Unknown Sire"}
                      </h3>
                      <p className="text-muted-foreground mb-3">Planned Parent Pairing</p>
                      
                      {/* Parents info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-500`}>♀</div>
                        <span className="text-sm">
                          <span className="font-medium">{litter.mother?.name || "Unknown Dam"}</span>
                          <span className="text-muted-foreground ml-1">(Dam)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500`}>♂</div>
                        <span className="text-sm">
                          <span className="font-medium">{litter.father?.name || "Unknown Sire"}</span>
                          <span className="text-muted-foreground ml-1">(Sire)</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Parent images side by side */}
                    <div className="flex gap-2">
                      {/* Dam's image */}
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-sm border border-pink-100">
                        {litter.mother?.profileImageUrl ? (
                          <img 
                            src={litter.mother.profileImageUrl} 
                            alt={litter.mother.name}
                            className="w-full h-full object-cover"
                          />
                        ) : litter.mother?.media?.find(m => m.type === 'image') ? (
                          <img 
                            src={litter.mother.media.find(m => m.type === 'image')!.url} 
                            alt={litter.mother.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-pink-50">
                            <span className="text-xl text-pink-400">♀</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Sire's image */}
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-sm border border-blue-100">
                        {litter.father?.profileImageUrl ? (
                          <img 
                            src={litter.father.profileImageUrl} 
                            alt={litter.father.name}
                            className="w-full h-full object-cover"
                          />
                        ) : litter.father?.media?.find(m => m.type === 'image') ? (
                          <img 
                            src={litter.father.media.find(m => m.type === 'image')!.url} 
                            alt={litter.father.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50">
                            <span className="text-xl text-blue-400">♂</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional info for future litters */}
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-amber-800">Join Our Waitlist</h4>
                    <p className="text-sm text-amber-700">
                      Interested in a puppy from this planned litter? Contact us to join our waitlist and be the first to know when puppies become available.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}