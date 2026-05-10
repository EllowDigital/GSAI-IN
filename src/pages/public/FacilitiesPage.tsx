import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Seo } from '@/components/seo/Seo';
import { Dumbbell, ShieldCheck, Users, MapPin } from 'lucide-react';

const LocationSection = lazy(() => import('@/components/home/LocationSection'));

const facilities = [
  {
    icon: Dumbbell,
    title: 'Matted Training Hall',
    desc: 'Spacious tatami-matted dojo for safe striking, grappling and sparring sessions.',
  },
  {
    icon: ShieldCheck,
    title: 'Padded Gear & Equipment',
    desc: 'Boxing bags, focus mitts, kick shields, BJJ gis and protective gear for every batch.',
  },
  {
    icon: Users,
    title: 'Small Batch Sizes',
    desc: 'Coach-to-student ratios that ensure personal attention and safe technique progression.',
  },
  {
    icon: MapPin,
    title: 'Two Lucknow Centres',
    desc: 'Indira Nagar (main) and Matiyari branch — both easily accessible by metro and bus.',
  },
];

export default function FacilitiesPage() {
  return (
    <>
      <Seo
        title="Our Facilities | Martial Arts Dojo & Training Centres in Lucknow"
        description="Tour the training facilities at Ghatak Sports Academy India — matted dojos, professional equipment, women-safe areas and two convenient Lucknow centres."
        canonical="/facilities"
        keywords={[
          'martial arts dojo Lucknow',
          'GSAI facilities',
          'training centre Indira Nagar',
        ]}
      />
      <Navbar />
      <main className="bg-black text-white pt-24">
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <header className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              World-Class Training Facilities
            </h1>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Purpose-built spaces designed for safety, performance and a
              premium training experience.
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-yellow-400/40 transition-colors"
              >
                <f.icon className="w-8 h-8 text-yellow-400" />
                <h2 className="mt-4 text-lg font-semibold text-white">
                  {f.title}
                </h2>
                <p className="mt-2 text-sm text-gray-300">{f.desc}</p>
              </article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:border-yellow-400/60 transition"
            >
              See our facilities in the Gallery
            </Link>
          </div>
        </section>
        <Suspense fallback={null}>
          <LocationSection />
        </Suspense>
      </main>
      <FooterSection />
    </>
  );
}
