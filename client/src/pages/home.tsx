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
    document.title = "Little Way Acres - Farm, Bakery, Colorado Mountain Dogs";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Colorado Mountain Dog breeders & artisan sourdough bakery in Michigan. Premium CMDR puppies & fresh croissants at Little Way Acres farm.');
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'Colorado Mountain Dogs Michigan, CMDR puppies, sourdough bakery Michigan, artisan croissants, dog breeders Michigan, sourdough bread, Little Way Acres, Hudsonville farm');
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
    
    updateOrCreateMetaTag('og:title', 'Little Way Acres - Farm, Bakery, Colorado Mountain Dogs');
    updateOrCreateMetaTag('og:description', 'Colorado Mountain Dog breeders & artisan sourdough bakery in Michigan. Premium CMDR puppies & fresh croissants from our family farm.');
    updateOrCreateMetaTag('og:type', 'website');
    updateOrCreateMetaTag('og:url', window.location.href);
    updateOrCreateMetaTag('og:image', '/logo.png');
    updateOrCreateMetaTag('og:site_name', 'Little Way Acres - Farm, Bakery, Colorado Mountain Dogs');
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
    updateOrCreateTwitterTag('twitter:title', 'Little Way Acres - Farm, Bakery, Colorado Mountain Dogs');
    updateOrCreateTwitterTag('twitter:description', 'Colorado Mountain Dog breeders & artisan sourdough bakery in Michigan. Premium CMDR puppies & fresh croissants.');
    updateOrCreateTwitterTag('twitter:image', '/logo.png');
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', window.location.origin);
    
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
      "name": "Little Way Acres - Farm, Bakery, Colorado Mountain Dogs",
      "description": "Premier Colorado Mountain Dog breeders and artisan sourdough bakery in Michigan",
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
              "name": "Colorado Mountain Dogs (CMDR)",
              "category": "Pet Animals",
              "description": "Premium Colorado Mountain Dog puppies from champion bloodlines. Ethical CMDR breeders in Michigan.",
              "brand": {
                "@type": "Brand",
                "name": "Little Way Acres"
              }
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Artisan Sourdough Bakery",
              "category": "Food",
              "description": "Fresh croissants, sourdough bread, and European-style pastries made with traditional techniques.",
              "brand": {
                "@type": "Brand",
                "name": "Little Way Acres Bakery"
              }
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Product",
              "name": "Nigerian Dwarf Goats",
              "category": "Livestock",
              "description": "High-quality Nigerian Dwarf Goats for milk production"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product", 
              "name": "Raw Farm Honey",
              "category": "Food",
              "description": "Pure, unprocessed honey from our farm"
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
        "Colorado Mountain Dogs (CMDR)",
        "Sourdough Bread Making",
        "Artisan Croissants", 
        "Dog Breeding",
        "European Baking Techniques",
        "Nigerian Dwarf Goats",
        "Farm Fresh Products"
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