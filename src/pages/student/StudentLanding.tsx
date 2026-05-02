import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Clock3,
  BadgeCheck,
} from 'lucide-react';
import Seo from '@/components/seo/Seo';
import { useStudentAuth } from './StudentAuthContext';

const landingKeywords = [
  'ghatak sports student portal',
  'ghatak sports student login',
  'ghatak sports academy student portal',
  'gsai student portal',
  'student portal lucknow',
  'ghatak sports academy login',
  'sports academy student dashboard',
  'ghatak sports fees portal',
];

const landingStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Ghatak Sports Student Portal',
  url: 'https://ghataksportsacademy.com/student',
  description:
    'Official student portal landing page for Ghatak Sports Academy India. Access your student dashboard, view fees, and get academy updates.',
  publisher: {
    '@type': 'Organization',
    name: 'Ghatak Sports Academy India',
    logo: {
      '@type': 'ImageObject',
      url: 'https://ghataksportsacademy.com/logo.png', // Update with actual logo URL if available
    },
  },
  isPartOf: {
    '@type': 'WebSite',
    name: 'Ghatak Sports Academy India',
    url: 'https://ghataksportsacademy.com',
  },
};

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Secure Access',
    description:
      'Protected and encrypted portal entry for officially enrolled students.',
  },
  {
    icon: Clock3,
    title: '24/7 Availability',
    description:
      'Check your progress updates, fee schedules, and announcements anytime.',
  },
  {
    icon: BadgeCheck,
    title: 'Official Portal',
    description:
      'The sole authenticated Ghatak Sports student portal for India.',
  },
];

export default function StudentLanding() {
  const { isAuthenticated } = useStudentAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white selection:bg-cyan-400/30 font-sans">
      <Seo
        title="Ghatak Sports Student Portal | Login, Fees & Dashboard"
        description="Official Ghatak Sports student portal landing page. Sign in to view fees, progress, announcements, events, and dashboard updates."
        canonical="/student"
        keywords={landingKeywords}
        structuredData={[landingStructuredData]}
      />

      <main className="relative overflow-hidden flex min-h-screen items-center">
        {/* Background Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[100px]" />
          <div className="absolute top-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-blue-600/15 blur-[120px]" />
          <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />
        </div>

        <section className="relative w-full mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 z-10">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left Column: Hero Content */}
            <div className="space-y-8 lg:space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 backdrop-blur-md">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                <span>Ghatak Sports Student Portal</span>
              </div>

              {/* Main Heading & Subtitle */}
              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                  Student portal access for{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    progress, fees & updates.
                  </span>
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  Use the official Ghatak Sports student portal to sign in and
                  manage your training journey. If you searched for Ghatak
                  Sports student login, student portal, or academy login, you
                  are in the right place.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/student/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#07111f]"
                >
                  Go to Login
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
                <Link
                  to="/enroll"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-[#07111f]"
                >
                  New Student Admission
                </Link>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid gap-4 sm:grid-cols-3 pt-4">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-1"
                    >
                      <Icon
                        className="h-6 w-6 text-cyan-400 mb-3"
                        aria-hidden="true"
                      />
                      <h2 className="text-base font-bold text-white tracking-wide">
                        {item.title}
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Info Card */}
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl sm:p-10 lg:ml-auto w-full max-w-md">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

              <div className="relative space-y-6">
                <div className="inline-flex items-center gap-2.5 text-cyan-300">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">
                    Official Portal Access
                  </span>
                </div>

                <h2 className="text-3xl font-black leading-tight text-white">
                  One hub for your academy updates.
                </h2>

                <p className="text-base leading-relaxed text-slate-300">
                  Sign in to securely access your student dashboard, view
                  transparent fee details, read official notices, and track
                  upcoming academy events.
                </p>

                <hr className="border-white/10" />

                <p className="text-xs leading-relaxed text-slate-500">
                  This secure landing page serves as the verified entry point
                  for all Ghatak Sports India members and staff.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
