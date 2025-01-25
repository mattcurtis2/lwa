import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";

export default function Hero() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const heroBackground = siteContent?.find(content => content.key === "hero_background");
  const heroText = siteContent?.find(content => content.key === "hero_text");
  const heroSubtext = siteContent?.find(content => content.key === "hero_subtext");

  const scrollToAbout = () => {
    document.getElementById('about-farm')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-[600px] bg-cover bg-center" style={{
      backgroundImage: `url('${heroBackground?.value || "https://images.unsplash.com/photo-1611501807352-03324d70054c"}')`
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-25" />
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-6">
            {heroText?.value || "Welcome to Little Way Acres"}
          </h1>
          <p className="text-xl mb-8">
            {heroSubtext?.value || "Experience the charm of sustainable farming, meet our beloved animals, and enjoy fresh, locally grown produce at our farmers market."}
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              variant="default"
              onClick={scrollToAbout}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}