
import { useQuery } from "@tanstack/react-query";
import { Content, MarketSection } from "@db/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Market() {
  const { data: content } = useQuery<Content[]>({
    queryKey: ["/api/content"],
  });

  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });

  const getContentValue = (key: string) => {
    const item = content?.find((c) => c.key === key);
    return item?.value || "";
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div 
        className="h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url(${getContentValue("market_hero_image")})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {getContentValue("market_page_title")}
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
            {getContentValue("market_description")}
          </p>
        </div>
      </div>

      {/* Market Sections */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.id} className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="text-muted-foreground">{section.description}</p>
              <Button asChild>
                <Link href={`/market/${section.name}`}>View Products</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
