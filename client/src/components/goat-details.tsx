import { useState, useEffect } from "react";
import { Goat, GoatMedia } from "@db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  FileImage,
  FileVideo,
  File,
  ExternalLink,
} from "lucide-react";
import { parseISO, format } from "date-fns";
import { formatDisplayDate } from "@/lib/date-utils";

interface GoatDetailsProps {
  goat: Goat & {
    media?: GoatMedia[];
    documents?: Document[];
  };
}

export default function GoatDetails({ goat }: GoatDetailsProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("details");
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const hasMedia = goat.media && goat.media.length > 0;
  const gallery = hasMedia ? [...goat.media] : [];
  const genderSymbol = goat.gender === 'female' ? '♀' : '♂';

  // Get profile image
  const profileImage = goat.profileImageUrl || (gallery.length > 0 ? gallery[0].url : '/images/goat-placeholder.jpg');

  return (
    <div className="min-h-screen bg-background pt-20 md:px-6">
      <div className="container mx-auto px-4 pb-20">
        {/* Hero Image and basic info */}
        <div className="relative mb-8 h-72 md:h-96 rounded-xl overflow-hidden bg-stone-100">
          <img
            src={profileImage}
            alt={goat.name}
            className="w-full h-full object-cover"
          />
          {goat.available && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md font-medium">
              Available
              {goat.price && <span className="ml-2">${goat.price}</span>}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Left Column - Basic Info */}
          <div className="md:w-1/3 mb-6 md:mb-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  {goat.name} {genderSymbol}
                </h1>
                {goat.registrationName && (
                  <p className="text-xl text-muted-foreground">{goat.registrationName}</p>
                )}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Breed</h3>
                  <p>Nigerian Dwarf Goat</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gender</h3>
                  <p className="flex items-center gap-1">
                    {goat.gender.charAt(0).toUpperCase() + goat.gender.slice(1)} {genderSymbol}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Birth Date</h3>
                  <p>{formatDisplayDate(parseISO(goat.birthDate))}</p>
                </div>
                {goat.milkProduction && (
                  <div>
                    <h3 className="font-semibold mb-1">Milk Production</h3>
                    <p>{goat.milkProduction}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="md:w-2/3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-6">
                  {goat.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-stone-700 whitespace-pre-wrap">{goat.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Physical Characteristics</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      {goat.height && (
                        <div>
                          <h3 className="font-semibold mb-1">Height</h3>
                          <p>{goat.height} inches</p>
                        </div>
                      )}
                      {goat.weight && (
                        <div>
                          <h3 className="font-semibold mb-1">Weight</h3>
                          <p>{goat.weight} lbs</p>
                        </div>
                      )}
                      {goat.color && (
                        <div className="col-span-2">
                          <h3 className="font-semibold mb-1">Color</h3>
                          <p>{goat.color}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {(goat.dam || goat.sire) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Lineage</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        {goat.dam && (
                          <div>
                            <h3 className="font-semibold mb-1">Dam</h3>
                            <p>{goat.dam}</p>
                          </div>
                        )}
                        {goat.sire && (
                          <div>
                            <h3 className="font-semibold mb-1">Sire</h3>
                            <p>{goat.sire}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="media">
                <Card>
                  <CardContent className="pt-6">
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}