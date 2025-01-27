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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Farmers Market</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Discover our fresh, locally sourced products from our farm to your table.
        </p>

        <div className="space-y-16">
          {sections.map(section => (
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

              {section.name !== 'about' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(p => p.section === section.name)
                    .slice(0, 3)
                    .map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}