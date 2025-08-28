import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRoute } from "wouter";
import { MarketSection, Product } from "@db/schema";
import ProductCard from "@/components/cards/product-card";
import PrintifyProductCard from "@/components/cards/printify-product-card";

export default function MarketSectionPage() {
  // Extract section name from URL
  const [, params] = useRoute("/market/:section");
  const currentSection = params?.section || "";

  // Convert URL path to section name
  const sectionNameMap: Record<string, string> = {
    'bakery': 'bakery',
    'animal-products': 'animal_products',
    'apparel': 'apparel'
  };

  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch Printify products specifically for apparel section
  const { data: printifyProducts = [] } = useQuery({
    queryKey: ["/api/printify/products"],
    enabled: currentSection === 'apparel',
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Find the section using the mapped section name
  const section = sections.find(s => s.name === sectionNameMap[currentSection]);
  const sectionProducts = products.filter(p => p.section === section?.name);

  // SEO optimization - section-specific titles and descriptions for bakery and honey products
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    if (currentSection === 'bakery') {
      document.title = 'Artisan Sourdough Bakery | Fresh Bread | Muskegon Farmers Market | Ottawa County';
      updateMetaDescription('Artisan sourdough bread, fresh baked goods, and specialty breads available at Muskegon Farmers Market and Little Way Acres farmstand. Michigan bakery in Ottawa County.');
    } else if (currentSection === 'animal-products') {
      document.title = 'Raw Honey & Farm Fresh Products | Michigan Honey | Little Way Acres Farmstand';
      updateMetaDescription('Raw honey, farm-fresh eggs, and natural animal products available at Little Way Acres farmstand and Muskegon Farmers Market. Local Michigan farm products in Ottawa County.');
    } else if (currentSection === 'apparel') {
      document.title = 'Farm Apparel & Merchandise | Little Way Acres | Michigan Farm Store';
      updateMetaDescription('Farm-themed apparel and merchandise from Little Way Acres. Support local Michigan agriculture with quality farm clothing and accessories.');
    } else {
      document.title = `${section?.title || 'Farm Products'} | Little Way Acres | Muskegon Farmers Market`;
      updateMetaDescription(`${section?.description || 'Quality farm products'} available at Little Way Acres farmstand and Muskegon Farmers Market in Ottawa County, Michigan.`);
    }
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
    };
  }, [currentSection, section]);
  
  const updateMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  };

  if (!section) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="relative rounded-lg overflow-hidden h-64 bg-gradient-to-br from-primary via-primary/80 to-primary/60">
            <div className="absolute inset-0 flex items-center justify-center text-center p-8 bg-black/20">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
                  {section.title}
                </h1>
                <p className="text-lg text-white/95 drop-shadow-md">
                  {section.description}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {currentSection === 'apparel' ? (
              // Show Printify products for apparel section
              printifyProducts.map((product: any) => (
                <PrintifyProductCard key={product.id} product={product} />
              ))
            ) : (
              // Show regular products for other sections
              sectionProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}