import React, { lazy, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Seo } from '@/components/seo/Seo';
import AboutSection from '@/components/home/AboutSection';

const FounderSection = lazy(() => import('@/components/home/FounderSection'));
const RecognitionAffiliationsSection = lazy(
  () => import('@/components/home/RecognitionAffiliationsSection')
);

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Ghatak Sports Academy India | Lucknow's Premier Martial Arts Academy"
        description="Learn about Ghatak Sports Academy India (GSAI) — a government-recognised martial arts and self-defense academy in Lucknow training champions in Karate, Taekwondo, MMA, Boxing and Kalaripayattu."
        canonical="/about"
        keywords={[
          'about Ghatak Sports Academy',
          'martial arts academy Lucknow',
          'GSAI founder',
          'self defense academy India',
        ]}
      />
      <Navbar />
      <main className="bg-black text-white pt-24">
        <AboutSection />
        <Suspense fallback={null}>
          <FounderSection />
          <RecognitionAffiliationsSection />
        </Suspense>
      </main>
      <FooterSection />
    </>
  );
}
