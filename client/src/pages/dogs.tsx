import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { DogsHero, Dog, DogMedia, Litter } from "@db/schema";
import DogCard from "@/components/cards/dog-card";
import { format } from "date-fns";

export default function Dogs() {
  const { data: heroContent } = useQuery<DogsHero[]>({
    queryKey: ["/api/dogs-hero"],
  });

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

  const hero = heroContent?.[0];
  const visibleLitter = litters?.find(litter => litter.isVisible);

  // Group dogs by gender
  const females = dogs?.filter(dog => dog.gender === 'female' && !dog.outsideBreeder) || [];
  const males = dogs?.filter(dog => dog.gender === 'male' && !dog.outsideBreeder) || [];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div 
        className="relative h-[500px] bg-cover bg-center"
        style={{ backgroundImage: `url(${hero?.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-4">
              {hero?.title || "Colorado Mountain Dogs"}
            </h1>
            <p className="text-xl">
              {hero?.subtitle || "Loyal guardians bred for livestock protection"}
            </p>
          </div>
        </div>
      </div>

      {/* Announcement Banner */}
      {visibleLitter && (
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 border-y border-amber-200">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center text-center">
              <div className="inline-block px-4 py-1 rounded-full bg-amber-200 text-amber-800 text-sm font-semibold mb-4">
                Exciting News!
              </div>
              <h2 className="text-3xl font-bold text-amber-900 mb-2">
                New Litter Coming Soon!
              </h2>
              <p className="text-amber-800 max-w-2xl mb-6">
                We're excited to announce an upcoming litter of Colorado Mountain Dog puppies. 
                Expected due date: <span className="font-semibold">{format(new Date(visibleLitter.dueDate), 'MMMM d, yyyy')}</span>
              </p>

              {/* Parents Section */}
              <div className="w-full max-w-4xl mt-8">
                <h3 className="text-xl font-semibold text-amber-900 mb-6">Meet the Parents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Mother Section */}
                  {visibleLitter.mother && (
                    <div>
                      <h4 className="text-lg font-semibold text-amber-900 mb-4">Mother</h4>
                      <DogCard 
                        dog={{
                          ...visibleLitter.mother,
                          media: visibleLitter.mother.media || []
                        }} 
                      />
                    </div>
                  )}

                  {/* Father Section */}
                  {visibleLitter.father && (
                    <div>
                      <h4 className="text-lg font-semibold text-amber-900 mb-4">Father</h4>
                      <DogCard 
                        dog={{
                          ...visibleLitter.father,
                          media: visibleLitter.father.media || []
                        }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dogs Grid */}
      <div className="container mx-auto px-4 py-16 space-y-16">
        {/* Females Section */}
        {females.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Meet Our Females</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {females.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </div>
        )}

        {/* Males Section */}
        {males.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Meet Our Males</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {males.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </div>
        )}

        {/* Outside Breeding Dogs Section */}
        {dogs?.filter(dog => dog.outsideBreeder).length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-stone-800">Breeding Dogs from Outside Farms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dogs
                .filter(dog => dog.outsideBreeder)
                .map((dog) => (
                  <DogCard key={dog.id} dog={dog} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}