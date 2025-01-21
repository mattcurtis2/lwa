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
        <h2 className="text-4xl font-bold text-center mb-12">
          {getContent("about_title") || "About Our Farm"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">
                {getContent("mission_title") || "Our Mission"}
              </h3>
              <p className="text-stone-600">
                {getContent("mission_text") || 
                  "Dedicated to sustainable farming practices and providing the highest quality produce and animal products to our local community."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">
                {getContent("animals_title") || "The Animals"}
              </h3>
              <p className="text-stone-600">
                {getContent("animals_text") || 
                  "Home to our wonderful Colorado Mountain Dogs and Nigerian Dwarf Goats, raised with love and care in a natural environment."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">
                {getContent("market_title") || "Farmers Market"}
              </h3>
              <p className="text-stone-600">
                {getContent("market_text") || 
                  "Fresh bread, pastries, and seasonal vegetables grown and prepared right here on our farm."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}