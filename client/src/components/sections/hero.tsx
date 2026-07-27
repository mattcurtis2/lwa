import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";

const DEFAULT_HERO_BACKGROUND =
  "https://firebasestorage.googleapis.com/v0/b/cmdr-test.firebasestorage.app/o/uploads%2F8d42e657-3e20-4d56-adf1-ac2657975f3a-PXL-20250530-004522953-2-jpg.jpg?alt=media&token=bf17d070-fb90-48f7-a7f0-db1e66546227";
const DEFAULT_HERO_TEXT = "Little Way Acres";
const DEFAULT_HERO_SUBTEXT = "Living out God's great plan in small ways, daily";

export default function Hero() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const heroBackground = siteContent?.find(content => content.key === "hero_background");
  const heroText = siteContent?.find(content => content.key === "hero_text");
  const heroSubtext = siteContent?.find(content => content.key === "hero_subtext");

  const backgroundUrl = heroBackground?.value || DEFAULT_HERO_BACKGROUND;

  const scrollToAbout = () => {
    document.getElementById('about-farm')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div 
      className="relative h-[600px] bg-cover bg-center" 
      style={{
        backgroundImage: `url('${backgroundUrl}')`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
      <div className="relative w-full max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">
            {heroText?.value || DEFAULT_HERO_TEXT}
          </h1>
          <p className="text-xl mb-8 drop-shadow-md">
            {heroSubtext?.value || DEFAULT_HERO_SUBTEXT}
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
