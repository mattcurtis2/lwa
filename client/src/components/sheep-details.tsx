import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Ruler, Weight, Palette, Scissors } from "lucide-react";
import { formatDisplayDate, parseISO } from "@/lib/date-utils";
import type { Sheep } from "@db/schema";

interface SheepDetailsProps {
  sheep: Sheep;
  showPrice?: boolean;
}

export default function SheepDetails({ sheep, showPrice = false }: SheepDetailsProps) {
  const genderSymbol = sheep.gender === 'male' ? '♂' : '♀';
  const genderClass = sheep.gender === 'male' ? 'text-blue-600' : 'text-pink-600';

  return (
    <div id={sheep.name.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-24">
      <Card className="overflow-hidden shadow-lg">
        {/* Image Section */}
        {sheep.profileImageUrl && (
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={sheep.profileImageUrl}
              alt={sheep.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-bold text-stone-800 mb-1">
                {sheep.name}
              </CardTitle>
              {sheep.registrationName && (
                <p className="text-stone-600 text-sm">
                  Registration: {sheep.registrationName}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={sheep.available ? "default" : "secondary"} className="text-sm">
                {sheep.available ? (sheep.sold ? "Sold" : "Available") : (sheep.lamb ? "Lamb" : sheep.gender === 'male' ? "Ram" : "Ewe")}
              </Badge>
              {showPrice && sheep.price && !sheep.sold && (
                <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200">
                  ${sheep.price}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {sheep.description && (
            <div className="mb-6">
              <p className="text-stone-700 leading-relaxed">{sheep.description}</p>
            </div>
          )}

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Breed</h3>
                  <p>{sheep.breed}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gender</h3>
                  <p className="flex items-center gap-1">
                    {sheep.gender.charAt(0).toUpperCase() + sheep.gender.slice(1)}{" "}
                    <span className={genderClass}>{genderSymbol}</span>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Birth Date</h3>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDisplayDate(parseISO(sheep.birthDate))}
                  </p>
                </div>
                {sheep.sireName && (
                  <div>
                    <h3 className="font-semibold mb-1">Sire</h3>
                    <p>{sheep.sireName}</p>
                  </div>
                )}
                {sheep.damName && (
                  <div>
                    <h3 className="font-semibold mb-1">Dam</h3>
                    <p>{sheep.damName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Physical Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle>Physical Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sheep.color && (
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color
                    </h3>
                    <p>{sheep.color}</p>
                  </div>
                )}
                {sheep.fleeceType && (
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <Scissors className="h-4 w-4" />
                      Fleece Type
                    </h3>
                    <p>{sheep.fleeceType}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sheep.height && (
                    <div>
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Height
                      </h3>
                      <p>{sheep.height} inches</p>
                    </div>
                  )}
                  {sheep.weight && (
                    <div>
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        Weight
                      </h3>
                      <p>{sheep.weight} lbs</p>
                    </div>
                  )}
                </div>
                {sheep.fleeceWeight && (
                  <div>
                    <h3 className="font-semibold mb-1">Fleece Weight</h3>
                    <p>{sheep.fleeceWeight} lbs</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Information */}
            {sheep.healthData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-stone max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: sheep.healthData }} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Details */}
            {sheep.narrativeDescription && (
              <Card>
                <CardHeader>
                  <CardTitle>About {sheep.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-stone max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: sheep.narrativeDescription }} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Media */}
            {sheep.media && sheep.media.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sheep.media.map((mediaItem, index) => (
                      <div key={index} className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={mediaItem.url}
                          alt={`${sheep.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {sheep.documents && sheep.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sheep.documents.map((doc, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          {doc.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}