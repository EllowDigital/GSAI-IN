import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './ui/carousel';
import { Award, Shield, Trophy, Star } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const logos = [
  {
    name: 'Government of India',
    url: '/assets/af_img/india.png',
    category: 'government',
  },
  {
    name: 'Ministry of Youth Affairs & Sports',
    url: '/assets/af_img/ministry.png',
    category: 'government',
  },
  {
    name: 'Fit India',
    url: '/assets/af_img/fit-india.png',
    category: 'fitness',
  },
  {
    name: 'Khelo India',
    url: '/assets/af_img/khelo-india.png',
    category: 'sports',
  },
  { name: 'MSME', url: '/assets/af_img/MSME.png', category: 'certification' },
  {
    name: 'ISO Certified',
    url: '/assets/af_img/iso.png',
    category: 'certification',
  },
  { name: 'SGFI', url: '/assets/af_img/SGF.png', category: 'federation' },
  {
    name: 'UP Olympic Association',
    url: '/assets/af_img/up-olympic.png',
    category: 'sports',
  },
  {
    name: 'UP Kalaripayattu Federation',
    url: '/assets/af_img/up-kalarippayattu.png',
    category: 'federation',
  },
  {
    name: 'Taekwondo Federation',
    url: '/assets/af_img/takewondo.png',
    category: 'federation',
  },
  {
    name: 'Indian Kalaripayattu Federation',
    url: '/assets/af_img/in-kalarippayattufed.png',
    category: 'federation',
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const highlights = [
  {
    icon: Shield,
    title: 'Government Recognized',
    description:
      'Officially recognized by Government of India and Ministry of Youth Affairs & Sports',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Trophy,
    title: 'Sports Federations',
    description:
      'Affiliated with multiple national and state sports federations',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    icon: Star,
    title: 'Quality Certified',
    description:
      'ISO certified academy with MSME registration for quality assurance',
    color: 'from-green-500 to-emerald-600',
  },
];

export default function RecognitionAffiliationsSection() {
  return (
    <section
      id="recognitions"
      className="section-shell relative bg-gradient-to-br from-slate-50 via-white to-amber-50/30 overflow-hidden py-12 md:py-20 lg:py-24"
      aria-labelledby="recognitions-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-600 tracking-wide uppercase">
              Trust & Excellence
            </span>
          </div>

          <h2
            id="recognitions-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
          >
            Recognitions &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600">
              Affiliations
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Proudly recognized and affiliated with premier national and state
            organizations driving excellence in sports, fitness, and martial
            arts.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-yellow-400" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400" />
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-orange-400 to-transparent" />
          </div>
        </motion.div>

        {/* Highlights Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-yellow-200 flex flex-col items-center text-center h-full"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${highlight.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <highlight.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors">
                {highlight.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {highlight.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Logo Carousel Section */}
        <motion.div
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

          <div className="relative z-10 text-center mb-10 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Prestigious Affiliations
            </h3>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              These recognitions validate our commitment to excellence and
              ensure the highest standards in training and education.
            </p>
          </div>

          <div className="relative flex items-center w-full justify-center z-10">
            <Carousel
              opts={{
                align: 'center',
                loop: true,
                slidesToScroll: 1,
                dragFree: true,
              }}
              className="w-full max-w-6xl px-8 sm:px-12"
            >
              <CarouselPrevious
                aria-label="Scroll left"
                className="left-0 sm:-left-4 bg-white hover:bg-yellow-50 border-gray-200 hover:border-yellow-300 text-gray-600 hover:text-yellow-700 shadow-md hover:shadow-lg h-10 w-10 sm:h-12 sm:w-12"
              />
              <CarouselContent className="-ml-4 py-4">
                {logos.map((logo, index) => (
                  <CarouselItem
                    key={logo.name}
                    className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 flex justify-center"
                  >
                    <motion.div
                      className="group flex flex-col items-center w-full max-w-[140px]"
                      title={logo.name}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative w-full aspect-square bg-white rounded-2xl p-4 shadow-md group-hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-yellow-200 flex items-center justify-center mb-3">
                        <img
                          src={logo.url}
                          alt={logo.name}
                          loading="lazy"
                          className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-80 group-hover:opacity-100"
                        />
                      </div>
                      <span className="text-xs sm:text-sm text-center text-gray-500 group-hover:text-yellow-700 transition-colors font-medium leading-tight line-clamp-2">
                        {logo.name}
                      </span>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext
                aria-label="Scroll right"
                className="right-0 sm:-right-4 bg-white hover:bg-yellow-50 border-gray-200 hover:border-yellow-300 text-gray-600 hover:text-yellow-700 shadow-md hover:shadow-lg h-10 w-10 sm:h-12 sm:w-12"
              />
            </Carousel>
          </div>

          <div className="text-center mt-10 md:mt-12 pt-8 border-t border-gray-100 relative z-10">
            <p className="text-gray-500 text-sm mb-6">
              These affiliations ensure our training programs meet the highest
              national and international standards.
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-100">
                <Trophy className="w-4 h-4" />
                <span>Excellence Recognized</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100">
                <Shield className="w-4 h-4" />
                <span>Quality Assured</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
