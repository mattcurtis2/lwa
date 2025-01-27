import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MarketSection, Product } from "@db/schema";
import ProductCard from "@/components/cards/product-card";

export default function Market() {
  const { data: sections = [] } = useQuery<MarketSection[]>({
    queryKey: ["/api/market-sections"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const aboutSection = sections.find(s => s.name === 'about');
  const productSections = sections.filter(s => s.name !== 'about');

  return (
    <div className="min-h-screen bg-background">
      {/* About Section with Hero Image */}
      {aboutSection && (
        <div className="relative h-[500px] mb-16">
          {aboutSection.imageUrl && (
            <img
              src={aboutSection.imageUrl}
              alt={aboutSection.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl font-bold mb-4">{aboutSection.title}</h1>
                <p className="text-xl text-white/90">{aboutSection.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Sections */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          {productSections.map(section => (
            <div key={section.name} className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </div>
                <Link href={`/market/${section.name.toLowerCase()}`}>
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