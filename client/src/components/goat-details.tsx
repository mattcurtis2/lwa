import { useState, useEffect } from "react";
import { Goat, GoatMedia } from "@db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  File,
  FileText,
  FileImage,
  FileVideo,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/date-utils";
import { parseISO } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface Document {
  id?: number;
  type: string;
  url: string;
  name: string;
  mimeType: string;
}

interface GoatDetailsProps {
  goat: Goat & {
    media?: GoatMedia[];
    documents?: Document[];
  };
  showPrice?: boolean;
}

function DocumentLink({ document }: { document: Document }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { url, type } = document;

  const isPdf = url.toLowerCase().endsWith(".pdf");
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(url);
  const isVideo = /\.(mp4|webm|mov)$/i.test(url);

  const getIcon = () => {
    if (isPdf) return <FileText className="h-5 w-5" />;
    if (isImage) return <FileImage className="h-5 w-5" />;
    if (isVideo) return <FileVideo className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="mt-2 w-full">
      <div className="border rounded-lg p-3 overflow-hidden">
        <div className="flex w-full items-center">
          <div className="flex flex-1 min-w-0 overflow-hidden text-primary">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex items-start mr-2 max-w-full overflow-hidden"
            >
              <div className="mr-2 flex-shrink-0 mt-1">{getIcon()}</div>
              <div className="break-words">
                {document.name || url.split("/").pop()}
              </div>
            </button>
          </div>
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle className="max-w-full break-words">
              {document.name || url.split("/").pop()}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {isPdf && (
              <iframe
                src={url}
                className="w-full h-[80vh]"
                title={document.name || "PDF document"}
              />
            )}
            {isImage && (
              <img
                src={url}
                alt={document.name || "Image"}
                className="w-full h-auto"
              />
            )}
            {isVideo && <video src={url} controls className="w-full h-auto" />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function GoatDetails({ goat, showPrice = false }: GoatDetailsProps) {
  console.log('GoatDetails rendered with:', { 
    goatId: goat.id,
    goatName: goat.name,
    available: goat.available, 
    price: goat.price, 
    showPrice 
  });
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const healthDocuments =
    goat.documents?.filter((doc) => doc.type === "health") || [];
  const pedigreeDocuments =
    goat.documents?.filter((doc) => doc.type === "pedigree") || [];
  const imageMedia = goat.media?.filter((m) => m.type === "image") || [];

  const genderSymbol =
    goat.gender === "male" ? (
      <span className="text-blue-500">♂</span>
    ) : (
      <span className="text-pink-500">♀</span>
    );

  const handleNextImage = () => {
    setActiveMediaIndex((prev) =>
      prev === imageMedia.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePrevImage = () => {
    setActiveMediaIndex((prev) =>
      prev === 0 ? imageMedia.length - 1 : prev - 1,
    );
  };

  // Determine which tabs to show based on content availability
  const hasStory = !!(goat.narrativeDescription || goat.description);
  const hasPhysical = !!(goat.color || goat.weight);
  const hasHealth = !!(goat.healthData || healthDocuments.length > 0);
  const hasPedigree = !!(goat.pedigree || pedigreeDocuments.length > 0);

  // Always default to basic tab per client request
  const getDefaultTab = () => {
    return "basic";
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isMediaDialogOpen) {
        if (e.key === "ArrowLeft") {
          handlePrevImage();
        } else if (e.key === "ArrowRight") {
          handleNextImage();
        } else if (e.key === "Escape") {
          setIsMediaDialogOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isMediaDialogOpen]);

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
          <img
            src={
              imageMedia[activeMediaIndex]?.url ||
              goat.profileImageUrl ||
              (goat.media && goat.media[0]?.url)
            }
            alt={goat.name}
            className="w-full h-full object-cover"
          />
          {/* Removed price banner from image */}
          {imageMedia.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {goat.name} {genderSymbol}
          </h1>
          {goat.registrationName && (
            <p className="text-xl text-muted-foreground">
              {goat.registrationName}
            </p>
          )}
          {showPrice && goat.available && (
            <div className="space-y-2 mt-2">
              {goat.price && !isNaN(parseInt(goat.price)) && (
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary py-2 px-4 rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <p className="text-lg font-semibold text-white">
                    Available: ${parseInt(goat.price).toLocaleString()}
                  </p>
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              )}
              
              {goat.gender === "male" && goat.wetherPrice && !isNaN(parseInt(goat.wetherPrice)) && (
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 py-2 px-4 rounded-md inline-flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <p className="text-lg font-semibold text-white">
                    As Wether: ${parseInt(goat.wetherPrice).toLocaleString()}
                  </p>
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Breed</h3>
                <p>{goat.breed}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gender</h3>
                <p className="flex items-center gap-1">
                  {goat.gender.charAt(0).toUpperCase() + goat.gender.slice(1)}{" "}
                  {genderSymbol}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Birth Date</h3>
                <p>{formatDisplayDate(parseISO(goat.birthDate))}</p>
              </div>
            </CardContent>
          </Card>

          {hasStory && (
            <Card>
              <CardHeader>
                <CardTitle>Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-base leading-relaxed space-y-6">
                  {goat.description && (
                    <div>
                      <h3 className="font-semibold mb-3">Basic Information</h3>
                      <div>
                        {goat.description.split("\n\n").map((paragraph, index) => (
                          <p key={`desc-${index}`} className="mb-4 last:mb-0">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {goat.narrativeDescription && (
                    <div>
                      <h3 className="font-semibold mb-3">Story</h3>
                      <div>
                        {goat.narrativeDescription.split("\n\n").map((paragraph, index) => (
                          <p key={`narr-${index}`} className="mb-4 last:mb-0">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {hasPhysical && (
            <Card>
              <CardHeader>
                <CardTitle>Physical Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goat.color && (
                  <div>
                    <h3 className="font-semibold mb-1">Color</h3>
                    <p>{goat.color}</p>
                  </div>
                )}
                {goat.weight && (
                  <div>
                    <h3 className="font-semibold mb-1">Weight</h3>
                    <p>{goat.weight} lbs</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {hasHealth && (
            <Card>
              <CardHeader>
                <CardTitle className="break-words">Health Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goat.healthData && (
                    <div className="prose max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: goat.healthData }} />
                    </div>
                  )}
                  {healthDocuments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold break-words">
                        Health Documents
                      </h3>
                      <div className="grid gap-4">
                        {healthDocuments.map((doc, index) => (
                          <DocumentLink key={index} document={doc} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {hasPedigree && (
            <Card>
              <CardHeader>
                <CardTitle className="break-words">
                  Pedigree Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {goat.pedigree && (
                    <div className="prose max-w-none mb-6">
                      <div dangerouslySetInnerHTML={{ __html: goat.pedigree }} />
                    </div>
                  )}
                  {pedigreeDocuments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold break-words">
                        Pedigree Documents
                      </h3>
                      <div className="grid gap-4">
                        {pedigreeDocuments.map((doc, index) => (
                          <DocumentLink key={index} document={doc} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="space-y-6">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          <img
            src={
              imageMedia[activeMediaIndex]?.url ||
              goat.profileImageUrl ||
              (goat.media && goat.media[0]?.url)
            }
            alt={goat.name}
            className="w-full h-full object-cover"
          />
          {/* Removed price banner from image */}
        </div>

        {imageMedia.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imageMedia.map((media, index) => (
              <button
                key={index}
                onClick={() => setActiveMediaIndex(index)}
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden transition-transform hover:scale-105",
                  activeMediaIndex === index &&
                    "ring-2 ring-primary ring-offset-2",
                )}
              >
                <img
                  src={media.url}
                  alt={`${goat.name} - photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="md:col-span-2 space-y-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-2">
            {goat.name} {genderSymbol}
          </h1>
          {goat.registrationName && (
            <p className="text-xl text-muted-foreground">
              {goat.registrationName}
            </p>
          )}
          {showPrice && goat.available && (
            <div className="space-y-2 mt-2">
              {goat.price && !isNaN(parseInt(goat.price)) && (
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary py-2 px-4 rounded-md inline-flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <p className="text-lg font-semibold text-white">
                    Available: ${parseInt(goat.price).toLocaleString()}
                  </p>
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              )}
              
              {goat.gender === "male" && goat.wetherPrice && !isNaN(parseInt(goat.wetherPrice)) && (
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeAmx7hDWVwRRToiTXTS-3SuT3uYjD0vnxTPP2gLi1ppoy4Ow/viewform?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 py-2 px-4 rounded-md inline-flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <p className="text-lg font-semibold text-white">
                    As Wether: ${parseInt(goat.wetherPrice).toLocaleString()}
                  </p>
                  <ExternalLink className="h-4 w-4 text-white" />
                </a>
              )}
            </div>
          )}
        </div>

        <Dialog open={isMediaDialogOpen} onOpenChange={setIsMediaDialogOpen}>
          <DialogContent className="max-w-4xl w-full h-[70vh] p-4">
            <DialogHeader className="mb-2">
              <DialogTitle>{goat.name}'s Gallery</DialogTitle>
            </DialogHeader>
            <div className="relative flex items-center justify-center h-[calc(100%-3rem)] w-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 z-10"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={imageMedia[activeMediaIndex]?.url}
                  alt={`${goat.name} - photo ${activeMediaIndex + 1}`}
                  className="max-h-[50vh] max-w-[600px] w-auto h-auto object-contain rounded-lg"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 z-10"
                onClick={handleNextImage}
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
                        : "bg-muted hover:bg-muted-foreground/50",
                    )}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <TabsList className="w-full md:w-auto inline-flex whitespace-nowrap overflow-x-auto">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            {hasStory && <TabsTrigger value="story">Story</TabsTrigger>}
            {hasPhysical && (
              <TabsTrigger value="physical">Physical</TabsTrigger>
            )}
            {hasHealth && <TabsTrigger value="health">Health</TabsTrigger>}
            {hasPedigree && (
              <TabsTrigger value="pedigree">Pedigree</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Breed</h3>
                <p>{goat.breed}</p>
              </div>
              <div>
                <h3 className="font-medium text-lg">Gender</h3>
                <p className="flex items-center gap-1">
                  {goat.gender.charAt(0).toUpperCase() + goat.gender.slice(1)}{" "}
                  {genderSymbol}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-lg">Birth Date</h3>
                <p>{formatDisplayDate(parseISO(goat.birthDate))}</p>
              </div>
            </div>
          </TabsContent>

          {hasStory && (
            <TabsContent value="story" className="space-y-6 pt-4">
              <div className="text-base leading-relaxed space-y-6">
                {goat.description && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Basic Information</h3>
                    <div>
                      {goat.description.split("\n\n").map((paragraph, index) => (
                        <p key={`desc-${index}`} className="mb-4 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                {goat.narrativeDescription && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Story</h3>
                    <div>
                      {goat.narrativeDescription.split("\n\n").map((paragraph, index) => (
                        <p key={`narr-${index}`} className="mb-4 last:mb-0">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {hasPhysical && (
            <TabsContent value="physical" className="space-y-6 pt-4">
              <div className="space-y-4">
                {goat.color && (
                  <div>
                    <h3 className="font-medium text-lg">Color</h3>
                    <p>{goat.color}</p>
                  </div>
                )}
                {goat.weight && (
                  <div>
                    <h3 className="font-medium text-lg">Weight</h3>
                    <p>{goat.weight} lbs</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {hasHealth && (
            <TabsContent value="health" className="space-y-6 pt-4">
              <div className="space-y-6">
                {goat.healthData && (
                  <div className="prose max-w-none mb-6">
                    <div dangerouslySetInnerHTML={{ __html: goat.healthData }} />
                  </div>
                )}
                {healthDocuments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg break-words">
                      Health Documents
                    </h3>
                    <div className="grid gap-4">
                      {healthDocuments.map((doc, index) => (
                        <DocumentLink key={index} document={doc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {hasPedigree && (
            <TabsContent value="pedigree" className="space-y-6 pt-4">
              <div className="space-y-6">
                {goat.pedigree && (
                  <div className="prose max-w-none mb-6">
                    <div dangerouslySetInnerHTML={{ __html: goat.pedigree }} />
                  </div>
                )}
                {pedigreeDocuments.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg break-words">
                      Pedigree Documents
                    </h3>
                    <div className="grid gap-4">
                      {pedigreeDocuments.map((doc, index) => (
                        <DocumentLink key={index} document={doc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
