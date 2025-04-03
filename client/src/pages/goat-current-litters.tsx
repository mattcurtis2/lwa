import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { GoatLitter, Goat, GoatMedia } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface LitterWithRelations extends GoatLitter {
  mother: Goat & { media?: GoatMedia[] };
  father: Goat & { media?: GoatMedia[] };
  kids: (Goat & { media?: GoatMedia[] })[];
}

export default function GoatCurrentLitters() {
  const [, navigate] = useLocation();
  const { data: litters, isLoading } = useQuery<LitterWithRelations[]>({
    queryKey: ['/api/goat-litters/list/current'],
  });
  
  // Function to get a suitable image for a litter
  const getLitterImage = (litter: LitterWithRelations): string | null => {
    // First try to get an image from kids
    if (litter.kids.length > 0) {
      for (const kid of litter.kids) {
        if (kid.profileImageUrl) return kid.profileImageUrl;
        if (kid.media && kid.media.length > 0) {
          const imgMedia = kid.media.find(m => m.type === 'image');
          if (imgMedia) return imgMedia.url;
        }
      }
    }
    
    // Then try mother
    if (litter.mother) {
      if (litter.mother.profileImageUrl) return litter.mother.profileImageUrl;
      if (litter.mother.media && litter.mother.media.length > 0) {
        const imgMedia = litter.mother.media.find(m => m.type === 'image');
        if (imgMedia) return imgMedia.url;
      }
    }
    
    // Then try father
    if (litter.father) {
      if (litter.father.profileImageUrl) return litter.father.profileImageUrl;
      if (litter.father.media && litter.father.media.length > 0) {
        const imgMedia = litter.father.media.find(m => m.type === 'image');
        if (imgMedia) return imgMedia.url;
      }
    }
    
    return null;
  };

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
        <h1 className="text-3xl font-bold mb-4">No Current Litters</h1>
        <p className="text-muted-foreground mb-8">
          We don't have any current litters to display at this time.
        </p>
        <Button onClick={() => navigate('/goats')}>
          View Our Goats
        </Button>
      </div>
    );
  }
  
  // Sort litters - those with kids first, then by due date (most recent first)
  const sortedLitters = [...litters].sort((a, b) => {
    // Litters with kids come first
    if (a.kids.length > 0 && b.kids.length === 0) return -1;
    if (a.kids.length === 0 && b.kids.length > 0) return 1;
    
    // Then sort by due date (most recent first)
    const dateA = new Date(a.dueDate);
    const dateB = new Date(b.dueDate);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Current Litters</h1>
        <div className="grid gap-8">
          {sortedLitters.map((litter) => (
            <Card
              key={litter.id}
              className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => navigate(`/goats/litters/${litter.id}`)}
            >
              {/* Simple header banner */}
              <div className="bg-amber-50 p-4 border-b border-amber-100">
                <span className="bg-amber-100 px-3 py-1 rounded-full text-amber-800 text-sm font-semibold">
                  {litter.kids.length > 0 ? "Current Litter" : "Upcoming Litter"}
                </span>
                <h3 className="text-xl font-semibold mt-2">
                  {litter.kids.length > 0 
                    ? `${litter.kids.length} ${litter.kids.length === 1 ? "Kid" : "Kids"}` 
                    : "Upcoming Litter"}
                </h3>
                <p className="text-muted-foreground">
                  {litter.kids.length > 0 
                    ? `Born: ${format(new Date(litter.dueDate), 'MMM d, yyyy')}` 
                    : `Due: ${format(new Date(litter.dueDate), 'MMM d, yyyy')}`}
                </p>
              </div>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr] gap-6">
                  
                  <div>
                    {/* Parent section */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Parents</h4>
                      <div className="flex flex-wrap justify-center gap-4 mb-2">
                        {/* Mother card with larger image */}
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-pink-100 border-2 border-pink-300 flex-shrink-0 shadow-md hover:shadow-lg transition-all">
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
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl text-pink-500">♀</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <span className="font-medium">
                              {litter.mother?.name || "Unknown Dam"} <span className="text-pink-500">♀</span>
                            </span>
                            <div className="text-xs text-muted-foreground">Dam</div>
                          </div>
                        </div>
                        
                        {/* Father card with larger image */}
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 border-2 border-blue-300 flex-shrink-0 shadow-md hover:shadow-lg transition-all">
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
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl text-blue-500">♂</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-center">
                            <span className="font-medium">
                              {litter.father?.name || "Unknown Sire"} <span className="text-blue-500">♂</span>
                            </span>
                            <div className="text-xs text-muted-foreground">Sire</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    {/* Kids section */}
                    <div>
                      <h4 className="font-medium mb-3">
                        {litter.kids.length > 0 ? 'Kids' : 'Status'}
                      </h4>
                      {litter.kids.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                          {litter.kids.slice(0, 4).map((kid) => (
                            <div key={kid.id} className="flex flex-col items-center">
                              <div className={`w-16 h-16 rounded-full overflow-hidden ${kid.gender === 'female' ? 'bg-pink-50 border-pink-200' : 'bg-blue-50 border-blue-200'} border-2 flex-shrink-0 shadow hover:shadow-md transition-all`}>
                                {kid.profileImageUrl ? (
                                  <img 
                                    src={kid.profileImageUrl} 
                                    alt={kid.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : kid.media?.find(m => m.type === 'image') ? (
                                  <img 
                                    src={kid.media.find(m => m.type === 'image')!.url} 
                                    alt={kid.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className={`text-xl ${kid.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                      {kid.gender === 'female' ? '♀' : '♂'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-center">
                                <div className="font-medium">
                                  <span className={kid.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}>
                                    {kid.gender === 'female' ? '♀' : '♂'}
                                  </span>{' '}
                                  {kid.name}
                                </div>
                                {kid.available && <div className="text-xs text-green-600 font-medium">Available</div>}
                              </div>
                            </div>
                          ))}
                          {litter.kids.length > 4 && (
                            <div className="text-sm text-muted-foreground">
                              +{litter.kids.length - 4} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Expecting new kids soon! Check back for updates.
                        </p>
                      )}
                    </div>
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