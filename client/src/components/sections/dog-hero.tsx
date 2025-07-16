
import { useQuery } from "@tanstack/react-query";

export function DogHero() {
  const { data: siteContent = [] } = useQuery({
    queryKey: ["/api/site-content"],
  });

  const getContentValue = (key: string) => {
    return siteContent.find((item: any) => item.key === key)?.value || "";
  };

  return (
    <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            getContentValue("dog_hero_image") ||
            "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10" />
      </div>
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
          {getContentValue("dog_hero_title") || "Colorado Mountain Dogs"}
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl drop-shadow-md">
          {getContentValue("dog_hero_subtitle") ||
            "Loyal guardians bred for livestock protection, combining strength with gentle temperament"}
        </p>
      </div>
    </div>
  );
}
