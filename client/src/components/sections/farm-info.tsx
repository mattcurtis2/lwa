import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";

export default function FarmInfo() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  return (
    <section id="about-farm" className="py-16" style={{ backgroundColor: '#FDF7EB' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            {getContent("about_title") || "About Our Farm"}
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {getContent("mission_text") || 
              "Dedicated to sustainable farming practices and providing the highest quality produce and animal products to our local community."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={getContent("animals_image") || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e"} 
                alt="Our Animals"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">
                {getContent("animals_title") || "Our Animals"}
              </h3>
              <p className="text-stone-600">
                {getContent("animals_text") || 
                  "Home to our wonderful Colorado Mountain Dogs and Nigerian Dwarf Goats, raised with love and care in a natural environment."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={getContent("bakery_image") || "https://images.unsplash.com/photo-1533318087102-b3ad366ed041"} 
                alt="Our Goats"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">
                {getContent("bakery_title") || "Our Goats"}
              </h3>
              <p className="text-stone-600">
                {getContent("bakery_text") || 
                  "Fresh bread and delicious pastries baked daily using traditional methods and the finest ingredients."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={getContent("products_image") || "https://images.unsplash.com/photo-1488459716781-31db52582fe9"} 
                alt="Farm Products"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">
                {getContent("products_title") || "Farm Products"}
              </h3>
              <p className="text-stone-600">
                {getContent("products_text") || 
                  "Fresh, seasonal vegetables and farm products grown with care using sustainable practices."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}