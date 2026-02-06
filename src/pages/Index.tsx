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
  url: 'https://ghataksportsacademy.com/',
  logo: {
    '@type': 'ImageObject',
    url: 'https://ghataksportsacademy.com/assets/img/logo.webp',
    width: 512,
    height: 512,
  },
  image: {
    '@type': 'ImageObject',
    url: 'https://ghataksportsacademy.com/assets/img/social-preview.png',
    width: 1200,
    height: 630,
  },
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
    'https://instagram.com/ghataksportsacademy',
    'https://facebook.com/ghataksportsacademy',
    'https://x.com/ghataksportsacademy',
    'https://www.linkedin.com/company/ghataksportsacademy',
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
    url: 'https://ghataksportsacademy.com',
  },
  description:
    'Tailored corporate training and workplace safety programs for businesses, MNCs and organisations in Lucknow and surrounding regions.',
};

const localBusinessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: 'Ghatak Sports Academy India',
  url: 'https://ghataksportsacademy.com/',
  image: {
    '@type': 'ImageObject',
    url: 'https://ghataksportsacademy.com/assets/img/logo.webp',
    width: 512,
    height: 512,
    caption: 'Ghatak Sports Academy India Logo',
  },
  telephone: '+91 63941 35988',
  email: 'ghatakgsai@gmail.com',
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, UPI, Card',
  foundingDate: '2025-03',
  slogan: 'Building Champions Through Martial Arts Excellence',
  hasMap:
    'https://www.google.com/maps/place/Ghatak+Sports+Academy+India/@26.9051619,81.0177244,17z/data=!3m1!4b1!4m6!3m5!1s0x3999596def6ea9c7:0x23d2ceb539bff92!8m2!3d26.9051619!4d81.0177244!16s%2Fg%2F11x2gs6twk?entry=ttu&g_ep=EgoyMDI2MDIwMy4wIKXMDSoASAFQAw%3D%3D8Fc6E6tovpfXWZw',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '104',
  },
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
  areaServed: [
    {
      '@type': 'City',
      name: 'Lucknow',
      containedInPlace: {
        '@type': 'State',
        name: 'Uttar Pradesh',
      },
    },
    {
      '@type': 'City',
      name: 'Gorakhpur',
      containedInPlace: {
        '@type': 'State',
        name: 'Uttar Pradesh',
      },
    },
    {
      '@type': 'City',
      name: 'Delhi',
    },
    {
      '@type': 'City',
      name: 'Mumbai',
    },
    {
      '@type': 'City',
      name: 'Bangalore',
    },
    {
      '@type': 'City',
      name: 'Hyderabad',
    },
    {
      '@type': 'City',
      name: 'Chennai',
    },
    {
      '@type': 'City',
      name: 'Kolkata',
    },
    {
      '@type': 'City',
      name: 'Pune',
    },
    {
      '@type': 'City',
      name: 'Jaipur',
    },
    {
      '@type': 'City',
      name: 'Ahmedabad',
    },
    {
      '@type': 'City',
      name: 'Surat',
    },
    {
      '@type': 'City',
      name: 'Kanpur',
    },
    {
      '@type': 'City',
      name: 'Varanasi',
    },
    {
      '@type': 'State',
      name: 'Uttar Pradesh',
    },
    {
      '@type': 'Country',
      name: 'India',
    },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '16:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday'],
      opens: '07:00',
      closes: '11:00',
    },
  ],
  knowsAbout: [
    'Karate',
    'Taekwondo',
    'MMA',
    'Boxing',
    'Kickboxing',
    'Grappling',
    'Kalaripayattu',
    'Self-Defense',
    'Fitness',
  ],
  sameAs: [
    'https://instagram.com/ghataksportsacademy',
    'https://facebook.com/ghataksportsacademy',
    'https://x.com/ghataksportsacademy',
    'https://www.linkedin.com/company/ghataksportsacademy',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Training Programs',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Karate Classes' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Taekwondo Classes' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'MMA Training' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Boxing Training' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Kickboxing Classes' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Self-Defense Training' },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Fitness and Conditioning' },
      },
    ],
  },
};

const reviewStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ghatak Sports Academy India',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '104',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Student Parent',
      },
      datePublished: '2025-12-01',
      reviewBody:
        'Excellent martial arts training with professional coaches. My child has gained tremendous confidence and discipline.',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
    },
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Adult Student',
      },
      datePublished: '2025-11-15',
      reviewBody:
        'Best martial arts academy in Lucknow. Great facilities and experienced instructors who genuinely care about student progress.',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
    },
  ],
};

const videoStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Ghatak Sports Academy India - Training Introduction',
  description:
    'Watch our introductory video showcasing martial arts training, facilities, and student achievements at Ghatak Sports Academy India in Lucknow.',
  thumbnailUrl: 'https://ghataksportsacademy.com/assets/img/logo.webp',
  uploadDate: '2025-03-01',
  contentUrl: 'https://ghataksportsacademy.com/assets/slider/intro.mp4',
  embedUrl: 'https://ghataksportsacademy.com/',
};

const programStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Ghatak Sports Academy India Programs',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'Service',
        name: 'Karate',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 2,
      item: {
        '@type': 'Service',
        name: 'Taekwondo',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 3,
      item: {
        '@type': 'Service',
        name: 'Boxing',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 4,
      item: {
        '@type': 'Service',
        name: 'Kickboxing',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 5,
      item: {
        '@type': 'Service',
        name: 'Grappling',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 6,
      item: {
        '@type': 'Service',
        name: 'MMA',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 7,
      item: {
        '@type': 'Service',
        name: 'Kalaripayattu',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 8,
      item: {
        '@type': 'Service',
        name: 'Self-Defense',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
    {
      '@type': 'ListItem',
      position: 9,
      item: {
        '@type': 'Service',
        name: 'Fat Loss',
        areaServed: 'Lucknow, Uttar Pradesh, India',
        provider: {
          '@type': 'Organization',
          name: 'Ghatak Sports Academy India',
          url: 'https://ghataksportsacademy.com',
        },
      },
    },
  ],
};

export default function Index() {
  return (
    <div className="bg-background w-full min-h-screen flex flex-col font-sans antialiased">
      {/* Advanced SEO with comprehensive optimization */}
      <Seo
        title="Best Martial Arts Academy in Lucknow | Karate, MMA, Boxing Training - Ghatak Sports Academy India"
        description="Join India's premier martial arts academy in Lucknow. Expert training in Karate, Taekwondo, MMA, Boxing, Kickboxing & Self-Defense for all ages. Professional coaches, world-class facilities. Start your fitness journey today!"
        canonical="/"
        image="/assets/img/logo.webp"
        imageAlt="Ghatak Sports Academy India Logo - Modern Martial Arts Academy"
        type="website"
        keywords={[
          'GSAI',
          'Ghatak',
          'Ghatak Sports Academy',
          'Ghatak Sports Academy India',
          'martial arts academy India',
          'martial arts training India',
          'best martial arts academy lucknow',
          'top karate classes lucknow indira nagar',
          'professional taekwondo training lucknow uttar pradesh',
          'best mma training center lucknow near me',
          'boxing classes for beginners lucknow',
          'kickboxing training lucknow women men kids',
          'self defense classes for girls women lucknow',
          'affordable martial arts training india',
          'best sports academy uttar pradesh',
          'ghatak sports academy india reviews',
          'martial arts school near me lucknow',
          'kids karate classes lucknow age 5-15',
          'adult martial arts training lucknow evening',
          'certified professional martial arts instructors lucknow',
          'martial arts fitness weight loss lucknow',
          'best combat sports training center india',
          'women self defense training near indira nagar',
          'karate taekwondo mma classes badshah kheda',
          'boxing gym lucknow takrohi road',
          'martial arts academy near gomti nagar',
          'sports training center indira nagar lucknow',
          'kickboxing classes lucknow morning evening',
          'taekwondo classes kids adults lucknow',
          'self defense training women lucknow uttar pradesh',
          'martial arts gorakhpur uttar pradesh',
          'karate training gorakhpur eastern up',
          'best martial arts uttar pradesh india',
          'sports academy lucknow ranking top',
          'professional martial arts india international',
          'beginner martial arts classes lucknow',
          'advanced mma training lucknow',
          'grappling jiu jitsu classes lucknow',
          'kalaripayattu indian martial arts lucknow',
          'fat loss fitness program lucknow gym',
          'combat sports fitness training india',
          'martial arts delhi mumbai bangalore',
          'karate classes delhi ncr up bihar',
          'mma training mumbai pune bangalore',
          'boxing kickboxing hyderabad chennai',
          'self defense training indian cities',
          'martial arts academy pan india',
          'sports training center north india',
          'combat sports eastern india',
          'martial arts western india gujarat',
          'karate taekwondo south india',
          'best martial arts school india worldwide',
          'international martial arts training india',
          'olympic martial arts training lucknow',
          'competitive martial arts india championships',
          'Lucknow',
          'Indira Nagar',
          'Takrohi',
          'Uttar Pradesh',
          'Gorakhpur',
          'India',
          'martial arts academy',
          'karate classes',
          'MMA training',
          'boxing classes',
          'fitness training',
          'self defense',
          'kickboxing classes',
          'grappling training',
          'kalaripayattu training',
          'fat loss program',
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
          localBusinessStructuredData,
          programStructuredData,
          reviewStructuredData,
          videoStructuredData,
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
