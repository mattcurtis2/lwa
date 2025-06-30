import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { MarketSection, Product } from "@db/schema";
import ProductCard from "@/components/cards/product-card";

export default function MarketSectionPage() {
  // Extract section name from URL
  const [, params] = useRoute("/market/:section");
  const currentSection = params?.section || "";

  // Convert URL path to section name
  const sectionNameMap: Record<string, string> = {
    'bakery': 'bakery',
    'garden': 'garden',
    'animal-products': 'animal_products',
    'apparel': 'apparel'
  };

  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Find the section using the mapped section name
  const section = sections.find(s => s.name === sectionNameMap[currentSection]);
  const sectionProducts = products.filter(p => p.section === section?.name);

  if (!section) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="relative rounded-lg overflow-hidden h-64">
            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt={section.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center p-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold text-white mb-4">{section.title}</h1>
                <p className="text-lg text-white/90">{section.description}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectionProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}