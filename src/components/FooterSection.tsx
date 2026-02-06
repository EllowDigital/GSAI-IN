import React, { useEffect, useState } from 'react';
import {
  Youtube,
  Mail,
  MapPin,
  Instagram,
  Twitter,
  Phone,
  Clock,
  Heart,
  ChevronUp,
  ArrowRight,
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
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/last-updated.json', { cache: 'no-cache' })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.lastUpdated) {
          try {
            const d = new Date(data.lastUpdated);
            const formatted = new Intl.DateTimeFormat('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }).format(d);
            setLastUpdated(formatted);
          } catch (e) {
            setLastUpdated(null);
          }
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <footer className="relative bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />
      </div>

      {/* Back to Top Button */}
      <div className="relative z-20 flex justify-center">
        <button
          onClick={scrollToTop}
          className="absolute -top-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-500/30 border-2 border-[#0a0a0a]"
          aria-label="Back to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          className="pt-16 pb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                  Ghatak Sports Academy India™
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Empowering youth and athletes through structured training,
                  discipline, and innovation. Join our thriving community to
                  unlock your strength and potential.
                </p>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                      <Phone className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <a
                        href="tel:+916394135988"
                        className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium"
                      >
                        +91 63941 35988
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                      <Mail className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <a
                        href="mailto:ghatakgsai@gmail.com"
                        className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 text-sm font-medium"
                      >
                        ghatakgsai@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-yellow-500/20 transition-colors">
                      <MapPin className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Badshah kheda, Takrohi Rd, nearby Balaji Chauraha,
                        Indira Nagar, Lucknow, Uttar Pradesh 226028
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                      <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm">
                        Mon-Sat: 4:00 PM - 8:00 PM
                        <br />
                        Sun: 7:00 AM - 11:00 AM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Links Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
                Quick Links
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="group text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Programs Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
                Our Programs
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {programs.map((program) => (
                  <li key={program.name}>
                    <a
                      href={program.href}
                      className="group text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-sm flex items-center gap-2"
                    >
                      <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                      <span>{program.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Social & Newsletter Column */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <h4 className="text-lg font-bold text-white mb-6 relative inline-block">
                Connect With Us
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"></div>
              </h4>

              {/* Social Links */}
              <div className="flex gap-4 mb-8">
                <a
                  href="https://www.youtube.com/@ghatakgsai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="group w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                >
                  <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                </a>
                <a
                  href="https://www.instagram.com/ghataksportsacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                >
                  <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                </a>
                <a
                  href="https://x.com/ghataksportsacademy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="group w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
                >
                  <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
                </a>
              </div>

              {/* Call to Action */}
              <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                <h5 className="text-base font-semibold text-white mb-2">
                  Ready to Start?
                </h5>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  Join our academy and begin your martial arts journey today.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href="tel:+916394135988"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 text-sm hover:-translate-y-0.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white font-semibold rounded-xl shadow hover:bg-white/20 transition-all duration-300 text-sm hover:-translate-y-0.5"
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
          className="border-t border-gray-800 py-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          variants={itemVariants}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-center md:text-left order-2 md:order-1">
              <p className="text-gray-500 text-xs sm:text-sm">
                &copy; {new Date().getFullYear()} Ghatak Sports Academy India™.
                All rights reserved.
              </p>
            </div>

            {/* Last updated badge */}
            {lastUpdated && (
              <div className="order-3 md:order-2 ml-0 md:ml-4">
                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-[#0a0a0a] px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  <svg
                    className="w-3 h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 8v5l3 3" />
                  </svg>
                  <span>Last updated</span>
                  <span className="ml-1 text-[11px] text-[#071018] opacity-90">
                    {lastUpdated}
                  </span>
                </span>
              </div>
            )}

            {/* Legal Links */}
            <div className="flex items-center gap-6 order-1 md:order-2">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 text-xs sm:text-sm"
                  >
                    {link.name}
                  </a>
                  {index < legalLinks.length - 1 && (
                    <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Credits */}
          <div className="text-center mt-6 pt-6 border-t border-gray-800/50">
            <div className="inline-flex items-center gap-1.5 text-gray-500 text-xs">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-red-500 animate-pulse fill-red-500" />
              <span>by</span>
              <a
                href="https://ellowdigitals.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400 transition-colors duration-300 font-medium"
              >
                EllowDigital
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
