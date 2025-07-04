import Seo from '../components/Seo';
import Navbar from '../components/Navbar';

import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import FounderSection from '../components/FounderSection';
import ProgramsSection from '../components/ProgramsSection';
import AchievementSection from '../components/AchievementSection';
import TestimonialSection from '../components/TestimonialSection';

import EventsSection from '../components/EventsSection';
import GallerySection from '../components/GallerySection';

import NewsSection from '../components/NewsSection';
import BlogNewsSection from '../components/BlogNewsSection';

import FaqSection, { faqs as faqData } from '../components/FaqSection';
import ContactSection from '../components/ContactSection';
import LocationSection from '../components/LocationSection';

import RecognitionAffiliationsSection from '../components/RecognitionAffiliationsSection';
import FooterSection from '../components/FooterSection';

// Structured data for SEO rich snippets
const orgStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SportsOrganization',
  name: 'Ghatak Sports Academy India',
  alternateName: 'GSAI',
  url: 'https://ghatakgsai.netlify.app/',
  logo: 'https://ghatakgsai.netlify.app/assets/img/logo.webp',
  description:
    'A multi-sport, martial arts, fitness and self-development academy in India. Programs for all ages.',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+91 63941 35988',
      contactType: 'customer service',
      email: 'ghatakgsai@gmail.com',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://instagram.com/ghatakgsai',
    'https://facebook.com/ghatakgsai',
  ],
};

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function Index() {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col font-sans antialiased">
      {/* SEO Meta Tags & Structured Data */}
      <Seo
        title="Ghatak Sports Academy India™ | Modern Martial Arts, Fitness & Excellence"
        description="Experience world-class martial arts training at Ghatak Sports Academy India™. Modern facilities, expert coaching, and comprehensive programs for all ages and skill levels."
        canonical="https://ghatakgsai.netlify.app/"
        image="https://ghatakgsai.netlify.app/assets/img/logo.webp"
        structuredData={[orgStructuredData, faqStructuredData]}
      />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-16 md:pt-20 flex-1 flex flex-col gap-0">
        <HeroSection />
        <AboutSection />
        <FounderSection />
        <ProgramsSection />
        <AchievementSection />
        <TestimonialSection />
        <EventsSection />
        <GallerySection />
        <NewsSection />
        <BlogNewsSection />
        <FaqSection />
        <ContactSection />
        <LocationSection />
        <RecognitionAffiliationsSection />
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
