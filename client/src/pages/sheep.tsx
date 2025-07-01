import { useQuery } from "@tanstack/react-query";
import type { Metadata } from "@/lib/types";
import { SheepHero } from "@/components/sections/sheep-hero";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SheepDetails from "@/components/sheep-details";
import type { Sheep, SiteContent } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";

interface SheepPageProps {
  genderFilter?: 'male' | 'female';
  showAvailable?: boolean;
}

export const metadata: Metadata = {
  title: "Katahdin Sheep | Little Way Acres",
  description: "Learn about our Katahdin sheep, known for their hardy nature and excellent mothering abilities.",
};

export default function SheepPage({ genderFilter, showAvailable }: SheepPageProps) {
  const { data: sheep = [] } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep"],
  });

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const sheepDescription = siteContent.find(
    (content) => content.key === "sheep_description"
  )?.value;

  // Filter sheep based on props - exclude outside breeders and non-displayed
  // For available page: Show only available sheep
  // For gender pages: Show both available and non-available, but with available first
  const filteredSheep = sheep.filter(s => {
    // Always exclude outside breeders from public pages and non-displayed sheep
    if (s.outsideBreeder) return false;
    if (s.display === false) return false;
    if (genderFilter && s.gender !== genderFilter) return false;
    if (showAvailable && !s.available) return false;
    return true;
  }).sort((a, b) => {
    // First sort by available status (available first)
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    
    // If both are available, sort by sold status (unsold first)
    if (a.available && b.available) {
      if (!a.sold && b.sold) return -1;
      if (a.sold && !b.sold) return 1;
    }
    
    return 0;
  });

  // Filter sheep for different sections on main page - exclude outside breeders and non-displayed
  const availableSheep = sheep.filter(s => 
    s.available === true && 
    !s.outsideBreeder && 
    s.display !== false
  ).sort((a, b) => {
    // Sort by sold status to show unsold sheep first
    if (!a.sold && b.sold) return -1;
    if (a.sold && !b.sold) return 1;
    return 0;
  });
  
  // Filter females - exclude available sheep as they will be shown in the available section
  const ewes = sheep.filter(s => 
    s.gender === 'female' && 
    !s.outsideBreeder && 
    !s.available && // Explicitly exclude available sheep
    s.display !== false
  );
  
  // Filter males - exclude available sheep as they will be shown in the available section
  const rams = sheep.filter(s => 
    s.gender === 'male' && 
    !s.outsideBreeder && 
    !s.available && // Explicitly exclude available sheep
    s.display !== false
  );

  // Determine the page title and description
  let pageTitle = "Our Katahdin Sheep";
  let pageDescription = sheepDescription || 
    "Our Katahdin sheep are hardy, naturally shedding sheep known for their excellent mothering abilities and lean meat production.";

  if (genderFilter === 'male') {
    pageTitle = "Meet Our Rams";
    pageDescription = "Meet our Katahdin rams. These hardy boys are carefully selected for their excellent genetics and strong conformation.";
  } else if (genderFilter === 'female') {
    pageTitle = "Our Ewes";
    pageDescription = "Meet our Katahdin ewes. These lovely ladies are the foundation of our flock, known for their excellent mothering abilities.";
  } else if (showAvailable) {
    pageTitle = "Available Sheep";
    pageDescription = "Browse our currently available Katahdin sheep. Each animal is raised with care and attention.";
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Only show hero on main sheep page */}
      {!genderFilter && !showAvailable && <SheepHero />}

      <section className={`container mx-auto px-4 ${!genderFilter && !showAvailable ? 'py-12' : 'pt-24'}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">{pageTitle}</h1>
          <div className="prose prose-stone mx-auto">
            <p className="text-lg leading-relaxed text-stone-600 text-center">
              {pageDescription}
            </p>
          </div>
        </div>

        {/* Coming Soon Banner when no sheep exist */}
        {!genderFilter && !showAvailable && sheep.length === 0 && (
          <div className="mt-16 mb-16">
            <div className="bg-gradient-to-r from-stone-50 to-stone-100 border border-stone-200 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Coming Soon!</h2>
              <p className="text-lg text-stone-600 mb-6">
                We're currently developing our Katahdin sheep program. Our sheep will be available soon!
              </p>
              <div className="text-sm text-stone-500">
                Check back soon or contact us for updates on our sheep availability.
              </div>
            </div>
          </div>
        )}

        {/* Show categorized sections on main page */}
        {!genderFilter && !showAvailable && sheep.length > 0 && (
          <div className="mt-16 space-y-16">
            {/* Available Sheep Section */}
            {availableSheep.length > 0 && (
              <div>
                <div className="relative flex py-5 items-center mb-8">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Meet Our Available Sheep</h2>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {availableSheep.map(s => (
                    <SheepDetails key={s.id} sheep={s} showPrice={s.available} />
                  ))}
                </div>
              </div>
            )}

            {/* Rams Section */}
            {rams.length > 0 && (
              <div>
                <div className="relative flex py-5 items-center mb-8">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Our Rams</h2>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {rams.slice(0, 3).map(s => (
                    <SheepDetails key={s.id} sheep={s} />
                  ))}
                </div>
                {rams.length > 3 && (
                  <div className="text-center mt-8">
                    <Button asChild>
                      <Link href="/sheep/males">View All Rams</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Ewes Section */}
            {ewes.length > 0 && (
              <div>
                <div className="relative flex py-5 items-center mb-8">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Our Ewes</h2>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {ewes.slice(0, 3).map(s => (
                    <SheepDetails key={s.id} sheep={s} />
                  ))}
                </div>
                {ewes.length > 3 && (
                  <div className="text-center mt-8">
                    <Button asChild>
                      <Link href="/sheep/females">View All Ewes</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Show filtered sheep for specific pages */}
        {(genderFilter || showAvailable) && (
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8">
              {filteredSheep.map(s => (
                <SheepDetails key={s.id} sheep={s} showPrice={showAvailable || s.available} />
              ))}
            </div>
            {filteredSheep.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-stone-600">No sheep found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}