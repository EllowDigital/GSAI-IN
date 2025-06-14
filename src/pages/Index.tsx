
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import FounderSection from "../components/FounderSection";
import ProgramsSection from "../components/ProgramsSection";
import BlogNewsSection from "../components/BlogNewsSection";
import GallerySection from "../components/GallerySection";
import RecognitionAffiliationsSection from "../components/RecognitionAffiliationsSection";
import FaqSection from "../components/FaqSection";
import LocationSection from "../components/LocationSection";
import FooterSection from "../components/FooterSection";

// Main page for Ghatak Sports Academy India™
const Index = () => {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col">
      <HeroSection />
      <AboutSection />
      <FounderSection />
      <ProgramsSection />
      <BlogNewsSection />
      <GallerySection />
      <RecognitionAffiliationsSection />
      <FaqSection />
      <LocationSection />
      <FooterSection />
    </div>
  );
};

export default Index;

