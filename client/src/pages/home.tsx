import Hero from "@/components/sections/hero";
import FarmInfo from "@/components/sections/farm-info";
import Principles from "@/components/sections/principles";
import FeatureCarousel from "@/components/sections/feature-carousel";
import LitterBanner from "@/components/sections/litter-banner";

export default function Home() {
  return (
    <div className="w-full">
      <LitterBanner />
      <Hero />
      <Principles />
      <FarmInfo />
      <FeatureCarousel />
    </div>
  );
}