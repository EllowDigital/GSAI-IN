import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { HelpCircle, Search, Filter, ChevronDown, Sparkles } from 'lucide-react';
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

const categories = [
  { id: 'all', label: 'All Questions', count: faqs.length },
  { id: 'programs', label: 'Programs', count: faqs.filter(faq => faq.category === 'programs').length },
  { id: 'fees', label: 'Fees', count: faqs.filter(faq => faq.category === 'fees').length },
  { id: 'facilities', label: 'Facilities', count: faqs.filter(faq => faq.category === 'facilities').length },
  { id: 'getting-started', label: 'Getting Started', count: faqs.filter(faq => faq.category === 'getting-started').length },
  { id: 'coaches', label: 'Coaches', count: faqs.filter(faq => faq.category === 'coaches').length },
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
      ease: "easeOut",
    },
  },
};

export default function FaqSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section
      id="faq"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="faq-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
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

          <h2 id="faq-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              Questions
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about our programs, facilities, coaching, and enrollment process.
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          className="mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border-2 border-yellow-100 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 transition-all duration-300 shadow-lg"
                aria-label="Search FAQ questions"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-yellow-500 to-red-500 text-white shadow-yellow-200'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-yellow-100 hover:bg-yellow-50'
                }`}
                aria-label={`Filter by ${category.label}`}
              >
                <Filter className="w-4 h-4" />
                <span>{category.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* FAQ Results Count */}
        {searchTerm && (
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-600 text-lg">
              Found <span className="font-semibold text-yellow-600">{filteredFaqs.length}</span> question{filteredFaqs.length !== 1 ? 's' : ''} 
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </motion.div>
        )}

        {/* FAQ Accordion */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {filteredFaqs.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {filteredFaqs.map((item, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <AccordionItem
                    value={`faq-${idx}`}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-yellow-100/50 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <AccordionTrigger className="group/trigger px-8 py-6 text-left hover:no-underline hover:bg-gradient-to-r hover:from-yellow-50 hover:to-red-50 transition-all duration-300">
                      <div className="flex items-start gap-4 w-full">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center mt-1">
                          <HelpCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight group-hover/trigger:text-yellow-700 transition-colors duration-300">
                            {item.question}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full capitalize">
                              {item.category.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="w-6 h-6 text-yellow-500 flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8" /> {/* Spacer for alignment */}
                        <div className="flex-1">
                          <div className="prose prose-gray max-w-none">
                            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-0">
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
          ) : (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-200 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No questions found</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                We couldn't find any questions matching your search. Try different keywords or browse all categories.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="text-center mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-3xl p-8 md:p-12 border border-yellow-100/50 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Still Have Questions?
              </h3>
              <Sparkles className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our friendly team is here to help you get started on your martial arts journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Contact Us</span>
              </a>
              <a
                href="tel:+916394135988"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-yellow-200/50 transition-all duration-300 transform hover:scale-105"
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
