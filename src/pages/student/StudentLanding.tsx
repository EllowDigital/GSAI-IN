import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, ShieldCheck, Clock3, BadgeCheck } from 'lucide-react';
import Seo from '@/components/seo/Seo';
import { useStudentAuth } from './StudentAuthContext';

const landingKeywords = [
  'ghatak sports student portal',
  'ghatak sports student login',
  'ghatak sports academy student portal',
  'gsai student portal',
  'student portal lucknow',
  'ghatak sports academy login',
];

const landingStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Ghatak Sports Student Portal',
  url: 'https://ghataksportsacademy.com/student',
  description:
    'Public student portal landing page for Ghatak Sports Academy India.',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Ghatak Sports Academy India',
    url: 'https://ghataksportsacademy.com',
  },
};

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Secure access',
    description: 'Protected portal entry for enrolled students.',
  },
  {
    icon: Clock3,
    title: '24x7 availability',
    description: 'Check updates, fees, and announcements anytime.',
  },
  {
    icon: BadgeCheck,
    title: 'Official portal',
    description: 'The official Ghatak Sports student portal for India.',
  },
];

export default function StudentLanding() {
  const { isAuthenticated } = useStudentAuth();

  if (isAuthenticated) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white selection:bg-cyan-400/30">
      <Seo
        title="Ghatak Sports Student Portal | Login, Fees & Dashboard"
        description="Official Ghatak Sports student portal landing page. Sign in to view fees, progress, announcements, events, and dashboard updates."
        canonical="/student"
        keywords={landingKeywords}
        structuredData={[landingStructuredData]}
      />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 left-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        </div>

        <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-200 backdrop-blur">
                <GraduationCap className="h-4 w-4" />
                Ghatak Sports Student Portal
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Student portal access for progress, fees, events, and updates.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Use the official Ghatak Sports student portal to sign in and
                  manage your training journey. If you searched for Ghatak
                  Sports student login, student portal, or academy login, this
                  is the correct public entry page.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/student/login"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform hover:-translate-y-0.5"
                >
                  Go to Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/enroll"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  New student admission
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                    >
                      <Icon className="h-5 w-5 text-cyan-300" />
                      <h2 className="mt-3 text-sm font-bold text-white">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl sm:p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-cyan-200">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                    Official portal access
                  </span>
                </div>
                <h2 className="text-2xl font-black leading-tight">
                  One portal for students and academy updates.
                </h2>
                <p className="text-sm leading-6 text-slate-300">
                  Sign in to see your student dashboard, fee details, notices,
                  and upcoming events. This landing page is the version Google
                  should show for student portal searches.
                </p>
              </div>

              <div className="mt-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">
                  Search terms covered
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Ghatak Sports student portal, Ghatak Sports student login,
                  GSAI student portal, and student portal Lucknow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}