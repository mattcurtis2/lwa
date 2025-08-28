import { useEffect } from "react";
import Hero from "@/components/sections/hero";
import FarmInfo from "@/components/sections/farm-info";
import Principles from "@/components/sections/principles";
import FeatureCarousel from "@/components/sections/feature-carousel";
import LitterBanner from "@/components/sections/litter-banner";

export default function Home() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Set page-specific SEO meta tags
    document.title = "Little Way Acres | Colorado Mountain Dogs & Nigerian Dwarf Goats | Hudsonville, MI";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Little Way Acres - Premium Colorado Mountain Dogs, Nigerian Dwarf Goats, and farm-fresh bakery products in Hudsonville, Michigan. Family farm specializing in ethical breeding, artisanal croissants, sourdough bread, and local honey. Visit our farmers market for the finest farm-to-table experience.');
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'Little Way Acres, Colorado Mountain Dogs, Nigerian Dwarf Goats, Hudsonville Michigan farm, croissants, sourdough bread, local honey, farmers market, family farm, ethical dog breeding, goat breeding, farm fresh products, Michigan bakery, Grand Rapids area farm');
    }
    
    // Open Graph meta tags for social sharing
    const updateOrCreateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };
    
    updateOrCreateMetaTag('og:title', 'Little Way Acres | Colorado Mountain Dogs & Goats Farm | Hudsonville, MI');
    updateOrCreateMetaTag('og:description', 'Premium Colorado Mountain Dogs, Nigerian Dwarf Goats, and artisanal bakery products from our family farm in Hudsonville, Michigan. Farm-fresh croissants, sourdough, and honey.');
    updateOrCreateMetaTag('og:type', 'website');
    updateOrCreateMetaTag('og:url', window.location.href);
    updateOrCreateMetaTag('og:image', '/logo.png');
    updateOrCreateMetaTag('og:site_name', 'Little Way Acres');
    updateOrCreateMetaTag('og:locale', 'en_US');
    
    // Twitter Card meta tags
    const updateOrCreateTwitterTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };
    
    updateOrCreateTwitterTag('twitter:card', 'summary_large_image');
    updateOrCreateTwitterTag('twitter:title', 'Little Way Acres | Colorado Mountain Dogs & Goats Farm');
    updateOrCreateTwitterTag('twitter:description', 'Premium Colorado Mountain Dogs, Nigerian Dwarf Goats, and artisanal bakery products from our family farm in Hudsonville, Michigan.');
    updateOrCreateTwitterTag('twitter:image', '/logo.png');
    
    // Structured Data (JSON-LD) for better search engine understanding
    const existingScript = document.querySelector('script[data-page="home"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-page', 'home');
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Little Way Acres",
      "description": "Family farm specializing in Colorado Mountain Dogs, Nigerian Dwarf Goats, and artisanal bakery products",
      "url": window.location.origin,
      "logo": `${window.location.origin}/logo.png`,
      "image": `${window.location.origin}/logo.png`,
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
      },
      "areaServed": {
        "@type": "Place",
        "name": "West Michigan",
        "geo": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": "42.8736",
            "longitude": "-85.8681"
          },
          "geoRadius": "50"
        }
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Farm Products & Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Colorado Mountain Dogs",
              "category": "Pet Animals",
              "description": "Ethically bred Colorado Mountain Dogs from champion bloodlines"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Product",
              "name": "Nigerian Dwarf Goats",
              "category": "Livestock",
              "description": "High-quality Nigerian Dwarf Goats for milk production and companionship"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Artisanal Bakery Products",
              "category": "Food",
              "description": "Fresh croissants, sourdough bread, and baked goods made with farm-fresh ingredients"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product", 
              "name": "Local Honey",
              "category": "Food",
              "description": "Raw, unfiltered honey produced on our farm"
            }
          }
        ]
      },
      "sameAs": [],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "1",
        "bestRating": "5",
        "worstRating": "1"
      },
      "priceRange": "$$",
      "paymentAccepted": ["Cash", "Credit Card", "Venmo"],
      "currenciesAccepted": "USD",
      "openingHours": ["Mo-Sa 08:00-18:00"],
      "telephone": "+1-616-XXX-XXXX",
      "founder": {
        "@type": "Person",
        "name": "Little Way Acres Family"
      },
      "foundingDate": "2020",
      "knowsAbout": [
        "Colorado Mountain Dogs",
        "Nigerian Dwarf Goats", 
        "Sustainable Farming",
        "Artisanal Baking",
        "Local Honey Production",
        "Ethical Animal Breeding"
      ],
      "slogan": "Living out God's great plan in small ways, daily"
    });
    
    document.head.appendChild(script);
  }, []);

  return (
    <div className="w-full">
      <Hero />
      <LitterBanner />
      <Principles />
      <FarmInfo />
      <FeatureCarousel />
    </div>
  );
}