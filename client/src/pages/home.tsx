import Hero from "@/components/sections/hero";
import FarmInfo from "@/components/sections/farm-info";
import Principles from "@/components/sections/principles";
import FeatureCarousel from "@/components/sections/feature-carousel";

export default function Home() {
  return (
    <div className="w-full">
      <Hero />
      <Principles />
      <FarmInfo />
      <FeatureCarousel />
    </div>
  );
}