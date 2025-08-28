import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Dog, DogMedia, Litter } from "@db/schema";
import { formatDisplayDate, parseApiDate } from "@/lib/date-utils";

interface PastLitter extends Litter {
  mother: Dog & { media?: DogMedia[] };
  father: Dog & { media?: DogMedia[] };
  puppies: (Dog & { media?: DogMedia[] })[];
  puppyCount: number;
}

export default function LitterBanner() {
  const [_, navigate] = useLocation();
  
  const { data: litters } = useQuery<PastLitter[]>({
    queryKey: ["/api/litters"],
  });

  // Find the visible litter (prioritize current litters that are visible)
  const visibleLitter = litters?.find(litter => litter.isVisible && (litter.isCurrentLitter || litter.isPlannedLitter));
  
  // If no visible current or planned litter, don't show banner
  if (!visibleLitter) return null;

  return (
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
                  {visibleLitter.puppyCount > 0 ? "New Litter Available!" : "New Litter Coming Soon!"}
                </div>
                <p className="text-amber-800">
                  {visibleLitter.isCurrentLitter && visibleLitter.isPlannedLitter ? (
                    <span>Due: <span className="font-semibold">
                      {format(parseApiDate(visibleLitter.dueDate), 'MMMM d, yyyy')}
                    </span></span>
                  ) : visibleLitter.puppyCount > 0 ? (
                    <span>Born: <span className="font-semibold">
                      {formatDisplayDate(parseApiDate(visibleLitter.dueDate))}
                    </span></span>
                  ) : (
                    <span>Expected: <span className="font-semibold">
                      {visibleLitter.expectedBreedingDate 
                        ? format(parseApiDate(visibleLitter.expectedBreedingDate), 'MMM yyyy')
                        : formatDisplayDate(parseApiDate(visibleLitter.dueDate))
                      }
                    </span></span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center border-2 border-amber-200">
                    {visibleLitter.mother.profileImageUrl ? (
                      <img
                        src={visibleLitter.mother.profileImageUrl}
                        alt={visibleLitter.mother.name}
                        className="w-full h-full object-cover"
                      />
                    ) : visibleLitter.mother.media && visibleLitter.mother.media.length > 0 ? (
                      <img
                        src={visibleLitter.mother.media[0].url}
                        alt={visibleLitter.mother.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-pink-500">♀</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">{visibleLitter.mother.name}</p>
                    <p className="text-sm text-amber-700/80">Mother</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center border-2 border-amber-200">
                    {visibleLitter.father.profileImageUrl ? (
                      <img
                        src={visibleLitter.father.profileImageUrl}
                        alt={visibleLitter.father.name}
                        className="w-full h-full object-cover"
                      />
                    ) : visibleLitter.father.media && visibleLitter.father.media.length > 0 ? (
                      <img
                        src={visibleLitter.father.media[0].url}
                        alt={visibleLitter.father.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-blue-500">♂</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">{visibleLitter.father.name}</p>
                    <p className="text-sm text-amber-700/80">Father</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
