import { useQuery } from "@tanstack/react-query";

export function SheepHero() {
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
            getContentValue("sheep_hero_image") ||
            "https://images.unsplash.com/photo-1563281577-a7be47e20db9"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {getContentValue("sheep_hero_title") || "Katahdin Sheep"}
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl">
          {getContentValue("sheep_hero_subtitle") ||
            "Hardy and naturally shedding sheep known for their excellent mothering abilities and lean meat production"}
        </p>
      </div>
    </div>
  );
}