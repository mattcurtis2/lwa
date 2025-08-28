import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Home, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Litter {
  id: number;
  motherName: string;
  fatherName: string;
  dueDate: string;
  isCurrentLitter: boolean;
  isPlannedLitter: boolean;
  isPastLitter: boolean;
}

export default function BreedingGoals() {
  const { data: litters } = useQuery<Litter[]>({
    queryKey: ["/api/litters"],
  });

  // Find the most recent upcoming/planned litter first, then current litter
  const mostRecentLitter = litters?.find(litter => 
    litter.isPlannedLitter === true
  ) || litters?.find(litter => 
    litter.isCurrentLitter === true
  ) || litters?.[0];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Comprehensive SEO optimization
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    document.title = 'Colorado Mountain Dog Breeding Goals | Little Way Acres Michigan CMDR';
    updateMetaDescription('Discover our Colorado Mountain Dog breeding philosophy at Little Way Acres Michigan. We breed for gentle temperament, intelligence, and small farm guardian abilities. Health-tested parents, purposeful breeding.');

    // Add keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'Colorado Mountain Dog breeding, livestock guardian dog, small farm dogs, Michigan dog breeder, CMDR breeding goals, guardian dog temperament, farm dog breeding, Little Way Acres');

    // Add Open Graph tags for social sharing
    const ogTags = [
      { property: 'og:title', content: 'Colorado Mountain Dog Breeding Goals | Little Way Acres' },
      { property: 'og:description', content: 'Our breeding philosophy focuses on gentle temperament, intelligence, and small farm guardian abilities for Colorado Mountain Dogs.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'Little Way Acres' },
      { property: 'og:image', content: 'https://lwacontent.s3.us-east-2.amazonaws.com/52aa3e57-3a8e-472e-a3f3-f905b2d19e3b.jpg' }
    ];

    ogTags.forEach(tag => {
      let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!ogTag) {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', tag.property);
        document.head.appendChild(ogTag);
      }
      ogTag.setAttribute('content', tag.content);
    });

    // Add structured data (JSON-LD) for search engines
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": "Colorado Mountain Dog Breeding Goals",
          "description": "Our comprehensive breeding philosophy for Colorado Mountain Dogs focused on temperament, intelligence, and farm work capabilities.",
          "author": {
            "@type": "Organization",
            "name": "Little Way Acres"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Little Way Acres",
            "address": {
              "@type": "PostalAddress",
              "addressRegion": "Michigan",
              "addressCountry": "US"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "616-502-7631",
              "contactType": "customer service"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
          },
          "image": "https://lwacontent.s3.us-east-2.amazonaws.com/52aa3e57-3a8e-472e-a3f3-f905b2d19e3b.jpg"
        },
        {
          "@type": "Organization",
          "name": "Little Way Acres",
          "url": window.location.origin,
          "description": "Small family farm specializing in Colorado Mountain Dogs and Nigerian Dwarf Goats in Michigan",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Michigan",
            "addressCountry": "US"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "616-502-7631",
            "contactType": "customer service"
          },
          "sameAs": []
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What are the main Colorado Mountain Dog breeding goals at Little Way Acres?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Our breeding goals focus on six key traits: bonding with family, staying close to home, calm steady presence, reliable guardian instincts, affection and companionship, and health-tested parents. We prioritize gentle temperament above all else."
              }
            },
            {
              "@type": "Question",
              "name": "Why do you focus on temperament in Colorado Mountain Dog breeding?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We want our dogs to be your children's favorite pillow. A gentle, calm disposition is our highest priority in every breeding decision, ensuring dogs that are trustworthy around all family members while maintaining guardian instincts."
              }
            },
            {
              "@type": "Question",
              "name": "Are Colorado Mountain Dogs good for small farms?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our Colorado Mountain Dogs are specifically bred for small farm operations where every animal must earn their place through both performance and personality. They adapt well to different farm animals and operations while staying close to home."
              }
            },
            {
              "@type": "Question",
              "name": "Do you health test your Colorado Mountain Dog breeding dogs?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. Every breeding decision includes thorough health testing to ensure our puppies inherit the strength and longevity needed for a lifetime of faithful service and companionship."
              }
            }
          ]
        }
      ]
    };

    let jsonLd = document.querySelector('#breeding-goals-structured-data');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'breeding-goals-structured-data';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData);

    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
      
      // Clean up added SEO elements
      const addedElements = document.querySelectorAll('meta[name="keywords"], meta[property^="og:"], #breeding-goals-structured-data');
      addedElements.forEach(element => element.remove());
    };
  }, []);
  
  const updateMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-stone-800 mb-6">
              Our Breeding Goals
            </h1>
            <div className="w-32 h-1 bg-amber-400 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-stone-700 leading-relaxed max-w-4xl mx-auto">
              At Little Way Acres, every breeding decision is guided by our commitment to producing Colorado Mountain Dogs who excel as both livestock guardians and beloved family companions. Our philosophy centers on temperament, loyalty, and the gentle strength that makes CMDRs perfect for small farm life.
            </p>
          </div>

          {/* Core Philosophy */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-800 mb-4">What We Look For</h2>
              <p className="text-stone-700 text-lg">
                In our breeding program, we look for dogs who embody these essential qualities:
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column - Traits */}
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Bond Closely with Both Herd and Family</h3>
                    <p className="text-stone-700 leading-relaxed">
                      Our dogs form deep, lasting connections with their livestock charges while remaining devoted family members. This dual bonding creates the perfect balance of protection and companionship.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Stay Home and Close to Their People</h3>
                    <p className="text-stone-700 leading-relaxed">
                      Rather than roaming, our CMDRs are bred to stay close to home and their families. This trait is essential for small farm operations where wandering can be dangerous and disruptive.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Rely on Calm Presence Over Constant Barking</h3>
                    <p className="text-stone-700 leading-relaxed">
                      Our dogs use their imposing presence and confident demeanor as their primary tools of deterrence, reserving barking for when it's truly needed. This makes them ideal for rural and suburban settings alike.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Photo */}
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-md">
                  <img 
                    src="https://lwacontent.s3.us-east-2.amazonaws.com/52aa3e57-3a8e-472e-a3f3-f905b2d19e3b.jpg" 
                    alt="Colorado Mountain Dog demonstrating calm guardian presence" 
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Traits */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-16">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left Column - Photo */}
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-md">
                  <img 
                    src="https://lwacontent.s3.us-east-2.amazonaws.com/f88fee00-816d-4f4a-8cf8-0a32b44ce8c4.jpg" 
                    alt="Colorado Mountain Dog showing reliable guardian instincts" 
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </div>

              {/* Right Column - Traits */}
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Show Steady, Reliable Guardian Instincts</h3>
                    <p className="text-stone-700 leading-relaxed">
                      Our dogs demonstrate consistent, dependable protective instincts without unnecessary aggression. They know when to be alert and when to be at ease, making them trustworthy around both livestock and visitors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Bring Warmth, Affection, and Companionship</h3>
                    <p className="text-stone-700 leading-relaxed">
                      Beyond their guardian duties, our CMDRs are loving family members who provide comfort, affection, and joy. They understand that protection and companionship go hand in hand.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 mb-3">Come from Carefully Health-Tested Parents</h3>
                    <p className="text-stone-700 leading-relaxed">
                      Every breeding decision includes thorough health testing to ensure our puppies inherit the strength and longevity needed for a lifetime of faithful service and companionship.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Four Core Breeding Priorities */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Our Four Breeding Priorities</h2>
              <p className="text-stone-700 text-lg">
                These priorities guide every breeding decision we make at Little Way Acres.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold text-xl">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">Temperament Above Everything Else</h3>
                  <p className="text-stone-700 leading-relaxed">
                    We want our dogs to be your children's favorite pillow. A gentle, calm disposition is our highest priority in every breeding decision, ensuring dogs that are trustworthy around all family members.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold text-xl">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">Teachable and Intelligent</h3>
                  <p className="text-stone-700 leading-relaxed">
                    We want smart dogs that will follow your lead in how your farm is operated. Intelligence and willingness to learn are essential for adapting to your specific farming needs and methods.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold text-xl">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">Seamless Adoption of New Animals</h3>
                  <p className="text-stone-700 leading-relaxed">
                    As small farmers often experiment with different animals, our CMDRs are bred and trained to adopt any animal you bring to your farm, providing flexible guardian coverage.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold text-xl">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">Beautifully Athletic</h3>
                  <p className="text-stone-700 leading-relaxed">
                    Tall, lean, and ready to run. We prioritize physical fitness and graceful movement in our breeding program, ensuring dogs capable of the physical demands of farm work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Final Message */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl shadow-lg border border-amber-200 p-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-stone-800 mb-6">More Than Just a Guardian</h2>
              <p className="text-stone-700 text-lg leading-relaxed mb-6">
                When you bring home a puppy from Little Way Acres, you're not just getting a livestock guardian—you're gaining a loyal farm companion who has been raised with love, purpose, and a commitment to health and well-being.
              </p>
              <p className="text-stone-700 text-lg leading-relaxed">
                Our Colorado Mountain Dogs represent the perfect balance of working ability and family devotion, bred specifically for small farm operations where every animal must earn their place through both performance and personality.
              </p>
            </div>
          </div>

          {/* Latest Litter Promo */}
          {mostRecentLitter && (
            <div className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 mt-16 text-center">
              <h2 className="text-3xl font-bold text-stone-800 mb-6">Interested in our next litter?</h2>
              <p className="text-stone-700 text-lg leading-relaxed mb-6 max-w-3xl mx-auto">
                Experience the Colorado Mountain Dog difference with our upcoming litter from {mostRecentLitter.motherName} and {mostRecentLitter.fatherName}. These puppies will embody all the breeding goals we've shared above - gentle temperament, intelligence, loyalty, and the perfect balance of guardian instincts with family companionship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3"
                >
                  <Link href={`/dogs/litters/${mostRecentLitter.id}`}>
                    View Current Litter
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50 px-8 py-3"
                >
                  <Link href="/dogs/how-to-purchase">
                    Learn Purchase Process
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}