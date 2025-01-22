import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { format } from "date-fns";
import { Dog, DogMedia, Litter } from "@db/schema";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/date-utils";
import DogProfile from "@/components/cards/dog-profile";

export default function LitterDetail() {
  const { id } = useParams();

  const { data: litter, isLoading: isLoadingLitter } = useQuery<(Litter & {
    mother: Dog & { media?: DogMedia[] },
    father: Dog & { media?: DogMedia[] }
  })>({
    queryKey: [`/api/litters/${id}`],
  });

  if (isLoadingLitter) {
    return <div>Loading...</div>;
  }

  if (!litter) {
    return <div>Litter not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 rounded-lg border border-amber-200 p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-amber-200/80 backdrop-blur-sm px-4 py-1 rounded-full text-amber-800 text-sm font-semibold mb-4">
            Upcoming Litter
          </div>
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            Expected {formatDisplayDate(new Date(litter.dueDate))}
          </h1>
          <p className="text-amber-800 text-lg">
            We're excited to announce this upcoming litter from our breeding program.
            Please contact us for more information about reserving a puppy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-stone-800 flex items-center gap-2">
            Mother <span className="text-pink-500">♀</span>
          </h2>
          <DogProfile dog={litter.mother} />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 text-stone-800 flex items-center gap-2">
            Father <span className="text-blue-500">♂</span>
          </h2>
          <DogProfile dog={litter.father} />
        </div>
      </div>
    </div>
  );
}
