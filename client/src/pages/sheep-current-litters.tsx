import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import type { SheepLitter, Sheep, SheepMedia } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { parseApiDate } from "@/lib/date-utils";

interface LitterWithRelations extends SheepLitter {
  mother: Sheep & { media?: SheepMedia[] };
  father: Sheep & { media?: SheepMedia[] };
  lambs: (Sheep & { media?: SheepMedia[] })[];
}

export default function SheepCurrentLitters() {
  const [, navigate] = useLocation();
  const { data: litters, isLoading } = useQuery<LitterWithRelations[]>({
    queryKey: ['/api/sheep-litters/list/current'],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    document.title = 'Current Sheep Litters | Lambs Available | Hudsonville, Grand Rapids, MI';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Current sheep litters available at Little Way Acres in Hudsonville, Michigan. Lambs ready for pickup in Grand Rapids, Holland, Zeeland, Byron Center, and surrounding West Michigan communities within 50 miles. Perfect for small farms and homesteads.');
    }
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'current sheep litters Hudsonville, lambs Grand Rapids, sheep lambs Holland Zeeland, West Michigan sheep, Byron Center livestock, sheep Ottawa County');
    
    const existingScript = document.querySelector('script[data-page="sheep-current-litters"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'sheep-current-litters');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Current Sheep Litters",
      "description": "Current sheep litters available in Hudsonville, Michigan area",
      "url": `${window.location.origin}/sheep/litters/current`,
      "areaServed": {
        "@type": "Place",
        "name": "West Michigan - 50 Mile Radius from Hudsonville",
        "geo": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": "42.8736",
            "longitude": "-85.8681"
          },
          "geoRadius": "50"
        }
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    });
    
    document.head.appendChild(script);
  }, [litters]);
  
  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    if (url === 'data:,' || url === 'data:') return false;
    return true;
  };
  
  const getLitterImage = (litter: LitterWithRelations): string | null => {
    if (litter.lambs.length > 0) {
      for (const lamb of litter.lambs) {
        if (isValidImageUrl(lamb.profileImageUrl)) return lamb.profileImageUrl;
        if (lamb.media && lamb.media.length > 0) {
          const imgMedia = lamb.media.find(m => m.type === 'image');
          if (imgMedia) return imgMedia.url;
        }
      }
    }
    
    if (litter.mother) {
      if (isValidImageUrl(litter.mother.profileImageUrl)) return litter.mother.profileImageUrl;
      if (litter.mother.media && litter.mother.media.length > 0) {
        const imgMedia = litter.mother.media.find(m => m.type === 'image');
        if (imgMedia) return imgMedia.url;
      }
    }
    
    if (litter.father) {
      if (isValidImageUrl(litter.father.profileImageUrl)) return litter.father.profileImageUrl;
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
        <Button onClick={() => navigate('/sheep')}>
          View Our Sheep
        </Button>
      </div>
    );
  }
  
  const sortedLitters = [...litters].sort((a, b) => {
    if (a.lambs.length > 0 && b.lambs.length === 0) return -1;
    if (a.lambs.length === 0 && b.lambs.length > 0) return 1;
    
    const dateA = parseApiDate(a.dueDate);
    const dateB = parseApiDate(b.dueDate);
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
              onClick={() => navigate(`/sheep/litters/${litter.id}`)}
            >
              <div className="bg-amber-50 p-4 border-b border-amber-100">
                <span className="bg-amber-100 px-3 py-1 rounded-full text-amber-800 text-sm font-semibold">
                  {litter.lambs.length > 0 ? "Current Litter" : "Upcoming Litter"}
                </span>
                <h3 className="text-xl font-semibold mt-2">
                  {litter.lambs.length > 0 
                    ? `${litter.lambs.length} ${litter.lambs.length === 1 ? "Lamb" : "Lambs"}` 
                    : "Upcoming Litter"}
                </h3>
                <p className="text-muted-foreground">
                  {litter.lambs.length > 0 
                    ? `Born: ${format(parseApiDate(litter.dueDate), 'MMM d, yyyy')}` 
                    : `Due: ${format(parseApiDate(litter.dueDate), 'MMM d, yyyy')}`}
                </p>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {litter.mother?.name || "Unknown Dam"} × {litter.father?.name || "Unknown Sire"}
                      </h3>
                      <p className="text-muted-foreground mb-3">Parent Information</p>
                      
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
                    
                    <div className="flex gap-2">
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-sm border border-pink-100">
                        {isValidImageUrl(litter.mother?.profileImageUrl) ? (
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
                      
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-sm border border-blue-100">
                        {isValidImageUrl(litter.father?.profileImageUrl) ? (
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

                  {litter.lambs.length > 0 ? (
                    <>
                      <Separator className="my-2" />
                      
                      <div>
                        <h4 className="font-medium mb-3">Lambs</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {litter.lambs.map((lamb) => (
                            <div key={lamb.id} className="flex items-center gap-4 p-3 rounded-md hover:bg-slate-50 transition-colors">
                              <div className={`h-16 w-16 md:h-20 md:w-20 rounded-md overflow-hidden border-2 ${lamb.gender === 'female' ? 'border-pink-200' : 'border-blue-200'}`}>
                                {isValidImageUrl(lamb.profileImageUrl) ? (
                                  <img 
                                    src={lamb.profileImageUrl} 
                                    alt={lamb.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : lamb.media?.find(m => m.type === 'image') ? (
                                  <img 
                                    src={lamb.media.find(m => m.type === 'image')!.url} 
                                    alt={lamb.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${lamb.gender === 'female' ? 'bg-pink-50' : 'bg-blue-50'}`}>
                                    <span className={`text-2xl ${lamb.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                                      {lamb.gender === 'female' ? '♀' : '♂'}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-lg flex items-center">
                                  {lamb.name}
                                  <span className={`ml-1 ${lamb.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
                                    {lamb.gender === 'female' ? '♀' : '♂'}
                                  </span>
                                </div>
                                {lamb.available && !lamb.sold ? (
                                  <div className="text-sm text-green-600 font-medium">Available</div>
                                ) : lamb.sold ? (
                                  <div className="text-sm text-red-600 font-medium">Sold</div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Expecting new lambs soon! Check back for updates.
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
