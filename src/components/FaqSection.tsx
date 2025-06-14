
import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What are the enrollment fees?",
    answer: "Enrollment fees vary by program. Please contact us or visit the academy for the most current fee structure.",
  },
  {
    question: "What age groups do you train?",
    answer: "We train children, teens, and adults – typically ages 5 and up. Programs are tailored by age and experience.",
  },
  {
    question: "Do you offer hostel accommodation?",
    answer: "Limited hostel accommodation may be available for outstation students. Please enquire directly with our office.",
  },
  {
    question: "What sports are included? (Martial Arts + Cricket & Kabaddi)",
    answer: "We offer a diverse range: Karate, Taekwondo, Kickboxing, MMA, Boxing, Grappling, Kalaripayattu, Self-defense, as well as Cricket and Kabaddi.",
  },
  {
    question: "Do you offer personal coaching?",
    answer: "Yes, we provide personal coaching and small group sessions for focused learning.",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="py-10 xs:py-16 px-2 xs:px-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold mb-6 xs:mb-8 text-yellow-400 text-center">
          ❓ Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="space-y-2 xs:space-y-3">
          {faqs.map((item, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`}>
              <AccordionTrigger className="font-medium text-base xs:text-lg">{item.question}</AccordionTrigger>
              <AccordionContent className="text-sm xs:text-base text-gray-600">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
