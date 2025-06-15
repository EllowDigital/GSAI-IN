import React from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { HelpCircle, Sparkles } from 'lucide-react'; // Correct icon import

export const faqs = [
  {
    question: 'What are the enrollment fees?',
    answer:
      'Enrollment fees vary by program. Please contact us or visit the academy for the most current fee structure.',
  },
  {
    question: 'What age groups do you train?',
    answer:
      'We train children, teens, and adults – typically ages 5 and up. Programs are tailored by age and experience.',
  },
  {
    question: 'Do you offer hostel accommodation?',
    answer:
      'Limited hostel accommodation may be available for outstation students. Please enquire directly with our office.',
  },
  {
    question: 'What sports are included? (Martial Arts + Cricket & Kabaddi)',
    answer:
      'We offer a diverse range: Karate, Taekwondo, Kickboxing, MMA, Boxing, Grappling, Kalaripayattu, Self-defense, as well as Cricket and Kabaddi.',
  },
  {
    question: 'Do you offer personal coaching?',
    answer:
      'Yes, we provide personal coaching and small group sessions for focused learning.',
  },
  {
    question: 'Are trial classes available?',
    answer:
      'Yes, we encourage prospective students to attend a trial class to experience our training firsthand. Please contact us to schedule your free trial session.',
  },
  {
    question: 'What should I wear for my first class?',
    answer:
      'For your first few classes, comfortable athletic wear like a t-shirt and track pants is perfectly fine. Once you enroll in a specific program, we will provide guidance on the required uniform (Gi, gloves, etc.).',
  },
  {
    question: 'What are the qualifications of the coaches?',
    answer:
      'Our coaches are certified, experienced professionals with national and international achievements in their respective sports. They are dedicated to providing safe, high-quality instruction.',
  },
];

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="py-12 xs:py-20 px-2 xs:px-4 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-yellow-100 animate-fade-in relative overflow-hidden"
    >
      {/* Decorative sparkles */}
      <Sparkles className="absolute left-2 top-2 w-14 h-14 text-yellow-400 opacity-10 z-0 pointer-events-none" />
      <Sparkles className="absolute right-0 bottom-10 w-14 h-14 text-yellow-600 opacity-15 z-0 pointer-events-none animate-pulse" />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-2 justify-center w-full">
            <HelpCircle className="w-6 h-6 text-gray-600" aria-hidden="true" />
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow font-montserrat text-center w-full relative">
              Frequently Asked Questions
              <span className="block h-1 w-14 bg-gradient-to-r from-yellow-400 to-red-200 rounded-full mx-auto mt-1" />
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-2xl">
            Answers to your most common queries about the academy, training, and
            facilities.
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((item, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="rounded-lg border border-yellow-100 shadow-sm overflow-hidden bg-white transition-shadow hover:shadow-md"
            >
              <AccordionTrigger className="font-semibold text-base xs:text-lg px-5 py-4 bg-yellow-50 hover:bg-yellow-100 transition-colors">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm xs:text-base text-gray-600 px-5 py-3 bg-white animate-fade-in">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
