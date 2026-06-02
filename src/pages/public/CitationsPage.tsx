import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Seo from '@/components/seo/Seo';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Button } from '@/components/ui/button';
import { ACADEMY_CONTACT_EMAIL } from '@/config/contact';

// Canonical NAP (Name, Address, Phone) — must stay consistent everywhere
const NAP = {
  name: 'Ghatak Sports Academy India™',
  address:
    'Badshah Kheda, Takrohi Road, near Balaji Chauraha, Indira Nagar, Lucknow, Uttar Pradesh 226028, India',
  phone: '+91 63941 35988',
  altPhone: '+91 83550 62424',
  email: ACADEMY_CONTACT_EMAIL,
  website: 'https://ghataksportsacademy.com',
  hours: 'Mon–Sat 4:00 PM – 8:00 PM • Sun 7:00 AM – 11:00 AM',
};

type Citation = {
  name: string;
  url: string;
  category:
    | 'Map / Search'
    | 'Business Directory'
    | 'Sports Directory'
    | 'Social Profile';
  verified?: boolean;
};

const citations: Citation[] = [
  {
    name: 'Google Business Profile',
    url: 'https://g.co/kgs/ghataksportsacademy',
    category: 'Map / Search',
    verified: true,
  },
  {
    name: 'Bing Places for Business',
    url: 'https://www.bing.com/maps?q=Ghatak+Sports+Academy+India+Lucknow',
    category: 'Map / Search',
  },
  {
    name: 'Apple Maps',
    url: 'https://maps.apple.com/?q=Ghatak+Sports+Academy+India+Lucknow',
    category: 'Map / Search',
  },
  {
    name: 'JustDial',
    url: 'https://www.justdial.com/Lucknow/Ghatak-Sports-Academy-India',
    category: 'Business Directory',
  },
  {
    name: 'Sulekha Lucknow',
    url: 'https://www.sulekha.com/martial-arts-classes/lucknow',
    category: 'Business Directory',
  },
  {
    name: 'IndiaMART',
    url: 'https://www.indiamart.com/ghatak-sports-academy-india/',
    category: 'Business Directory',
  },
  {
    name: 'UrbanPro',
    url: 'https://www.urbanpro.com/lucknow/ghatak-sports-academy-india',
    category: 'Business Directory',
  },
  {
    name: 'Yellow Pages India',
    url: 'https://www.yellowpages.in/lucknow/ghatak-sports-academy',
    category: 'Business Directory',
  },
  {
    name: 'Foursquare',
    url: 'https://foursquare.com/v/ghatak-sports-academy-india/lucknow',
    category: 'Business Directory',
  },
  {
    name: 'Yelp India',
    url: 'https://www.yelp.com/biz/ghatak-sports-academy-india-lucknow',
    category: 'Business Directory',
  },
  {
    name: 'Sportskeeda Profile',
    url: 'https://www.sportskeeda.com/',
    category: 'Sports Directory',
  },
  {
    name: 'Khelo India Center Listing',
    url: 'https://kheloindia.gov.in/',
    category: 'Sports Directory',
  },
  {
    name: 'Karate India Organization',
    url: 'https://www.karateindia.org/',
    category: 'Sports Directory',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/ghataksportsacademy',
    category: 'Social Profile',
    verified: true,
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/ghataksportsacademy',
    category: 'Social Profile',
    verified: true,
  },
  {
    name: 'X / Twitter',
    url: 'https://x.com/ghataksportsacademy',
    category: 'Social Profile',
    verified: true,
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/ghataksportsacademy',
    category: 'Social Profile',
    verified: true,
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@ghataksportsacademy',
    category: 'Social Profile',
  },
];

const grouped = citations.reduce<Record<string, Citation[]>>((acc, c) => {
  (acc[c.category] = acc[c.category] || []).push(c);
  return acc;
}, {});

