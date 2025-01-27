import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import type { GoatLitter } from "@db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoatCard } from "@/components/cards/goat-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoatLitterDetail() {
  const [, params] = useRoute("/goats/litters/:id");
  const litterId = params?.id;

  const { data: litter, isLoading } = useQuery<GoatLitter>({
    queryKey: [`/api/goat-litters/${litterId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4">
          <Skeleton className="w-full h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (!litter) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Litter Not Found</CardTitle>
              <CardDescription>
                The requested litter could not be found.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const hasBirthDate = litter.puppies?.some(kid => kid.birthDate);
  const birthDate = hasBirthDate 
    ? new Date(litter.puppies[0].birthDate).toLocaleDateString() 
    : null;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {birthDate 
                ? `Born ${birthDate}`
                : `Expected ${new Date(litter.dueDate).toLocaleDateString()}`
              }
            </CardTitle>
            <CardDescription>
              {birthDate ? 'Past Litter' : 'Upcoming Litter'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-2">
              {litter.mother && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dam</h3>
                  <GoatCard goat={litter.mother} />
                </div>
              )}
              {litter.father && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sire</h3>
                  <GoatCard goat={litter.father} />
                </div>
              )}
            </div>

            {litter.puppies?.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Kids</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {litter.puppies.map(kid => (
                    <GoatCard key={kid.id} goat={kid} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
