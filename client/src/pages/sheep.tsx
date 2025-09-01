import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { Metadata } from "@/lib/types";
import { SheepHero } from "@/components/sections/sheep-hero";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import SheepDetails from "@/components/sheep-details";
import type { Sheep, SiteContent } from "@db/schema";
import { formatDisplayDate } from "@/lib/date-utils";

interface SheepPageProps {
  genderFilter?: 'male' | 'female';
  showAvailable?: boolean;
}

export const metadata: Metadata = {
  title: "Katahdin Sheep | Little Way Acres",
  description: "Learn about our Katahdin sheep, known for their hardy nature and excellent mothering abilities.",
};

export default function SheepPage({ genderFilter, showAvailable }: SheepPageProps) {
  const { data: sheep = [] } = useQuery<Sheep[]>({
    queryKey: ["/api/sheep"],
  });

  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const sheepDescription = siteContent.find(
    (content) => content.key === "sheep_description"
  )?.value;

  // Filter sheep based on props - exclude outside breeders and non-displayed
  // For available page: Show only available sheep
  // For gender pages: Show both available and non-available, but with available first
  const filteredSheep = sheep.filter(s => {
    // Always exclude outside breeders from public pages and non-displayed sheep
    if (s.outsideBreeder) return false;
    if (s.display === false) return false;
    if (genderFilter && s.gender !== genderFilter) return false;
    if (showAvailable && !s.available) return false;
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

  // Filter sheep for different sections on main page - exclude outside breeders and non-displayed
  const availableSheep = sheep.filter(s => 
    s.available === true && 
    !s.outsideBreeder && 
    s.display !== false
  ).sort((a, b) => {
    // Sort by sold status to show unsold sheep first
    if (!a.sold && b.sold) return -1;
    if (a.sold && !b.sold) return 1;
    return 0;
  });
  
  // Filter females - exclude available sheep as they will be shown in the available section
  const ewes = sheep.filter(s => 
    s.gender === 'female' && 
    !s.outsideBreeder && 
    !s.available && // Explicitly exclude available sheep
    s.display !== false
  );
  
  // Filter males - exclude available sheep as they will be shown in the available section
  const rams = sheep.filter(s => 
    s.gender === 'male' && 
    !s.outsideBreeder && 
    !s.available && // Explicitly exclude available sheep
    s.display !== false
  );

  // Determine the page title and description
  let pageTitle = "Our Katahdin Sheep";
  let pageDescription = sheepDescription || 
    "Our Katahdin sheep are hardy, naturally shedding sheep known for their excellent mothering abilities and lean meat production.";

  if (genderFilter === 'male') {
    pageTitle = "Meet Our Rams";
    pageDescription = siteContent.find(c => c.key === 'sheep_rams_description')?.value || 
      "Meet our Katahdin rams. These hardy boys are carefully selected for their excellent genetics and strong conformation.";
  } else if (genderFilter === 'female') {
    pageTitle = "Our Ewes";
    pageDescription = siteContent.find(c => c.key === 'sheep_ewes_description')?.value || 
      "Meet our Katahdin ewes. These lovely ladies are the foundation of our flock, known for their excellent mothering abilities.";
  } else if (showAvailable) {
    pageTitle = "Available Sheep";
    pageDescription = siteContent.find(c => c.key === 'sheep_available_message')?.value || 
      "Browse our currently available Katahdin sheep. Each animal is raised with care and attention.";
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
      pageTitle = 'Katahdin Sheep Ewes for Sale | Female Hair Sheep | Hudsonville, Grand Rapids, MI';
      pageDescription = 'Katahdin sheep ewes (female hair sheep) for sale at Little Way Acres in Hudsonville, Michigan. Hardy, naturally-shedding sheep perfect for small farms in Grand Rapids, Holland, Zeeland, Byron Center, and surrounding West Michigan communities within 50 miles. Excellent mothers with easy lambing.';
      pageKeywords = 'Katahdin sheep ewes for sale, female hair sheep Hudsonville Michigan, naturally shedding sheep Grand Rapids, West Michigan livestock, Holland Zeeland sheep, Byron Center sustainable farming, Ottawa County hair sheep';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Katahdin Sheep Ewes for Sale",
        "description": pageDescription,
        "url": `${window.location.origin}/sheep/females`,
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
      pageTitle = 'Katahdin Sheep Rams for Sale | Male Hair Sheep | Hudsonville, Grand Rapids, MI';
      pageDescription = 'Katahdin sheep rams (male hair sheep) for sale at Little Way Acres in Hudsonville, Michigan. Quality breeding rams for sustainable farming in Grand Rapids, Holland, Zeeland, Byron Center, and West Michigan area within 50 miles. Hardy, naturally-shedding sheep with excellent genetics.';
      pageKeywords = 'Katahdin sheep rams for sale, male hair sheep Hudsonville Michigan, breeding rams Grand Rapids, West Michigan sustainable farming, Holland Zeeland livestock, Ottawa County sheep breeders';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Katahdin Sheep Rams for Sale",
        "description": pageDescription,
        "url": `${window.location.origin}/sheep/males`
      };
    } else if (showAvailable) {
      pageTitle = 'Katahdin Sheep for Sale | Available Hair Sheep | Hudsonville, MI';
      pageDescription = 'Katahdin sheep for sale now at Little Way Acres in Hudsonville, Michigan. Available hair sheep ready for pickup. Serving Grand Rapids, Holland, Zeeland, Byron Center, Wyoming, Kentwood, and all West Michigan communities within 50 miles. Hardy, low-maintenance sheep perfect for sustainable farming.';
      pageKeywords = 'Katahdin sheep for sale, hair sheep available Hudsonville, Grand Rapids livestock, West Michigan sustainable farming, Holland Zeeland sheep for sale, Ottawa County Katahdin breeders';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Available Katahdin Sheep for Sale",
        "description": pageDescription,
        "url": `${window.location.origin}/sheep/available`,
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "areaServed": {
          "@type": "Place",
          "name": "West Michigan - 50 Mile Radius from Hudsonville",
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
      pageTitle = 'Katahdin Hair Sheep | Natural Shedding Sheep | Hudsonville, Grand Rapids, Holland, MI';
      pageDescription = 'Katahdin hair sheep at Little Way Acres in Hudsonville, Michigan. Hardy, naturally-shedding sheep perfect for sustainable farming and homesteads in Grand Rapids, Holland, Zeeland, Byron Center, Georgetown, Wyoming, and surrounding West Michigan area. Low-maintenance livestock ideal for families within 50 miles - no shearing required!';
      pageKeywords = 'Katahdin hair sheep, naturally shedding sheep Hudsonville Michigan, sustainable farming Grand Rapids, small farm sheep West Michigan, Holland Zeeland livestock, homestead sheep Ottawa County, no shear sheep';
      
      structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Little Way Acres - Katahdin Hair Sheep",
        "description": pageDescription,
        "url": `${window.location.origin}/sheep`,
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
          "name": "Katahdin Sheep Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Katahdin Sheep Ewes",
                "category": "Livestock",
                "description": "Hardy ewes for sustainable farming and meat production"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "Katahdin Sheep Rams",
                "category": "Livestock",
                "description": "Quality breeding rams for flock improvement"
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
    const existingScript = document.querySelector('script[data-page="sheep"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'sheep');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
      const scriptToRemove = document.querySelector('script[data-page="sheep"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [genderFilter, showAvailable, sheep]);
  
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
      {/* Only show hero on main sheep page */}
      {!genderFilter && !showAvailable && <SheepHero />}

      {/* Our Katahdin Sheep Program Section - Only show on main sheep page */}
      {!genderFilter && !showAvailable && (
        <section className="py-16" style={{ backgroundColor: '#FDF7EB' }}>
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3F6A52] mb-6">
                {siteContent.find(c => c.key === "sheep_program_title")?.value || "Our Katahdin Sheep Program"}
              </h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side - Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{siteContent.find(c => c.key === "sheep_program_card1_icon")?.value || "🐑"}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">
                          {siteContent.find(c => c.key === "sheep_program_card1_title")?.value || "No Shearing Required"}
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {siteContent.find(c => c.key === "sheep_program_card1_description")?.value || 
                            "Katahdin sheep naturally shed their coat each spring, eliminating the need for annual shearing and reducing maintenance costs."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{siteContent.find(c => c.key === "sheep_program_card2_icon")?.value || "💪"}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">
                          {siteContent.find(c => c.key === "sheep_program_card2_title")?.value || "Hardy & Resilient"}
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {siteContent.find(c => c.key === "sheep_program_card2_description")?.value || 
                            "Known for their exceptional hardiness and disease resistance, Katahdin sheep thrive in various climates with minimal intervention."}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{siteContent.find(c => c.key === "sheep_program_card3_icon")?.value || "🥩"}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">
                          {siteContent.find(c => c.key === "sheep_program_card3_title")?.value || "Quality Meat Production"}
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {siteContent.find(c => c.key === "sheep_program_card3_description")?.value || 
                            "Katahdin sheep produce lean, flavorful meat with excellent marbling and tender texture, perfect for farm-to-table dining."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image */}
                <div className="relative">
                  <img
                    src={siteContent.find(c => c.key === "sheep_program_image")?.value || "https://images.unsplash.com/photo-1568454537842-d933259bb258"}
                    alt="Katahdin sheep grazing"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our Breeding Goals Section - Only show on main sheep page */}
      {!genderFilter && !showAvailable && (
        <section className="py-16 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3F6A52] mb-4">
                {siteContent.find(c => c.key === "sheep_goals_title")?.value || "Our Breeding Goals"}
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                {siteContent.find(c => c.key === "sheep_goals_description")?.value || 
                  "We're developing a sustainable sheep breeding program that prioritizes hardiness, mothering ability, and meat quality."}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Goal 1 */}
              <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={siteContent.find(c => c.key === "sheep_goal1_image")?.value || "https://images.unsplash.com/photo-1572967792798-79b46a3b0c30"}
                    alt="Superior meat quality sheep"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                    {siteContent.find(c => c.key === "sheep_goal1_title")?.value || "Superior Meat Quality"}
                  </h3>
                  <p className="text-stone-700 leading-relaxed mb-4">
                    {siteContent.find(c => c.key === "sheep_goal1_description")?.value || 
                      "Breeding for sheep that produce lean, flavorful meat with excellent marbling and feed conversion efficiency for sustainable farming."}
                  </p>
                  <div className="flex items-center text-[#3F6A52] font-medium">
                    <span className="text-sm">
                      {siteContent.find(c => c.key === "sheep_goal1_subtitle")?.value || "Premium Genetics"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Goal 2 */}
              <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={siteContent.find(c => c.key === "sheep_goal2_image")?.value || "https://images.unsplash.com/photo-1542012258-55a8f7c0bc44"}
                    alt="Healthy sheep family"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                    {siteContent.find(c => c.key === "sheep_goal2_title")?.value || "Excellent Mothering"}
                  </h3>
                  <p className="text-stone-700 leading-relaxed mb-4">
                    {siteContent.find(c => c.key === "sheep_goal2_description")?.value || 
                      "Selecting for ewes with strong maternal instincts, easy lambing, and excellent milk production to raise healthy, vigorous lambs."}
                  </p>
                  <div className="flex items-center text-[#3F6A52] font-medium">
                    <span className="text-sm">
                      {siteContent.find(c => c.key === "sheep_goal2_subtitle")?.value || "Natural Mothers"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Goal 3 */}
              <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={siteContent.find(c => c.key === "sheep_goal3_image")?.value || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
                    alt="Hardy sheep in pasture"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                    {siteContent.find(c => c.key === "sheep_goal3_title")?.value || "Climate Adaptability"}
                  </h3>
                  <p className="text-stone-700 leading-relaxed mb-4">
                    {siteContent.find(c => c.key === "sheep_goal3_description")?.value || 
                      "Breeding sheep that thrive in Michigan's climate with natural parasite resistance and year-round hardiness for sustainable farming."}
                  </p>
                  <div className="flex items-center text-[#3F6A52] font-medium">
                    <span className="text-sm">
                      {siteContent.find(c => c.key === "sheep_goal3_subtitle")?.value || "Weather Resilience"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Explore Our Sheep Navigation Section - Only show on main sheep page */}
      {!genderFilter && !showAvailable && (
        <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-stone-800 mb-4">
                  {siteContent.find(c => c.key === "sheep_explore_title")?.value || "Explore Our Sheep"}
                </h2>
                <div className="w-24 h-1 bg-amber-400 mx-auto rounded-full"></div>
                <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                  {siteContent.find(c => c.key === "sheep_explore_description")?.value || "Discover our Katahdin sheep breeding program and meet our flock"}
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/sheep/males" className="group">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Our Rams</h3>
                    <p className="text-stone-600 mb-6">
                      Meet our breeding rams and learn about their genetics and characteristics
                    </p>
                    <div className="inline-flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                      View Rams
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
                
                <Link href="/sheep/females" className="group">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-pink-200 transition-colors">
                      <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Our Ewes</h3>
                    <p className="text-stone-600 mb-6">
                      Discover our breeding ewes and their contributions to our program
                    </p>
                    <div className="inline-flex items-center text-pink-600 font-semibold group-hover:text-pink-700">
                      View Ewes
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
                
                <Link href="/sheep/available" className="group">
                  <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-amber-200 hover:-translate-y-1">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Available Sheep</h3>
                    <p className="text-stone-600 mb-6">
                      See our currently available sheep ready for their new homes
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

      {/* Show main page title and description only on filtered pages, not main sheep page */}
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

          {/* Show filtered sheep for specific pages */}
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8">
              {filteredSheep.map(s => (
                <SheepDetails key={s.id} sheep={s} showPrice={showAvailable || s.available} />
              ))}
            </div>
            {filteredSheep.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-stone-600">
                  {showAvailable ? "Check back soon for available sheep!" : "No sheep found matching your criteria."}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Show available sheep section only on main page when sheep exist */}
      {!genderFilter && !showAvailable && sheep.length > 0 && availableSheep.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mt-16">
            <div className="relative flex py-5 items-center mb-8">
              <div className="flex-grow border-t border-gray-200"></div>
              <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Meet Our Available Sheep</h2>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {availableSheep.map(s => (
                <SheepDetails key={s.id} sheep={s} showPrice={s.available} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Banner when no sheep exist on main page */}
      {!genderFilter && !showAvailable && sheep.length === 0 && (
        <section className="container mx-auto px-4 py-12">
          <div className="mt-16 mb-16">
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: '#FDF7EB' }}>
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Coming Soon!</h2>
              <p className="text-lg text-stone-600 mb-6">
                We're currently developing our Katahdin sheep program. Our sheep will be available soon!
              </p>
              <div className="text-sm text-stone-500">
                Check back soon or contact us for updates on our sheep availability.
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}