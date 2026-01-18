import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Shield, 
  Leaf, 
  Settings, 
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Sun,
  TreeDeciduous,
  Flower2
} from "lucide-react";

export default function TotalVegetationManagement() {
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    
    document.title = 'Total Vegetation Management for Solar Sites | Little Way Acres – Sustainable Sheep Grazing';
    updateMetaDescription('Professional solar grazing services using Katahdin sheep for cost-effective, herbicide-free vegetation control. Reduce O&M costs 20–40%, improve soil health, support pollinators, and meet fire-safety standards.');

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'solar grazing, vegetation management, sheep grazing solar farms, agrivoltaics, solar site maintenance, herbicide-free vegetation control, sustainable solar, Michigan solar grazing, Northern Indiana solar, Katahdin sheep grazing');

    const ogTags = [
      { property: 'og:title', content: 'Total Vegetation Management for Solar Sites | Little Way Acres' },
      { property: 'og:description', content: 'Professional solar grazing services using Katahdin sheep for cost-effective, herbicide-free vegetation control. Reduce O&M costs 20–40%, improve soil health, support pollinators.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'Little Way Acres' },
      { property: 'og:image', content: '/logo.png' }
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

    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Total Vegetation Management for Solar Sites | Little Way Acres' },
      { name: 'twitter:description', content: 'Professional solar grazing services using Katahdin sheep for cost-effective, herbicide-free vegetation control.' },
      { name: 'twitter:image', content: '/logo.png' }
    ];

    twitterTags.forEach(tag => {
      let twitterTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!twitterTag) {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', tag.name);
        document.head.appendChild(twitterTag);
      }
      twitterTag.setAttribute('content', tag.content);
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "name": "Solar Grazing Vegetation Management",
          "description": "Professional solar grazing services using Katahdin sheep for cost-effective, herbicide-free vegetation control at solar installations.",
          "provider": {
            "@type": "Organization",
            "name": "Little Way Acres",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Hudsonville",
              "addressRegion": "Michigan",
              "addressCountry": "US"
            },
            "telephone": "616-502-7631"
          },
          "areaServed": [
            { "@type": "State", "name": "Michigan" },
            { "@type": "State", "name": "Indiana" }
          ],
          "serviceType": "Vegetation Management"
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How much can solar grazing reduce vegetation management costs?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Solar grazing can reduce vegetation management costs by 20-40% compared to mechanical mowing or herbicide applications, with predictable seasonal pricing."
              }
            },
            {
              "@type": "Question",
              "name": "Is solar grazing safe for solar panels?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, our managed rotational grazing uses experienced sheep that do not damage panels or wiring. We carry comprehensive liability insurance and coordinate all access safely."
              }
            }
          ]
        }
      ]
    };

    let jsonLd = document.querySelector('#solar-grazing-structured-data');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'solar-grazing-structured-data';
      (jsonLd as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = originalTitle;
      if (originalDescription) {
        updateMetaDescription(originalDescription);
      }
      const addedElements = document.querySelectorAll('meta[name="keywords"], meta[property^="og:"], meta[name^="twitter:"], #solar-grazing-structured-data');
      addedElements.forEach(element => element.remove());
    };
  }, []);
  
  const updateMetaDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  };

  const benefits = [
    {
      icon: DollarSign,
      title: "Cost Savings",
      description: "Reduce vegetation management costs by 20–40% compared to mechanical mowing or herbicides. Predictable seasonal pricing with no surprise fuel or chemical expenses."
    },
    {
      icon: Shield,
      title: "Compliance & Fire Safety",
      description: "Maintain vegetation at safe heights year-round to meet O&M requirements and reduce wildfire risk. Detailed monitoring and reporting provided."
    },
    {
      icon: Leaf,
      title: "Environmental & ESG Benefits",
      description: "Herbicide-free grazing improves soil organic matter, supports pollinator habitats, and aligns with sustainability goals and pollinator-friendly vegetation plans."
    },
    {
      icon: Settings,
      title: "Reliable Operations",
      description: "Managed rotational grazing with insured, experienced team. Quick response times via local site monitors + central coordination. No damage to panels or wiring."
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Initial Site Assessment",
      description: "Site walk-through covering fencing requirements, water access, panel clearance, and vegetation baseline evaluation."
    },
    {
      step: 2,
      title: "Customized Grazing Plan",
      description: "Tailored plan with stocking density of 3–4 sheep per acre, rotation frequency of 3–7 days based on vegetation growth."
    },
    {
      step: 3,
      title: "Mobilization & Seasonal Management",
      description: "Active grazing season runs April through October in Michigan and Northern Indiana, with flexible scheduling."
    },
    {
      step: 4,
      title: "Ongoing Monitoring & Reporting",
      description: "Regular photos, vegetation height logs, soil health notes, and habitat observations provided throughout the season."
    },
    {
      step: 5,
      title: "Contract Flexibility",
      description: "3–10 year contract terms available, milestone payments, and end-of-season site restoration included."
    },
    {
      step: 6,
      title: "Hybrid Support Options",
      description: "Optional spot mowing if needed for specific areas, ensuring complete vegetation management coverage."
    }
  ];

  const stats = [
    { value: "20-40%", label: "Cost Reduction" },
    { value: "0", label: "Herbicides Used" },
    { value: "100%", label: "Pollinator-Friendly" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
        <img
          src="/solar-grazing-hero.png"
          alt="Sheep grazing under solar panels"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
          <div className="flex items-center gap-3 mb-6">
            <Sun className="w-10 h-10 text-amber-300" />
            <TreeDeciduous className="w-8 h-8 text-green-300" />
            <Flower2 className="w-8 h-8 text-pink-300" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
            Total Vegetation Management
          </h1>
          <p className="text-2xl md:text-3xl font-semibold mb-2 drop-shadow-md text-amber-200">
            with Solar Grazing
          </p>
          <p className="text-xl md:text-2xl max-w-3xl drop-shadow-md mb-8 text-white/90">
            Reliable, low-impact vegetation control that saves money, eliminates chemicals, and enhances site sustainability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-lg"
              asChild
            >
              <a href="mailto:littlewayacres@gmail.com?subject=Solar%20Grazing%20Site%20Assessment%20Request">
                Request a Site Assessment
              </a>
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-stone-800 hover:bg-stone-100 font-semibold px-8 py-6 text-lg"
              asChild
            >
              <a href="tel:616-502-7631">
                <Phone className="w-5 h-5 mr-2" />
                Call 616-502-7631
              </a>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              ASGA Certified
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Katahdin Specialists
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Serving Michigan & Northern Indiana
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#3F6A52] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-amber-300 mb-2">{stat.value}</div>
                <div className="text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Key Benefits Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-stone-800 mb-4">
                Benefits for Solar Operators
              </h2>
              <div className="w-24 h-1 bg-[#3F6A52] mx-auto rounded-full"></div>
              <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                Solar grazing delivers measurable value for your operations, your bottom line, and the environment.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-stone-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-[#3F6A52]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-7 h-7 text-[#3F6A52]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-800 mb-2">{benefit.title}</h3>
                        <p className="text-stone-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-stone-800 mb-4">
                How It Works
              </h2>
              <div className="w-24 h-1 bg-[#3F6A52] mx-auto rounded-full"></div>
              <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
                Our proven process ensures reliable, professional vegetation management from start to finish.
              </p>
            </div>
            
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#3F6A52]/20 -translate-x-1/2"></div>
              
              <div className="space-y-8">
                {processSteps.map((step, index) => (
                  <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <Card className="border-stone-200 inline-block w-full md:max-w-md">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold text-stone-800 mb-2">{step.title}</h3>
                          <p className="text-stone-600">{step.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="hidden md:flex w-12 h-12 bg-[#3F6A52] rounded-full items-center justify-center text-white font-bold text-lg flex-shrink-0 z-10">
                      {step.step}
                    </div>
                    <div className="flex-1 hidden md:block"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 bg-stone-100 rounded-xl p-6 text-center">
              <p className="text-stone-700 text-lg">
                <strong>We handle it all:</strong> liability insurance (≥$1M umbrella), access coordination, and any required documentation.
              </p>
            </div>
          </section>

          {/* Proof / Credibility Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-stone-800 mb-4">
                Why Trust Little Way Acres
              </h2>
              <div className="w-24 h-1 bg-[#3F6A52] mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-stone-200 text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-2">MSU Extension Supported</h3>
                  <p className="text-stone-600 text-sm">Supported by research and guidance from Michigan State University Extension.</p>
                </CardContent>
              </Card>
              
              <Card className="border-stone-200 text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-2">ASGA Best Practices</h3>
                  <p className="text-stone-600 text-sm">Following American Solar Grazing Association standards and protocols.</p>
                </CardContent>
              </Card>
              
              <Card className="border-stone-200 text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <TreeDeciduous className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-2">Katahdin Specialists</h3>
                  <p className="text-stone-600 text-sm">Experienced with Katahdin sheep, ideal for solar grazing applications.</p>
                </CardContent>
              </Card>
              
              <Card className="border-stone-200 text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-stone-800 mb-2">Regional Coverage</h3>
                  <p className="text-stone-600 text-sm">Serving Michigan solar sites from Muskegon to South Bend.</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="bg-[#3F6A52] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Lower Vegetation Costs and Meet Sustainability Goals?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Contact us for a no-obligation site review, proposal, or grazing plan tailored to your solar array.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-lg"
                asChild
              >
                <a href="mailto:littlewayacres@gmail.com?subject=Solar%20Grazing%20Proposal%20Request">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Us
                </a>
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-[#3F6A52] hover:bg-stone-100 font-semibold px-8 py-6 text-lg"
                asChild
              >
                <a href="tel:616-502-7631">
                  <Phone className="w-5 h-5 mr-2" />
                  Schedule a Call
                </a>
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Hudsonville, Michigan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <a href="tel:616-502-7631" className="hover:text-white">616-502-7631</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <a href="mailto:littlewayacres@gmail.com" className="hover:text-white">littlewayacres@gmail.com</a>
              </div>
            </div>
          </section>

          {/* Back to Sheep Link */}
          <div className="mt-12 text-center">
            <Link href="/sheep">
              <Button variant="outline" className="text-[#3F6A52] border-[#3F6A52] hover:bg-[#3F6A52]/10">
                ← Back to Our Sheep
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
