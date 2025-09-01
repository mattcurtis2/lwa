
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dog, DogMedia } from "@db/schema";
import DogDetails from "@/components/dog-details";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { DogHero } from "@/components/sections/dog-hero";
import { SiteContent } from "@/lib/types";
import LitterBanner from "@/components/sections/litter-banner";

interface DogsProps {
  genderFilter?: 'male' | 'female';
  showAvailable?: boolean;
}

export default function Dogs({ genderFilter, showAvailable }: DogsProps) {
  const [_, navigate] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContent = (key: string) => {
    return siteContent.find((item) => item.key === key)?.value || "";
  };

  const { data: dogs } = useQuery<(Dog & { media?: DogMedia[] })[]>({
    queryKey: ["/api/dogs"],
    onSuccess: (data) => {
      console.log("Dogs fetched for public page:", data);
      if (data) {
        console.log("Number of dogs displayed:", data.length);
        console.log("Dogs with display=false:", data.filter(dog => dog.display === false).length);
      }
    }
  });

  // Fetch litter data to determine navigation link
  const { data: currentLitters } = useQuery<any[]>({
    queryKey: ["/api/litters/list/current"],
  });

  const { data: futureLitters } = useQuery<any[]>({
    queryKey: ["/api/litters/list/future"],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Enhanced SEO with structured data and comprehensive meta tags
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    let pageTitle = '';
    let pageDescription = '';
    let pageKeywords = '';
    let structuredData: any = {};
    
    if (genderFilter === 'female') {
      pageTitle = 'Colorado Mountain Dog Females | CMDR Breeding Dogs';
      pageDescription = 'Meet our exceptional Colorado Mountain Dog females at Little Way Acres in Hudsonville, Michigan. Champion CMDR breeding dogs known for gentle temperament, intelligence, and superior livestock guardian abilities. Perfect for family farms.';
      pageKeywords = 'Colorado Mountain Dog females, CMDR breeding dogs, female CMDR, livestock guardian dogs, Hudsonville Michigan, dog breeding, family farm dogs, gentle temperament dogs';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Colorado Mountain Dog Females",
        "description": pageDescription,
        "url": `${window.location.origin}/dogs/females`,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Female Colorado Mountain Dogs",
          "description": "Our breeding female Colorado Mountain Dogs",
          "numberOfItems": dogs?.filter(dog => dog.gender === 'female' && dog.display).length || 0
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin},
            {"@type": "ListItem", "position": 2, "name": "Dogs", "item": `${window.location.origin}/dogs`},
            {"@type": "ListItem", "position": 3, "name": "Females", "item": `${window.location.origin}/dogs/females`}
          ]
        }
      };
    } else if (genderFilter === 'male') {
      pageTitle = 'Colorado Mountain Dog Males | CMDR Breeding Dogs';
      pageDescription = 'Meet our outstanding Colorado Mountain Dog males at Little Way Acres in Hudsonville, Michigan. Premier CMDR breeding dogs with proven bloodlines, gentle nature, and exceptional guardian instincts. Ideal for livestock protection.';
      pageKeywords = 'Colorado Mountain Dog males, CMDR breeding dogs, male CMDR, livestock guardian dogs, Hudsonville Michigan, dog breeding, family farm dogs, proven bloodlines';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Colorado Mountain Dog Males",
        "description": pageDescription,
        "url": `${window.location.origin}/dogs/males`,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Male Colorado Mountain Dogs",
          "description": "Our breeding male Colorado Mountain Dogs",
          "numberOfItems": dogs?.filter(dog => dog.gender === 'male' && dog.display).length || 0
        },
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": window.location.origin},
            {"@type": "ListItem", "position": 2, "name": "Dogs", "item": `${window.location.origin}/dogs`},
            {"@type": "ListItem", "position": 3, "name": "Males", "item": `${window.location.origin}/dogs/males`}
          ]
        }
      };
    } else if (showAvailable) {
      pageTitle = 'Available Colorado Mountain Dogs | CMDR Puppies & Dogs';
      pageDescription = 'Colorado Mountain Dog puppies and dogs available now at Little Way Acres in Hudsonville, Michigan. CMDR breed known for gentle temperament, intelligence, and livestock guardian abilities. Contact us about available dogs today.';
      pageKeywords = 'available Colorado Mountain Dogs, CMDR puppies for sale, Colorado Mountain Dog puppies, Hudsonville Michigan, livestock guardian puppies, family farm dogs for sale, CMDR breed';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Available Colorado Mountain Dogs",
        "description": pageDescription,
        "url": `${window.location.origin}/dogs/available`,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Available Colorado Mountain Dogs",
          "description": "Colorado Mountain Dogs currently available for purchase",
          "numberOfItems": dogs?.filter(dog => dog.display && dog.isAvailable).length || 0
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        }
      };
    } else {
      pageTitle = 'Colorado Mountain Dogs | CMDR Breed Info & Our Dogs';
      pageDescription = 'Learn about Colorado Mountain Dogs (CMDR) at Little Way Acres in Hudsonville, Michigan. Gentle giants perfect for livestock guardians and family companions. Meet our breeding dogs and discover why CMDRs are ideal for small farms and families.';
      pageKeywords = 'Colorado Mountain Dogs, CMDR breed, livestock guardian dogs, family farm dogs, Hudsonville Michigan, dog breeding, gentle temperament, livestock protection, family companions';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Colorado Mountain Dogs",
        "description": pageDescription,
        "url": `${window.location.origin}/dogs`,
        "mainEntity": {
          "@type": "ItemList",
          "name": "Our Colorado Mountain Dogs",
          "description": "Our breeding Colorado Mountain Dogs at Little Way Acres",
          "numberOfItems": dogs?.filter(dog => dog.display).length || 0
        },
        "about": {
          "@type": "Thing",
          "name": "Colorado Mountain Dog Breed",
          "description": "A gentle, intelligent livestock guardian dog breed ideal for family farms"
        }
      };
    }
    
    document.title = pageTitle;
    updateMetaDescription(pageDescription);
    updateMetaKeywords(pageKeywords);
    
    // Update Open Graph and Twitter meta tags
    updateOrCreateMetaTag('og:title', pageTitle);
    updateOrCreateMetaTag('og:description', pageDescription);
    updateOrCreateMetaTag('og:type', 'website');
    updateOrCreateMetaTag('og:url', window.location.href);
    updateOrCreateMetaTag('og:image', '/logo.png');
    
    updateOrCreateTwitterTag('twitter:card', 'summary_large_image');
    updateOrCreateTwitterTag('twitter:title', pageTitle);
    updateOrCreateTwitterTag('twitter:description', pageDescription);
    updateOrCreateTwitterTag('twitter:image', '/logo.png');
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    
    if (genderFilter === 'female') {
      canonicalLink.setAttribute('href', `${window.location.origin}/dogs/females`);
    } else if (genderFilter === 'male') {
      canonicalLink.setAttribute('href', `${window.location.origin}/dogs/males`);
    } else if (showAvailable) {
      canonicalLink.setAttribute('href', `${window.location.origin}/dogs/available`);
    } else {
      canonicalLink.setAttribute('href', `${window.location.origin}/dogs`);
    }
    
    // Add structured data
    const existingScript = document.querySelector('script[data-page="dogs"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'dogs');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
      const scriptToRemove = document.querySelector('script[data-page="dogs"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [genderFilter, showAvailable, dogs]);
  
  const updateMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  };

  const updateMetaKeywords = (keywords: string) => {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  };

  const updateOrCreateMetaTag = (property: string, content: string) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  };

  const updateOrCreateTwitterTag = (name: string, content: string) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  };

  // Filter dogs based on gender, display setting, and filter out puppies, outside breeders, and available dogs
  // Available dogs should only be shown in the available section
  const females = dogs?.filter(dog =>
    dog.gender === 'female' &&
    !dog.outsideBreeder &&
    !dog.puppy &&
    !dog.available && // Exclude available dogs from this section
    dog.display !== false // Ensure only displayed dogs are shown
  ) || [];

  // Filter males - exclude available dogs as they'll be shown in the available section
  const males = dogs?.filter(dog =>
    dog.gender === 'male' &&
    !dog.outsideBreeder &&
    !dog.puppy &&
    !dog.available && // Exclude available dogs from this section
    dog.display !== false // Ensure only displayed dogs are shown
  ) || [];

  // Filter available dogs based on gender if we're on a gender-specific page
  // Sort by sold status so unsold dogs appear first
  let availableDogs = dogs?.filter(dog => dog.available && dog.display !== false) || [];
  
  // Sort available dogs to put unsold ones first
  availableDogs = availableDogs.sort((a, b) => {
    // First sort by sold status (unsold first)
    if (!a.sold && b.sold) return -1;
    if (a.sold && !b.sold) return 1;
    return 0;
  });
  
  // If we're on a gender-specific page, only show available dogs of that gender
  if (genderFilter === 'female') {
    availableDogs = availableDogs.filter(dog => dog.gender === 'female');
  } else if (genderFilter === 'male') {
    availableDogs = availableDogs.filter(dog => dog.gender === 'male');
  }

  // Determine whether to show each gender section based on the filter
  // If we're on the main page (no filter), show both
  // If we're on a filtered page, only show that specific gender
  const shouldShowFemales = genderFilter === 'female' || !genderFilter;
  const shouldShowMales = genderFilter === 'male' || !genderFilter;

  // Determine the appropriate litter navigation link and text
  const getLitterNavigation = () => {
    const hasCurrentLitters = currentLitters && currentLitters.length > 0;
    const hasFutureLitters = futureLitters && futureLitters.length > 0;

    if (hasCurrentLitters) {
      return {
        href: "/dogs/litters/current",
        title: "Current Litters",
        description: "Meet our available litters of beautiful guardians and reserve your own today!"
      };
    } else if (hasFutureLitters) {
      return {
        href: "/dogs/litters/future",
        title: "Upcoming Litters",
        description: "See planned litters and reserve your future guardian companion"
      };
    } else {
      return {
        href: "/dogs/litters/past",
        title: "Past Litters",
        description: "View our previous litters and their lineage"
      };
    }
  };

  const litterNavigation = getLitterNavigation();

  return (
    <div className="w-full">
      {!showAvailable && !genderFilter && <DogHero />}
      {!showAvailable && !genderFilter && <LitterBanner />}
      {!showAvailable && !genderFilter && (
        <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto space-y-16">
              
              {/* Why We Love Our Colorado Mountain Dogs */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    {getContent("dogs_why_love_title") || "Why We Love Our Colorado Mountain Dogs"}
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                      <p className="text-stone-700 leading-relaxed text-lg mb-6">
                        {getContent("dogs_why_love_description") || "Colorado Mountain Dogs represent the perfect balance of guardian instincts and family companionship. These remarkable dogs are gentle with children and livestock, yet fierce protectors when needed."}
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">{getContent("dogs_trait_1") || "Loyal and devoted to family"}</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">{getContent("dogs_trait_2") || "Excellent with children"}</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">{getContent("dogs_trait_3") || "Natural livestock guardians"}</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">{getContent("dogs_trait_4") || "Athletic and agile"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={getContent("dogs_why_love_image_1") || "https://lwacontent.s3.us-east-2.amazonaws.com/52aa3e57-3a8e-472e-a3f3-f905b2d19e3b.jpg"}
                        alt="Colorado Mountain Dog" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <p className="text-sm text-stone-600">{getContent("dogs_why_love_caption_1") || "Guardian & Family Companion"}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={getContent("dogs_why_love_image_2") || "https://lwacontent.s3.us-east-2.amazonaws.com/f88fee00-816d-4f4a-8cf8-0a32b44ce8c4.jpg"}
                        alt="Colorado Mountain Dog" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <p className="text-sm text-stone-600">{getContent("dogs_why_love_caption_2") || "Livestock Protection Expert"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Little Way Acres Breeding Goals */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    {getContent("dogs_breeding_goals_title") || "Little Way Acres Breeding Goals"}
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-8">
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-amber-600 font-bold text-lg">1</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">{getContent("dogs_goal_1_title") || "Temperament Above Everything Else"}</h3>
                            <p className="text-stone-700 leading-relaxed">
                              {getContent("dogs_goal_1_description") || "We want our dogs to be your children's favorite pillow. A gentle, calm disposition is our highest priority in every breeding decision."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-amber-600 font-bold text-lg">2</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">{getContent("dogs_goal_2_title") || "Teachable"}</h3>
                            <p className="text-stone-700 leading-relaxed">
                              {getContent("dogs_goal_2_description") || "We want smart dogs that will follow your lead in how your farm is operated. Intelligence and willingness to learn are essential traits."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-amber-600 font-bold text-lg">3</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">{getContent("dogs_goal_3_title") || "Seamless Adoption of New Animals"}</h3>
                            <p className="text-stone-700 leading-relaxed">
                              {getContent("dogs_goal_3_description") || "As a small farmer, we're experimenting with different animals. Our CMDRs are bred and trained to adopt any animal you bring on your farm."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-amber-600 font-bold text-lg">4</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-stone-800 mb-2">{getContent("dogs_goal_4_title") || "Beautifully Athletic"}</h3>
                            <p className="text-stone-700 leading-relaxed">
                              {getContent("dogs_goal_4_description") || "Tall, lean, and ready to run. We prioritize physical fitness and graceful movement in our breeding program."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={getContent("dogs_breeding_goals_image") || "https://lwacontent.s3.us-east-2.amazonaws.com/c361a5d5-8ec6-4fea-99bc-5ab50c31347b.jpg"}
                          alt="Colorado Mountain Dog" 
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Who is a Good Fit */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    {getContent("dogs_good_fit_title") || "Who is a Good Fit for a CMDR?"}
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-800 mb-6">{getContent("dogs_good_fit_subtitle") || "Perfect for Small Farms"}</h3>
                      <p className="text-stone-700 leading-relaxed mb-6">
                        {getContent("dogs_good_fit_description") || "Colorado Mountain Dogs were specifically developed for small farm operations where traditional livestock guardians might be too large, loud, or roaming. They excel in environments where close family bonds and selective protection are essential."}
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">{getContent("dogs_good_fit_point_1") || "Small to medium-sized farms (1-20 acres)"}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">{getContent("dogs_good_fit_point_2") || "Families with children"}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">{getContent("dogs_good_fit_point_3") || "Goat, sheep, or poultry operations"}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">{getContent("dogs_good_fit_point_4") || "Active rural or suburban households"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={getContent("dogs_good_fit_image") || "https://lwacontent.s3.us-east-2.amazonaws.com/d0dffa6d-f0e3-4c6d-bbfe-03f9f54ecdb5-cropped-image-jpg.jpg"}
                        alt="Colorado Mountain Dog on farm" 
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4">
                        <p className="text-sm text-stone-600">{getContent("dogs_good_fit_image_caption") || "Protecting our small farm operation"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Navigation Section */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    {getContent("dogs_explore_title") || "Explore Our Dogs"}
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                  <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                    {getContent("dogs_explore_description") || "Discover our breeding program and meet our Colorado Mountain Dogs"}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <Link href="/dogs/males" className="group">
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-stone-800 mb-3">Our Males</h3>
                      <p className="text-stone-600 mb-6">
                        Meet our breeding males and learn about their lineage and characteristics
                      </p>
                      <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                        View Males
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href="/dogs/females" className="group">
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-200 transition-colors">
                        <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-stone-800 mb-3">Our Females</h3>
                      <p className="text-stone-600 mb-6">
                        Discover our breeding females and their contributions to our program
                      </p>
                      <div className="inline-flex items-center text-pink-600 font-semibold group-hover:text-pink-700">
                        View Females
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                  
                  <Link href={litterNavigation.href} className="group">
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-stone-800 mb-3">{litterNavigation.title}</h3>
                      <p className="text-stone-600 mb-6">
                        {litterNavigation.description}
                      </p>
                      <div className="inline-flex items-center text-amber-600 font-semibold group-hover:text-amber-700">
                        View Litters
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </section>

              {/* FAQ Section */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    {getContent("dogs_faq_title") || "Frequently Asked Questions"}
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                  <div className="space-y-8">
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">{getContent("dogs_faq_1_question") || "How big do Colorado Mountain Dogs get?"}</h3>
                      <p className="text-stone-700">{getContent("dogs_faq_1_answer") || "CMDRs typically stand 26-34 inches at the shoulder and weigh 80-140 pounds. They have a tall, lean build that's athletic and agile, perfect for navigating rugged terrain while maintaining endurance."}</p>
                    </div>
                    
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">{getContent("dogs_faq_2_question") || "Are CMDs good with children?"}</h3>
                      <p className="text-stone-700">{getContent("dogs_faq_2_answer") || "Absolutely! Colorado Mountain Dogs are exceptionally good with children. They're bred to be gentle, patient, and protective family guardians. Their natural instinct is to watch over and protect their \"flock,\" which includes children. Many CMD owners report that their dogs are incredibly tolerant of children's behavior and form deep, protective bonds with kids in the family."}</p>
                    </div>
                    
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">{getContent("dogs_faq_3_question") || "Are they good with other pets?"}</h3>
                      <p className="text-stone-700">{getContent("dogs_faq_3_answer") || "Yes! CMDRs are specifically bred to be gentle with family members, including other pets. They form strong bonds with their \"flock\" - whether that's livestock, family pets, or both. Their guardian instincts extend to protecting all members of their household."}</p>
                    </div>
                    
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">{getContent("dogs_faq_4_question") || "Do they bark a lot?"}</h3>
                      <p className="text-stone-700">{getContent("dogs_faq_4_answer") || "Unlike some traditional livestock guardian breeds, CMDRs are bred for minimal unnecessary barking. They're discerning protectors - alert and vocal when there's a real threat, but generally quiet during normal daily activities."}</p>
                    </div>
                    
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">{getContent("dogs_faq_5_question") || "How much exercise do they need?"}</h3>
                      <p className="text-stone-700">{getContent("dogs_faq_5_answer") || "CMDRs are working dogs that thrive with regular activity and mental stimulation. They do best with access to space to patrol and explore, but don't require intense exercise like some high-energy breeds. A job to do is more important than miles of running."}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">{getContent("dogs_faq_6_question") || "What's their grooming requirements?"}</h3>
                      <p className="text-stone-700">{getContent("dogs_faq_6_answer") || "CMDRs have medium-length, weather-resistant white coats that are surprisingly low-maintenance. Regular brushing helps manage seasonal shedding, but their coats are designed to be self-cleaning and don't require frequent baths."}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Only show container if there are dogs to display */}
      {((availableDogs.length > 0 && !showAvailable) || 
        (!showAvailable && shouldShowFemales && genderFilter && females.length > 0) || 
        (!showAvailable && shouldShowMales && genderFilter && males.length > 0)) ? (
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Available Dogs Section */}
          {availableDogs.length > 0 && !showAvailable && (
            <div>
              <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-center">
                  <div className="bg-background px-6">
                    <h2 className="text-3xl font-bold text-stone-800">Meet Our Available Dogs</h2>
                  </div>
                </div>
              </div>
              <div className="space-y-16">
                {availableDogs.map((dog) => (
                  <DogDetails key={dog.id} dog={dog} />
                ))}
              </div>
            </div>
          )}

          {/* Females Section */}
          {!showAvailable && shouldShowFemales && genderFilter && females.length > 0 && (
            <div>
              <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-center">
                  <div className="bg-background px-6">
                    <h2 className="text-3xl font-bold text-stone-800">Meet Our Females</h2>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8">
                {females.map((dog) => (
                  <DogDetails key={dog.id} dog={dog} />
                ))}
              </div>
            </div>
          )}

          {/* Males Section */}
          {!showAvailable && shouldShowMales && genderFilter && males.length > 0 && (
            <div>
              <div className="relative mb-12">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-center">
                  <div className="bg-background px-6">
                    <h2 className="text-3xl font-bold text-stone-800">Meet Our Males</h2>
                  </div>
                </div>
              </div>
              <div className="space-y-16">
                {males.map((dog) => (
                  <DogDetails key={dog.id} dog={dog} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Available Dogs Page Content */}
      {showAvailable && (
        <div className="container mx-auto px-4 py-16">
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Available Dogs</h2>
            {availableDogs.length > 0 ? (
              <div className="space-y-16">
                {/* Available Females */}
                {availableDogs.filter(dog => dog.gender === 'female').length > 0 && (
                  <div>
                    <div className="relative flex py-5 items-center mb-8">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Available Females</h2>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="space-y-8">
                      {availableDogs
                        .filter(dog => dog.gender === 'female')
                        .map((dog) => (
                          <DogDetails key={dog.id} dog={dog} />
                        ))}
                    </div>
                  </div>
                )}

                {/* Available Males */}
                {availableDogs.filter(dog => dog.gender === 'male').length > 0 && (
                  <div>
                    <div className="relative flex py-5 items-center mb-8">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Available Males</h2>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="space-y-8">
                      {availableDogs
                        .filter(dog => dog.gender === 'male')
                        .map((dog) => (
                          <DogDetails key={dog.id} dog={dog} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-lg border border-stone-200">
                <p className="text-lg text-stone-600">We currently don't have any available dogs.</p>
                <p className="text-stone-500 mt-2">Please check back later or contact us for more information.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
