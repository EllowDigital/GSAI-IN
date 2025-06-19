import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Lightbulb, HeartHandshake } from 'lucide-react';

const affiliations = [
  {
    name: 'Martial Arts Federation',
    logo: '/assets/img/martial-arts-federation.webp',
    description: 'Recognized by the Martial Arts Federation for excellence in training.',
    icon: ShieldCheck,
  },
  {
    name: 'Educational Programs',
    logo: '/assets/img/educational-programs.webp',
    description: 'Affiliated with leading educational programs for student development.',
    icon: GraduationCap,
  },
  {
    name: 'Innovative Training',
    logo: '/assets/img/innovative-training.webp',
    description: 'Committed to innovative training methods and techniques.',
    icon: Lightbulb,
  },
  {
    name: 'Community Partnerships',
    logo: '/assets/img/community-partnerships.webp',
    description: 'Partnerships with local community organizations for outreach programs.',
    icon: HeartHandshake,
  },
  {
    name: 'Global Recognition',
    logo: '/assets/img/global-recognition.webp',
    description: 'Globally recognized for sports excellence and athlete development.',
    icon: ShieldCheck,
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
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function RecognitionAffiliationsSection() {
  return (
    <section
      id="recognition"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="recognition-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
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
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Recognition
            </span>
          </div>

          <h2 id="recognition-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              Affiliations
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are proud to be affiliated with leading organizations and recognized for our commitment to excellence in sports and athlete development.
          </p>
        </motion.div>

        {/* Recognition Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {affiliations.map((affiliation, index) => (
            <motion.div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-yellow-200/50"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative w-24 h-24 mb-4">
                  <img
                    src={affiliation.logo}
                    alt={affiliation.name}
                    className="object-contain w-full h-full rounded-xl shadow-md"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-yellow-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center group-hover:text-yellow-600 transition-colors duration-300">
                  {affiliation.name}
                </h3>
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  {affiliation.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Our Community?
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Discover the benefits of training with a recognized and affiliated sports academy. Contact us today to learn more about our programs.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
    </section>
  );
}
