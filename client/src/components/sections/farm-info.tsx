import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { SiteContent } from "@db/schema";
import { Link } from "wouter";

const DEFAULTS = {
  about_title: "What We Offer",
  mission_text:
    "A small family farm and sourdough bakery in West Michigan raising ADGA registered Nigerian Dwarf goats, hens, meat chickens, honey bees, vegetables, fruit, and our beautiful CMDR registered Colorado Mountain Dogs.",
  animals_title: "Colorado Mountain Dogs",
  animals_text:
    "Our exceptional working dogs bred for livestock protection. Known for their gentle nature with family and friends and fierce loyalty in guarding livestock, these magnificent animals are raised with hands-on care and early socialization.",
  animals_image:
    "https://firebasestorage.googleapis.com/v0/b/cmdr-test.firebasestorage.app/o/uploads%2F0816a67f-974c-4749-b4c0-0025b48bcbf3.jpg?alt=media&token=831c56a7-810e-459e-8209-f01fecd9268d",
  animals_button_text: "Learn More",
  animals_redirect: "/dogs",
  bakery_title: "Nigerian Dwarf Goats",
  bakery_text:
    "Our beloved Nigerian Dwarf Goats, known for their friendly personalities and rich milk production. Perfect for small homesteads, they're ADGA registered, health-tested, and raised with love.",
  bakery_image:
    "https://firebasestorage.googleapis.com/v0/b/cmdr-test.firebasestorage.app/o/uploads%2F721202a4-f999-4de1-92b4-dc4aec332199-IMG-2252-1-JPG.jpg?alt=media&token=ea48bf51-e15f-422e-a764-845b14570571",
  bakery_button_text: "Learn More",
  bakery_redirect: "/goats",
  products_title: "Farmers Markets",
  products_text:
    "Learn about our bakery and farm products available at the farmers market. ",
  products_image:
    "https://firebasestorage.googleapis.com/v0/b/cmdr-test.firebasestorage.app/o/uploads%2Fe6e4e6db-b6b5-4a42-bdc5-465627a25688.jpg?alt=media&token=09c7da7c-18b4-4c6a-aac1-0ecbddeb9a89",
  products_button_text: "Learn More",
  products_redirect: "/market",
  sheep_title: "Katahdin Sheep",
  sheep_text:
    "Hardy Katahdin sheep known for their natural shedding coat and excellent meat production, raised with care on our pastures.",
  sheep_image:
    "https://firebasestorage.googleapis.com/v0/b/cmdr-test.firebasestorage.app/o/uploads%2F50a29c90-a91a-4095-acee-a3f20b52f87e-1000005433-jpg.jpg?alt=media&token=3ca2030d-a1bf-474d-81c0-e47d5b6e6090",
  sheep_button_text: "Learn About Our Sheep",
  sheep_redirect: "/sheep",
} as const;

export default function FarmInfo() {
  const { data: siteContent } = useQuery<SiteContent[]>({
    queryKey: ["/api/site-content"],
  });

  const getContent = (key: keyof typeof DEFAULTS) =>
    siteContent?.find(c => c.key === key)?.value || DEFAULTS[key];

  return (
    <section id="about-farm" className="py-16 bg-white">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            {getContent("about_title")}
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {getContent("mission_text")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to={getContent("animals_redirect")}>
            <Card className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col h-full">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={getContent("animals_image")} 
                  alt={getContent("animals_title")}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4">
                  {getContent("animals_title")}
                </h3>
                <p className="text-stone-600 mb-6 line-clamp-10 flex-grow">
                  {getContent("animals_text")}
                </p>
                <div className="text-center">
                  <Button className="w-full">
                    {getContent("animals_button_text")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={getContent("bakery_redirect")}>
            <Card className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col h-full" >
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={getContent("bakery_image")} 
                  alt={getContent("bakery_title")}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4">
                  {getContent("bakery_title")}
                </h3>
                <p className="text-stone-600 mb-6 line-clamp-10 flex-grow">
                  {getContent("bakery_text")}
                </p>
                <div className="text-center">
                  <Button className="w-full">
                    {getContent("bakery_button_text")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={getContent("products_redirect")}>
            <Card className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col h-full">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={getContent("products_image")} 
                  alt={getContent("products_title")}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4">
                  {getContent("products_title")}
                </h3>
                <p className="text-stone-600 mb-6 line-clamp-10 flex-grow">
                  {getContent("products_text")}
                </p>
                <div className="text-center">
                  <Button className="w-full">
                    {getContent("products_button_text")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={getContent("sheep_redirect")}>
            <Card className="cursor-pointer transition-transform hover:scale-[1.02] flex flex-col h-full">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={getContent("sheep_image")} 
                  alt={getContent("sheep_title")}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-4">
                  {getContent("sheep_title")}
                </h3>
                <p className="text-stone-600 mb-6 line-clamp-10 flex-grow">
                  {getContent("sheep_text")}
                </p>
                <div className="text-center">
                  <Button className="w-full">
                    {getContent("sheep_button_text")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  );
}
