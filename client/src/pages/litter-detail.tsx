import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Dog, DogMedia, Litter } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";
import DogProfile from "@/components/cards/dog-profile";
import { Card, CardContent } from "@/components/ui/card";

interface LitterWithRelations extends Litter {
  mother: Dog & { media?: DogMedia[] };
  father: Dog & { media?: DogMedia[] };
  puppies?: (Dog & { media?: DogMedia[] })[];
}

export default function LitterDetail() {
  const { id } = useParams();

  const { data: litter, isLoading: isLoadingLitter } = useQuery<LitterWithRelations>({
    queryKey: [`/api/litters/${id}`],
  });

  if (isLoadingLitter) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!litter) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">Litter not found</h2>
              <p className="mt-2 text-gray-600">The requested litter could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPastDueDate = new Date(litter.dueDate) < new Date();
  const puppyCount = litter.puppies?.length || 0;
  const maleCount = litter.puppies?.filter(puppy => puppy.gender === 'male').length || 0;
  const femaleCount = litter.puppies?.filter(puppy => puppy.gender === 'female').length || 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Litter Overview */}
      <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 rounded-lg border border-amber-200 p-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-amber-200/80 backdrop-blur-sm px-4 py-1 rounded-full text-amber-800 text-sm font-semibold mb-4">
            {isPastDueDate ? 'Born Litter' : 'Upcoming Litter'}
          </div>

          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            {isPastDueDate 
              ? `Born ${formatDisplayDate(new Date(litter.dueDate))}` 
              : `Expected ${formatDisplayDate(new Date(litter.dueDate))}`}
          </h1>

          {puppyCount > 0 && (
            <div className="space-y-2">
              <p className="text-amber-800 text-lg">
                {puppyCount} {puppyCount === 1 ? 'puppy' : 'puppies'}
              </p>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-blue-500">♂</span>
                  <span className="text-lg font-semibold text-gray-700">{maleCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-pink-500">♀</span>
                  <span className="text-lg font-semibold text-gray-700">{femaleCount}</span>
                </div>
              </div>
            </div>
          )}

          {!isPastDueDate && (
            <p className="text-amber-800 text-lg mt-4">
              We're excited to announce this upcoming litter from our breeding program.
              Please contact us for more information about reserving a puppy.
            </p>
          )}
        </div>
      </div>

      {/* Parents Section */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-stone-800 text-center">Parents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <h3 className="text-2xl font-bold mb-6 text-stone-800 flex items-center gap-2">
              <span className="text-pink-500">♀</span> Mother
            </h3>
            <div className="flex-grow">
              <DogProfile dog={litter.mother} />
            </div>
          </div>

          <div className="flex flex-col">
            <h3 className="text-2xl font-bold mb-6 text-stone-800 flex items-center gap-2">
              <span className="text-blue-500">♂</span> Father
            </h3>
            <div className="flex-grow">
              <DogProfile dog={litter.father} />
            </div>
          </div>
        </div>
      </div>

      {/* Puppies Section */}
      {puppyCount > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-8 text-stone-800 text-center">Puppies</h2>
          <div className="grid grid-cols-1 gap-8">
            {litter.puppies?.map((puppy) => (
              <div key={puppy.id}>
                <DogProfile dog={puppy} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}