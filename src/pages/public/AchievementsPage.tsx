import React, { lazy, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Seo } from '@/components/seo/Seo';
import AchievementSection from '@/components/home/AchievementSection';

const CompetitionResultsSection = lazy(
  () => import('@/components/home/CompetitionResultsSection')
);

export default function AchievementsPage() {
  return (
    <>
      <Seo
        title="Achievements & Championships | Ghatak Sports Academy India"
        description="Explore the medals, championships and student success stories at Ghatak Sports Academy India — proof of consistent excellence in martial arts and self-defense training."
        canonical="/achievements"
        keywords={[
          'GSAI achievements',
          'martial arts champions Lucknow',
          'karate gold medal India',
        ]}
      />
      <Navbar />
      <main className="bg-black text-white pt-24">
        <AchievementSection />
        <Suspense fallback={null}>
          <CompetitionResultsSection />
        </Suspense>
      </main>
      <FooterSection />
    </>
  );
}
