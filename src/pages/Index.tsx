import Seo from '../components/Seo';
import Navbar from '../components/Navbar';

import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import FounderSection from '../components/FounderSection';
import ProgramsSection from '../components/ProgramsSection';
import CorporateSection from '../components/CorporateSection';
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
    'A multi-sport, martial arts, fitness and self-development academy in Lucknow, India. Structured programs for all ages.',
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
    streetAddress:
      'Badshah kheda, Takrohi Rd, nearby Balaji Chauraha, Indira Nagar',
    addressLocality: 'Lucknow',
    addressRegion: 'Uttar Pradesh',
    postalCode: '226028',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 26.8467,
    longitude: 80.9462,
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

const corporateServiceStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Ghatak Sports Academy India - Corporate Training',
  serviceType: [
    'Corporate Self-Defense',
    'Team Building',
    'Executive Coaching',
  ],
  areaServed: 'Lucknow, Uttar Pradesh, India',
  provider: {
    '@type': 'Organization',
    name: 'Ghatak Sports Academy India',
    url: 'https://ghatakgsai.netlify.app',
  },
  description:
    'Tailored corporate training and workplace safety programs for businesses, MNCs and organisations in Lucknow and surrounding regions.',
};

export default function Index() {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col font-sans antialiased">
      {/* Advanced SEO with comprehensive optimization */}
      <Seo
        title="Ghatak Sports Academy (GSAI) — Martial Arts & Fitness"
        description="Ghatak Sports Academy (GSAI) — world-class martial arts & fitness training in Lucknow (Indira Nagar, Takrohi), Uttar Pradesh, India. Expert coaches and structured programs in karate, MMA, boxing and self‑defense."
        canonical="https://ghatakgsai.netlify.app/"
        image="https://ghatakgsai.netlify.app/assets/img/logo.webp"
        imageAlt="Ghatak Sports Academy India Logo - Modern Martial Arts Academy"
        type="website"
        keywords={[
          'GSAI',
          'Ghatak',
          'Ghatak Sports Academy',
          'Lucknow',
          'Indira Nagar',
          'Takrohi',
          'Uttar Pradesh',
          'martial arts academy',
          'karate classes',
          'MMA training',
          'boxing classes',
          'fitness training',
          'self defense',
          'sports academy India',
          'corporate training',
          'MNC training',
          'corporate self defense',
          'team building',
          'workplace safety',
          'corporate wellness',
        ]}
        category="Sports & Fitness"
        structuredData={[
          orgStructuredData,
          faqStructuredData,
          corporateServiceStructuredData,
        ]}
      >
        {/* Additional performance meta tags */}
        <meta name="google-site-verification" content="7c06ba0fd23ccdce" />
      </Seo>

      {/* Navbar */}
      <Navbar />

      {/* Main Content with improved semantic structure */}
      <main className="flex-1 flex flex-col gap-0" role="main">
        <HeroSection />
        <AboutSection />
        <ProgramsSection />
        {/* <CorporateSection /> */}
        <AchievementSection />
        <FounderSection />
        <GallerySection />
        <TestimonialSection />
        <EventsSection />
        <NewsSection />
        <BlogNewsSection />
        <FaqSection />
        <LocationSection />
        <ContactSection />
        <RecognitionAffiliationsSection />
      </main>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
