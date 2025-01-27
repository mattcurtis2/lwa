import { useQuery } from "@tanstack/react-query";
import type { Metadata } from "@/lib/types";
import { GoatHero } from "@/components/sections/goat-hero";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { GoatCard } from "@/components/cards/goat-card";
import type { Goat } from "@db/schema";

export const metadata: Metadata = {
  title: "Nigerian Dwarf Goats | Little Way Acres",
  description: "Learn about our Nigerian Dwarf goats, known for their friendly personalities and excellent milk production.",
};

export default function GoatsPage() {
  const { data: goats = [] } = useQuery<Goat[]>({
    queryKey: ["/api/goats"],
  });

  const { data: siteContent = [] } = useQuery({
    queryKey: ["/api/site-content"],
  });

  const goatDescription = siteContent.find(
    (content) => content.key === "goat_description"
  )?.value;

  return (
    <div className="min-h-screen bg-background">
      <GoatHero />

      <section className="container mx-auto px-4 py-12">
        <div className="prose prose-stone mx-auto">
          <p className="text-lg leading-relaxed text-stone-600">
            {goatDescription || 
              "Our Nigerian Dwarf Goats are beloved members of our farm family. These charming, miniature dairy goats are known for their friendly personalities and rich milk production. Perfect for small homesteads, they're easy to handle and maintain. Our goats are registered, health-tested, and raised with love to ensure they make wonderful additions to your family or farming operation."}
          </p>
        </div>

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

        <div className="mt-16">
          <h2 className="text-3xl font-semibold text-center mb-8">
            Featured Goats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goats.slice(0, 3).map((goat) => (
              <GoatCard key={goat.id} goat={goat} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}