
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dog, DogMedia, Litter } from "@db/schema";
import DogDetails from "@/components/dog-details";
import { useLocation, Link } from "wouter";
import { formatDisplayDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { DogHero } from "@/components/sections/dog-hero";
import { SiteContent } from "@/lib/types";

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

  const { data: litters } = useQuery<(Litter & {
    mother: Dog & { media?: DogMedia[] },
    father: Dog & { media?: DogMedia[] }
  })[]>({
    queryKey: ["/api/litters"],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const visibleLitter = litters?.find(litter => litter.isVisible && litter.isCurrentLitter);

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

  const motherDog = dogs?.find(dog => dog.id === visibleLitter?.mother?.id);
  const fatherDog = dogs?.find(dog => dog.id === visibleLitter?.father?.id);

  return (
    <div className="w-full">
      {!showAvailable && !genderFilter && <DogHero />}
      {!showAvailable && !genderFilter && (
        <div className="bg-stone-50 border-y border-stone-200">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-stone-800 mb-4">
                {getContent("dogs_page_title") || "Colorado Mountain Dogs"}
              </h2>
              <p className="text-stone-600 whitespace-pre-wrap">
                {getContent("dogs_page_description") || 
                  "Meet our Colorado Mountain Dogs, a breed dedicated to protecting livestock with unwavering loyalty and gentle temperament."}
              </p>
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

      {!showAvailable && !genderFilter && visibleLitter && motherDog && fatherDog && (
        <div
          onClick={() => navigate(`/dogs/litters/${visibleLitter.id}`)}
          className="bg-gradient-to-br from-amber-100 via-amber-200 to-amber-100 border-y border-amber-200 cursor-pointer hover:bg-gradient-to-br hover:from-amber-50 hover:via-amber-100 hover:to-amber-50 transition-colors"
        >
          <div className="container mx-auto px-4">
            <div className="min-h-[100px] py-4 flex items-center">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-12">
                  <div>
                    <div className="bg-amber-200/80 backdrop-blur-sm px-3 py-1 rounded-full text-amber-800 text-sm font-semibold mb-2 inline-block">
                      {visibleLitter.isPlannedLitter ? "New Litter Coming Soon!" : "New Litter Available!"}
                    </div>
                    <p className="text-amber-800">
                      {visibleLitter.isPlannedLitter ? "Expected" : "Born"}: <span className="font-semibold">{formatDisplayDate(new Date(visibleLitter.dueDate))}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-10">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center border-2 border-amber-200">
                        {motherDog.profileImageUrl ? (
                          <img
                            src={motherDog.profileImageUrl}
                            alt={motherDog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : motherDog.media && motherDog.media.length > 0 ? (
                          <img
                            src={motherDog.media[0].url}
                            alt={motherDog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-pink-500">♀</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-amber-900">{motherDog.name}</p>
                        <p className="text-sm text-amber-700/80">Mother</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center border-2 border-amber-200">
                        {fatherDog.profileImageUrl ? (
                          <img
                            src={fatherDog.profileImageUrl}
                            alt={fatherDog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : fatherDog.media && fatherDog.media.length > 0 ? (
                          <img
                            src={fatherDog.media[0].url}
                            alt={fatherDog.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-blue-500">♂</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-amber-900">{fatherDog.name}</p>
                        <p className="text-sm text-amber-700/80">Father</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
