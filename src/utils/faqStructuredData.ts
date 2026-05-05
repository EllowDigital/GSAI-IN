export type FaqEntry = { question: string; answer: string };

export const buildFaqStructuredData = (faqs: FaqEntry[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});

export const programsFaqs: FaqEntry[] = [
  {
    question: 'What martial arts programs does Ghatak Sports Academy offer?',
    answer:
      'We offer Karate, Taekwondo, MMA, Boxing, Kickboxing, Brazilian Jiu-Jitsu (Grappling), Kalaripayattu, and Self-Defense classes for kids, teens and adults in Lucknow.',
  },
  {
    question: 'What is the best martial art for beginners in Lucknow?',
    answer:
      'For beginners we usually recommend Karate or Kickboxing for striking fundamentals, and Brazilian Jiu-Jitsu for grappling. A free trial class helps you choose what fits your goals.',
  },
  {
    question: 'Do you offer a free trial class?',
    answer:
      'Yes. Prospective students can attend one free trial class before enrolling. Please contact the academy on +91 63941 35988 to schedule.',
  },
  {
    question: 'What age groups can join the programs?',
    answer:
      'Our programs are open to children from age 5, teens, and adults. Each batch is grouped by age and skill level.',
  },
  {
    question: 'Are the coaches certified?',
    answer:
      'Yes. All coaches are certified, experienced professionals with national and international achievements in their respective sports.',
  },
];

export const enrollFaqs: FaqEntry[] = [
  {
    question: 'How do I enroll at Ghatak Sports Academy India?',
    answer:
      'Fill out the official admission form on this page with student, guardian and program details. Our team will contact you to confirm your batch and fees.',
  },
  {
    question: 'What documents are required for admission?',
    answer:
      'A valid 12-digit Aadhaar number for the student, guardian contact details, and a recent photograph. Other documents may be requested at the academy.',
  },
  {
    question: 'What are the enrollment fees?',
    answer:
      'Fees vary by program and batch. Final fees are confirmed during onboarding. Contact the academy for the latest fee structure.',
  },
  {
    question: 'Can I enroll in more than one program?',
    answer:
      'Yes. Students can enroll in multiple disciplines such as Karate, Boxing or BJJ together, with combined batch scheduling.',
  },
  {
    question: 'Is admission open throughout the year?',
    answer:
      'Yes, admissions are open year-round. New batches start every month subject to availability.',
  },
];

export const locationLucknowFaqs: FaqEntry[] = [
  {
    question: 'Where is Ghatak Sports Academy located in Lucknow?',
    answer:
      'Our flagship Lucknow center is on Takrohi Road, near Balaji Chauraha, Indira Nagar, Lucknow, Uttar Pradesh 226028.',
  },
  {
    question: 'What are the academy timings in Lucknow?',
    answer:
      'Monday to Saturday from 4:00 PM to 8:00 PM, and Sunday from 7:00 AM to 11:00 AM.',
  },
  {
    question: 'Do you offer self-defense classes for women in Lucknow?',
    answer:
      'Yes. We run dedicated self-defense batches for women and girls focused on practical, real-world techniques.',
  },
  {
    question: 'Do you provide corporate self-defense training?',
    answer:
      'Yes. We deliver on-site corporate self-defense and team-building workshops across Lucknow and nearby cities.',
  },
];
