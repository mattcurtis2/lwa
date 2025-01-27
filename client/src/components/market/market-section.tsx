import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { MarketSection, Product } from "@db/schema";
import ProductCard from "@/components/cards/product-card";

export default function MarketSections() {
  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const getProductsBySection = (sectionName: string) => {
    return products.filter(product => product.section === sectionName);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="w-full justify-start mb-8">
          {sections.map(section => (
            <TabsTrigger key={section.id} value={section.name} className="text-lg">
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {sections.map(section => (
          <TabsContent key={section.id} value={section.name}>
            <div className="grid gap-8">
              <div className="relative rounded-lg overflow-hidden h-64 mb-8">
                {section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center p-8">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl font-bold text-white mb-4">{section.title}</h2>
                    <p className="text-lg text-white/90">{section.description}</p>
                  </div>
                </div>
              </div>

              {section.name !== 'about' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getProductsBySection(section.name).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
