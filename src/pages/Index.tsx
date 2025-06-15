import Navbar from "../components/Navbar";
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
import NewsSection from "../components/NewsSection";
import EventsSection from "../components/EventsSection";

// Main page for Ghatak Sports Academy India™
const Index = () => {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col font-montserrat">
      <Navbar />
      <main className="pt-16 md:pt-20 flex-1 flex flex-col gap-0">
        <HeroSection />
        <EventsSection />
        <AboutSection />
        <FounderSection />
        <ProgramsSection />
        <NewsSection />
        <BlogNewsSection />
        <GallerySection />
        <FaqSection />
        <LocationSection />
        <RecognitionAffiliationsSection />
      </main>
      <FooterSection />
    </div>
  );
};

export default Index;
