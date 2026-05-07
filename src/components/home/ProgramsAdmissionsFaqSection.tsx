import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { GraduationCap, Trophy } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

type Faq = { question: string; answer: string };

const programsFaqs: Faq[] = [
  {
    question: 'Which martial arts programs are offered at Ghatak Sports Academy India in Lucknow?',
    answer:
      'We offer Karate, Taekwondo, MMA, Boxing, Kickboxing, Brazilian Jiu-Jitsu (Grappling), Kalaripayattu, Self-Defense and Fitness/Fat-loss programs for kids (5+), teens, women and adults — all run by certified national and international level coaches.',
  },
  {
    question: 'Which martial art is best for a complete beginner?',
    answer:
      'For most beginners we recommend Karate or Kickboxing to build striking fundamentals, footwork and discipline. If you prefer ground game or self-defense focus, Brazilian Jiu-Jitsu (Grappling) or our dedicated Self-Defense batch is a great start. A free trial helps you decide.',
  },
  {
    question: 'Do you have separate batches for kids, women and adults?',
    answer:
      'Yes. We run age-grouped batches: Kids (5-12), Teens (13-17) and Adults (18+). We also run dedicated women-only self-defense batches focused on practical techniques for real-world safety.',
  },
  {
    question: 'How often will I train, and how long until I progress?',
    answer:
      'Most students train 3-5 days a week. Belt or level progression depends on discipline and attendance — typically 4-6 months between gradings for early belts/levels with consistent practice.',
  },
  {
    question: 'Are your coaches certified?',
    answer:
      'Yes. All coaches hold national/international certifications (WKF, WT, IBJJF, AIBA pathways) and have a record of medals at state, national and international championships.',
  },
  {
    question: 'Do you offer corporate or school self-defense workshops?',
    answer:
      'Yes. We deliver on-site corporate self-defense, women safety and team-building workshops for schools, MNCs and IT parks across Lucknow and Uttar Pradesh.',
  },
];

const admissionsFaqs: Faq[] = [
  {
    question: 'How do I enroll at Ghatak Sports Academy India?',
    answer:
      'Visit the /enroll page and complete the online admission form with student, guardian and program details. Our admissions team will call you within 24 hours to confirm your batch, fees and start date.',
  },
  {
    question: 'What documents are required for admission?',
    answer:
      'A valid 12-digit Aadhaar number for the student, guardian contact details and a recent passport-size photograph. Additional ID or medical declarations may be requested at the academy.',
  },
  {
    question: 'Is there a free trial class before I pay fees?',
    answer:
      'Yes — every new student is welcome to one free trial class. Call +91 63941 35988 to schedule your slot before visiting.',
  },
  {
    question: 'What are the enrollment and monthly fees?',
    answer:
      'Fees vary by program, batch frequency and age group. We follow a transparent hierarchy of Student Custom > Program Fee > Global Default. Final fees are confirmed during onboarding.',
  },
  {
    question: 'Can I enroll in more than one martial art at the same time?',
    answer:
      'Yes. Many of our students train in two or more disciplines (for example Karate + BJJ, or Boxing + Kickboxing). We offer combined-batch scheduling and a multi-program discount.',
  },
  {
    question: 'When do new batches start? Are admissions open year-round?',
    answer:
      'Admissions are open throughout the year. New batches start every month, subject to seat availability in your chosen age group and discipline.',
  },
  {
    question: 'Do you provide a uniform, certificates and student portal access?',
    answer:
      'Yes. Enrolled students receive uniform guidance, official belt/level certificates after each grading, and a personal Student Portal account to track attendance, fees, progression and event notifications.',
  },
];

const buildFaqSchema = (faqs: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});

const FaqGroup = ({
  title,
  icon,
  faqs,
  prefix,
}: {
  title: string;
  icon: React.ReactNode;
  faqs: Faq[];
  prefix: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.5 }}
    className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 md:p-8"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
        {icon}
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
    </div>
    <Accordion type="single" collapsible className="space-y-3">
      {faqs.map((f, i) => (
        <AccordionItem
          key={`${prefix}-${i}`}
          value={`${prefix}-${i}`}
          className="border border-white/10 rounded-xl px-4 hover:border-yellow-500/30 transition-colors"
        >
          <AccordionTrigger className="text-left text-white hover:no-underline hover:text-yellow-500 text-sm md:text-base font-semibold py-4">
            {f.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-400 text-sm md:text-base leading-relaxed pb-4">
            {f.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </motion.div>
);

export default function ProgramsAdmissionsFaqSection() {
  const allFaqs = [...programsFaqs, ...admissionsFaqs];

  return (
    <section
      id="programs-admissions-faq"
      aria-labelledby="programs-admissions-faq-heading"
      className="section-shell relative bg-[#070707] py-12 md:py-20 lg:py-24 overflow-hidden"
    >
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(buildFaqSchema(allFaqs))}
        </script>
      </Helmet>

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="text-sm md:text-base font-semibold text-yellow-500 tracking-widest uppercase">
            Programs & Admissions
          </span>
          <h2
            id="programs-admissions-faq-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mt-3 mb-4 leading-tight"
          >
            Everything Parents & Students{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Ask Us
            </span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Real questions we get every week from parents and students in Lucknow about our martial arts programs and the admission process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <FaqGroup
            title="Programs & Training"
            icon={<Trophy className="w-5 h-5 text-white" />}
            faqs={programsFaqs}
            prefix="programs"
          />
          <FaqGroup
            title="Admissions & Enrollment"
            icon={<GraduationCap className="w-5 h-5 text-white" />}
            faqs={admissionsFaqs}
            prefix="admissions"
          />
        </div>
      </div>
    </section>
  );
}
