
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import ProgramsSection from "../components/ProgramsSection";
import GallerySection from "../components/GallerySection";
import FooterSection from "../components/FooterSection";

// Main page for Ghatak Sports Academy India™
const Index = () => {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col">
      <HeroSection />
      <AboutSection />
      <ProgramsSection />
      <GallerySection />
      <FooterSection />
    </div>
  );
};

export default Index;
