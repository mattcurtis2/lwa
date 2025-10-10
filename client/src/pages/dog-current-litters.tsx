import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import type { Litter, Dog, DogMedia, ContactInfo } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { parseApiDate } from "@/lib/date-utils";
import { Heart, Mail } from "lucide-react";

interface LitterWithRelations extends Litter {
  mother: Dog & { media?: DogMedia[] };
  father: Dog & { media?: DogMedia[] };
  puppies: (Dog & { media?: DogMedia[] })[];
}

export default function DogCurrentLitters() {
  const [, navigate] = useLocation();
  const { data: litters, isLoading } = useQuery<LitterWithRelations[]>({
    queryKey: ['/api/litters/list/current'],
  });

  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ['/api/contact-info'],
  });

  // Helper function to handle interest form button click
  const handleInterestClick = (litter: LitterWithRelations, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to litter detail
    
    if (litter.waitlistLink) {
      // Open existing waitlist link
      window.open(litter.waitlistLink, '_blank');
    } else if (contactInfo?.email) {
      // Create email with pre-filled subject about this litter
      const subject = `Interest in ${litter.mother?.name || "Unknown Dam"} × ${litter.father?.name || "Unknown Sire"} Litter`;
      const body = `Hi! I'm interested in learning more about the litter from ${litter.mother?.name || "Unknown Dam"} and ${litter.father?.name || "Unknown Sire"} that's ${litter.puppies.length > 0 ? 'currently available' : 'expected on ' + format(parseApiDate(litter.dueDate), 'MMM d, yyyy')}. Please let me know how I can get more information or join the waitlist.`;
      const mailtoLink = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // SEO optimization for current litters page
    document.title = 'Current Colorado Mountain Dog Litters | Available CMDR Puppies | Little Way Acres, MI';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Current Colorado Mountain Dog litters available at Little Way Acres in Hudsonville, Michigan. View our CMDR puppies ready for loving homes. Gentle, intelligent livestock guardian dogs perfect for families and farms.');
    }
    
    // Add keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'current CMDR litters, Colorado Mountain Dog puppies, available puppies, Hudsonville Michigan, livestock guardian puppies, CMDR breed, family farm dogs');
    
    // Open Graph meta tags
    const updateOrCreateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };
    
    updateOrCreateMetaTag('og:title', 'Current Colorado Mountain Dog Litters | Available CMDR Puppies');
    updateOrCreateMetaTag('og:description', 'Current Colorado Mountain Dog litters available at Little Way Acres in Hudsonville, Michigan. View our CMDR puppies ready for loving homes.');
    updateOrCreateMetaTag('og:type', 'website');
    updateOrCreateMetaTag('og:url', window.location.href);
    updateOrCreateMetaTag('og:image', '/logo.png');
    
    // Structured data for current litters
    const existingScript = document.querySelector('script[data-page="current-litters"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'current-litters');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Current Colorado Mountain Dog Litters",
      "description": "Current Colorado Mountain Dog litters available at Little Way Acres",
      "url": `${window.location.origin}/dogs/litters/current`,
      "mainEntity": {
        "@type": "ItemList",
        "name": "Current CMDR Litters",
        "description": "Colorado Mountain Dog litters currently available",
        "numberOfItems": litters?.length || 0
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin},
          {"@type": "ListItem", "position": 2, "name": "Dogs", "item": `${window.location.origin}/dogs`},
          {"@type": "ListItem", "position": 3, "name": "Current Litters", "item": `${window.location.origin}/dogs/litters/current`}
        ]
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    });
    
    document.head.appendChild(script);
  }, [litters]);

  const { data: futureLitters, isLoading: futureLittersLoading } = useQuery<LitterWithRelations[]>({
    queryKey: ['/api/litters/list/future'],
  });
  
  // Function to get a suitable image for a litter
  const getLitterImage = (litter: LitterWithRelations): string | null => {
    // First try to get an image from puppies
    if (litter.puppies.length > 0) {
      for (const puppy of litter.puppies) {
        if (puppy.profileImageUrl) return puppy.profileImageUrl;
        if (puppy.media && puppy.media.length > 0) {
          const imgMedia = puppy.media.find(m => m.type === 'image');
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
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">No Current Litters</h1>
          <p className="text-muted-foreground mb-8">
            We don't have any current litters to display at this time.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/dogs')} variant="outline" size="lg">
              View Our Dogs
            </Button>
            <Button onClick={() => navigate('/dogs/litters/past')} variant="outline" size="lg">
              View Past Litters
            </Button>
          </div>
        </div>

        {/* Future Litters Section */}
        {futureLitters && futureLitters.length > 0 && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Upcoming Litters</h2>
            <div className="grid gap-6">
              {futureLitters.map((litter) => (
                <Card key={litter.id} className="overflow-hidden">
                  <div className="bg-blue-50 p-4 border-b border-blue-100">
                    <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm font-semibold">
                      Planned Litter
                    </span>
                    <h3 className="text-xl font-semibold mt-2">
                      Due: {format(parseApiDate(litter.dueDate), 'MMM d, yyyy')}
                    </h3>
                    {litter.waitlistLink && (
                      <Button 
                        onClick={() => litter.waitlistLink && window.open(litter.waitlistLink, '_blank')}
                        size="sm"
                        className="mt-2"
                      >
                        Sign Up Here
                      </Button>
                    )}
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
                        
                        <div className="flex gap-2">
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
                      
                      <p className="text-muted-foreground text-sm">
                        Expecting new puppies soon! Check back for updates.
                      </p>
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
  
  // Sort litters - those with puppies first, then by due date (most recent first)
  const sortedLitters = [...litters].sort((a, b) => {
    // Litters with puppies come first
    if (a.puppies.length > 0 && b.puppies.length === 0) return -1;
    if (a.puppies.length === 0 && b.puppies.length > 0) return 1;
    
    // Then sort by due date (most recent first)
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
              onClick={() => navigate(`/dogs/litters/${litter.id}`)}
            >
              {/* Simple header banner */}
              <div className="bg-blue-50 p-4 border-b border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-800 text-sm font-semibold">
                      {litter.puppies.length > 0 ? "Current Litter" : "Upcoming Litter"}
                    </span>
                    <h3 className="text-xl font-semibold mt-2">
                      {litter.puppies.length > 0 
                        ? `${litter.puppies.length} ${litter.puppies.length === 1 ? "Puppy" : "Puppies"}` 
                        : "Upcoming Litter"}
                    </h3>
                    <p className="text-muted-foreground">
                      {litter.puppies.length > 0 
                        ? `Born: ${format(parseApiDate(litter.dueDate), 'MMM d, yyyy')}` 
                        : `Due: ${format(parseApiDate(litter.dueDate), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                  
                  {/* Interest Form Button */}
                  <Button
                    onClick={(e) => handleInterestClick(litter, e)}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 self-start sm:self-center"
                    size="sm"
                  >
                    <Heart className="h-4 w-4" />
                    {litter.puppies.length > 0 ? "Reserve a Puppy" : "Join Our Waitlist"}
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  
                  {/* Top section with litter info and parent images */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {litter.mother?.name || "Unknown Dam"} × {litter.father?.name || "Unknown Sire"}
                      </h3>
                      <p className="text-muted-foreground mb-3">Parent Information</p>
                      
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

                  {litter.puppies.length > 0 ? (
                    <>
                      <Separator className="my-2" />
                      
                      {/* Puppies section */}
                      <div>
                        <h4 className="font-medium mb-3">Puppies</h4>
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
                                {puppy.available && !puppy.sold ? (
                                  <div className="text-sm text-green-600 font-medium">Available</div>
                                ) : puppy.sold ? (
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
                      Expecting new puppies soon! Check back for updates.
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