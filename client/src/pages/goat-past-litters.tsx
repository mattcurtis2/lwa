import { useQuery } from "@tanstack/react-query";
import type { GoatLitter } from "@db/schema";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoatCard } from "@/components/cards/goat-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoatPastLitters() {
  const { data: litters, isLoading } = useQuery<GoatLitter[]>({
    queryKey: ["/api/goat-litters/list/past"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {[1, 2].map(i => (
              <Skeleton key={i} className="w-full h-[300px] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!litters?.length) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>No Past Litters</CardTitle>
              <CardDescription>
                Check back later to see our past litters.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Past Litters</h1>
        <div className="space-y-12">
          {litters.map(litter => (
            <Card key={litter.id}>
              <CardHeader>
                <CardTitle>Born {new Date(litter.puppies[0].birthDate).toLocaleDateString()}</CardTitle>
                <CardDescription>
                  View details about this past litter
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
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Kids</h3>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {litter.puppies.map(kid => (
                      <GoatCard key={kid.id} goat={kid} />
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <Link href={`/goats/litters/${litter.id}`}>
                    <a className="text-primary hover:text-primary/80 font-medium">
                      View Litter Details →
                    </a>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
