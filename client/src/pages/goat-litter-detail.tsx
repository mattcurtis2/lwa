
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useEffect } from "react";
import { Goat, GoatLitter } from "@db/schema";
import { formatDisplayDate, parseApiDate } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import GoatDetails from "@/components/goat-details";

interface Document {
  id?: number;
  type: string;
  url: string;
  name: string;
  mimeType: string;
}

interface LitterWithRelations extends GoatLitter {
  mother: Goat & { media?: { url: string; type: string }[]; documents?: Document[] };
  father: Goat & { media?: { url: string; type: string }[]; documents?: Document[] };
  kids?: (Goat & { media?: { url: string; type: string }[]; documents?: Document[] })[];
}

export default function GoatLitterDetail() {
  const { id } = useParams();

  const { data: litter, isLoading: isLoadingLitter } = useQuery<LitterWithRelations>({
    queryKey: [`/api/goat-litters/${id}`],
  });

  useEffect(() => {
    if (litter) {
      const motherName = litter.mother?.name || 'Unknown Dam';
      const fatherName = litter.father?.name || 'Unknown Sire';
      const pageTitle = `${motherName} × ${fatherName} Litter | Nigerian Dwarf Goat Kids | Little Way Acres`;
      const dueDate = formatDisplayDate(parseApiDate(litter.dueDate));
      const pageDescription = `Nigerian Dwarf goat litter from ${motherName} and ${fatherName}. ${litter.kids?.length || 0} kids. Expected ${dueDate}. Little Way Acres, Hudsonville, Michigan.`;
      const imageUrl = litter.mother?.media?.[0]?.url || litter.father?.media?.[0]?.url || '/logo.png';

      document.title = pageTitle;

      const updateOrCreateMetaTag = (name: string, content: string) => {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('name', name);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      };

      const updateOrCreateOGTag = (property: string, content: string) => {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', content);
      };

      updateOrCreateMetaTag('description', pageDescription);
      updateOrCreateMetaTag('keywords', `Nigerian Dwarf goat litter, goat kids, ${motherName}, ${fatherName}, Hudsonville Michigan, dairy goats`);

      updateOrCreateOGTag('og:title', pageTitle);
      updateOrCreateOGTag('og:description', pageDescription);
      updateOrCreateOGTag('og:image', imageUrl);
      updateOrCreateOGTag('og:url', window.location.href);
      updateOrCreateOGTag('og:type', 'article');
      updateOrCreateOGTag('og:site_name', 'Little Way Acres');

      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', window.location.href);
    }
  }, [litter]);

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

  const isPastDueDate = parseApiDate(litter.dueDate) < new Date();
  const kidCount = litter.kids?.length || 0;
  const maleCount = litter.kids?.filter(kid => kid.gender === 'male').length || 0;
  const femaleCount = litter.kids?.filter(kid => kid.gender === 'female').length || 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Litter Header */}
      <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 rounded-lg border border-amber-200">
        <div className="max-w-3xl mx-auto py-6 px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="inline-block bg-amber-200/80 backdrop-blur-sm px-3 py-1 rounded-full text-amber-800 text-sm font-semibold mb-2">
                {isPastDueDate ? 'Born Litter' : 'Upcoming Litter'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">
                {isPastDueDate
                  ? `Born ${formatDisplayDate(parseApiDate(litter.dueDate))}`
                  : `Expected ${formatDisplayDate(parseApiDate(litter.dueDate))}`}
              </h1>
            </div>

            {kidCount > 0 && (
              <div className="flex flex-col items-center sm:items-end">
                <p className="text-amber-800 text-lg mb-1">
                  {kidCount} {kidCount === 1 ? 'kid' : 'kids'}
                </p>
                <div className="flex items-center gap-6">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Kids Section */}
        {kidCount > 0 && (
          <div className="space-y-16">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-center">
                <div className="bg-background px-6">
                  <h2 className="text-3xl font-bold text-stone-800">Kids</h2>
                </div>
              </div>
            </div>

            {litter.kids?.map((kid) => (
              <div key={kid.id}>
                <GoatDetails goat={kid} />
              </div>
            ))}
          </div>
        )}

        {/* Parents Section */}
        <div className="space-y-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-center">
              <div className="bg-background px-6">
                <h2 className="text-3xl font-bold text-stone-800">Parents</h2>
              </div>
            </div>
          </div>

          <div className="space-y-16">
            <GoatDetails goat={litter.mother} />
            <GoatDetails goat={litter.father} />
          </div>
        </div>
      </div>
    </div>
  );
}
