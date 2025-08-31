
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

  // Hero Section Content
  const heroTitle = getContentValue("bees_hero_title", "Our Bees");
  const beeDescription = getContentValue(
    "bees_page_description", 
    "Our beekeeping program focuses on developing mite-resistant, winter-hardy Michigan bees while producing high-quality honey and supporting our farm's pollination needs."
  );
  const beeImage = getContentValue(
    "bees_image",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64"
  );

  // Purpose Section Content
  const purposeTitle = getContentValue("bees_purpose_title", "Our Purpose");
  const purposeImage = getContentValue("bees_purpose_image", "https://images.unsplash.com/photo-1471943311424-646960669fbc");
  
  // Purpose Items
  const honeyTitle = getContentValue("bees_honey_title", "Honey Production");
  const honeyIcon = getContentValue("bees_honey_icon", "🍯");
  const honeyDescription = getContentValue("bees_honey_description", "To produce pure, raw honey that captures the essence of our local flora and provides natural sweetness for our community.");
  
  const pollinationTitle = getContentValue("bees_pollination_title", "Pollination Support");
  const pollinationIcon = getContentValue("bees_pollination_icon", "🌸");
  const pollinationDescription = getContentValue("bees_pollination_description", "To pollinate our fruit trees and garden, increasing yields and supporting the biodiversity of our farm ecosystem.");
  
  const beautifulTitle = getContentValue("bees_beautiful_title", "Bee Beautiful");
  const beautifulIcon = getContentValue("bees_beautiful_icon", "🐝");
  const beautifulDescription = getContentValue("bees_beautiful_description", "To maintain healthy, thriving bee colonies that add beauty and wonder to our farm while contributing to environmental health.");

  // Goals Section Content
  const goalsTitle = getContentValue("bees_goals_title", "Our Beekeeping Goals");
  const goalsDescription = getContentValue("bees_goals_description", "We're committed to developing sustainable, resilient bee colonies that thrive in Michigan's climate.");
  
  // Goal 1
  const goal1Title = getContentValue("bees_goal1_title", "Mite Resistance Development");
  const goal1Subtitle = getContentValue("bees_goal1_subtitle", "Building Natural Immunity");
  const goal1Description = getContentValue("bees_goal1_description", "Develop and introduce mite-resistant genetics to create stronger, healthier bee colonies that can naturally defend against varroa mites and other pests.");
  const goal1Image = getContentValue("bees_goal1_image", "https://images.unsplash.com/photo-1558618047-b0c8cdda7b9b");
  
  // Goal 2
  const goal2Title = getContentValue("bees_goal2_title", "Winter Hardy Michigan Bees");
  const goal2Subtitle = getContentValue("bees_goal2_subtitle", "Cold Climate Adaptation");
  const goal2Description = getContentValue("bees_goal2_description", "Select for winter-hardy traits that allow our bees to thrive in Michigan's harsh winters, reducing losses and building sustainable colonies.");
  const goal2Image = getContentValue("bees_goal2_image", "https://images.unsplash.com/photo-1547036967-23d11aacaee0");
  
  // Goal 3
  const goal3Title = getContentValue("bees_goal3_title", "Honey Production Excellence");
  const goal3Subtitle = getContentValue("bees_goal3_subtitle", "Premium Quality Focus");
  const goal3Description = getContentValue("bees_goal3_description", "Produce hives that love building honey, focusing on genetics that promote strong honey production and efficient comb building.");
  const goal3Image = getContentValue("bees_goal3_image", "https://images.unsplash.com/photo-1587049352846-4a222e784d38");
  
  // Products Section Content
  const productsTitle = getContentValue("bees_products_title", "Honey & Bee Products Coming Soon!");
  const productsDescription = getContentValue("bees_products_description", "We're currently establishing our hives and working toward our first honey harvest. Our raw, unfiltered honey and other bee products will be available at our farmers market soon.");
  const productsFooter = getContentValue("bees_products_footer", "Check back soon or contact us for updates on our honey availability.");
  
  // Product Badges
  const productBadge1 = getContentValue("bees_product_badge_1", "Raw Honey");
  const productBadge2 = getContentValue("bees_product_badge_2", "Beeswax");
  const productBadge3 = getContentValue("bees_product_badge_3", "Propolis");
  const productBadge4 = getContentValue("bees_product_badge_4", "Honey Comb");

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
            {heroTitle}
          </h1>
          <p className="text-xl md:text-2xl leading-relaxed opacity-95">
            {beeDescription}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-0" style={{ backgroundColor: '#FDF7EB' }}>
        {/* Purpose Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3F6A52] mb-6">{purposeTitle}</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side - Content */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{honeyIcon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">{honeyTitle}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {honeyDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{pollinationIcon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">{pollinationTitle}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {pollinationDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                        <span className="text-2xl">{beautifulIcon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#3F6A52] mb-2">{beautifulTitle}</h3>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {beautifulDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Image */}
                <div className="relative h-80 md:h-auto">
                  <img
                    src={purposeImage}
                    alt="Beekeeper working with hives"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#3F6A52] mb-4">{goalsTitle}</h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                {goalsDescription}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <Card className="group hover:shadow-xl transition-all duration-300 border border-stone-200 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={goal1Image}
                      alt="Healthy bee colony"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#3F6A52] mb-3">{goal1Title}</h3>
                    <p className="text-stone-700 leading-relaxed mb-4">
                      {goal1Description}
                    </p>
                    <div className="flex items-center text-[#3F6A52] font-medium">
                      <span className="text-sm">{goal1Subtitle}</span>
                      <div className="ml-2 w-2 h-2 bg-[#3F6A52] rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border border-stone-200 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={goal2Image}
                      alt="Winter beehive in snow"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#3F6A52] mb-3">{goal2Title}</h3>
                    <p className="text-stone-700 leading-relaxed mb-4">
                      {goal2Description}
                    </p>
                    <div className="flex items-center text-[#3F6A52] font-medium">
                      <span className="text-sm">{goal2Subtitle}</span>
                      <div className="ml-2 w-2 h-2 bg-[#3F6A52] rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border border-stone-200 shadow-lg" style={{ backgroundColor: '#FDF7EB' }}>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={goal3Image}
                      alt="Honeycomb construction"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 to-transparent"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#3F6A52] mb-3">{goal3Title}</h3>
                    <p className="text-stone-700 leading-relaxed mb-4">
                      {goal3Description}
                    </p>
                    <div className="flex items-center text-[#3F6A52] font-medium">
                      <span className="text-sm">{goal3Subtitle}</span>
                      <div className="ml-2 w-2 h-2 bg-[#3F6A52] rounded-full animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Products Coming Soon Section */}
      <section className="py-16" style={{ backgroundColor: '#FDF7EB' }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🍯</span>
            </div>
            <h2 className="text-3xl font-bold text-stone-800 mb-4">{productsTitle}</h2>
            <p className="text-lg text-stone-600 mb-6 max-w-2xl mx-auto">
              {productsDescription}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="secondary" className="text-sm">{productBadge1}</Badge>
              <Badge variant="secondary" className="text-sm">{productBadge2}</Badge>
              <Badge variant="secondary" className="text-sm">{productBadge3}</Badge>
              <Badge variant="secondary" className="text-sm">{productBadge4}</Badge>
            </div>
            <div className="text-sm text-stone-500">
              {productsFooter}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
