
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
            <div className="max-w-6xl mx-auto space-y-16">
              
              {/* Why We Love Our Colorado Mountain Dogs */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    Why We Love Our Colorado Mountain Dogs
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                      <p className="text-stone-700 leading-relaxed text-lg mb-6">
                        Colorado Mountain Dogs represent the perfect balance of guardian instincts and family companionship. These remarkable dogs are gentle with children and livestock, yet fierce protectors when needed.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">Loyal and devoted to family</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">Excellent with children</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">Natural livestock guardians</span>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-stone-600">Athletic and agile</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="https://lwacontent.s3.us-east-2.amazonaws.com/899bf35a-3b9c-41b2-8ad9-8ac8da890c9f-cropped-image-jpg.jpg" 
                        alt="Max - Colorado Mountain Dog" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-stone-800">Max</h4>
                        <p className="text-sm text-stone-600">Guardian & Family Companion</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="https://lwacontent.s3.us-east-2.amazonaws.com/14376075-4e44-4748-b223-0a46e8bcf14f-cropped-image-jpg.jpg" 
                        alt="Reba - Colorado Mountain Dog" 
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-stone-800">Reba</h4>
                        <p className="text-sm text-stone-600">Livestock Protection Expert</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Who is a Good Fit */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    Who is a Good Fit for a CMDR?
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-800 mb-6">Perfect for Small Farms</h3>
                      <p className="text-stone-700 leading-relaxed mb-6">
                        Colorado Mountain Dogs were specifically developed for small farm operations where traditional livestock guardians might be too large, loud, or roaming. They excel in environments where close family bonds and selective protection are essential.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">Small to medium-sized farms (1-20 acres)</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">Families with children</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">Goat, sheep, or poultry operations</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-stone-700">Active rural or suburban households</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src="https://lwacontent.s3.us-east-2.amazonaws.com/a3ca8c47-6768-4e09-a145-17d978eda27f-cropped-image-jpg.jpg" 
                        alt="Cash - Colorado Mountain Dog on farm" 
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-stone-800">Cash</h4>
                        <p className="text-sm text-stone-600">Protecting our small farm operation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-stone-800 mb-4">
                    Frequently Asked Questions
                  </h2>
                  <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                  <div className="space-y-8">
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">How big do Colorado Mountain Dogs get?</h3>
                      <p className="text-stone-700">CMDRs typically stand 26-34 inches at the shoulder and weigh 80-140 pounds. They have a tall, lean build that's athletic and agile, perfect for navigating rugged terrain while maintaining endurance.</p>
                    </div>
                    
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">Are they good with children and other pets?</h3>
                      <p className="text-stone-700">Yes! CMDRs are specifically bred to be gentle with family members, including children and other pets. They form strong bonds with their "flock" - whether that's livestock, family, or both.</p>
                    </div>
                    
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">Do they bark a lot?</h3>
                      <p className="text-stone-700">Unlike some traditional livestock guardian breeds, CMDRs are bred for minimal unnecessary barking. They're discerning protectors - alert and vocal when there's a real threat, but generally quiet during normal daily activities.</p>
                    </div>
                    
                    <div className="border-b border-stone-200 pb-6">
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">How much exercise do they need?</h3>
                      <p className="text-stone-700">CMDRs are working dogs that thrive with regular activity and mental stimulation. They do best with access to space to patrol and explore, but don't require intense exercise like some high-energy breeds. A job to do is more important than miles of running.</p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-stone-800 mb-3">What's their grooming requirements?</h3>
                      <p className="text-stone-700">CMDRs have medium-length, weather-resistant white coats that are surprisingly low-maintenance. Regular brushing helps manage seasonal shedding, but their coats are designed to be self-cleaning and don't require frequent baths.</p>
                    </div>
                  </div>
                </div>
              </section>
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
