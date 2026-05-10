import React, { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Seo } from '@/components/seo/Seo';

const FounderSection = lazy(() => import('@/components/home/FounderSection'));
const TestimonialSection = lazy(
  () => import('@/components/home/TestimonialSection')
);

const coaches = [
  {
    name: 'Mr. Nitesh Yadav',
    role: 'Founder & Chief Instructor',
    bio: 'National-level martial artist with 15+ years of experience training champions across Karate, Taekwondo and self-defense disciplines.',
    specialties: ['Karate (Black Belt)', 'Self-Defense', 'Taekwondo'],
  },
  {
    name: 'Senior Boxing Coach',
    role: 'Boxing & Kickboxing',
    bio: 'Certified coach with state-level achievements, focused on technical sparring, conditioning and competition preparation.',
    specialties: ['Boxing', 'Kickboxing', 'Strength & Conditioning'],
  },
  {
    name: 'BJJ & MMA Coach',
    role: 'Grappling & Mixed Martial Arts',
    bio: 'IBJJF-aligned grappling instructor specialising in BJJ, ground game and complete MMA development for amateurs and competitors.',
    specialties: ['Brazilian Jiu-Jitsu', 'MMA', 'Wrestling Basics'],
  },
];

export default function CoachesPage() {
  return (
    <>
      <Seo
        title="Our Coaches | Certified Martial Arts Instructors in Lucknow — GSAI"
        description="Meet the certified, experienced coaches at Ghatak Sports Academy India — national champions and licensed instructors for Karate, Taekwondo, Boxing, BJJ and MMA in Lucknow."
        canonical="/coaches"
        keywords={[
          'martial arts coach Lucknow',
          'karate instructor Lucknow',
          'BJJ coach India',
          'GSAI coaches',
        ]}
      />
      <Navbar />
      <main className="bg-black text-white pt-24">
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <header className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Meet Our Coaches
            </h1>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Certified instructors with national and international experience,
              dedicated to building disciplined, confident athletes.
            </p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coaches.map((c) => (
              <article
                key={c.name}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-yellow-400/40 transition-colors"
              >
                <h2 className="text-xl font-semibold text-white">{c.name}</h2>
                <p className="text-yellow-400 text-sm mt-1">{c.role}</p>
                <p className="text-gray-300 text-sm mt-4">{c.bio}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {c.specialties.map((s) => (
                    <li
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-200"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/enroll"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-orange-500/40 transition"
            >
              Train with our coaches — Enroll today
            </Link>
          </div>
        </section>
        <Suspense fallback={null}>
          <FounderSection />
          <TestimonialSection />
        </Suspense>
      </main>
      <FooterSection />
    </>
  );
}
