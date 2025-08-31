
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
          <div className="mb-16">
            <div className="relative flex py-5 items-center mb-8">
              <div className="flex-grow border-t border-gray-200"></div>
              <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Our Purpose</h2>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🍯</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">Honey Production</h3>
                  <p className="text-stone-700 leading-relaxed">
                    To produce pure, raw honey that captures the essence of our local flora and provides natural sweetness for our community.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🌸</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">Pollination</h3>
                  <p className="text-stone-700 leading-relaxed">
                    To pollinate our fruit trees and garden, increasing yields and supporting the biodiversity of our farm ecosystem.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🐝</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-3">Bee Beautiful</h3>
                  <p className="text-stone-700 leading-relaxed">
                    To maintain healthy, thriving bee colonies that add beauty and wonder to our farm while contributing to environmental health.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Goals Section */}
          <div className="mb-16">
            <div className="relative flex py-5 items-center mb-8">
              <div className="flex-grow border-t border-gray-200"></div>
              <h2 className="flex-shrink-0 text-3xl font-semibold px-4">Our Goals</h2>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold text-lg">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Mite Resistance</h3>
                  <p className="text-stone-700 leading-relaxed">
                    Develop and introduce mite-resistant genetics to create stronger, healthier bee colonies that can naturally defend against varroa mites and other pests.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold text-lg">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Winter Hardy Michigan Bees</h3>
                  <p className="text-stone-700 leading-relaxed">
                    Select for winter-hardy traits that allow our bees to thrive in Michigan's harsh winters, reducing losses and building sustainable colonies.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 md:col-span-2 justify-center">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-amber-600 font-bold text-lg">3</span>
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-stone-800 mb-2">Honey Production Excellence</h3>
                  <p className="text-stone-700 leading-relaxed">
                    Produce hives that love building honey, focusing on genetics that promote strong honey production and efficient comb building.
                  </p>
                </div>
              </div>
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
