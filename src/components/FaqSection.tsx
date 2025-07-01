
import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { HelpCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const faqs = [
  {
    question: 'What are the enrollment fees?',
    answer:
      'Enrollment fees vary by program. Please contact us or visit the academy for the most current fee structure.',
    category: 'fees',
  },
  {
    question: 'What age groups do you train?',
    answer:
      'We train children, teens, and adults – typically ages 5 and up. Programs are tailored by age and experience.',
    category: 'programs',
  },
  {
    question: 'Do you offer hostel accommodation?',
    answer:
      'Limited hostel accommodation may be available for outstation students. Please enquire directly with our office.',
    category: 'facilities',
  },
  {
    question: 'What sports are included? (Martial Arts + Cricket & Kabaddi)',
    answer:
      'We offer a diverse range: Karate, Taekwondo, Kickboxing, MMA, Boxing, Grappling, Kalaripayattu, Self-defense, as well as Cricket and Kabaddi.',
    category: 'programs',
  },
  {
    question: 'Do you offer personal coaching?',
    answer:
      'Yes, we provide personal coaching and small group sessions for focused learning.',
    category: 'programs',
  },
  {
    question: 'Are trial classes available?',
    answer:
      'Yes, we encourage prospective students to attend a trial class to experience our training firsthand. Please contact us to schedule your free trial session.',
    category: 'programs',
  },
  {
    question: 'What should I wear for my first class?',
    answer:
      'For your first few classes, comfortable athletic wear like a t-shirt and track pants is perfectly fine. Once you enroll in a specific program, we will provide guidance on the required uniform (Gi, gloves, etc.).',
    category: 'getting-started',
  },
  {
    question: 'What are the qualifications of the coaches?',
    answer:
      'Our coaches are certified, experienced professionals with national and international achievements in their respective sports. They are dedicated to providing safe, high-quality instruction.',
    category: 'coaches',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Got Questions?
            </span>
          </div>

          <h2
            id="faq-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            Frequently Asked
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              Questions
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about our programs, facilities,
            coaching, and enrollment process.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <Accordion type="multiple" className="space-y-6">
            {faqs.map((item, idx) => (
              <motion.div
                key={`${item.category}-${idx}`}
                variants={itemVariants}
              >
                <AccordionItem
                  value={`faq-${item.category}-${idx}`}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-yellow-100/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="group/trigger px-8 py-6 text-left hover:no-underline hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset [&>svg]:hidden">
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center mt-1">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight group-hover/trigger:text-yellow-700 transition-colors duration-300">
                          {item.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-red-100 text-yellow-700 text-xs font-medium rounded-full capitalize border border-yellow-200/50">
                            {item.category.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8" />
                      <div className="flex-1">
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-0 font-medium">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="text-center mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-50 via-white to-red-50 rounded-3xl p-8 md:p-12 border border-yellow-100/50 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Still Have Questions?
              </h3>
              <Sparkles className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our friendly team is here to
              help you get started on your martial arts journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                aria-label="Contact us for more information"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Contact Us</span>
              </a>
              <a
                href="tel:+916394135988"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-yellow-200/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                aria-label="Call us at +91 63941 35988"
              >
                <span>Call: +91 63941 35988</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
