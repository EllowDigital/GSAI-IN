import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  Users,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { programs } from '@/data/programsData';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import InternalLinksBlock from '@/components/InternalLinksBlock';
import Seo from '@/components/Seo';

export default function ProgramDetail() {
  const { slug } = useParams<{ slug: string }>();
  const program = programs.find((p) => p.slug === slug);

  if (!program) return <Navigate to="/programs" replace />;

  const otherPrograms = programs.filter((p) => p.slug !== slug).slice(0, 3);
  const programUrl = `https://ghataksportsacademy.com/programs/${program.slug}`;
  const programImage = 'https://ghataksportsacademy.com/assets/img/social-preview.png';

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${program.title} Training Program`,
    description: program.fullDescription,
    category: 'Martial Arts Training Program',
    image: [programImage],
    brand: {
      '@type': 'Brand',
      name: 'Ghatak Sports Academy India',
    },
    url: programUrl,
  };

  const courseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${program.title} Course`,
    description: program.fullDescription,
    provider: {
      '@type': 'Organization',
      name: 'Ghatak Sports Academy India',
      sameAs: 'https://ghataksportsacademy.com',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'offline',
      location: {
        '@type': 'Place',
        name: 'Ghatak Sports Academy India, Lucknow',
      },
    },
  };

  return (
    <>
      <Seo
        title={`${program.title} Training — GSAI Lucknow`}
        description={program.fullDescription.slice(0, 155)}
        canonical={`/programs/${program.slug}`}
        structuredData={[productStructuredData, courseStructuredData]}
      />

      <Navbar />

      <main className="bg-[#050505] min-h-screen pt-20">
        {/* Hero Banner */}
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-32">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-600/20 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Link
              to="/#programs"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors mb-8 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Programs
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-6xl md:text-7xl">{program.icon}</span>
                <div>
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-wider rounded-full border border-yellow-500/20">
                    {program.category}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                {program.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
                {program.fullDescription}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Duration
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {program.duration}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Age Group
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {program.ageGroup}
                  </p>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    Schedule
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {program.schedule}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits + Level */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Key Benefits
                </h2>
                <ul className="space-y-4">
                  {program.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Skill Level
                  </h2>
                  <span className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 text-yellow-400 font-bold text-lg">
                    {program.level}
                  </span>
                  <p className="text-gray-400 mt-4 leading-relaxed">
                    Our experienced instructors adapt every session to match
                    your current ability, ensuring safe progression and
                    consistent improvement.
                  </p>
                </div>

                <a
                  href="#contact"
                  className="mt-8 inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all hover:-translate-y-0.5 w-full md:w-auto text-center"
                >
                  Enrol Now — Free Trial Class
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Other Programs */}
        <section className="py-12 md:py-20 border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">
              Explore Other Programs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherPrograms.map((p) => (
                <Link
                  key={p.slug}
                  to={`/programs/${p.slug}`}
                  className="group bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-yellow-500/30 transition-all hover:-translate-y-1"
                >
                  <span className="text-4xl mb-3 block">{p.icon}</span>
                  <h3 className="text-white font-bold text-lg group-hover:text-yellow-400 transition-colors mb-1">
                    {p.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{p.desc}</p>
                  <span className="inline-flex items-center text-yellow-500 text-sm font-medium">
                    Learn more <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              ))}
            </div>

            <InternalLinksBlock
              title="Related Internal Links"
              items={[
                {
                  to: '/programs',
                  label: 'All Programs',
                  description:
                    'Return to the complete programs listing with category filters.',
                },
                {
                  to: '/events',
                  label: 'Academy Events',
                  description:
                    'Check upcoming workshops, gradings, and competition events.',
                },
                {
                  to: '/blogs',
                  label: 'Training Blog',
                  description:
                    'Read coaching insights, tips, and martial arts guides.',
                },
                {
                  to: '/contact',
                  label: 'Contact Academy',
                  description:
                    'Reach out for batch timings, trial classes, and enrolment.',
                },
              ]}
            />
          </div>
        </section>

        <FooterSection />
      </main>
    </>
  );
}
