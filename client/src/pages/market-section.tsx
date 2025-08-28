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

  // Enhanced SEO with local targeting for Muskegon and Hudsonville market locations
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    let pageTitle = '';
    let pageDescription = '';
    let pageKeywords = '';
    let structuredData: any = {};
    
    if (currentSection === 'bakery') {
      pageTitle = 'Fresh Croissants & Artisan Bakery | Muskegon Farmers Market & Hudsonville Pickup | Michigan Sourdough';
      pageDescription = 'Award-winning fresh croissants, artisan sourdough bread, and European-style pastries available at Muskegon Farmers Market every Saturday and pickup at Little Way Acres in Hudsonville, Michigan. Authentic French bakery techniques with Michigan ingredients - pre-order for guaranteed availability.';
      pageKeywords = 'fresh croissants Muskegon Michigan, artisan sourdough Muskegon farmers market, European pastries Michigan, bakery Hudsonville pickup, Saturday farmers market croissants, West Michigan bakery, French croissants Michigan';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Bakery",
        "name": "Little Way Acres Bakery",
        "description": pageDescription,
        "url": `${window.location.origin}/market/bakery`,
        "servesCuisine": "French Pastries",
        "menu": {
          "@type": "Menu",
          "hasMenuSection": [
            {
              "@type": "MenuSection",
              "name": "Fresh Croissants",
              "description": "European-style artisan croissants"
            },
            {
              "@type": "MenuSection", 
              "name": "Sourdough Breads",
              "description": "Traditional sourdough with natural fermentation"
            }
          ]
        },
        "location": [
          {
            "@type": "Place",
            "name": "Muskegon Farmers Market",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Muskegon",
              "addressRegion": "MI"
            }
          },
          {
            "@type": "Place",
            "name": "Little Way Acres Farm Pickup",
            "address": {
              "@type": "PostalAddress", 
              "addressLocality": "Hudsonville",
              "addressRegion": "MI"
            }
          }
        ],
        "openingHours": "Sa 09:00-14:00",
        "priceRange": "$$"
      };
    } else if (currentSection === 'animal-products') {
      pageTitle = 'Raw Honey & Farm Fresh Products | Muskegon Market & Hudsonville Pickup | Michigan Honey';
      pageDescription = 'Pure raw honey, farm-fresh eggs, and natural animal products from Little Way Acres. Available at Muskegon Farmers Market every Saturday and farm pickup in Hudsonville, Michigan. Unprocessed honey and farm products from our West Michigan homestead.';
      pageKeywords = 'raw honey Muskegon Michigan, farm fresh eggs Hudsonville, Michigan honey farmers market, natural farm products, West Michigan honey, Saturday farmers market, Little Way Acres honey';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Little Way Acres Farm Products",
        "description": pageDescription,
        "url": `${window.location.origin}/market/animal-products`,
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Farm Products",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Raw Honey",
                "category": "Natural Sweeteners"
              }
            }
          ]
        }
      };
    } else if (currentSection === 'apparel') {
      pageTitle = 'St. Thérèse Apparel & Colorado Mountain Dog Clothing | Little Way Inspired | Michigan';
      pageDescription = 'St. Thérèse inspired apparel and Colorado Mountain Dog themed clothing available at Muskegon Farmers Market and Little Way Acres. Faith-based and dog lover apparel from our Michigan farm.';
      pageKeywords = 'St Therese apparel Michigan, Colorado Mountain Dog clothing, faith based apparel, Muskegon farmers market clothing, Michigan farm apparel';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        "name": "Little Way Inspired Apparel"
      };
    } else {
      pageTitle = `${section?.title || 'Farm Products'} | Muskegon Farmers Market & Hudsonville | Little Way Acres`;
      pageDescription = `${section?.description || 'Quality farm products'} available at Muskegon Farmers Market every Saturday and pickup at Little Way Acres in Hudsonville, Michigan. Fresh, local products from our West Michigan farm.`;
      pageKeywords = `${section?.title} Michigan, Muskegon farmers market, Hudsonville farm pickup, West Michigan farm products`;
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Store",
        "name": "Little Way Acres"
      };
    }
    
    document.title = pageTitle;
    updateMetaDescription(pageDescription);
    updateMetaKeywords(pageKeywords);
    
    // Open Graph and Twitter meta tags
    updateOrCreateMetaTag('og:title', pageTitle);
    updateOrCreateMetaTag('og:description', pageDescription);
    updateOrCreateMetaTag('og:type', 'website');
    updateOrCreateMetaTag('og:url', window.location.href);
    updateOrCreateMetaTag('og:image', '/logo.png');
    
    updateOrCreateTwitterTag('twitter:card', 'summary_large_image');
    updateOrCreateTwitterTag('twitter:title', pageTitle);
    updateOrCreateTwitterTag('twitter:description', pageDescription);
    updateOrCreateTwitterTag('twitter:image', '/logo.png');
    
    // Add structured data
    const existingScript = document.querySelector('script[data-page="market-section"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'market-section');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
      const scriptToRemove = document.querySelector('script[data-page="market-section"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [currentSection, section, sections]);
  
  const updateMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  };

  const updateMetaKeywords = (keywords: string) => {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
  };

  const updateOrCreateMetaTag = (property: string, content: string) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
  };

  const updateOrCreateTwitterTag = (name: string, content: string) => {
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
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