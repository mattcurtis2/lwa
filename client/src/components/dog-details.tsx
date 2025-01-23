import { useState, useEffect } from "react";
import { Dog, DogMedia } from "@db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FileText,
  FileImage,
  FileVideo,
  File,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DogMediaCarousel from "@/components/cards/dog-media-carousel";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/date-utils";
import { parseISO } from "date-fns";
import React from "react";

interface Document {
  id?: number;
  type: string;
  url: string;
  name: string;
  mimeType: string;
}

interface DogDetailsProps {
  dog: Dog & {
    media?: DogMedia[];
    documents?: Document[];
  };
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

export default function DogDetails({ dog }: DogDetailsProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const healthDocuments = dog.documents?.filter((doc) => doc.type === 'health') || [];
  const pedigreeDocuments = dog.documents?.filter((doc) => doc.type === 'pedigree') || [];
  const imageMedia = dog.media?.filter(m => m.type === 'image') || [];

  const genderSymbol = dog.gender === 'male' ? (
    <span className="text-blue-500">♂</span>
  ) : (
    <span className="text-pink-500">♀</span>
  );

  const handleKeyPress = (e: KeyboardEvent) => {
    if (isMediaDialogOpen) {
      if (e.key === 'ArrowLeft') {
        setActiveMediaIndex((prev) =>
          prev === 0 ? imageMedia.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setActiveMediaIndex((prev) =>
          prev === imageMedia.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'Escape') {
        setIsMediaDialogOpen(false);
      }
    }
  };

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isMediaDialogOpen]);

  const handleThumbnailClick = (index: number) => {
    setActiveMediaIndex(index);
    setIsMediaDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={dog.profileImageUrl || (dog.media && dog.media[0]?.url)}
              alt={dog.name}
            />
            <AvatarFallback>
              {genderSymbol}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              {dog.name} {genderSymbol}
            </h1>
            {dog.registrationName && (
              <p className="text-xl text-muted-foreground">{dog.registrationName}</p>
            )}
          </div>
        </div>

        {/* Desktop/Tablet Image Thumbnails */}
        {imageMedia.length > 0 && (
          <div className="hidden md:flex gap-2 items-center">
            {imageMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative w-16 h-16 rounded-md overflow-hidden transition-transform hover:scale-105",
                  activeMediaIndex === index && isMediaDialogOpen && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <img
                  src={media.url}
                  alt={`${dog.name} - photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Media Dialog */}
      <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[70vh] p-4">
          <DialogHeader className="mb-2">
            <DialogTitle>{dog.name}'s Gallery</DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center h-[calc(100%-6rem)] w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 z-10"
              onClick={() => setActiveMediaIndex((prev) =>
                prev === 0 ? imageMedia.length - 1 : prev - 1
              )}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={imageMedia[activeMediaIndex]?.url}
                alt={`${dog.name} - photo ${activeMediaIndex + 1}`}
                className="max-h-[50vh] max-w-[600px] w-auto h-auto object-contain rounded-lg"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 z-10"
              onClick={() => setActiveMediaIndex((prev) =>
                prev === imageMedia.length - 1 ? 0 : prev + 1
              )}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {imageMedia.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveMediaIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    index === activeMediaIndex
                      ? "bg-primary"
                      : "bg-muted hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <div>
                  <h3 className="font-semibold mb-2">Birth Date</h3>
                  <p>{formatDisplayDate(parseISO(dog.birthDate))}</p>
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

      {/* Mobile Media Gallery */}
      {dog.media && dog.media.length > 0 && (
        <div className="md:hidden">
          <h2 className="text-2xl font-bold mb-6">Pictures & Videos</h2>
          <div className="grid grid-cols-4 gap-2">
            {dog.media.map((item, index) => (
              item.type === 'image' && (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={cn(
                    "relative aspect-square group transition-transform hover:scale-105",
                    activeMediaIndex === index && isMediaDialogOpen && "ring-2 ring-primary ring-offset-2"
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