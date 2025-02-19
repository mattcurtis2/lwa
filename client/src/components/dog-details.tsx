import { useState, useEffect } from "react";
import { Dog, DogMedia } from "@db/schema";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { FileText, FileImage, FileVideo, File, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/date-utils";
import { parseISO } from "date-fns";

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
            <img src={document.url} alt={document.name} className="w-full h-full object-cover"/>
          ) : isVideo ? (
            <video src={document.url} className="w-full h-full object-cover"/>
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
          <Button variant="outline" size="sm" className="mt-2" asChild>
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
  const healthDocuments = dog.documents?.filter((doc) => doc.type === 'health') || [];
  const pedigreeDocuments = dog.documents?.filter((doc) => doc.type === 'pedigree') || [];
  const imageMedia = dog.media?.filter(m => m.type === 'image') || [];

  const genderSymbol = dog.gender === 'male' ? (
    <span className="text-blue-500">♂</span>
  ) : (
    <span className="text-pink-500">♀</span>
  );

  const handlePrevImage = () => {
    setActiveMediaIndex((prev) => (prev === 0 ? imageMedia.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveMediaIndex((prev) => (prev === imageMedia.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="w-full max-w-screen-lg mx-auto overflow-x-hidden md:overflow-visible">
      <CardContent className="p-6 space-y-8">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[4/3] md:aspect-[16/9] rounded-lg overflow-hidden bg-muted">
            <img
              src={imageMedia[activeMediaIndex]?.url || dog.profileImageUrl || (dog.media && dog.media[0]?.url)}
              alt={dog.name}
              className="w-full h-full object-cover"
            />
            {imageMedia.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Dog Information */}
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
            {dog.name} {genderSymbol}
          </h1>
          {dog.registrationName && (
            <p className="text-xl text-muted-foreground">{dog.registrationName}</p>
          )}
        </div>

        {/* Basic Information */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
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
            </div>
          </CardContent>
        </Card>


        {/* Story */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Story</h2>
          <div className="prose max-w-none">
            <p className="text-lg leading-relaxed">
              {dog.narrativeDescription || dog.description}
            </p>
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Physical Characteristics</h2>
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
        </div>

        {/* Health Information */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Health Information</h2>
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
        </div>

        {/* Pedigree Information */}
        <div className="border-t pt-6">
          <h2 className="text-2xl font-semibold mb-4">Pedigree Information</h2>
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
        </div>
      </CardContent>
    </Card>
  );
}