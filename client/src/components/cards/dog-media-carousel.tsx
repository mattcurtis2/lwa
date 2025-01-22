import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DogMedia } from "@db/schema";
import { cn } from "@/lib/utils";

interface DogMediaCarouselProps {
  media: DogMedia[];
  className?: string;
  onSlideChange?: (index: number) => void;
  activeIndex?: number;
}

export default function DogMediaCarousel({ 
  media, 
  className,
  onSlideChange,
  activeIndex: controlledIndex 
}: DogMediaCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);

  const currentIndex = controlledIndex ?? internalIndex;

  if (!media || media.length === 0) return null;

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newIndex = currentIndex === 0 ? media.length - 1 : currentIndex - 1;
    setInternalIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const newIndex = currentIndex === media.length - 1 ? 0 : currentIndex + 1;
    setInternalIndex(newIndex);
    onSlideChange?.(newIndex);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    setInternalIndex(index);
    onSlideChange?.(index);
  };

  const handleMediaClick = (e: React.MouseEvent) => {
    // Only stop propagation if it's a video being clicked
    if ((e.target as HTMLElement).tagName === 'VIDEO') {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const currentMedia = media[currentIndex];

  return (
    <div className={cn("relative aspect-square", className)}>
      {currentMedia.type === 'video' ? (
        <video
          src={currentMedia.url}
          className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
          controls
          loop
          muted
          playsInline
          onClick={handleMediaClick}
        />
      ) : (
        <img
          src={currentMedia.url}
          alt="Dog media"
          className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
        />
      )}

      {media.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {media.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                onClick={(e) => handleDotClick(e, index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}