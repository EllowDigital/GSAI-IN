import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { HelpCircle, Sparkles, MessageCircle, ChevronDown } from 'lucide-react';
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
    question: 'What sports are included?',
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
      className="section-shell relative bg-gradient-to-br from-slate-50 via-white to-amber-50/30 overflow-hidden py-12 md:py-20 lg:py-24"
      aria-labelledby="faq-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-600 tracking-wide uppercase">
              Got Questions?
            </span>
          </div>

          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
          >
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600">
              Questions
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Find answers to common questions about our programs, facilities,
            coaching, and enrollment process.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-yellow-400" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400" />
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-orange-400 to-transparent" />
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <Accordion type="single" collapsible className="space-y-4 sm:space-y-6">
            {faqs.map((item, idx) => (
              <motion.div
                key={`${item.category}-${idx}`}
                variants={itemVariants}
              >
                <AccordionItem
                  value={`faq-${item.category}-${idx}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-yellow-200 transition-all duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-5 sm:px-8 sm:py-6 text-left hover:no-underline hover:bg-yellow-50/30 transition-colors duration-300 [&[data-state=open]]:bg-yellow-50/50">
                    <div className="flex items-start gap-4 w-full pr-2">
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-yellow-200 transition-colors">
                        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 leading-tight group-hover:text-yellow-700 transition-colors">
                          {item.question}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 capitalize">
                            {item.category.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 sm:w-10" />
                      <div className="flex-1">
                        <div className="prose prose-yellow max-w-none">
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
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
          className="text-center mt-16 md:mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-3xl p-8 md:p-12 border border-yellow-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl -ml-16 -mb-16" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 animate-pulse" />
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Still Have Questions?
                </h3>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <p className="text-gray-600 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our friendly team is here to
                help you get started on your martial arts journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="#contact"
                  className="btn-primary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Us
                </a>
                <a
                  href="tel:+916394135988"
                  className="btn-secondary w-full sm:w-auto justify-center px-8 py-3 text-base sm:text-lg"
                >
                  Call: +91 63941 35988
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
