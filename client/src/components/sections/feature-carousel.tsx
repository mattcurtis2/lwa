import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CarouselItem } from "@db/schema";

export default function FeatureCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const { data: slides = [] } = useQuery<CarouselItem[]>({
    queryKey: ["/api/carousel"],
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide) => (
            <div 
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0"
            >
              <div 
                className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center text-center p-4 md:p-6">
                  <div className="max-w-2xl">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-4">
                      {slide.title}
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-white/90">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-12 h-12 md:w-14 md:h-14"
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
      >
        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-12 h-12 md:w-14 md:h-14"
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
      >
        <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
      </Button>
    </div>
  );
}