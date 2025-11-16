import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Metadata } from "@/lib/types";
import { GoatHero } from "@/components/sections/goat-hero";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import GoatDetails from "@/components/goat-details";
import type { Goat, SiteContent } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";

interface GoatsPageProps {
  genderFilter?: 'male' | 'female';
  showAvailable?: boolean;
}

export const metadata: Metadata = {
  title: "Nigerian Dwarf Goats | Little Way Acres",
  description: "Learn about our Nigerian Dwarf goats, known for their friendly personalities and excellent milk production.",
};

export default function GoatsPage({ genderFilter, showAvailable }: GoatsPageProps) {
  const { data: goats = [] } = useQuery<Goat[]>({
    queryKey: ["/api/goats"],
  });

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const goatDescription = siteContent.find(
    (content) => content.key === "goat_description"
  )?.value;

  // Filter goats based on props - exclude outside breeders and non-displayed
  // For available page: Show only available goats
  // For gender pages: Show both available and non-available, but with available first
  const filteredGoats = goats.filter(goat => {
    // Always exclude outside breeders from public pages and non-displayed goats
    if (goat.outsideBreeder) return false;
    if (goat.display === false) return false;
    if (genderFilter && goat.gender !== genderFilter) return false;
    if (showAvailable && !goat.available) return false;
    return true;
  }).sort((a, b) => {
    // First sort by available status (available first)
    if (a.available && !b.available) return -1;
    if (!a.available && b.available) return 1;
    
    // If both are available, sort by sold status (unsold first)
    if (a.available && b.available) {
      if (!a.sold && b.sold) return -1;
      if (a.sold && !b.sold) return 1;
    }
    
    return 0;
  });

  // Filter goats for different sections on main page - exclude outside breeders and non-displayed
  const availableGoats = goats.filter(goat => 
    goat.available === true && 
    !goat.outsideBreeder && 
    goat.display !== false
  ).sort((a, b) => {
    // Sort by sold status to show unsold goats first
    if (!a.sold && b.sold) return -1;
    if (a.sold && !b.sold) return 1;
    return 0;
  });
  
  // Filter females - exclude available goats as they will be shown in the available section
  const females = goats.filter(goat => 
    goat.gender === 'female' && 
    !goat.outsideBreeder && 
    !goat.available && // Explicitly exclude available goats
    goat.display !== false
  );
  
  // Filter males - exclude available goats as they will be shown in the available section
  const males = goats.filter(goat => 
    goat.gender === 'male' && 
    !goat.outsideBreeder && 
    !goat.available && // Explicitly exclude available goats
    goat.display !== false
  );

  // Determine the page title and description
  let pageTitle = "Our Nigerian Dwarf Goats";
  let pageDescription = goatDescription || 
    "Our Nigerian Dwarf Goats are beloved members of our farm family. These charming, miniature dairy goats are known for their friendly personalities and rich milk production.";

  if (genderFilter === 'male') {
    pageTitle = "Meet Our Bucks";
    pageDescription = "Meet our Nigerian Dwarf bucks. These handsome boys are carefully selected for their excellent genetics and conformation.";
  } else if (genderFilter === 'female') {
    pageTitle = "Our Does";
    pageDescription = "Meet our Nigerian Dwarf does. These lovely ladies are the foundation of our breeding program, known for their excellent milk production.";
  } else if (showAvailable) {
    pageTitle = "Available Goats";
    pageDescription = "Browse our currently available Nigerian Dwarf goats. Each goat is raised with care and attention.";
  }

  // Enhanced SEO with hyper-local targeting for 50-mile radius from Hudsonville
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    let pageTitle = '';
    let pageDescription = '';
    let pageKeywords = '';
    let structuredData: any = {};
    
    if (genderFilter === 'female') {
      pageTitle = 'Nigerian Dwarf Goat Does for Sale | Female Goats | Hudsonville, Grand Rapids, MI';
      pageDescription = 'Nigerian Dwarf goat does (female goats) for sale at Little Way Acres in Hudsonville, Michigan. High-quality milk goats perfect for small farms in Grand Rapids, Holland, Zeeland, Byron Center, and surrounding West Michigan communities within 50 miles. Excellent mothers with sweet temperaments.';
      pageKeywords = 'Nigerian Dwarf goat does for sale, female goats Hudsonville Michigan, milk goats Grand Rapids, West Michigan dairy goats, Holland Zeeland goats, Byron Center livestock, Ottawa County goats';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Nigerian Dwarf Goat Does for Sale",
        "description": pageDescription,
        "url": `${window.location.origin}/goats/females`,
        "areaServed": [
          {"@type": "City", "name": "Hudsonville", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Grand Rapids", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Holland", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Zeeland", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Byron Center", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Georgetown", "containedInPlace": {"@type": "State", "name": "Michigan"}}
        ]
      };
    } else if (genderFilter === 'male') {
      pageTitle = 'Nigerian Dwarf Goat Bucks for Sale | Male Goats | Hudsonville, Grand Rapids, MI';
      pageDescription = 'Nigerian Dwarf goat bucks (male goats) for sale at Little Way Acres in Hudsonville, Michigan. Quality breeding bucks for dairy herds in Grand Rapids, Holland, Zeeland, Byron Center, and West Michigan area within 50 miles. Proven genetics and gentle temperaments.';
      pageKeywords = 'Nigerian Dwarf goat bucks for sale, male goats Hudsonville Michigan, breeding bucks Grand Rapids, West Michigan dairy goats, Holland Zeeland livestock, Ottawa County goat breeders';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Nigerian Dwarf Goat Bucks for Sale",
        "description": pageDescription,
        "url": `${window.location.origin}/goats/males`
      };
    } else if (showAvailable) {
      pageTitle = 'Nigerian Dwarf Goats for Sale | Available Kids & Adults | Hudsonville, MI';
      pageDescription = 'Nigerian Dwarf goats for sale now at Little Way Acres in Hudsonville, Michigan. Available kids and adult goats ready for pickup. Serving Grand Rapids, Holland, Zeeland, Byron Center, Wyoming, Kentwood, and all West Michigan communities within 50 miles.';
      pageKeywords = 'Nigerian Dwarf goats for sale, goat kids available Hudsonville, Grand Rapids goats, West Michigan livestock, Holland Zeeland goats for sale, Ottawa County dairy goats';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Available Nigerian Dwarf Goats for Sale",
        "description": pageDescription,
        "url": `${window.location.origin}/goats/available`,
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "areaServed": {
          "@type": "Place",
          "name": "West Michigan - 50 Mile Radius",
          "geo": {
            "@type": "GeoCircle",
            "geoMidpoint": {
              "@type": "GeoCoordinates",
              "latitude": "42.8736",
              "longitude": "-85.8681"
            },
            "geoRadius": "50"
          }
        }
      };
    } else {
      pageTitle = 'Nigerian Dwarf Goats | Dairy Goats | Hudsonville, Grand Rapids, Holland, MI';
      pageDescription = 'Nigerian Dwarf goats at Little Way Acres in Hudsonville, Michigan. Premium dairy goats perfect for small farms and homesteads in Grand Rapids, Holland, Zeeland, Byron Center, Georgetown, Wyoming, and surrounding West Michigan area. Excellent milk producers with friendly personalities - ideal for families within 50 miles.';
      pageKeywords = 'Nigerian Dwarf goats, dairy goats Hudsonville Michigan, milk goats Grand Rapids, small farm goats West Michigan, Holland Zeeland dairy goats, homestead livestock Ottawa County';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Little Way Acres - Nigerian Dwarf Goats",
        "description": pageDescription,
        "url": `${window.location.origin}/goats`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Hudsonville",
          "addressRegion": "MI",
          "addressCountry": "US",
          "postalCode": "49426"
        },
        "areaServed": [
          {"@type": "City", "name": "Hudsonville", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Grand Rapids", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Holland", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Zeeland", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Byron Center", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Georgetown", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Wyoming", "containedInPlace": {"@type": "State", "name": "Michigan"}},
          {"@type": "City", "name": "Kentwood", "containedInPlace": {"@type": "State", "name": "Michigan"}}
        ],
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "42.8736",
          "longitude": "-85.8681"
        },
        "priceRange": "$$",
        "paymentAccepted": ["Cash", "Venmo"],
        "currenciesAccepted": "USD",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Nigerian Dwarf Goat Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Nigerian Dwarf Goat Does",
                "category": "Livestock",
                "description": "High-quality dairy goat does for milk production and breeding"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Nigerian Dwarf Goat Bucks", 
                "category": "Livestock",
                "description": "Quality breeding bucks for dairy herd improvement"
              }
            }
          ]
        }
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
    const existingScript = document.querySelector('script[data-page="goats"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'goats');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
      const scriptToRemove = document.querySelector('script[data-page="goats"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [genderFilter, showAvailable, goats]);
  
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
      {/* Only show hero on main goats page */}
      {!genderFilter && !showAvailable && <GoatHero />}

      {/* Our Nigerian Dwarf Goats Program Section - Only show on main goats page */}
      {!genderFilter && !showAvailable && (
        <section className="py-16" style={{ backgroundColor: '#FDF7EB' }}>
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3F6A52] mb-6">
                {siteContent.find(c => c.key === "goats_program_title")?.value || "Our Nigerian Dwarf Goats Program"}
              </h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side - Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{siteContent.find(c => c.key === "goats_program_card1_icon")?.value || "🥛"}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">
                          {siteContent.find(c => c.key === "goats_program_card1_title")?.value || "Premium Milk Production"}
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {siteContent.find(c => c.key === "goats_program_card1_description")?.value || 
                            "Nigerian Dwarf goats produce rich, creamy milk perfect for drinking, cheese making, and soap production with high butterfat content."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{siteContent.find(c => c.key === "goats_program_card2_icon")?.value || "💚"}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">
                          {siteContent.find(c => c.key === "goats_program_card2_title")?.value || "Gentle Companions"}
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {siteContent.find(c => c.key === "goats_program_card2_description")?.value || 
                            "Known for their friendly, docile temperaments, Nigerian Dwarf goats make excellent family pets and therapy animals."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{siteContent.find(c => c.key === "goats_program_card3_icon")?.value || "🏠"}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">
                          {siteContent.find(c => c.key === "goats_program_card3_title")?.value || "Small Space Friendly"}
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {siteContent.find(c => c.key === "goats_program_card3_description")?.value || 
                            "Their compact size makes them perfect for small farms and homesteads, requiring less space while still providing excellent milk production."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image */}
                <div className="relative">
                  <img
                    src={siteContent.find(c => c.key === "goats_program_image")?.value || "https://images.unsplash.com/photo-1516467508483-a7212febe31a"}
                    alt="Nigerian Dwarf goats grazing"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Breeding Goals Section - Only show on main goats page */}
      {!genderFilter && !showAvailable && (
        <section className="py-16 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3F6A52] mb-4">
                {siteContent.find(c => c.key === "goats_goals_title")?.value || "Our Breeding Goals"}
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                {siteContent.find(c => c.key === "goats_goals_description")?.value || 
                  "We're developing a sustainable goat breeding program that prioritizes health, milk production, and gentle temperaments."}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Goal 1 */}
              <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={siteContent.find(c => c.key === "goats_goal1_image")?.value || "https://images.unsplash.com/photo-1559827260-dc66d52bef19"}
                    alt="High-quality dairy goats"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                    {siteContent.find(c => c.key === "goats_goal1_title")?.value || "Superior Milk Quality"}
                  </h3>
                  <p className="text-stone-700 leading-relaxed mb-4">
                    {siteContent.find(c => c.key === "goats_goal1_description")?.value || 
                      "Breeding for goats that produce high-butterfat milk with excellent taste and nutritional value, perfect for artisan cheese and soap making."}
                  </p>
                  <div className="flex items-center text-[#3F6A52] font-medium">
                    <span className="text-sm">
                      {siteContent.find(c => c.key === "goats_goal1_subtitle")?.value || "Quality Genetics"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Goal 2 */}
              <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={siteContent.find(c => c.key === "goats_goal2_image")?.value || "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e"}
                    alt="Healthy goat family"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                    {siteContent.find(c => c.key === "goats_goal2_title")?.value || "Health & Longevity"}
                  </h3>
                  <p className="text-stone-700 leading-relaxed mb-4">
                    {siteContent.find(c => c.key === "goats_goal2_description")?.value || 
                      "Selecting for robust health, disease resistance, and longevity to ensure our goats live happy, productive lives for many years."}
                  </p>
                  <div className="flex items-center text-[#3F6A52] font-medium">
                    <span className="text-sm">
                      {siteContent.find(c => c.key === "goats_goal2_subtitle")?.value || "Vitality & Wellness"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Goal 3 */}
              <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={siteContent.find(c => c.key === "goats_goal3_image")?.value || "https://images.unsplash.com/photo-1605514779778-b7fe5fe2341b"}
                    alt="Friendly goats with people"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                    {siteContent.find(c => c.key === "goats_goal3_title")?.value || "Gentle Temperaments"}
                  </h3>
                  <p className="text-stone-700 leading-relaxed mb-4">
                    {siteContent.find(c => c.key === "goats_goal3_description")?.value || 
                      "Breeding for calm, friendly personalities that make our goats wonderful family companions and easy to handle for milking and care."}
                  </p>
                  <div className="flex items-center text-[#3F6A52] font-medium">
                    <span className="text-sm">
                      {siteContent.find(c => c.key === "goats_goal3_subtitle")?.value || "Family Friendly"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Only show main page title section on filtered pages, not main goats page */}
      {(genderFilter || showAvailable) && (
        <section className="container mx-auto px-4 pt-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">{pageTitle}</h1>
            <div className="prose prose-stone mx-auto">
              <p className="text-lg leading-relaxed text-stone-600 text-center">
                {pageDescription}
              </p>
            </div>
          </div>

          {/* Show filtered content for specific pages */}
          <div className="mt-12">
            {filteredGoats.length > 0 ? (
              <div className="space-y-16">
                {/* All Females Section */}
                {filteredGoats.filter(goat => goat.gender === 'female').length > 0 && (
                  <div>
                    <div className="relative flex py-5 items-center mb-8">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Meet Our Does</h2>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                      {filteredGoats
                        .filter(goat => goat.gender === 'female')
                        .map(goat => (
                          <GoatDetails key={goat.id} goat={goat} showPrice={goat.available} />
                        ))}
                    </div>
                  </div>
                )}

                {/* Available Males Section */}
                {filteredGoats.filter(goat => goat.gender === 'male').length > 0 && (
                  <div>
                    <div className="relative flex py-5 items-center mb-8">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Our Bucks</h2>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-8">
                      {filteredGoats
                        .filter(goat => goat.gender === 'male')
                        .map(goat => (
                          <GoatDetails key={goat.id} goat={goat} showPrice={goat.available} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-stone-600">
                  No goats currently available in this category.
                  Check back later or contact us for more information.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Explore Our Goats Navigation Section - Only show on main goats page */}
      {!genderFilter && !showAvailable && (
        <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-stone-800 mb-4">
                  {siteContent.find(c => c.key === "goats_explore_title")?.value || "Explore Our Goats"}
                </h2>
                <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                  {siteContent.find(c => c.key === "goats_explore_description")?.value || "Discover our Nigerian Dwarf goat breeding program and meet our herd"}
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/goats/males" className="group">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Our Bucks</h3>
                    <p className="text-stone-600 mb-6">
                      Meet our breeding bucks and learn about their genetics and characteristics
                    </p>
                    <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                      View Bucks
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
                
                <Link href="/goats/females" className="group">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-200 transition-colors">
                      <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Our Does</h3>
                    <p className="text-stone-600 mb-6">
                      Discover our breeding does and their contributions to our program
                    </p>
                    <div className="inline-flex items-center text-pink-600 font-semibold group-hover:text-pink-700">
                      View Does
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
                
                <Link href="/goats/available" className="group">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Available Goats</h3>
                    <p className="text-stone-600 mb-6">
                      See our currently available goats ready for their new homes
                    </p>
                    <div className="inline-flex items-center text-green-600 font-semibold group-hover:text-green-700">
                      View Available
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}