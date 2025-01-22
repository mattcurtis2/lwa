import { useQuery } from "@tanstack/react-query";
import { Dog, DogMedia } from "@db/schema";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { formatAge } from "@/lib/date-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import DogMediaCarousel from "@/components/cards/dog-media-carousel";

export default function DogDetail() {
  const [location] = useLocation();
  const dogName = location.split("/").pop()?.replace("#", "");

  const { data: dogs } = useQuery<(Dog & { media?: DogMedia[] })[]>({
    queryKey: ["/api/dogs"],
  });

  const dog = dogs?.find((d) => d.name.toLowerCase() === dogName?.toLowerCase());

  if (!dog) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Dog not found</h1>
      </div>
    );
  }

  const genderSymbol = dog.gender === 'male' ? (
    <span className="text-blue-500">♂</span>
  ) : (
    <span className="text-pink-500">♀</span>
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
            {dog.name} {genderSymbol}
          </h1>
          {dog.registrationName && (
            <p className="text-xl text-muted-foreground">{dog.registrationName}</p>
          )}
          <p className="text-lg mt-2">
            Age: {formatAge(new Date(dog.birthDate))}
          </p>
        </div>

        {/* Media Section */}
        {dog.media && dog.media.length > 0 && (
          <div className="mb-12">
            <DogMediaCarousel media={dog.media} className="w-full max-w-4xl mx-auto" />
            
            {/* Image Grid/Collage */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {dog.media.map((item, index) => (
                item.type === 'image' && (
                  <div key={index} className="aspect-square">
                    <img
                      src={item.url}
                      alt={`${dog.name} - photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Details Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="physical">Physical Characteristics</TabsTrigger>
            <TabsTrigger value="health">Health Information</TabsTrigger>
            <TabsTrigger value="pedigree">Pedigree</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>About {dog.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full rounded-md">
                  <div className="space-y-4">
                    <p className="text-lg leading-relaxed">
                      {dog.narrativeDescription || dog.description}
                    </p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="physical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Physical Characteristics</CardTitle>
                <CardDescription>Detailed physical attributes and measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Color</h3>
                    <p>{dog.color || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Fur Length</h3>
                    <p>{dog.furLength || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Height</h3>
                    <p>{dog.height ? `${dog.height} inches` : "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Weight</h3>
                    <p>{dog.weight ? `${dog.weight} lbs` : "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Dewclaws</h3>
                    <p>{dog.dewclaws || "Not specified"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Information</CardTitle>
                <CardDescription>Health records and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {dog.healthData ? (
                    <div dangerouslySetInnerHTML={{ __html: dog.healthData }} />
                  ) : (
                    <p>No health information available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pedigree" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Pedigree Information</CardTitle>
                <CardDescription>Family history and lineage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {dog.pedigree ? (
                    <div dangerouslySetInnerHTML={{ __html: dog.pedigree }} />
                  ) : (
                    <p>No pedigree information available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
