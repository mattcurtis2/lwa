
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dog, DogMedia, Litter } from "@db/schema";
import DogDetails from "@/components/dog-details";
import { useLocation } from "wouter";
import { formatDisplayDate } from "@/lib/date-utils";

interface DogsProps {
  genderFilter?: 'male' | 'female';
  showAvailable?: boolean;
}

export default function Dogs({ genderFilter, showAvailable }: DogsProps) {
  const [_, navigate] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: dogs } = useQuery<(Dog & { media?: DogMedia[] })[]>({
    queryKey: ["/api/dogs"],
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

  const visibleLitter = litters?.find(litter => litter.isVisible);

  const females = dogs?.filter(dog =>
    dog.gender === 'female' &&
    !dog.outsideBreeder &&
    !dog.puppy
  ) || [];

  const males = dogs?.filter(dog =>
    dog.gender === 'male' &&
    !dog.outsideBreeder &&
    !dog.puppy
  ) || [];

  const availableDogs = dogs?.filter(dog => dog.available) || [];

  const shouldShowFemales = !genderFilter || genderFilter === 'female';
  const shouldShowMales = !genderFilter || genderFilter === 'male';

  const motherDog = dogs?.find(dog => dog.id === visibleLitter?.mother?.id);
  const fatherDog = dogs?.find(dog => dog.id === visibleLitter?.father?.id);

  return (
    <div className="w-full">
      {!showAvailable && !genderFilter && visibleLitter && motherDog && fatherDog && (
        <div
          onClick={() => navigate(`/dogs/litters/${visibleLitter.id}`)}
          className="bg-gradient-to-br from-amber-100 via-amber-200 to-amber-100 border-y border-amber-200 cursor-pointer hover:bg-gradient-to-br hover:from-amber-50 hover:via-amber-100 hover:to-amber-50 transition-colors"
        >
          <div className="container mx-auto px-4">
            <div className="h-[100px] flex items-center">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-12">
                  <div>
                    <div className="bg-amber-200/80 backdrop-blur-sm px-3 py-1 rounded-full text-amber-800 text-sm font-semibold mb-2 inline-block">
                      New Litter Coming Soon!
                    </div>
                    <p className="text-amber-800">
                      Expected: <span className="font-semibold">{formatDisplayDate(new Date(visibleLitter.dueDate))}</span>
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
        {showAvailable && availableDogs.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Available Dogs</h2>
            <div className="space-y-8">
              {availableDogs.map((dog) => (
                <DogDetails key={dog.id} dog={dog} />
              ))}
            </div>
          </div>
        )}

        {!showAvailable && (
          <>
            {shouldShowFemales && females.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-8 text-stone-800 text-center">Meet Our Females</h2>
                <div className="space-y-8">
                  {females.map((dog) => (
                    <DogDetails key={dog.id} dog={dog} />
                  ))}
                </div>
              </div>
            )}

            {shouldShowMales && males.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-8 text-stone-800 text-center">Meet Our Males</h2>
                <div className="space-y-8">
                  {males.map((dog) => (
                    <DogDetails key={dog.id} dog={dog} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
