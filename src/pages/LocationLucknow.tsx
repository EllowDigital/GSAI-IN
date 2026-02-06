import React from 'react';
import Seo from '../components/Seo';
import Navbar from '../components/Navbar';
import FooterSection from '../components/FooterSection';

const lucknowStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: 'Ghatak Sports Academy India - Lucknow',
  url: 'https://ghataksportsacademy.com/locations/lucknow',
  image: 'https://ghataksportsacademy.com/assets/img/logo.webp',
  telephone: '+91 63941 35988',
  email: 'ghatakgsai@gmail.com',
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
  areaServed: ['Lucknow', 'Uttar Pradesh', 'India'],
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
};

export default function LocationLucknow() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Seo
        title="Ghatak Sports Academy India - Lucknow Martial Arts Training"
        description="Ghatak Sports Academy India in Lucknow offers karate, taekwondo, MMA, boxing, kickboxing, self-defense, and fitness training. Located in Indira Nagar, Takrohi with expert coaches and structured programs for all ages."
        canonical="/locations/lucknow"
        image="/assets/img/logo.webp"
        imageAlt="Ghatak Sports Academy India - Lucknow"
        type="website"
        keywords={[
          'Ghatak Sports Academy India Lucknow',
          'martial arts academy Lucknow',
          'karate classes Lucknow',
          'taekwondo classes Lucknow',
          'MMA training Lucknow',
          'boxing classes Lucknow',
          'kickboxing classes Lucknow',
          'self defense classes Lucknow',
          'fitness training Lucknow',
          'Indira Nagar martial arts',
          'Takrohi martial arts',
        ]}
        structuredData={[lucknowStructuredData]}
      />

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 shadow-xl">
          <p className="text-xs uppercase tracking-widest text-yellow-500">
            Lucknow, Uttar Pradesh
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Ghatak Sports Academy India - Lucknow
          </h1>
          <p className="mt-4 text-gray-300 leading-relaxed">
            Train at our flagship Lucknow academy in Indira Nagar, Takrohi. We
            offer structured martial arts and fitness programs led by certified
            coaches. Students train in karate, taekwondo, MMA, boxing,
            kickboxing, self-defense, grappling, and conditioning.
          </p>
          <p className="mt-4 text-gray-300 leading-relaxed">
            Our Lucknow center focuses on skill development, discipline, and
            confidence for kids, teens, adults, and corporate teams. Join a
            supportive community with clear progression and practical coaching.
          </p>
          <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
            <h2 className="text-lg font-semibold text-white">Hours</h2>
            <p className="mt-2 text-gray-300 text-sm">
              Mon-Sat: 4:00 PM - 8:00 PM
              <br />
              Sun: 7:00 AM - 11:00 AM
            </p>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
