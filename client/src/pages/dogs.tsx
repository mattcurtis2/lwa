import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { DogsHero, Dog } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { formatAge } from "@/lib/date-utils";

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
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dogs?.map((dog) => (
            <Card key={dog.id}>
              <div className="aspect-square relative">
                <img
                  src={dog.imageUrl || ''}
                  alt={dog.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">{dog.name}</h3>
                <p className="text-stone-600 mb-2">
                  {dog.breed} • {formatAge(new Date(dog.birthDate))}
                </p>
                <p className="text-stone-600">{dog.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}