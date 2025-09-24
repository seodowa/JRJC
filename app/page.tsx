import HeroSection from "@/components/sections/HeroSection";
import CarsSection from "@/components/sections/CarsSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <CarsSection />
    </div>
  );
}
