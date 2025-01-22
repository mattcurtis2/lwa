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
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  File,
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  type: string;
  url: string;
  name: string;
}

function DocumentLink({ document }: { document: Document }) {
  const getIcon = () => {
    const ext = document.url.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="h-5 w-5" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImage className="h-5 w-5" />;
    if (['mp4', 'mov', 'avi'].includes(ext || '')) return <FileVideo className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2 w-full justify-start"
      asChild
    >
      <a href={document.url} target="_blank" rel="noopener noreferrer">
        {getIcon()}
        <span className="flex-1 truncate">{document.name}</span>
        <ExternalLink className="h-4 w-4 shrink-0" />
      </a>
    </Button>
  );
}

export default function DogDetail() {
  const [location] = useLocation();
  const dogName = location.split("/").pop()?.replace("#", "");

  const { data: dogs } = useQuery<(Dog & { 
    media?: DogMedia[],
    healthDocuments?: Document[],
    pedigreeDocuments?: Document[]
  })[]>({
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
          <div className="prose max-w-none mt-4">
            <p>{dog.description}</p>
          </div>
        </div>

        {/* Pictures & Videos Section */}
        {dog.media && dog.media.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Pictures & Videos</h2>
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
                <div className="space-y-6">
                  {dog.healthData && (
                    <div className="prose max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: dog.healthData }} />
                    </div>
                  )}

                  {/* Health Documents Section */}
                  {dog.healthDocuments && dog.healthDocuments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Health Documents</h3>
                      <div className="grid gap-2">
                        {dog.healthDocuments.map((doc, index) => (
                          <DocumentLink key={index} document={doc} />
                        ))}
                      </div>
                    </div>
                  )}

                  {!dog.healthData && (!dog.healthDocuments || dog.healthDocuments.length === 0) && (
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
                <div className="space-y-6">
                  {dog.pedigree && (
                    <div className="prose max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: dog.pedigree }} />
                    </div>
                  )}

                  {/* Pedigree Documents Section */}
                  {dog.pedigreeDocuments && dog.pedigreeDocuments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Pedigree Documents</h3>
                      <div className="grid gap-2">
                        {dog.pedigreeDocuments.map((doc, index) => (
                          <DocumentLink key={index} document={doc} />
                        ))}
                      </div>
                    </div>
                  )}

                  {!dog.pedigree && (!dog.pedigreeDocuments || dog.pedigreeDocuments.length === 0) && (
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