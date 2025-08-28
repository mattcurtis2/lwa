import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRoute, Link } from "wouter";
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
      pageTitle = 'Fresh Croissants & Bakery | Muskegon Market | Michigan';
      pageDescription = 'Fresh croissants, sourdough bread & pastries at Muskegon Farmers Market Saturdays. Little Way Acres bakery in Hudsonville, Michigan.';
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
      pageTitle = 'Raw Honey & Farm Products | Muskegon Market | Michigan';
      pageDescription = 'Raw honey, farm eggs & natural products at Muskegon Farmers Market Saturdays. Little Way Acres farm in Hudsonville, Michigan.';
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
      pageTitle = 'St. Thérèse Apparel & CMDR Dog Clothing | Michigan';
      pageDescription = 'St. Thérèse Catholic apparel & Colorado Mountain Dog clothing at Muskegon Farmers Market. Faith-based shirts & CMDR breed merchandise.';
      pageKeywords = 'St Therese Little Way apparel, Colorado Mountain Dog CMDR clothing, Catholic faith apparel Michigan, rare dog breed merchandise, St Therese of Lisieux clothing, CMDR breed apparel, faith based shirts Michigan, Colorado Mountain Dog gifts, Catholic spirituality apparel, dog breed clothing Michigan, Muskegon farmers market apparel, Hudsonville faith clothing';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "ClothingStore",
        "name": "Little Way Inspired Apparel & CMDR Clothing",
        "description": pageDescription,
        "url": `${window.location.origin}/market/apparel`,
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Faith & Dog Breed Apparel",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "St. Thérèse Little Way Apparel",
                "category": "Faith-Based Clothing",
                "description": "Catholic apparel inspired by St. Thérèse of Lisieux and her Little Way spirituality",
                "brand": {
                  "@type": "Brand",
                  "name": "Little Way Acres"
                }
              },
              "availableAtOrFrom": [
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
                  "name": "Little Way Acres Farm",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Hudsonville", 
                    "addressRegion": "MI"
                  }
                }
              ]
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Colorado Mountain Dog Breed Clothing",
                "category": "Dog Breed Apparel",
                "description": "Authentic Colorado Mountain Dog (CMDR) breed merchandise and clothing for dog lovers",
                "brand": {
                  "@type": "Brand",
                  "name": "Little Way Acres"
                }
              }
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
              "addressRegion": "MI",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "43.2342",
              "longitude": "-86.2484"
            }
          },
          {
            "@type": "Place",
            "name": "Little Way Acres Farm",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Hudsonville",
              "addressRegion": "MI", 
              "addressCountry": "US",
              "postalCode": "49426"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "42.8736",
              "longitude": "-85.8681"
            }
          }
        ],
        "audience": {
          "@type": "Audience",
          "audienceType": ["Catholic faithful", "Dog lovers", "Colorado Mountain Dog owners", "Faith-based apparel customers"]
        },
        "servedBy": {
          "@type": "Organization",
          "name": "Little Way Acres",
          "description": "Colorado Mountain Dog breeders and Catholic farm family"
        },
        "priceRange": "$$",
        "paymentAccepted": ["Cash", "Venmo", "Online Payment"],
        "currenciesAccepted": "USD"
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

          {/* Navigation Links for Internal SEO */}
          <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Explore Our Farm</h2>
            <nav className="flex flex-wrap gap-4">
              <Link href="/dogs" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Colorado Mountain Dogs
              </Link>
              <Link href="/goats" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Nigerian Dwarf Goats
              </Link>
              <Link href="/sheep" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Katahdin Sheep
              </Link>
              <Link href="/market" className="text-primary hover:text-primary/80 font-medium transition-colors">
                All Market Products
              </Link>
              <Link href="/about" className="text-primary hover:text-primary/80 font-medium transition-colors">
                About Our Farm
              </Link>
            </nav>
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