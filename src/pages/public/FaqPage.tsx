import React, { lazy, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Seo } from '@/components/seo/Seo';
import FaqSection from '@/components/home/FaqSection';
import { faqs as homeFaqs } from '@/components/home/faqData';
import {
  buildFaqStructuredData,
  programsFaqs,
  enrollFaqs,
} from '@/utils/faqStructuredData';

const ProgramsAdmissionsFaqSection = lazy(
  () => import('@/components/home/ProgramsAdmissionsFaqSection')
);

const faqJsonLd = buildFaqStructuredData([
  ...homeFaqs.map((f) => ({ question: f.question, answer: f.answer })),
  ...programsFaqs,
  ...enrollFaqs,
]);

export default function FaqPage() {
  return (
    <>
      <Seo
        title="FAQ — Programs & Admissions | GSAI Lucknow"
        description="Answers about programs, admissions, fees, age groups, women's self-defense, and training schedules at GSAI Lucknow."
        canonical="/faq"
        keywords={[
          'martial arts FAQ Lucknow',
          'GSAI admissions',
          'karate fees Lucknow',
        ]}
        structuredData={[faqJsonLd]}
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
