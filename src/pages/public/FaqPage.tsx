import React, { lazy, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Seo } from '@/components/seo/Seo';
import FaqSection from '@/components/home/FaqSection';

const ProgramsAdmissionsFaqSection = lazy(
  () => import('@/components/home/ProgramsAdmissionsFaqSection')
);

export default function FaqPage() {
  return (
    <>
      <Seo
        title="FAQ — Programs, Admissions & Training | Ghatak Sports Academy India"
        description="Answers to the most asked questions about programs, admissions, fees, age groups, women's self-defense, and training schedules at GSAI Lucknow."
        canonical="/faq"
        keywords={[
          'martial arts FAQ Lucknow',
          'GSAI admissions',
          'karate fees Lucknow',
        ]}
      />
      <Navbar />
      <main className="bg-black text-white pt-24">
        <FaqSection />
        <Suspense fallback={null}>
          <ProgramsAdmissionsFaqSection />
        </Suspense>
      </main>
      <FooterSection />
    </>
  );
}
