import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  Quote,
  Star,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Seo from '@/components/seo/Seo';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Button } from '@/components/ui/button';
import { ACADEMY_CONTACT_EMAIL } from '@/config/contact';

const pressKitAssets = [
  {
    label: 'GSAI Logo (PNG, transparent)',
    href: '/assets/images/logo.webp',
    icon: ImageIcon,
    type: 'Logo',
  },
  {
    label: 'Social Preview Banner (1200x630)',
    href: '/assets/images/social-preview.png',
    icon: ImageIcon,
    type: 'Banner',
  },
  {
    label: 'Founder Bio & Academy Fact Sheet',
    href:
      'mailto:' +
      ACADEMY_CONTACT_EMAIL +
      '?subject=Press%20Kit%20Request%20-%20Fact%20Sheet',
    icon: FileText,
    type: 'Document',
  },
  {
    label: 'Championship Photo Pack',
    href:
      'mailto:' +
      ACADEMY_CONTACT_EMAIL +
      '?subject=Press%20Kit%20Request%20-%20Photo%20Pack',
    icon: ImageIcon,
    type: 'Photo Pack',
  },
];

const testimonials = [
  {
    name: 'Anjali Verma',
    role: 'Parent — Indira Nagar, Lucknow',
    rating: 5,
    quote:
      'My son joined the Karate program 8 months ago. The discipline, focus and confidence he has developed is incredible. The coaches genuinely care about every child.',
  },
  {
    name: 'Rohan Singh',
    role: 'MMA Student • Age 22',
    rating: 5,
    quote:
      'Best MMA training in Lucknow. Real sparring, structured technique work and supportive teammates. I went from beginner to inter-state competitor in a year.',
  },
  {
    name: 'Priya Sharma',
    role: "Women's Self-Defense Batch",
    rating: 5,
    quote:
      'The women-only self-defense class taught me practical techniques I actually feel confident using. The instructors made every session safe and empowering.',
  },
  {
    name: 'Capt. Aakash R.',
    role: 'Corporate Workshop Client',
    rating: 5,
    quote:
      'We hosted GSAI for a self-defense workshop at our office. Incredibly professional, engaging and tailored to our team. Will book again next year.',
  },
  {
    name: 'Saurabh Mishra',
    role: 'Boxing Student',
    rating: 5,
    quote:
      'World-class boxing coach. Pad work, conditioning, and ring time — everything is structured. I have visibly improved in 3 months.',
  },
  {
    name: 'Mrs. Kapoor',
    role: 'Parent of Taekwondo Student',
    rating: 5,
    quote:
      'The Student Portal keeps us updated on attendance, fees and belt progression. Very modern and transparent operation.',
  },
];

const reviewSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ghatak Sports Academy India',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: testimonials.length.toString(),
    bestRating: '5',
    worstRating: '1',
  },
  review: testimonials.map((t) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: t.name },
    reviewBody: t.quote,
    reviewRating: { '@type': 'Rating', ratingValue: t.rating, bestRating: '5' },
  })),
};

export default function PressPage() {
  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      <Seo
        title="Press Kit & Testimonials | Ghatak Sports Academy India"
        description="Download official press assets, founder bio, championship photos and read verified testimonials from students, parents and corporate clients of GSAI Lucknow."
        canonical="/press"
        keywords={[
          'ghatak sports academy press kit',
          'gsai testimonials',
          'martial arts media lucknow',
        ]}
        structuredData={[reviewSchema]}
      />
      <Navbar />

      <main className="relative pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white mb-8"
          >
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="text-sm font-semibold text-yellow-500 tracking-widest uppercase">
              For Media, Schools & Partners
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-4 bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
              GSAI Press Kit & Testimonials
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Everything journalists, schools, sponsors and corporate partners
              need to feature, partner with or write about Ghatak Sports Academy
              India.
            </p>
          </motion.header>

          {/* Press Kit Downloads */}
          <section aria-labelledby="press-kit-heading" className="mb-16">
            <h2
              id="press-kit-heading"
              className="text-2xl md:text-3xl font-bold text-white mb-6"
            >
              Downloadable Press Kit
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pressKitAssets.map((asset) => {
                const Icon = asset.icon;
                const isMail = asset.href.startsWith('mailto:');
                return (
                  <a
                    key={asset.label}
                    href={asset.href}
                    {...(!isMail
                      ? {
                          download: true,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : {})}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-yellow-500/30 p-5 transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold group-hover:text-yellow-500 truncate">
                        {asset.label}
                      </p>
                      <p className="text-gray-500 text-sm">{asset.type}</p>
                    </div>
                    <Download className="w-5 h-5 text-gray-400 group-hover:text-yellow-500" />
                  </a>
                );
              })}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Need a custom asset, interview or quote? Email{' '}
              <a
                href={`mailto:${ACADEMY_CONTACT_EMAIL}`}
                className="text-yellow-500 hover:text-yellow-400"
              >
                {ACADEMY_CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          {/* Testimonials Gallery */}
          <section aria-labelledby="testimonials-heading" className="mb-16">
            <h2
              id="testimonials-heading"
              className="text-2xl md:text-3xl font-bold text-white mb-6"
            >
              Testimonials Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.figure
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 flex flex-col"
                >
                  <Quote
                    className="w-6 h-6 text-yellow-500 mb-3"
                    aria-hidden="true"
                  />
                  <blockquote className="text-gray-300 text-sm md:text-base leading-relaxed flex-1">
                    "{t.quote}"
                  </blockquote>
                  <div
                    className="flex items-center gap-1 mt-4"
                    aria-label={`${t.rating} out of 5 stars`}
                  >
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 text-yellow-500 fill-yellow-500"
                      />
                    ))}
                  </div>
                  <figcaption className="mt-3">
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </section>

          {/* Press Contact */}
          <section
            aria-labelledby="press-contact"
            className="rounded-2xl bg-gradient-to-br from-yellow-900/20 via-black to-red-900/20 border border-white/10 p-6 md:p-10 text-center"
          >
            <h2
              id="press-contact"
              className="text-2xl md:text-3xl font-bold text-white mb-3"
            >
              Press & Partnership Contact
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Reach out for interviews, school partnerships, corporate workshops
              or sponsorship opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={`mailto:${ACADEMY_CONTACT_EMAIL}?subject=Press%20Enquiry`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Mail className="w-4 h-4" /> Email Press Desk
              </a>
              <a
                href="tel:+916394135988"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                <Phone className="w-4 h-4" /> +91 63941 35988
              </a>
            </div>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
