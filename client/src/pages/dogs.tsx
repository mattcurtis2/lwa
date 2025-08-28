
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <div className="w-full">
      {!showAvailable && !genderFilter && <DogHero />}
      {!showAvailable && !genderFilter && <LitterBanner />}
      {!showAvailable && !genderFilter && (
        <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Main title with emphasis */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-stone-800 mb-4">
                  {getContent("dogs_page_title") || "Colorado Mountain Dogs"}
                </h2>
                <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
              </div>
              
              {/* Featured description with visual enhancement */}
              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-8">
                <div className="prose prose-lg mx-auto text-center">
                  <p className="text-stone-700 leading-relaxed text-lg">
                    {getContent("dogs_page_description") || 
                      "Meet our Colorado Mountain Dogs, a breed dedicated to protecting livestock with unwavering loyalty and gentle temperament."}
                  </p>
                </div>
              </div>
              
              {/* What We're Doing - Mission highlights */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-stone-200 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">Selective Breeding</h3>
                  <p className="text-stone-600 text-sm">
                    Carefully selecting breeding pairs to enhance protective instincts and gentle family temperament
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-md border border-stone-200 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">Early Socialization</h3>
                  <p className="text-stone-600 text-sm">
                    Comprehensive training and socialization from birth to ensure well-rounded guardians
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-md border border-stone-200 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800 mb-2">Health Testing</h3>
                  <p className="text-stone-600 text-sm">
                    Rigorous health screening and genetic testing to maintain breed health and longevity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation buttons - only show on main dogs page */}
      {!genderFilter && !showAvailable && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dogs/males">
              <Button
                variant="outline"
                className="w-full h-auto py-8 flex flex-col items-center gap-2"
              >
                <span className="text-xl">Males</span>
                <span className="text-sm text-stone-500">View our male dogs</span>
              </Button>
            </Link>

            <Link href="/dogs/females">
              <Button
                variant="outline"
                className="w-full h-auto py-8 flex flex-col items-center gap-2"
              >
                <span className="text-xl">Females</span>
                <span className="text-sm text-stone-500">View our female dogs</span>
              </Button>
            </Link>

            <Link href="/dogs/available">
              <Button
                variant="outline"
                className="w-full h-auto py-8 flex flex-col items-center gap-2"
              >
                <span className="text-xl">Available</span>
                <span className="text-sm text-stone-500">
                  View dogs available for adoption
                </span>
              </Button>
            </Link>
          </div>
        </div>
      )}

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
        {!showAvailable && shouldShowFemales && females.length > 0 && (
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
        {!showAvailable && shouldShowMales && males.length > 0 && (
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

        {/* Available Dogs Page Content */}
        {showAvailable && (
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
        )}
      </div>
    </div>
  );
}
