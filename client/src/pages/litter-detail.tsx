import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Dog, DogMedia, Litter } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";
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
import { useState } from 'react';
import { cn } from "@/lib/utils";

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

function DocumentLink({ document }: { document: Document }) {
  const isImage = document.mimeType.startsWith('image/');
  const isVideo = document.mimeType.startsWith('video/');
  const isPdf = document.mimeType === 'application/pdf';

  const getIcon = () => {
    if (isPdf) return <FileText className="h-5 w-5" />;
    if (isImage) return <FileImage className="h-5 w-5" />;
    if (isVideo) return <FileVideo className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center">
          {isImage ? (
            <img
              src={document.url}
              alt={document.name}
              className="w-full h-full object-cover"
            />
          ) : isVideo ? (
            <video
              src={document.url}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              {getIcon()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{document.name}</h4>
          <p className="text-sm text-muted-foreground">
            {document.mimeType.split('/')[1].toUpperCase()}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            asChild
          >
            <a href={document.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Document
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

function DogInfo({ dog }: { dog: Dog & { media?: DogMedia[]; documents?: Document[] } }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const healthDocuments = dog.documents?.filter((doc) => doc.type === 'health') || [];
  const pedigreeDocuments = dog.documents?.filter((doc) => doc.type === 'pedigree') || [];

  const genderSymbol = dog.gender === 'male' ? (
    <span className="text-blue-500">♂</span>
  ) : (
    <span className="text-pink-500">♀</span>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
          {dog.name} {genderSymbol}
        </h1>
        {dog.registrationName && (
          <p className="text-xl text-muted-foreground">{dog.registrationName}</p>
        )}
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full md:w-auto inline-flex whitespace-nowrap">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="physical">Physical Characteristics</TabsTrigger>
          <TabsTrigger value="health">Health Information</TabsTrigger>
          <TabsTrigger value="pedigree">Pedigree</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Breed</h3>
                  <p>Colorado Mountain Dog</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Gender</h3>
                  <p className="flex items-center gap-1">
                    {dog.gender.charAt(0).toUpperCase() + dog.gender.slice(1)} {genderSymbol}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="story">
          <Card>
            <CardHeader>
              <CardTitle>Story</CardTitle>
              <CardDescription>Learn more about {dog.name}'s personality and background</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-lg leading-relaxed">
                  {dog.narrativeDescription || dog.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="physical">
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

        <TabsContent value="health">
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
                {healthDocuments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Health Documents</h3>
                    <div className="grid gap-4">
                      {healthDocuments.map((doc, index) => (
                        <DocumentLink key={index} document={doc} />
                      ))}
                    </div>
                  </div>
                )}
                {!dog.healthData && healthDocuments.length === 0 && (
                  <p>No health information available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedigree">
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
                {pedigreeDocuments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Pedigree Documents</h3>
                    <div className="grid gap-4">
                      {pedigreeDocuments.map((doc, index) => (
                        <DocumentLink key={index} document={doc} />
                      ))}
                    </div>
                  </div>
                )}
                {!dog.pedigree && pedigreeDocuments.length === 0 && (
                  <p>No pedigree information available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {dog.media && dog.media.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Pictures & Videos</h2>
          <DogMediaCarousel
            media={dog.media}
            className="w-full max-w-3xl mx-auto mb-4"
            activeIndex={activeMediaIndex}
            onSlideChange={setActiveMediaIndex}
          />
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 px-4">
            {dog.media.map((item, index) => (
              item.type === 'image' && (
                <button
                  key={index}
                  onClick={() => setActiveMediaIndex(index)}
                  className={cn(
                    "relative aspect-square group transition-transform hover:scale-105",
                    activeMediaIndex === index && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  <img
                    src={item.url}
                    alt={`${dog.name} - photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md" />
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
      {/* Litter Overview */}
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

      {/* Parents Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-pink-500">♀</span> Mother
          </h2>
          <DogInfo dog={litter.mother} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-blue-500">♂</span> Father
          </h2>
          <DogInfo dog={litter.father} />
        </div>
      </div>

      {/* Puppies Section */}
      {puppyCount > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-8 text-stone-800 text-center">Puppies</h2>
          <div className="grid grid-cols-1 gap-12">
            {litter.puppies?.map((puppy) => (
              <div key={puppy.id}>
                <DogInfo dog={puppy} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}