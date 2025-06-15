
import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { help as Help } from "lucide-react";

const faqs = [
  {
    question: "What are the enrollment fees?",
    answer:
      "Enrollment fees vary by program. Please contact us or visit the academy for the most current fee structure.",
  },
  {
    question: "What age groups do you train?",
    answer:
      "We train children, teens, and adults – typically ages 5 and up. Programs are tailored by age and experience.",
  },
  {
    question: "Do you offer hostel accommodation?",
    answer:
      "Limited hostel accommodation may be available for outstation students. Please enquire directly with our office.",
  },
  {
    question: "What sports are included? (Martial Arts + Cricket & Kabaddi)",
    answer:
      "We offer a diverse range: Karate, Taekwondo, Kickboxing, MMA, Boxing, Grappling, Kalaripayattu, Self-defense, as well as Cricket and Kabaddi.",
  },
  {
    question: "Do you offer personal coaching?",
    answer: "Yes, we provide personal coaching and small group sessions for focused learning.",
  },
];

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="py-12 xs:py-20 px-2 xs:px-4 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-yellow-100 animate-fade-in"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-2">
            <Help size={32} className="text-yellow-400 drop-shadow" />
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-2xl">
            Answers to your most common queries about the academy, training, and facilities.
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
