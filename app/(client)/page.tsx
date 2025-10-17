import HeroSection from "@/components/sections/HeroSection";
import CarsSection from "@/components/sections/CarsSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import AboutSection from "@/components/sections/AboutSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <div id="cars">
        <CarsSection />
      </div>
      <div id="reviews">
        <ReviewsSection />
      </div>
      <div id="about-us">
        <AboutSection />
      </div>
      <Footer />
    </div>
  );
}