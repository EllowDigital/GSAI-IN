import React, { lazy, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import FooterSection from '@/components/layout/FooterSection';
import { Seo } from '@/components/seo/Seo';
import ContactSection from '@/components/home/ContactSection';

const LocationSection = lazy(() => import('@/components/home/LocationSection'));

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Contact Us | Ghatak Sports Academy India — Lucknow"
        description="Get in touch with Ghatak Sports Academy India in Lucknow. Call, WhatsApp, email or visit our Indira Nagar and Matiyari centres for admissions and queries."
        canonical="/contact"
        keywords={[
          'contact GSAI',
          'martial arts academy Lucknow contact',
          'karate classes phone Lucknow',
        ]}
      />
      <Navbar />
      <main className="bg-black text-white pt-24">
        <ContactSection />
        <Suspense fallback={null}>
          <LocationSection />
        </Suspense>
      </main>
      <FooterSection />
    </>
  );
}
