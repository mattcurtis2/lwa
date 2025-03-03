import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Goat } from "@db/schema";
import { formatAge } from "@/lib/date-utils";

interface GoatDetailsProps {
  goat: Goat & {
    media?: { url: string; type: string }[];
    documents?: { url: string; type: string; fileName: string }[];
  };
}

export default function GoatDetails({ goat }: GoatDetailsProps) {
  const hasMedia = goat.media && goat.media.length > 0;
  const gallery = hasMedia ? [...goat.media] : [];
  const genderLabel = goat.gender === 'female' ? 'Doe' : 'Buck';

  const healthDocuments = goat.documents?.filter(doc => doc.type === 'health') || [];
  const pedigreeDocuments = goat.documents?.filter(doc => doc.type === 'pedigree') || [];

  return (
    <div className="w-full px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          {hasMedia ? (
            <div className="rounded-lg overflow-hidden">
              <img
                src={gallery[0].url}
                alt={goat.name}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No image available</p>
            </div>
          )}
        </div>
        <div>
          <div className="space-y-4">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold mr-3">{goat.name}</h1>
              <span className={`text-2xl ${goat.gender === 'female' ? 'text-pink-500' : 'text-blue-500'}`}>
                {goat.gender === 'female' ? '♀' : '♂'}
              </span>
            </div>
            {goat.registrationName && (
              <p className="text-lg text-muted-foreground">{goat.registrationName}</p>
            )}
            {goat.available && goat.price && (
              <div className="mt-2 inline-block bg-amber-600 py-2 px-4">
                <p className="text-lg font-semibold text-white">
                  Available: ${parseInt(goat.price).toLocaleString()}
                </p>
              </div>
            )}
            <Tabs defaultValue="details" className="mt-6">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
                {(healthDocuments.length > 0 || pedigreeDocuments.length > 0) && (
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-muted-foreground">Type</div>
                      <div>{genderLabel}</div>

                      {goat.breed && (
                        <>
                          <div className="text-muted-foreground">Breed</div>
                          <div>{goat.breed}</div>
                        </>
                      )}

                      {goat.birthDate && (
                        <>
                          <div className="text-muted-foreground">Age</div>
                          <div>{formatAge(new Date(goat.birthDate))}</div>
                        </>
                      )}

                      {goat.height && (
                        <>
                          <div className="text-muted-foreground">Height</div>
                          <div>{goat.height} inches</div>
                        </>
                      )}

                      {goat.weight && (
                        <>
                          <div className="text-muted-foreground">Weight</div>
                          <div>{goat.weight} lbs</div>
                        </>
                      )}

                      {goat.available && goat.price && (
                        <>
                          <div className="text-muted-foreground">Price</div>
                          <div>${parseInt(goat.price).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>

                  {goat.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Description</h3>
                      <p>{goat.description}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="space-y-4">
                  {healthDocuments.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <h3 className="text-lg font-semibold mb-2">Health Records</h3>
                      <ul className="space-y-2">
                        {healthDocuments.map((doc, i) => (
                          <li key={i} className="flex items-center">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline w-full truncate"
                            >
                              <span className="mr-2">📄</span>
                              <span>{doc.fileName || `Health Document ${i + 1}`}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pedigreeDocuments.length > 0 && (
                    <div className="border rounded-lg p-3">
                      <h3 className="text-lg font-semibold mb-2">Pedigree Documents</h3>
                      <ul className="space-y-2">
                        {pedigreeDocuments.map((doc, i) => (
                          <li key={i} className="flex items-center">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline w-full truncate"
                            >
                              <span className="mr-2">📄</span>
                              <span>{doc.fileName || `Pedigree Document ${i + 1}`}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
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
    </div>
  );
}