const napStructured = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${NAP.website}/#organization`,
  name: NAP.name,
  image: `${NAP.website}/assets/images/social-preview.png`,
  logo: `${NAP.website}/assets/images/logo.webp`,
  address: {
    '@type': 'PostalAddress',
    streetAddress:
      'Badshah Kheda, Takrohi Road, near Balaji Chauraha, Indira Nagar',
    addressLocality: 'Lucknow',
    addressRegion: 'Uttar Pradesh',
    postalCode: '226028',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 26.8924,
    longitude: 81.0086,
  },
  telephone: NAP.phone,
  email: NAP.email,
  url: NAP.website,
  priceRange: '₹₹',
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
      dayOfWeek: 'Sunday',
      opens: '07:00',
      closes: '11:00',
    },
  ],
  sameAs: citations.map((c) => c.url),
};

export default function CitationsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-montserrat">
      <Seo
        title="Verified Citations & Listings | Ghatak Sports Academy India"
        description="Official directory listings and verified business citations for Ghatak Sports Academy India in Lucknow. Consistent NAP details for local SEO."
        canonical="/citations"
        keywords={[
          'ghatak sports academy citations',
          'gsai listings',
          'lucknow martial arts directory',
        ]}
        structuredData={[napStructured]}
      />
      <Navbar />

      <main className="relative pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-10 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
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
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-yellow-500 tracking-widest uppercase">
              Local SEO • Verified Listings
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-4 bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent">
              Citations & Directory Listings
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
              Our verified presence across business directories, map services
              and sports listings. Use the canonical NAP details below when
              citing or linking to us.
            </p>
          </motion.header>

          {/* Canonical NAP card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            aria-labelledby="nap-heading"
            className="rounded-2xl bg-gradient-to-br from-yellow-900/20 via-black to-red-900/20 border border-white/10 p-6 md:p-8 mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-yellow-500" />
              <h2
                id="nap-heading"
                className="text-xl md:text-2xl font-bold text-white"
              >
                Official NAP — Use Exactly As Shown
              </h2>
            </div>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
              <div>
                <dt className="text-gray-500 mb-1">Business Name</dt>
                <dd className="text-white font-semibold">{NAP.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Address
                </dt>
                <dd className="text-white">{NAP.address}</dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4" /> Phone
                </dt>
                <dd className="text-white">
                  <a
                    href={`tel:${NAP.phone.replace(/\s/g, '')}`}
                    className="hover:text-yellow-500"
                  >
                    {NAP.phone}
                  </a>
                  <span className="text-gray-600 mx-2">|</span>
                  <a
                    href={`tel:${NAP.altPhone.replace(/\s/g, '')}`}
                    className="hover:text-yellow-500"
                  >
                    {NAP.altPhone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${NAP.email}`}
                    className="text-yellow-500 hover:text-yellow-400"
                  >
                    {NAP.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4" /> Website
                </dt>
                <dd>
                  <a
                    href={NAP.website}
                    className="text-yellow-500 hover:text-yellow-400"
                    rel="noopener"
                  >
                    {NAP.website}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 mb-1">Hours</dt>
                <dd className="text-white">{NAP.hours}</dd>
              </div>
            </dl>
          </motion.section>

          {/* Listings by category */}
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category} aria-labelledby={`cat-${category}`}>
                <h2
                  id={`cat-${category}`}
                  className="text-2xl font-bold text-white mb-4"
                >
                  {category}
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((c) => (
                    <li key={c.url}>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-yellow-500/30 px-4 py-3 transition-colors group"
                      >
                        <span className="flex items-center gap-2 text-white group-hover:text-yellow-500">
                          {c.name}
                          {c.verified && (
                            <ShieldCheck
                              className="w-4 h-4 text-emerald-400"
                              aria-label="Verified listing"
                            />
                          )}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-yellow-500" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm text-gray-500 text-center">
            Spotted an inconsistent listing? Please report it to{' '}
            <a
              href={`mailto:${NAP.email}`}
              className="text-yellow-500 hover:text-yellow-400"
            >
              {NAP.email}
            </a>{' '}
            so we can keep our NAP details consistent across the web.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
