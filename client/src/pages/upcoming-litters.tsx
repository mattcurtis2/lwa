import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dog, DogMedia, Litter } from "@db/schema";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import DogForm from "@/components/forms/dog-form";

interface PastLitter extends Litter {
  mother: Dog & { media?: DogMedia[] };
  father: Dog & { media?: DogMedia[] };
  puppies: (Dog & { media?: DogMedia[] })[];
}

export default function UpcomingLitters() {
  const [_, navigate] = useLocation();
  const [showDogForm, setShowDogForm] = useState(false);
  const [selectedDog, setSelectedDog] = useState<Partial<Dog> | null>(null);

  const { data: litters, isLoading } = useQuery<PastLitter[]>({
    queryKey: ["/api/litters/list/current"],
  });

  const { data: futureLitters, isLoading: futureLittersLoading } = useQuery<PastLitter[]>({
    queryKey: ["/api/litters/list/future"],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    document.title = 'Upcoming Colorado Mountain Dog Litters | Puppies Available | Little Way Acres';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Upcoming Colorado Mountain Dog litters at Little Way Acres in Hudsonville, Michigan. CMDRs puppies available for families and farms in Grand Rapids, Holland, Zeeland, and West Michigan area.');
    }
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'Colorado Mountain Dog puppies Hudsonville, CMD litters Grand Rapids, livestock guardian dogs Michigan, CMDRs puppies Holland Zeeland, West Michigan guardian dogs');
    
    // Open Graph tags
    const ogTags = {
      'og:title': 'Upcoming Colorado Mountain Dog Litters | Little Way Acres',
      'og:description': 'Upcoming Colorado Mountain Dog litters at Little Way Acres in Hudsonville, Michigan. CMDRs puppies available for families and farms.',
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
  }, [litters, futureLitters]);

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

  if (!litters?.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">No Current Litters</h1>
          <p className="text-muted-foreground mb-8">
            We currently don't have any available puppies.
            Please check back later or contact us for more information.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate('/dogs')}
              variant="outline"
              size="lg"
            >
              View Our Dogs
            </Button>
            <Button 
              onClick={() => navigate('/dogs/past-litters')}
              variant="outline"
              size="lg"
            >
              View Past Litters
            </Button>
          </div>
        </div>

        {/* Future Litters Section */}
        {futureLitters && futureLitters.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-center">Upcoming Litters</h2>
            <div className="grid gap-6">
              {futureLitters.map((litter) => (
                <Card key={litter.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-[1fr,2fr] gap-6">
                      <div>
                        <div className="bg-secondary py-2 px-4 rounded-full text-secondary-foreground text-sm font-semibold mb-3 inline-block">
                          Planned for {formatDisplayDate(litter.dueDate)}
                        </div>
                        <p className="text-muted-foreground text-sm mt-2">
                          {litter.waitlistLink && (
                            <Button 
                              onClick={() => window.open(litter.waitlistLink, '_blank')}
                              size="sm"
                              className="mt-2"
                            >
                              Sign Up Here
                            </Button>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-2 rounded-lg">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                            {litter.mother.profileImageUrl ? (
                              <img
                                src={litter.mother.profileImageUrl}
                                alt={litter.mother.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                                <span className="text-2xl text-pink-500">♀</span>
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
                                src={litter.father.profileImageUrl}
                                alt={litter.father.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                                <span className="text-2xl text-blue-500">♂</span>
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
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Current Litters</h1>
      <div className="grid gap-8">
        {litters.map((litter) => (
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
                          src={litter.mother.profileImageUrl}
                          alt={litter.mother.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-pink-100 flex items-center justify-center">
                          <span className="text-2xl text-pink-500">♀</span>
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
                          src={litter.father.profileImageUrl}
                          alt={litter.father.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                          <span className="text-2xl text-blue-500">♂</span>
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
    </div>
  );
}