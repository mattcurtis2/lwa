import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "wouter";
import { MarketSection, Product, MarketSchedule, SiteContent } from "@db/schema";
import ProductCard from "@/components/cards/product-card";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { isBeforeThursdayNoonEastern, formatDeadline, getTimeUntilDeadline } from "@/lib/date-utils";

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

  // Enhanced SEO with local targeting for Muskegon Farmers Market and Hudsonville pickup
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    const pageTitle = 'Fresh Croissants & Bakery | Muskegon Market | Little Way';
    const pageDescription = 'Fresh croissants, artisan sourdough & raw honey at Muskegon Farmers Market Saturdays. Little Way Acres bakery in Hudsonville, Michigan.';
    const pageKeywords = 'fresh croissants Muskegon, artisan bakery Michigan, sourdough bread Muskegon farmers market, raw honey Hudsonville, farm pickup Michigan, Little Way Acres bakery, West Michigan croissants, Saturday farmers market';
    
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
    
    // Structured data for farmers market and bakery
    const existingScript = document.querySelector('script[data-page="market"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'market');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Little Way Acres Farmers Market & Bakery",
      "description": pageDescription,
      "url": `${window.location.origin}/market`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hudsonville",
        "addressRegion": "MI",
        "addressCountry": "US",
        "postalCode": "49426"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Farm Products & Bakery",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Fresh Croissants",
              "category": "Bakery",
              "description": "European-style artisan croissants baked fresh"
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
                "name": "Little Way Acres Farm Pickup",
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
              "name": "Artisan Sourdough Bread",
              "category": "Bakery",
              "description": "Traditional sourdough bread with natural fermentation"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Raw Honey",
              "category": "Farm Products",
              "description": "Pure, unprocessed honey from our farm"
            }
          }
        ]
      },
      "openingHours": "Sa 09:00-14:00",
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
          "name": "Little Way Acres Farm Pickup", 
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Hudsonville",
            "addressRegion": "MI",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "42.8736",
            "longitude": "-85.8681"
          }
        }
      ],
      "priceRange": "$$",
      "paymentAccepted": ["Cash", "Venmo"],
      "currenciesAccepted": "USD"
    });
    
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
      const scriptToRemove = document.querySelector('script[data-page="market"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);
  
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

      {/* Pre-order Deadline Banner */}
      <div className="bg-primary/5 border-y border-primary/20 py-6">
        <div className="container mx-auto px-4">
          {isBeforeThursdayNoonEastern() ? (
            <div className="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
              <div className="flex items-center text-green-700">
                <Clock className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-semibold">Pre-order deadline: {formatDeadline()}</p>
                  <p className="text-sm text-green-600 mt-1">
                    Complete your order before the deadline for this week's Saturday pickup. Time remaining: {getTimeUntilDeadline()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-red-200 p-4 shadow-sm">
              <div className="flex items-center text-red-700">
                <AlertTriangle className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-semibold">Pre-order deadline has passed</p>
                  <p className="text-sm text-red-600 mt-1">
                    Order deadline passed for this week's Saturday pickup. New orders open next week.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* Navigation Links for Internal SEO */}
      <div className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <nav className="flex flex-wrap gap-4 justify-center">
            <Link href="/dogs" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Colorado Mountain Dogs
            </Link>
            <Link href="/goats" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Nigerian Dwarf Goats
            </Link>
            <Link href="/sheep" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Katahdin Sheep
            </Link>
            <Link href="/about" className="text-primary hover:text-primary/80 font-medium transition-colors">
              About Our Farm
            </Link>
          </nav>
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
                <Link href={`/market/${section.name === 'animal_products' ? 'animal-products' : section.name}`}>
                  <a className="text-primary hover:text-primary/80 font-medium">
                    View All →
                  </a>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
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