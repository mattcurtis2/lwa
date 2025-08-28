import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ContactInfo } from "@db/schema";
import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

interface Litter {
  id: number;
  motherName: string;
  fatherName: string;
  dueDate: string;
  status: string;
}

export default function HowToPurchase() {
  const { data: contactInfo } = useQuery<ContactInfo>({
    queryKey: ["/api/contact-info"],
  });

  const { data: litters } = useQuery<Litter[]>({
    queryKey: ["/api/litters"],
  });

  // Find the most recent litter (current, planned, or any upcoming litter)
  const mostRecentLitter = litters?.find(litter => 
    litter.status === 'current' || litter.status === 'planned'
  ) || litters?.[0];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Update page title and meta description for SEO
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    document.title = 'How to Purchase a Colorado Mountain Dog Puppy | Little Way Acres Process';
    updateMetaDescription('Learn how to purchase a Colorado Mountain Dog puppy from Little Way Acres. Our placement process includes interest form, phone conversation, dog selection, and personal pickup or delivery in Michigan.');
    
    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Purchase a Colorado Mountain Dog Puppy",
      "description": "Complete guide to purchasing a Colorado Mountain Dog puppy from Little Way Acres, including our placement process and breeding philosophy.",
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
        }
      },
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I purchase a Colorado Mountain Dog puppy?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Our process includes filling out an interest form, having a phone conversation, going through our dog selection process, and arranging personal pickup or delivery."
            }
          },
          {
            "@type": "Question",
            "name": "Do you ship Colorado Mountain Dog puppies?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, we don't use carrier or shipping services. We arrange direct pickup at the farm or personal delivery to ensure we meet families face-to-face."
            }
          }
        ]
      }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
    };
  }, []);
  
  const updateMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  };

  const openGoogleMaps = () => {
    if (contactInfo?.address) {
      const encodedAddress = encodeURIComponent(contactInfo.address);
      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-stone-800 mb-6">
              How to Purchase a Puppy
            </h1>
            <div className="w-32 h-1 bg-amber-400 mx-auto rounded-full mb-6"></div>
            <p className="text-xl text-stone-700 leading-relaxed max-w-3xl mx-auto">
              At Little Way Acres, we believe finding the right home for our Colorado Mountain Dog puppies is just as important as breeding exceptional dogs. Our placement process ensures the best match for both our puppies and your family.
            </p>
          </div>

          {/* Process Steps */}
          <div className="space-y-12 mb-16">
            
            {/* Step 1: Interest Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-2xl">1</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-stone-800 mb-4">Interest Form / Waitlist</h2>
                  <p className="text-stone-700 leading-relaxed text-lg mb-6">
                    Families begin by filling out our interest form or joining our waitlist. This helps us learn more about your needs—whether you're looking for a dedicated working guardian, a family companion, or both.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-3">What We Ask About:</h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Your farm setup, land size, livestock, and predator challenges</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>What type of dog you need (livestock guardian, companion, all-around farm dog)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Previous experience with guardian dogs and current animals on your farm</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Training plans, housing arrangements, and specific puppy preparation needs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Phone Conversation */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-2xl">2</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-stone-800 mb-4">Phone Conversation</h2>
                  <p className="text-stone-700 leading-relaxed text-lg mb-6">
                    We require a personal phone call with every prospective family. This gives us a chance to connect directly, answer questions, and make sure we're a good fit for one another.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-3">During Our Call:</h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Learn about your specific needs and expectations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Discuss our breeding goals and philosophy</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Answer any questions about Colorado Mountain Dogs</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Share insights about upcoming litters</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Dog Selection Process */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-2xl">3</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-stone-800 mb-4">Dog Selection Process</h2>
                  <p className="text-stone-700 leading-relaxed text-lg mb-6">
                    For families that submit a deposit for dogs, we work to identify the best traits of our litters that fit your individual needs. These traits start to show themselves in weeks 4-6. After we have identified top candidates for your farms, we work through reservations in order of deposit to find the best fit for CMDRs.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-3">Our Selection Timeline:</h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Weeks 1-3: Early observation and temperament notes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Weeks 4-6: Individual personalities and traits emerge</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Week 6: Matching process begins with deposit holders</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Week 8: Final selections and preparation for pickup</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Pickup or Personal Delivery */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-2xl">4</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-stone-800 mb-4">Pickup or Personal Delivery</h2>
                  <p className="text-stone-700 leading-relaxed text-lg mb-6">
                    We don't use carrier or shipping services. Instead, we arrange direct pickup at the farm or personal delivery, so we can meet you face-to-face and know our puppies are going to the right home.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-stone-800 mb-3">Why Personal Handoff:</h3>
                    <ul className="space-y-2 text-stone-700">
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Ensures puppies travel safely and stress-free</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Allows us to meet you and your family in person</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Provides opportunity for final questions and guidance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Creates lasting relationships with puppy families</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Ready to Start the Process?</h2>
              <p className="text-stone-700 text-lg">
                We'd love to hear from you and learn about what you're looking for in a Colorado Mountain Dog.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Details */}
              <div className="space-y-6">
                {contactInfo?.email && (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">Email Us</h3>
                      <a 
                        href={`mailto:${contactInfo.email}`}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {contactInfo?.phone && (
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">Call Us</h3>
                      <a 
                        href={`tel:${contactInfo.phone}`}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {contactInfo?.address && (
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-stone-800 mb-2">Visit Our Farm</h3>
                      <p className="text-stone-700 mb-3">{contactInfo.address}</p>
                      <Button 
                        onClick={openGoogleMaps}
                        variant="outline"
                        className="flex items-center space-x-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Get Directions</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Call to Action */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold text-stone-800 mb-4">Start Your Journey</h3>
                <p className="text-stone-700 mb-6">
                  Ready to welcome a Colorado Mountain Dog into your family? Check out our current litter or reach out to us to begin the placement process.
                </p>
                {mostRecentLitter && (
                  <Button 
                    asChild
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Link href={`/dogs/litters/${mostRecentLitter.id}`}>
                      View Current Litter
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8 mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Explore Our Farm</h2>
              <p className="text-stone-700 text-lg">
                Learn more about our animals and farm operations at Little Way Acres.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Dogs Section */}
              <div className="bg-amber-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                    🐕
                  </span>
                  Colorado Mountain Dogs
                </h3>
                <ul className="space-y-2 text-stone-700">
                  <li>
                    <a href="/dogs" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Our Dogs
                    </a>
                  </li>
                  <li>
                    <a href="/dogs/breeding-goals" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Breeding Goals
                    </a>
                  </li>
                  <li>
                    <a href="/dogs/males" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Males
                    </a>
                  </li>
                  <li>
                    <a href="/dogs/females" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Females
                    </a>
                  </li>
                  <li>
                    <a href="/dogs/available" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Available Dogs
                    </a>
                  </li>
                  <li>
                    <a href="/dogs/litters/current" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Current Litters
                    </a>
                  </li>
                  <li>
                    <a href="/dogs/litters/future" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Future Litters
                    </a>
                  </li>
                  <li>
                    <a href="/dogs/litters/past" className="text-amber-700 hover:text-amber-800 transition-colors">
                      Past Litters
                    </a>
                  </li>
                </ul>
              </div>

              {/* Goats Section */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    🐐
                  </span>
                  Nigerian Dwarf Goats
                </h3>
                <ul className="space-y-2 text-stone-700">
                  <li>
                    <a href="/goats" className="text-green-700 hover:text-green-800 transition-colors">
                      Our Goats
                    </a>
                  </li>
                  <li>
                    <a href="/goats/males" className="text-green-700 hover:text-green-800 transition-colors">
                      Males
                    </a>
                  </li>
                  <li>
                    <a href="/goats/females" className="text-green-700 hover:text-green-800 transition-colors">
                      Females
                    </a>
                  </li>
                  <li>
                    <a href="/goats/available" className="text-green-700 hover:text-green-800 transition-colors">
                      Available Goats
                    </a>
                  </li>
                  <li>
                    <a href="/goats/litters/current" className="text-green-700 hover:text-green-800 transition-colors">
                      Current Litters
                    </a>
                  </li>
                  <li>
                    <a href="/goats/litters/upcoming" className="text-green-700 hover:text-green-800 transition-colors">
                      Upcoming Litters
                    </a>
                  </li>
                  <li>
                    <a href="/goats/litters/past" className="text-green-700 hover:text-green-800 transition-colors">
                      Past Litters
                    </a>
                  </li>
                </ul>
              </div>

              {/* Sheep & Market Section */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    🐑
                  </span>
                  Katahdin Sheep & Market
                </h3>
                <ul className="space-y-2 text-stone-700">
                  <li>
                    <a href="/sheep" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Our Sheep
                    </a>
                  </li>
                  <li>
                    <a href="/sheep/males" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Males
                    </a>
                  </li>
                  <li>
                    <a href="/sheep/females" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Females
                    </a>
                  </li>
                  <li>
                    <a href="/sheep/available" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Available Sheep
                    </a>
                  </li>
                  <li className="pt-2 border-t border-blue-200">
                    <a href="/market" className="text-blue-700 hover:text-blue-800 transition-colors font-semibold">
                      Farmers Market
                    </a>
                  </li>
                  <li>
                    <a href="/market/bakery" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Bakery Items
                    </a>
                  </li>
                  <li>
                    <a href="/market/animal-products" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Animal Products
                    </a>
                  </li>
                  <li>
                    <a href="/market/apparel" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Apparel
                    </a>
                  </li>
                  <li>
                    <a href="/gallery" className="text-blue-700 hover:text-blue-800 transition-colors">
                      Gallery
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}