import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MarketSection, Product, MarketSchedule, SiteContent } from "@db/schema";
import ProductCard from "@/components/cards/product-card";
import { Calendar, Clock } from "lucide-react";

export default function Market() {
  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContentValue = (key: string) => {
    return siteContent.find(item => item.key === key)?.value || '';
  };
  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: schedules = [] } = useQuery<MarketSchedule[]>({
    queryKey: ["/api/market-schedules"],
  });

  const aboutSection = sections.find(s => s.name === 'about');
  const productSections = sections.filter(s => s.name !== 'about');

  return (
    <div className="min-h-screen bg-background">
      {/* About Section with Hero Image */}
      {aboutSection && (
        <div className="relative h-[500px]">
          {aboutSection.imageUrl && (
            <img
              src={getContentValue("market_hero_image") || aboutSection.imageUrl}
              alt={aboutSection.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl font-bold mb-4">{aboutSection.title}</h1>
                <p className="text-xl text-white/90">{getContentValue("market_description")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Schedule Section */}
      <div className="bg-stone-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6">Market Times & Locations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="bg-white rounded-lg shadow-md p-6 border border-stone-200"
              >
                <h3 className="text-lg font-semibold mb-2">{schedule.location}</h3>
                <p className="text-stone-600 mb-4">{schedule.address}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-stone-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{schedule.dayOfWeek}</span>
                  </div>
                  <div className="flex items-center text-stone-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{schedule.startTime} - {schedule.endTime}</span>
                  </div>
                </div>
                {schedule.description && (
                  <p className="mt-4 text-stone-600">{schedule.description}</p>
                )}
                {(schedule.seasonStart || schedule.seasonEnd) && (
                  <p className="mt-4 text-sm text-stone-500">
                    Season: {schedule.seasonStart?.toLocaleDateString()} - {schedule.seasonEnd?.toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Sections */}
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-16">
          {productSections.map(section => (
            <div key={section.name} className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </div>
                <Link href={`/market/${section.name.toLowerCase().replace('_', '-')}`}>
                  <a className="text-primary hover:text-primary/80 font-medium">
                    View All →
                  </a>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter(p => p.section === section.name)
                  .slice(0, 3)
                  .map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}