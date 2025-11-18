import React from 'react';

const sections = [
  {
    heading: '4. Training Participation & Risk Acknowledgement',
    content: `Participation in martial arts, sports, and physical fitness activities involves inherent risks of injury or harm. By enrolling in Ghatak Sports Academy India, you acknowledge and voluntarily accept these risks. The academy, its coaches, and staff are not liable for any injury, illness, disability, or death that may occur during training, competition, travel, or related events.`,
  },
  {
    heading: '5. Medical Fitness & Health Disclosure',
    content: `You (or your guardian, if under 18) affirm that you are medically fit to participate in physical training. You must disclose any pre-existing medical conditions or injuries prior to enrollment. The academy is not responsible for medical expenses or health issues arising from non-disclosure or personal negligence.`,
  },
  {
    heading: '6. Code of Conduct',
    content: `All students must maintain discipline, respect instructors and peers, and adhere to training protocols. Misconduct, violence, harassment, bullying, or breach of academy values may result in suspension or permanent expulsion, with no refund of fees.`,
  },
  {
    heading: '7. Uniform & Safety Gear',
    content: `All participants are required to wear designated academy uniforms and approved safety gear during training and sparring sessions. The academy reserves the right to deny training to those without proper gear to ensure safety and consistency.`,
  },
  {
    heading: '8. Fee Structure & Refund Policy',
    content: (
      <>
        Fees must be paid in full as per the selected program or membership
        plan. <strong>All fees are non-refundable</strong> under any
        circumstances, including withdrawal, relocation, illness, or
        disciplinary removal.
      </>
    ),
  },
  {
    heading: '9. Attendance & Leaves',
    content: `Regular attendance is essential for progress. Students must inform instructors in advance about planned absences. The academy is not responsible for missed classes or sessions, and no fee adjustments will be made for the same.`,
  },
  {
    heading: '10. Parental Consent (for Minors)',
    content: `Students below 18 years must provide written parental or guardian consent before joining. Parents must ensure the child adheres to safety, health, and conduct guidelines, and accept all risks associated with physical training.`,
  },
  {
    heading: '11. Photos, Videos & Media Use',
    content: `The academy may capture photos or videos during training or events for promotional or educational use. By joining the academy, you grant permission to use your (or your child's) likeness in marketing, social media, or printed materials unless explicitly opted out in writing.`,
  },
  {
    heading: '12. Insurance & Emergency Care',
    content: `The academy does not provide health or accident insurance. It is the responsibility of each participant (or guardian) to maintain appropriate medical coverage. In case of emergencies, the academy may arrange medical care, and all associated expenses must be borne by the participant.`,
  },
  {
    heading: '13. Academy Property & Facilities',
    content: `Respect academy property, equipment, and facilities. Any intentional damage caused by a student or their guardian must be compensated. The academy reserves the right to monitor usage of its premises for safety and quality control.`,
  },
  {
    heading: '14. Termination of Enrollment',
    content: `Ghatak Sports Academy India reserves the right to terminate any student’s enrollment for violations of these terms, misconduct, or behavior deemed harmful to others or the institution. Such terminations will be immediate and without refund.`,
  },
];

const TermsPage: React.FC = () => (
  <div className="min-h-screen font-montserrat bg-gradient-to-br from-yellow-50 via-white to-yellow-100 py-0">
    <div className="max-w-3xl mx-auto mt-8 px-4 py-10 rounded-2xl bg-white/95 shadow-xl border border-yellow-100">
      <header className="border-b border-gray-200 pb-3 mb-7">
        <h1 className="text-3xl font-bold text-yellow-500 mb-1 text-center select-none">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Last updated: 12 February 2025
        </p>
      </header>

      {sections.map((section, idx) => (
        <section className="mb-7 last:mb-0" key={idx}>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {section.heading}
          </h2>
          <div className="text-gray-700 text-base">{section.content}</div>
        </section>
      ))}
    </div>
    <div className="w-full max-w-3xl mx-auto text-gray-400 text-xs text-center py-5">
      &copy; 2025 Ghatak Sports Academy India. All rights reserved.
    </div>
  </div>
);

export default TermsPage;
