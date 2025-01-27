import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { MarketSection, Product } from "@db/schema";
import ProductCard from "@/components/cards/product-card";

export default function Market() {
  const [location] = useLocation();
  const section = new URLSearchParams(location.split('?')[1]).get('section') || 'about';

  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const currentSection = sections.find(s => s.name === section);
  const sectionProducts = products.filter(p => p.section === section);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {currentSection && (
          <div className="space-y-8">
            <div className="relative rounded-lg overflow-hidden h-64">
              {currentSection.imageUrl && (
                <img
                  src={currentSection.imageUrl}
                  alt={currentSection.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center p-8">
                <div className="max-w-2xl">
                  <h1 className="text-4xl font-bold text-white mb-4">{currentSection.title}</h1>
                  <p className="text-lg text-white/90">{currentSection.description}</p>
                </div>
              </div>
            </div>

            {section !== 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectionProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}