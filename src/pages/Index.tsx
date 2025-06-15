import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import AboutSection from "../components/AboutSection";
import FounderSection from "../components/FounderSection";
import ProgramsSection from "../components/ProgramsSection";
import EventsSection from "../components/EventsSection";
import NewsSection from "../components/NewsSection";
import BlogNewsSection from "../components/BlogNewsSection";
import GallerySection from "../components/GallerySection";
import RecognitionAffiliationsSection from "../components/RecognitionAffiliationsSection";
import FaqSection from "../components/FaqSection";
import LocationSection from "../components/LocationSection";
import FooterSection from "../components/FooterSection";

// Main page for Ghatak Sports Academy India™
const Index = () => {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col font-montserrat">
      {/* Sticky Navbar */}
      <Navbar />

      <main className="pt-16 md:pt-20 flex-1 flex flex-col gap-0">
        {/* Hero / Landing Banner */}
        <HeroSection />

        {/* About Academy */}
        <AboutSection />

        {/* Founder Story */}
        <FounderSection />

        {/* Training Programs */}
        <ProgramsSection />

        {/* Upcoming Events */}
        <EventsSection />

        {/* Latest News */}
        <NewsSection />

        {/* Blog Articles or Updates */}
        <BlogNewsSection />

        {/* Academy Photo Gallery */}
        <GallerySection />

        {/* Frequently Asked Questions */}
        <FaqSection />

        {/* Academy Location */}
        <LocationSection />

        {/* Recognitions and Affiliations */}
        <RecognitionAffiliationsSection />
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Index;
