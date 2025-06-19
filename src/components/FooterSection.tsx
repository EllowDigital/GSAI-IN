import React from 'react';
import {
  Youtube,
  Mail,
  MapPin,
  Instagram,
  Phone,
  Clock,
  Heart,
  ChevronUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Programs', href: '#programs' },
  { name: 'Gallery', href: '#gallery' },
  { name: 'Contact', href: '#contact' },
  { name: 'Location', href: '#location' },
  { name: 'FAQ', href: '#faq' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
];

const programs = [
  { name: 'Karate', href: '#programs' },
  { name: 'Taekwondo', href: '#programs' },
  { name: 'Kickboxing', href: '#programs' },
  { name: 'MMA', href: '#programs' },
  { name: 'Boxing', href: '#programs' },
  { name: 'Cricket', href: '#programs' },
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

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function FooterSection() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-red-500/20 to-yellow-500/20 rounded-full blur-3xl" />
      </div>

      {/* Back to Top Button */}
      <div className="relative z-20 flex justify-center">
        <button
          onClick={scrollToTop}
          className="absolute -top-6 bg-gradient-to-r from-yellow-500 to-red-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300"
          aria-label="Back to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">
        {/* Main Footer Content */}
        <motion.div
          className="pt-16 pb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-4">
                  Ghatak Sports Academy India™
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                  Empowering youth and athletes through structured training,
                  discipline, and innovation. Join our thriving community to
                  unlock your strength and potential.
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <a
                        href="tel:+916394135988"
                        className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm"
                      >
                        +91 63941 35988
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <a
                        href="mailto:ghatakgsai@gmail.com"
                        className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm"
                      >
                        ghatakgsai@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Naubasta Pulia, Takrohi Road
                        <br />
                        Indira Nagar, Lucknow, UP
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">
                        Mon-Sat: 6:00 AM - 9:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Links Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <h4 className="text-xl font-bold text-white mb-6 relative">
                Quick Links
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="group text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm md:text-base flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Programs Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <h4 className="text-xl font-bold text-white mb-6 relative">
                Our Programs
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {programs.map((program) => (
                  <li key={program.name}>
                    <a
                      href={program.href}
                      className="group text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm md:text-base flex items-center gap-2"
                    >
                      <div className="w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span>{program.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Social & Newsletter Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <h4 className="text-xl font-bold text-white mb-6 relative">
                Connect With Us
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"></div>
              </h4>

              {/* Social Links */}
              <div className="flex gap-4 mb-6">
                <a
                  href="https://www.youtube.com/@ghatakgsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="group w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                >
                  <Youtube className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300" />
                </a>
                <a
                  href="https://www.instagram.com/ghatakgsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-pink-500 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl"
                >
                  <Instagram className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300" />
                </a>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl p-6 backdrop-blur-sm border border-gray-700/50">
                <h5 className="text-lg font-semibold text-white mb-3">
                  Ready to Start?
                </h5>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  Join our academy and begin your martial arts journey today.
                  Contact us for a free trial class.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:+916394135988"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 text-sm"
                  >
                    <span>Contact Us</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Bottom */}
        <motion.div
          className="border-t border-gray-700/50 py-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Ghatak Sports Academy India™.
                All rights reserved.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </a>
                  {index < legalLinks.length - 1 && (
                    <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Credits */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
                <span>Crafted with</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                <span>by</span>
                <a
                  href="https://ellowdigitals.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors duration-300 font-semibold"
                >
                  EllowDigital
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
