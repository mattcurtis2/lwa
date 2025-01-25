import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import { useLocation } from "wouter";

export default function FarmInfo() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });
  const [, setLocation] = useLocation();

  const getContent = (key: string) => siteContent?.find(c => c.key === key)?.value;

  const handleCardClick = (redirectUrl: string) => {
    setLocation(redirectUrl);
  };

  return (
    <section id="about-farm" className="py-16 bg-white">
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
          <Card className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col h-full" onClick={() => handleCardClick(getContent("animals_redirect") || "/dogs")}>
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={getContent("animals_image") || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e"} 
                alt="Our Animals"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-4">
                {getContent("animals_title") || "Our Animals"}
              </h3>
              <p className="text-stone-600 mb-6 line-clamp-10 flex-grow">
                {getContent("animals_text") || 
                  "Home to our wonderful Colorado Mountain Dogs and Nigerian Dwarf Goats, raised with love and care in a natural environment."}
              </p>
              <div className="text-center">
                <Button className="w-full">
                  {getContent("animals_button_text") || "Learn More About Our Dogs"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col h-full" onClick={() => handleCardClick(getContent("bakery_redirect") || "/#goats")}>
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={getContent("bakery_image") || "https://images.unsplash.com/photo-1533318087102-b3ad366ed041"} 
                alt="Our Goats"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-4">
                {getContent("bakery_title") || "Our Goats"}
              </h3>
              <p className="text-stone-600 mb-6 line-clamp-10 flex-grow">
                {getContent("bakery_text") || 
                  "Fresh bread and delicious pastries baked daily using traditional methods and the finest ingredients."}
              </p>
              <div className="text-center">
                <Button className="w-full">
                  {getContent("bakery_button_text") || "Learn About Our Goats"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col h-full" onClick={() => handleCardClick(getContent("products_redirect") || "/#market")}>
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={getContent("products_image") || "https://images.unsplash.com/photo-1488459716781-31db52582fe9"} 
                alt="Farm Products"
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="pt-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-4">
                {getContent("products_title") || "Farm Products"}
              </h3>
              <p className="text-stone-600 mb-6 line-clamp-10 flex-grow">
                {getContent("products_text") || 
                  "Fresh, seasonal vegetables and farm products grown with care using sustainable practices."}
              </p>
              <div className="text-center">
                <Button className="w-full">
                  {getContent("products_button_text") || "Visit Our Market"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}