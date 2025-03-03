import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import type { Goat } from "@db/schema";
import { GoatCard } from "@/components/cards/goat-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoatDetail() {
  const [, params] = useRoute("/goats/:id");
  const goatId = params?.id;

  const { data: goat, isLoading } = useQuery<Goat>({
    queryKey: [`/api/goats/${goatId}`],
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

  if (!goat) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold text-red-500">Goat not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <GoatCard goat={goat} />
          
          <Tabs defaultValue="info" className="mt-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">About {goat.name}</h3>
                <p className="text-muted-foreground">{goat.description}</p>
                
                {goat.birthDate && (
                  <div>
                    <h4 className="font-medium">Birth Date</h4>
                    <p className="text-muted-foreground">
                      {new Date(goat.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {goat.breed && (
                  <div>
                    <h4 className="font-medium">Breed</h4>
                    <p className="text-muted-foreground">{goat.breed}</p>
                  </div>
                )}
                
                {goat.color && (
                  <div>
                    <h4 className="font-medium">Color</h4>
                    <p className="text-muted-foreground">{goat.color}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="media">
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {goat.media?.length ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {goat.media.map((media, index) => (
                      <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
                        <img
                          src={media.url}
                          alt={`${goat.name} - Photo ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No media available
                  </p>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
