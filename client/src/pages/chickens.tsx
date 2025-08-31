import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import { Badge } from "@/components/ui/badge";

export default function Chickens() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Heritage Chickens - Little Way Acres";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Heritage chicken breeding program at Little Way Acres. Raising colorful hens for farm fresh eggs and breeding for color variety and high production.');
    }
  }, []);

  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section 
        className="relative h-[400px] bg-cover bg-center" 
        style={{
          backgroundImage: getContent("chickens_hero_image") 
            ? `url('${getContent("chickens_hero_image")}')` 
            : "url('https://images.unsplash.com/photo-1548550023-2bdb3c5beed7')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/20" />
        <div className="relative w-full max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              {getContent("chickens_hero_title") || "Heritage Chickens"}
            </h1>
            <p className="text-lg md:text-xl mb-6 drop-shadow-md">
              {getContent("chickens_hero_description") || 
                "Raising heritage breed chickens for colorful eggs and sustainable farming practices"}
            </p>
          </div>
        </div>
      </section>

      {/* Our Purpose Section */}
      <section className="py-16" style={{ backgroundColor: '#FDF7EB' }}>
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#3F6A52] mb-6">
              {getContent("chickens_purpose_title") || "Our Chicken Program"}
            </h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left Side - Content */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                      <span className="text-2xl">🥚</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#3F6A52] mb-2">Fresh Farm Eggs</h3>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Daily collection of fresh, nutritious eggs from our free-range hens for local families and farmers market sales.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                      <span className="text-2xl">🌈</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#3F6A52] mb-2">Color Variety</h3>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Breeding for beautiful color diversity in both our chickens and their eggs, from blue and green to brown and cream.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FDF7EB' }}>
                      <span className="text-2xl">📈</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#3F6A52] mb-2">High Production</h3>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Selecting for hens that consistently lay large quantities of high-quality eggs throughout the year.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="relative">
                <img
                  src={getContent("chickens_purpose_image") || "https://images.unsplash.com/photo-1612170153139-6f881ff067e0"}
                  alt="Heritage chickens foraging"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Goals Section */}
      <section className="py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#3F6A52] mb-4">
              {getContent("chickens_goals_title") || "Our Breeding Goals"}
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              {getContent("chickens_goals_description") || 
                "We're developing a sustainable chicken breeding program that prioritizes health, productivity, and genetic diversity."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Goal 1 */}
            <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                <img
                  src={getContent("chickens_goal1_image") || "https://images.unsplash.com/photo-1607205327669-0962adfd4e1d"}
                  alt="Colorful heritage chicken breeds"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                  {getContent("chickens_goal1_title") || "Heritage Breed Preservation"}
                </h3>
                <p className="text-stone-700 leading-relaxed mb-4">
                  {getContent("chickens_goal1_description") || 
                    "Maintain and expand our collection of heritage chicken breeds, preserving genetic diversity and traditional characteristics for future generations."}
                </p>
                <div className="flex items-center text-[#3F6A52] font-medium">
                  <span className="text-sm">
                    {getContent("chickens_goal1_subtitle") || "Genetic Conservation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal 2 */}
            <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                <img
                  src={getContent("chickens_goal2_image") || "https://images.unsplash.com/photo-1563281577-a7be47e20db9"}
                  alt="Colorful chicken eggs in basket"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                  {getContent("chickens_goal2_title") || "Rainbow Egg Collection"}
                </h3>
                <p className="text-stone-700 leading-relaxed mb-4">
                  {getContent("chickens_goal2_description") || 
                    "Develop flocks that produce eggs in a stunning array of colors - from deep chocolate brown to sky blue and olive green."}
                </p>
                <div className="flex items-center text-[#3F6A52] font-medium">
                  <span className="text-sm">
                    {getContent("chickens_goal2_subtitle") || "Color Diversity"}
                  </span>
                </div>
              </div>
            </div>

            {/* Goal 3 */}
            <div className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video overflow-hidden">
                <img
                  src={getContent("chickens_goal3_image") || "https://images.unsplash.com/photo-1606978334925-5e5c7d36f3aa"}
                  alt="Free-range chickens in pasture"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#3F6A52] mb-3">
                  {getContent("chickens_goal3_title") || "Sustainable Production"}
                </h3>
                <p className="text-stone-700 leading-relaxed mb-4">
                  {getContent("chickens_goal3_description") || 
                    "Breed for consistent, high-volume egg production while maintaining excellent hen health and welfare in free-range conditions."}
                </p>
                <div className="flex items-center text-[#3F6A52] font-medium">
                  <span className="text-sm">
                    {getContent("chickens_goal3_subtitle") || "Productivity & Welfare"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16" style={{ backgroundColor: '#FDF7EB' }}>
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-stone-800 mb-4">
            {getContent("chickens_products_title") || "Farm Fresh Chicken Products"}
          </h2>
          <p className="text-lg text-stone-600 mb-6 max-w-2xl mx-auto">
            {getContent("chickens_products_description") || 
              "Our heritage chickens provide fresh eggs daily and occasional breeding stock for fellow chicken enthusiasts and small farms."}
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="secondary" className="text-sm">
              {getContent("chickens_product_badge1") || "Fresh Eggs"}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {getContent("chickens_product_badge2") || "Heritage Chicks"}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {getContent("chickens_product_badge3") || "Breeding Stock"}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              {getContent("chickens_product_badge4") || "Hatching Eggs"}
            </Badge>
          </div>
          
          <div className="text-sm text-stone-500">
            {getContent("chickens_products_footer") || 
              "Contact us for availability of eggs, chicks, and breeding stock throughout the year."}
          </div>
        </div>
      </section>
    </div>
  );
}