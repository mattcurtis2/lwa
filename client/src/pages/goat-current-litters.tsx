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
                <div className="flex flex-col gap-6">
                  
                  {/* Top section with litter info and first image */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {litter.mother?.name || "Unknown Dam"} × {litter.father?.name || "Unknown Sire"}
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        {litter.kids.length > 0 
                          ? `${litter.kids.length} ${litter.kids.length === 1 ? "Kid" : "Kids"} born ${format(new Date(litter.dueDate), 'MMM d, yyyy')}`
                          : `Expected ${format(new Date(litter.dueDate), 'MMM d, yyyy')}`}
                      </p>
                      
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
                    
                    {/* Main image */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden shadow-sm border">
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
                      ) : litter.father?.profileImageUrl ? (
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
                      ) : litter.kids.length > 0 && litter.kids[0]?.profileImageUrl ? (
                        <img 
                          src={litter.kids[0].profileImageUrl} 
                          alt={litter.kids[0].name}
                          className="w-full h-full object-cover"
                        />
                      ) : litter.kids.length > 0 && litter.kids[0]?.media?.find(m => m.type === 'image') ? (
                        <img 
                          src={litter.kids[0].media.find(m => m.type === 'image')!.url} 
                          alt={litter.kids[0].name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-amber-50">
                          <span className="text-4xl text-amber-300">🐐</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {litter.kids.length > 0 ? (
                    <>
                      <Separator className="my-2" />
                      
                      {/* Kids section */}
                      <div>
                        <h4 className="font-medium mb-3">Kids</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {litter.kids.slice(0, 4).map((kid) => (
                            <div key={kid.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                              <div className={`h-12 w-12 rounded-md overflow-hidden border ${kid.gender === 'female' ? 'border-pink-200' : 'border-blue-200'}`}>
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
                                  <div className={`w-full h-full flex items-center justify-center ${kid.gender === 'female' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                                    <span className={`text-lg ${kid.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                      {kid.gender === 'female' ? '♀' : '♂'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium flex items-center">
                                  {kid.name}
                                  <span className={`ml-1 ${kid.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
                                    {kid.gender === 'female' ? '♀' : '♂'}
                                  </span>
                                </div>
                                {kid.available && (
                                  <div className="text-xs text-green-600 font-medium">Available</div>
                                )}
                              </div>
                            </div>
                          ))}
                          {litter.kids.length > 4 && (
                            <div className="text-sm text-muted-foreground">
                              +{litter.kids.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Expecting new kids soon! Check back for updates.
                    </p>
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