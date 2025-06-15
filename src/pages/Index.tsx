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
import ContactSection from "../components/ContactSection";
import Seo from "../components/Seo";

// Organization Structured Data for homepage rich snippet
const orgStructuredData = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": "Ghatak Sports Academy India",
  "alternateName": "GSAI",
  "url": "https://ghatakgsai.netlify.app/",
  "logo": "https://ghatakgsai.netlify.app/assets/img/logo.webp",
  "description": "A multi-sport, martial arts, fitness and self-development academy in India. Programs for all ages.",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+91 63941 35988",
      "contactType": "customer service",
      "email": "ghatakgsai@gmail.com"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "sameAs": [
    "https://instagram.com/ghatakgsai",
    "https://facebook.com/ghatakgsai"
  ]
};

export default function Index() {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col font-montserrat">
      {/* SEO: Title, meta, canonical, JSON-LD. */}
      <Seo
        title="Ghatak Sports Academy India™ | Martial Arts, Fitness & Personal Excellence"
        description="Join Ghatak Sports Academy India™ for world-class martial arts, fitness, and self-development programs. Explore training, events, latest news and a vibrant sports community."
        canonical="https://ghatakgsai.netlify.app/"
        image="https://ghatakgsai.netlify.app/assets/img/logo.webp"
        structuredData={[
          orgStructuredData
        ]}
      />
      {/* Sticky Navbar */}
      <Navbar />
      <main className="pt-16 md:pt-20 flex-1 flex flex-col gap-0">
        {/* Use semantic sections and proper heading order (SEO best practice) */}
        <HeroSection />
        <AboutSection />
        <FounderSection />
        <ProgramsSection />
        <EventsSection />
        <NewsSection />
        <BlogNewsSection />
        <GallerySection />
        <FaqSection />
        <ContactSection />
        <LocationSection />
        <RecognitionAffiliationsSection />
      </main>
      <FooterSection />
    </div>
  );
}
