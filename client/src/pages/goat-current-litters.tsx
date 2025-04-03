import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { GoatLitter, Goat, GoatMedia } from "@db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface LitterWithRelations extends GoatLitter {
  mother: Goat & { media?: GoatMedia[] };
  father: Goat & { media?: GoatMedia[] };
  kids: (Goat & { media?: GoatMedia[] })[];
}

export default function GoatCurrentLitters() {
  const [, navigate] = useLocation();
  const { data: litters, isLoading } = useQuery<LitterWithRelations[]>({
    queryKey: ['/api/goat-litters/list/current'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-8"></div>
            {[1, 2].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!litters?.length) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Current Litters</h1>
        <p className="text-muted-foreground mb-8">
          We don't have any current litters to display at this time.
        </p>
        <Button onClick={() => navigate('/goats')}>
          View Our Goats
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Current Litters</h1>
        <div className="grid gap-8">
          {litters.map((litter) => (
            <Card
              key={litter.id}
              className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => navigate(`/goats/litters/${litter.id}`)}
            >
              <CardContent className="p-6">
                <div className="grid md:grid-cols-[1fr,2fr] gap-6">
                  <div>
                    <div className="bg-amber-100 px-3 py-1 rounded-full text-amber-800 text-sm font-semibold mb-3 inline-block">
                      Current Litter
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {litter.kids.length > 0 
                        ? `${litter.kids.length} ${litter.kids.length === 1 ? "Kid" : "Kids"}` 
                        : "Upcoming Litter"}
                    </h3>
                    <p className="text-muted-foreground">
                      {litter.kids.length > 0 
                        ? `Born: ${format(new Date(litter.dueDate), 'MMM d, yyyy')}` 
                        : `Due: ${format(new Date(litter.dueDate), 'MMM d, yyyy')}`}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div>
                        <h4 className="font-medium">Parents</h4>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span>
                            {litter.mother?.name || "Unknown Dam"} × {litter.father?.name || "Unknown Sire"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div>
                      <h4 className="font-medium mb-2">
                        {litter.kids.length > 0 ? 'Kids' : 'Status'}
                      </h4>
                      {litter.kids.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {litter.kids.slice(0, 3).map((kid) => (
                            <div key={kid.id} className="text-sm">
                              <span className={kid.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}>
                                {kid.gender === 'female' ? '♀' : '♂'}
                              </span>{' '}
                              {kid.name}
                              {kid.available && <span className="ml-1 text-green-600 font-medium">(Available)</span>}
                            </div>
                          ))}
                          {litter.kids.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{litter.kids.length - 3} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Expecting new kids soon! Check back for updates.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}