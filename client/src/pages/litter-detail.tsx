import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Dog, DogMedia, Litter } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import DogDetails from "@/components/dog-details";

interface Document {
  id?: number;
  type: string;
  url: string;
  name: string;
  mimeType: string;
}

interface LitterWithRelations extends Litter {
  mother: Dog & { media?: DogMedia[]; documents?: Document[] };
  father: Dog & { media?: DogMedia[]; documents?: Document[] };
  puppies?: (Dog & { media?: DogMedia[]; documents?: Document[] })[];
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
      {/* Litter Header */}
      <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 rounded-lg border border-amber-200">
        <div className="max-w-3xl mx-auto py-6 px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="inline-block bg-amber-200/80 backdrop-blur-sm px-3 py-1 rounded-full text-amber-800 text-sm font-semibold mb-2">
                {isPastDueDate ? 'Born Litter' : 'Upcoming Litter'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">
                {isPastDueDate
                  ? `Born ${formatDisplayDate(new Date(litter.dueDate))}`
                  : `Expected ${formatDisplayDate(new Date(litter.dueDate))}`}
              </h1>
            </div>

            {puppyCount > 0 && (
              <div className="flex flex-col items-center sm:items-end">
                <p className="text-amber-800 text-lg mb-1">
                  {puppyCount} {puppyCount === 1 ? 'puppy' : 'puppies'}
                </p>
                <div className="flex items-center gap-6">
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
          </div>

          {!isPastDueDate && (
            <p className="text-amber-800 text-center sm:text-left mt-4 text-sm sm:text-base">
              We're excited to announce this upcoming litter from our breeding program.
              Please contact us for more information about reserving a puppy.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Puppies Section */}
        {puppyCount > 0 && (
          <div className="space-y-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-center">
                <div className="bg-background px-6">
                  <h2 className="text-3xl font-bold text-stone-800">Puppies</h2>
                </div>
              </div>
            </div>

            {litter.puppies?.map((puppy, index) => (
              <div key={puppy.id}>
                <DogDetails dog={puppy} />
              </div>
            ))}
          </div>
        )}

        {/* Parents Section */}
        <div className="space-y-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-center">
              <div className="bg-background px-6">
                <h2 className="text-3xl font-bold text-stone-800">Parents</h2>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            <DogDetails dog={litter.mother} />
            <DogDetails dog={litter.father} />
          </div>
        </div>
      </div>
    </div>
  );
}