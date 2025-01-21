import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { DogsHero, Dog } from "@db/schema";
import DogCard from "@/components/cards/dog-card";

export default function Dogs() {
  const { data: heroContent } = useQuery<DogsHero[]>({
    queryKey: ["/api/dogs-hero"],
  });

  const { data: dogs } = useQuery<Dog[]>({
    queryKey: ["/api/dogs"],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hero = heroContent?.[0];

  // Group dogs by gender
  const females = dogs?.filter(dog => dog.gender === 'female') || [];
  const males = dogs?.filter(dog => dog.gender === 'male') || [];

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
      </div>
    </div>
  );
}