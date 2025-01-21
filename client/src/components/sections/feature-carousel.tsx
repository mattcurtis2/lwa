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

  // Auto-rotation setup
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    // Stop autoplay on user interaction
    const onPointerDown = () => {
      clearInterval(autoplay);
    };

    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on("select", onSelect);

    return () => {
      clearInterval(autoplay);
      if (emblaApi) {
        emblaApi.off('pointerDown', onPointerDown);
        emblaApi.off("select", onSelect);
      }
    };
  }, [emblaApi, onSelect]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide) => (
            <div 
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0"
            >
              <div 
                className="relative h-[350px] md:h-[450px] lg:h-[550px] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex items-center justify-center text-center p-4 md:p-6">
                  <div className="max-w-2xl">
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-4">
                      {slide.title}
                    </h2>
                    <p className="text-sm md:text-lg lg:text-xl text-white/90 max-w-lg mx-auto">
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
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 md:w-12 md:h-12"
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-10 h-10 md:w-12 md:h-12"
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </Button>
    </div>
  );
}