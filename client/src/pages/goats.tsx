import { useQuery } from "@tanstack/react-query";
import type { Metadata } from "@/lib/types";
import { GoatHero } from "@/components/sections/goat-hero";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GoatCard } from "@/components/cards/goat-card";
import GoatDetails from "@/components/goat-details";
import type { Goat } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";

interface GoatsPageProps {
  genderFilter?: 'male' | 'female';
  showAvailable?: boolean;
}

export const metadata: Metadata = {
  title: "Nigerian Dwarf Goats | Little Way Acres",
  description: "Learn about our Nigerian Dwarf goats, known for their friendly personalities and excellent milk production.",
};

export default function GoatsPage({ genderFilter, showAvailable }: GoatsPageProps) {
  const { data: goats = [] } = useQuery<Goat[]>({
    queryKey: ["/api/goats"],
  });

  const { data: siteContent = [] } = useQuery({
    queryKey: ["/api/site-content"],
  });

  const goatDescription = siteContent.find(
    (content: any) => content.key === "goat_description"
  )?.value;

  // Filter goats based on props
  const filteredGoats = goats.filter(goat => {
    if (genderFilter && goat.gender !== genderFilter) return false;
    if (showAvailable && !goat.available) return false;
    if (goat.kid) return false; // Don't show kids in main listing
    return true;
  });

  // Determine the page title and description
  let pageTitle = "Our Nigerian Dwarf Goats";
  let pageDescription = goatDescription || 
    "Our Nigerian Dwarf Goats are beloved members of our farm family. These charming, miniature dairy goats are known for their friendly personalities and rich milk production.";

  if (genderFilter === 'male') {
    pageTitle = "Our Bucks";
    pageDescription = "Meet our Nigerian Dwarf bucks. These handsome boys are carefully selected for their excellent genetics and conformation.";
  } else if (genderFilter === 'female') {
    pageTitle = "Our Does";
    pageDescription = "Meet our Nigerian Dwarf does. These lovely ladies are the foundation of our breeding program, known for their excellent milk production.";
  } else if (showAvailable) {
    pageTitle = "Available Goats";
    pageDescription = "Browse our currently available Nigerian Dwarf goats. Each goat is raised with care and attention.";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Only show hero on main goats page */}
      {!genderFilter && !showAvailable && <GoatHero />}

      <section className={`container mx-auto px-4 ${!genderFilter && !showAvailable ? 'py-12' : 'pt-24'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">{pageTitle}</h1>
          <div className="prose prose-stone mx-auto">
            <p className="text-lg leading-relaxed text-stone-600 text-center">
              {pageDescription}
            </p>
          </div>
        </div>

        {/* Only show navigation buttons on main goats page */}
        {!genderFilter && !showAvailable && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Link href="/goats/males">
              <Button
                variant="outline"
                className="w-full h-auto py-8 flex flex-col items-center gap-2"
              >
                <span className="text-xl">Males</span>
                <span className="text-sm text-stone-500">View our bucks</span>
              </Button>
            </Link>

            <Link href="/goats/females">
              <Button
                variant="outline"
                className="w-full h-auto py-8 flex flex-col items-center gap-2"
              >
                <span className="text-xl">Females</span>
                <span className="text-sm text-stone-500">View our does</span>
              </Button>
            </Link>

            <Link href="/goats/available">
              <Button
                variant="outline"
                className="w-full h-auto py-8 flex flex-col items-center gap-2"
              >
                <span className="text-xl">Available</span>
                <span className="text-sm text-stone-500">
                  View goats available for sale
                </span>
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-16">
          {filteredGoats.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {filteredGoats.map(goat => 
                genderFilter ? (
                  <GoatDetails key={goat.id} goat={goat} />
                ) : (
                  <GoatCard key={goat.id} goat={goat} />
                )
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-stone-600">
                No goats currently available in this category.
                Check back later or contact us for more information.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}