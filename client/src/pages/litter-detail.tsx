import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Dog, DogMedia, Litter } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  const [selectedDog, setSelectedDog] = useState<{id: number, type: 'parent' | 'puppy'} | null>(null);

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

  const selectedDogData = selectedDog 
    ? selectedDog.type === 'parent'
      ? selectedDog.id === litter.mother.id
        ? litter.mother
        : litter.father
      : litter.puppies?.find(puppy => puppy.id === selectedDog.id)
    : litter.mother;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Litter Header */}
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

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Dog Selector */}
        <div className="flex flex-wrap gap-4 justify-center">
          {/* Parents */}
          <button
            onClick={() => setSelectedDog({ id: litter.mother.id, type: 'parent' })}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              selectedDog?.id === litter.mother.id && selectedDog?.type === 'parent'
                ? 'border-pink-200 bg-pink-50 ring-2 ring-pink-200'
                : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50'
            }`}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={litter.mother.profileImageUrl || (litter.mother.media && litter.mother.media[0]?.url)}
                alt={litter.mother.name}
              />
              <AvatarFallback>
                <span className="text-2xl text-pink-500">♀</span>
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h3 className="font-semibold text-lg">{litter.mother.name}</h3>
              <p className="text-sm text-muted-foreground">Mother</p>
            </div>
          </button>

          <button
            onClick={() => setSelectedDog({ id: litter.father.id, type: 'parent' })}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              selectedDog?.id === litter.father.id && selectedDog?.type === 'parent'
                ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            }`}
          >
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={litter.father.profileImageUrl || (litter.father.media && litter.father.media[0]?.url)}
                alt={litter.father.name}
              />
              <AvatarFallback>
                <span className="text-2xl text-blue-500">♂</span>
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <h3 className="font-semibold text-lg">{litter.father.name}</h3>
              <p className="text-sm text-muted-foreground">Father</p>
            </div>
          </button>

          {/* Puppies Section */}
          {puppyCount > 0 && (
            <>
              <div className="w-full flex items-center gap-4 px-4 my-4">
                <Separator className="flex-grow" />
                <span className="text-sm font-medium text-muted-foreground">Puppies</span>
                <Separator className="flex-grow" />
              </div>

              {litter.puppies?.map((puppy) => (
                <button
                  key={puppy.id}
                  onClick={() => setSelectedDog({ id: puppy.id, type: 'puppy' })}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    selectedDog?.id === puppy.id && selectedDog?.type === 'puppy'
                      ? puppy.gender === 'male'
                        ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-pink-200 bg-pink-50 ring-2 ring-pink-200'
                      : 'border-gray-200 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={puppy.profileImageUrl || (puppy.media && puppy.media[0]?.url)}
                      alt={puppy.name}
                    />
                    <AvatarFallback>
                      <span className={`text-2xl ${puppy.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>
                        {puppy.gender === 'male' ? '♂' : '♀'}
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg">{puppy.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {puppy.gender.charAt(0).toUpperCase() + puppy.gender.slice(1)}
                    </p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Selected Dog Details */}
        {selectedDogData && (
          <div className="mt-8">
            <DogDetails dog={selectedDogData} />
          </div>
        )}
      </div>
    </div>
  );
}