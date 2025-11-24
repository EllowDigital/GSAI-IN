import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        plan.{' '}
        <strong className="text-white">All fees are non-refundable</strong>{' '}
        under any circumstances, including withdrawal, relocation, illness, or
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
  <div className="min-h-screen bg-black text-white font-montserrat relative overflow-hidden">
    {/* Decorative Elements */}
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
    </div>

    <div className="relative z-10 max-w-4xl mx-auto px-4 py-20">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          asChild
          variant="outline"
          size="sm"
          className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 shadow-2xl"
      >
        <header className="border-b border-white/10 pb-8 mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-gray-400">Last updated: 12 February 2025</p>
        </header>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <section key={idx} className="group">
              <h2 className="text-xl md:text-2xl font-semibold text-yellow-500 mb-4 group-hover:text-yellow-400 transition-colors">
                {section.heading}
              </h2>
              <div className="text-gray-300 leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </motion.div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        &copy; 2025 Ghatak Sports Academy India. All rights reserved.
      </div>
    </div>
  </div>
);

export default TermsPage;
