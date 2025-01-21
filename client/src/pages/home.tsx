import Hero from "@/components/sections/hero";
import FarmInfo from "@/components/sections/farm-info";
import FeatureCarousel from "@/components/sections/feature-carousel";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <FarmInfo />
      <FeatureCarousel />
    </div>
  );
}