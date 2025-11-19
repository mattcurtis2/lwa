import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { SheepLitter } from "@db/schema";
import { formatDisplayDate, parseApiDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";

export default function SheepPastLitters() {
  const [_, navigate] = useLocation();

  const { data: litters, isLoading } = useQuery<SheepLitter[]>({
    queryKey: ["/api/sheep-litters/list/past"],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    document.title = 'Past Sheep Litters | Breeding History | Little Way Acres';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Past sheep litters from Little Way Acres in Hudsonville, Michigan. Our breeding history and successful lambs placed in homes throughout Grand Rapids, Holland, Zeeland, Byron Center, and West Michigan area.');
    }
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'past sheep litters Hudsonville, sheep breeding history Grand Rapids, sheep breeding success Holland Zeeland, West Michigan sheep program, Ottawa County sheep breeders');
    
    // Open Graph tags
    const ogTags = {
      'og:title': 'Past Sheep Litters | Little Way Acres',
      'og:description': 'Past sheep litters from Little Way Acres in Hudsonville, Michigan. View our breeding history and success.',
      'og:image': '/logo.png',
      'og:url': window.location.href,
      'og:type': 'website',
      'og:site_name': 'Little Way Acres'
    };
    
    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
    
    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
    
    const existingScript = document.querySelector('script[data-page="sheep-past-litters"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'sheep-past-litters');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Past Sheep Litters",
      "description": "Past sheep litters and breeding history in Hudsonville, Michigan area",
      "url": `${window.location.origin}/sheep/litters/past`,
      "areaServed": {
        "@type": "Place",
        "name": "West Michigan - Hudsonville Area",
        "geo": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": "42.8736",
            "longitude": "-85.8681"
          },
          "geoRadius": "50"
        }
      }
    });
    
    document.head.appendChild(script);
  }, [litters]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Past Litters</h1>
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

  if (!litters?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Past Litters</h1>
        <p className="text-muted-foreground">
          We don't have any past litters to display at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Past Litters</h1>
      <div className="grid gap-8">
        {litters.map((litter) => (
          <Card
            key={litter.id}
            className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => navigate(`/sheep/litters/${litter.id}`)}
          >
            <CardContent className="p-6">
              <div className="grid md:grid-cols-[1fr,2fr] gap-6">
                <div>
                  <div className="bg-stone-200/80 backdrop-blur-sm px-3 py-1 rounded-full text-stone-800 text-sm font-semibold mb-3 inline-block">
                    Born {litter.dueDate ? formatDisplayDate(parseApiDate(litter.dueDate)) : "N/A"}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {litter.lambs?.length || 0} {litter.lambs?.length === 1 ? "lamb" : "lambs"} from this litter
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {litter.mother?.profileImageUrl ? (
                        <img
                          src={litter.mother.profileImageUrl}
                          alt={litter.mother.name}
                          className="w-full h-full object-cover"
                        />
                      ) : litter.mother?.media && litter.mother.media.length > 0 && litter.mother.media[0].type === 'image' ? (
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
                      <p className="font-medium">{litter.mother?.name}</p>
                      <p className="text-sm text-muted-foreground">Dam</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {litter.father?.profileImageUrl ? (
                        <img
                          src={litter.father.profileImageUrl}
                          alt={litter.father.name}
                          className="w-full h-full object-cover"
                        />
                      ) : litter.father?.media && litter.father.media.length > 0 && litter.father.media[0].type === 'image' ? (
                        <img
                          src={litter.father.media[0].url}
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
                      <p className="font-medium">{litter.father?.name}</p>
                      <p className="text-sm text-muted-foreground">Sire</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
