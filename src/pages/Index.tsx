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
      {/* Advanced SEO with comprehensive optimization */}
      <Seo
        title="Ghatak Sports Academy India™ | Modern Martial Arts, Fitness & Excellence"
        description="Experience world-class martial arts training at Ghatak Sports Academy India™. Modern facilities, expert coaching, and comprehensive programs for all ages and skill levels in Karate, MMA, Boxing, and more."
        canonical="https://ghatakgsai.netlify.app/"
        image="https://ghatakgsai.netlify.app/assets/img/logo.webp"
        imageAlt="Ghatak Sports Academy India Logo - Modern Martial Arts Academy"
        type="website"
        keywords={[
          'martial arts academy',
          'karate classes',
          'MMA training',
          'boxing classes',
          'fitness training',
          'self defense',
          'sports academy India',
          'martial arts coaching',
          'combat sports training',
          'youth sports programs',
        ]}
        category="Sports & Fitness"
        structuredData={[orgStructuredData, faqStructuredData]}
      >
        {/* Additional performance meta tags */}
        <link rel="preload" href="/assets/img/logo.webp" as="image" />
        <meta name="google-site-verification" content="7c06ba0fd23ccdce" />
      </Seo>

      {/* Navbar */}
      <Navbar />

      {/* Main Content with improved semantic structure */}
      <main className="pt-24 sm:pt-28 lg:pt-0 flex-1 flex flex-col gap-0" role="main">
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
