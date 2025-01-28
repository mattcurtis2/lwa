import { useQuery } from "@tanstack/react-query";

export function GoatHero() {
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
            getContentValue("goat_hero_image") ||
            "https://images.unsplash.com/photo-1533318087102-b3ad366ed041"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {getContentValue("goats_hero_title") || "Nigerian Dwarf Goats"}
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl">
          {getContentValue("goats_hero_subtitle") ||
            "Exceptional dairy goats known for their gentle nature and rich milk production"}
        </p>
      </div>
    </div>
  );
}
