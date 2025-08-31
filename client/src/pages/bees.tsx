
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SiteContent {
  id: number;
  key: string;
  value: string;
  type: string;
}

export default function BeesPage() {
  const { data: siteContent = [] } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  // Get bee-specific content or use defaults
  const getContentValue = (key: string, defaultValue: string) => {
    const content = siteContent.find(c => c.key === key);
    return content?.value || defaultValue;
  };

  const beeDescription = getContentValue(
    "bees_page_description", 
    "Our beekeeping program focuses on developing mite-resistant, winter-hardy Michigan bees while producing high-quality honey and supporting our farm's pollination needs."
  );

  const beeImage = getContentValue(
    "bees_image",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64"
  );

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${beeImage})` }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Our Bees
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed opacity-95">
            {beeDescription}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          
          {/* Purpose Section */}
          <div className="mb-16 py-16 -mx-4" style={{ backgroundColor: '#FDF7EB' }}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#3F6A52] mb-6">Our Purpose</h2>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side - Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">🍯</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">Honey Production</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          To produce pure, raw honey that captures the essence of our local flora and provides natural sweetness for our community.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">🌸</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">Pollination Support</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          To pollinate our fruit trees and garden, increasing yields and supporting the biodiversity of our farm ecosystem.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">🐝</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">Bee Beautiful</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          To maintain healthy, thriving bee colonies that add beauty and wonder to our farm while contributing to environmental health.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image */}
                <div className="relative h-80 md:h-auto">
                  <img
                    src="https://images.unsplash.com/photo-1471943311424-646960669fbc"
                    alt="Beekeeper working with hives"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10"></div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3F6A52] mb-4">Our Beekeeping Goals</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                We're committed to developing sustainable, resilient bee colonies that thrive in Michigan's climate.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <Card className="group hover:shadow-xl transition-all duration-300 border border-stone-200 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1558618047-b0c8cdda7b9b"
                      alt="Healthy bee colony"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#3F6A52] mb-3">Mite Resistance Development</h3>
                    <p className="text-stone-700 leading-relaxed mb-4">
                      Develop and introduce mite-resistant genetics to create stronger, healthier bee colonies that can naturally defend against varroa mites and other pests.
                    </p>
                    <div className="flex items-center text-[#3F6A52] font-medium">
                      <span className="text-sm">Building Natural Immunity</span>
                      <div className="ml-2 w-2 h-2 bg-[#3F6A52] rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border border-stone-200 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1547036967-23d11aacaee0"
                      alt="Winter beehive in snow"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#3F6A52] mb-3">Winter Hardy Michigan Bees</h3>
                    <p className="text-stone-700 leading-relaxed mb-4">
                      Select for winter-hardy traits that allow our bees to thrive in Michigan's harsh winters, reducing losses and building sustainable colonies.
                    </p>
                    <div className="flex items-center text-[#3F6A52] font-medium">
                      <span className="text-sm">Cold Climate Adaptation</span>
                      <div className="ml-2 w-2 h-2 bg-[#3F6A52] rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border border-stone-200 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1587049352846-4a222e784d38"
                      alt="Honeycomb construction"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#3F6A52] mb-3">Honey Production Excellence</h3>
                    <p className="text-stone-700 leading-relaxed mb-4">
                      Produce hives that love building honey, focusing on genetics that promote strong honey production and efficient comb building.
                    </p>
                    <div className="flex items-center text-[#3F6A52] font-medium">
                      <span className="text-sm">Premium Quality Focus</span>
                      <div className="ml-2 w-2 h-2 bg-[#3F6A52] rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
          </div>

          {/* Products Coming Soon Section */}
          <div className="mt-16">
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: '#FDF7EB' }}>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🍯</span>
              </div>
              <h2 className="text-3xl font-bold text-stone-800 mb-4">Honey & Bee Products Coming Soon!</h2>
              <p className="text-lg text-stone-600 mb-6 max-w-2xl mx-auto">
                We're currently establishing our hives and working toward our first honey harvest. Our raw, unfiltered honey and other bee products will be available at our farmers market soon.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">Raw Honey</Badge>
                <Badge variant="secondary" className="text-sm">Beeswax</Badge>
                <Badge variant="secondary" className="text-sm">Propolis</Badge>
                <Badge variant="secondary" className="text-sm">Honey Comb</Badge>
              </div>
              <div className="text-sm text-stone-500">
                Check back soon or contact us for updates on our honey availability.
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
