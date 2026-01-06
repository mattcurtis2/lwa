
import { useQuery } from "@tanstack/react-query";

export function DogHero() {
  const { data: siteContent = [] } = useQuery({
    queryKey: ["/api/site-content"],
  });

  const getContentValue = (key: string) => {
    return siteContent.find((item: any) => item.key === key)?.value || "";
  };

  const heroImage = getContentValue("dog_hero_image") || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e";

  return (
    <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      <img
        src={heroImage}
        alt="Colorado Mountain Dogs at Little Way Acres"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#3F6A52]/30 via-[#3F6A52]/20 to-[#3F6A52]/10" />
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-1 drop-shadow-lg">
          {getContentValue("dog_hero_title") || "Colorado Mountain Dogs"}
        </h1>
        {getContentValue("dog_hero_tagline") && (
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold max-w-2xl drop-shadow-md mb-2">
            {getContentValue("dog_hero_tagline")}
          </p>
        )}
        <p className="text-xl md:text-2xl max-w-2xl drop-shadow-md">
          {getContentValue("dog_hero_subtitle") ||
            "Loyal guardians bred for livestock protection, combining strength with gentle temperament"}
        </p>
      </div>
    </div>
  );
}
