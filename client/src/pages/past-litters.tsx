import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dog, DogMedia, Litter } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import SimplePuppyMap from "@/components/simple-puppy-map";

interface PastLitter extends Litter {
  mother: Dog & { media?: DogMedia[] };
  father: Dog & { media?: DogMedia[] };
  puppies: (Dog & { media?: DogMedia[] })[];
}

export default function PastLitters() {
  const [_, navigate] = useLocation();

  const { data: litters, isLoading } = useQuery<PastLitter[]>({
    queryKey: ["/api/litters/list/past"],
  });

  // Show loading skeleton
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">No Past Litters</h1>
          <p className="text-muted-foreground">
            We don't have any past litters to display at this time.
          </p>
        </div>
      </div>
    );
  }

  // Get all puppies from past litters for the map
  const allPuppies = litters?.flatMap(litter => litter.puppies) || [];

  // Sort litters by due date (most recent first)
  const sortedLitters = [...litters].sort((a, b) => {
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Past Litters</h1>
        
        {/* Puppy Placement Map - Hidden for now */}
        {/* <div className="mb-12">
          <SimplePuppyMap puppies={allPuppies} />
        </div> */}
        
        <div className="grid gap-8">
          {sortedLitters.map((litter) => (
            <Card
              key={litter.id}
              className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => navigate(`/dogs/litters/${litter.id}`)}
            >
              {/* Header banner for past litters */}
              <div className="bg-stone-50 p-4 border-b border-stone-100">
                <span className="bg-stone-100 px-3 py-1 rounded-full text-stone-800 text-sm font-semibold">
                  Past Litter
                </span>
                <h3 className="text-xl font-semibold mt-2">
                  {litter.puppies.length} {litter.puppies.length === 1 ? "Puppy" : "Puppies"}
                </h3>
                <p className="text-muted-foreground">
                  Born: {format(new Date(litter.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
              
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  
                  {/* Parent information and images */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {litter.mother?.name || "Unknown Dam"} × {litter.father?.name || "Unknown Sire"}
                      </h3>
                      <p className="text-muted-foreground mb-3">Parent Information</p>
                      
                      {/* Parents info */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">♀</div>
                        <span className="text-sm">
                          <span className="font-medium">{litter.mother?.name || "Unknown Dam"}</span>
                          <span className="text-muted-foreground ml-1">(Dam)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">♂</div>
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

                  {litter.puppies.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      
                      {/* Puppies section */}
                      <div>
                        <h4 className="font-medium mb-3">Puppies from this Litter</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {litter.puppies.map((puppy) => (
                            <div key={puppy.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-slate-50 transition-colors">
                              <div className={`h-16 w-16 md:h-20 md:w-20 rounded-md overflow-hidden border-2 ${puppy.gender === 'female' ? 'border-pink-200' : 'border-blue-200'}`}>
                                {puppy.profileImageUrl ? (
                                  <img 
                                    src={puppy.profileImageUrl} 
                                    alt={puppy.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : puppy.media?.find(m => m.type === 'image') ? (
                                  <img 
                                    src={puppy.media.find(m => m.type === 'image')!.url} 
                                    alt={puppy.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${puppy.gender === 'female' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                                    <span className={`text-2xl ${puppy.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                      {puppy.gender === 'female' ? '♀' : '♂'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-lg flex items-center">
                                  {puppy.name}
                                  <span className={`ml-1 ${puppy.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
                                    {puppy.gender === 'female' ? '♀' : '♂'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}