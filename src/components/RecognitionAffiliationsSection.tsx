
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from './ui/carousel';
import { Award, Shield, Trophy, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const logos = [
  { name: 'Government of India', url: '/assets/af_img/india.png', category: 'government' },
  {
    name: 'Ministry of Youth Affairs & Sports',
    url: '/assets/af_img/ministry.png',
    category: 'government'
  },
  { name: 'Fit India', url: '/assets/af_img/fit-india.png', category: 'fitness' },
  { name: 'Khelo India', url: '/assets/af_img/khelo-india.png', category: 'sports' },
  { name: 'MSME', url: '/assets/af_img/MSME.png', category: 'certification' },
  { name: 'ISO Certified', url: '/assets/af_img/iso.png', category: 'certification' },
  { name: 'SGFI', url: '/assets/af_img/SGF.png', category: 'federation' },
  { name: 'UP Olympic Association', url: '/assets/af_img/up-olympic.png', category: 'sports' },
  {
    name: 'UP Kalaripayattu Federation',
    url: '/assets/af_img/up-kalarippayattu.png',
    category: 'federation'
  },
  { name: 'Taekwondo Federation', url: '/assets/af_img/takewondo.png', category: 'federation' },
  {
    name: 'Indian Kalaripayattu Federation',
    url: '/assets/af_img/in-kalarippayattufed.png',
    category: 'federation'
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
      ease: "easeOut",
    },
  },
};

const highlights = [
  {
    icon: Shield,
    title: 'Government Recognized',
    description: 'Officially recognized by Government of India and Ministry of Youth Affairs & Sports',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Trophy,
    title: 'Sports Federations',
    description: 'Affiliated with multiple national and state sports federations',
    color: 'from-yellow-500 to-red-500',
  },
  {
    icon: Star,
    title: 'Quality Certified',
    description: 'ISO certified academy with MSME registration for quality assurance',
    color: 'from-green-500 to-emerald-600',
  },
];

export default function RecognitionAffiliationsSection() {
  return (
    <section
      id="recognitions"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="recognitions-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
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
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Trust & Excellence
            </span>
          </div>

          <h2 id="recognitions-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Recognitions &
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              Affiliations
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Proudly recognized and affiliated with premier national and state organizations driving excellence in sports, fitness, and martial arts.
          </p>
        </motion.div>

        {/* Highlights Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-yellow-200/50"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${highlight.color} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <highlight.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors duration-300">
                  {highlight.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Logo Carousel Section */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-white/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Prestigious Affiliations
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These recognitions validate our commitment to excellence and ensure the highest standards in training and education.
            </p>
          </div>

          <div className="relative flex items-center w-full justify-center">
            <Carousel
              opts={{
                align: 'center',
                loop: true,
                slidesToScroll: 2,
                dragFree: true,
              }}
              className="w-full max-w-5xl"
            >
              <CarouselPrevious 
                aria-label="Scroll left" 
                className="bg-white/80 hover:bg-white border-yellow-200 text-yellow-600 hover:text-yellow-700 shadow-lg hover:shadow-xl"
              />
              <CarouselContent className="gap-4 md:gap-6 py-6">
                {logos.map((logo, index) => (
                  <CarouselItem
                    key={logo.name}
                    className="basis-1/3 xs:basis-1/4 md:basis-1/6 flex justify-center"
                  >
                    <motion.div
                      className="group flex flex-col items-center min-w-[100px] max-w-[120px] flex-shrink-0 p-4"
                      title={logo.name}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative bg-white rounded-2xl p-4 shadow-lg group-hover:shadow-2xl transition-all duration-300 border border-yellow-100/50 group-hover:border-yellow-200 mb-4">
                        <img
                          src={logo.url}
                          alt={logo.name}
                          loading="lazy"
                          className="h-16 w-auto object-contain mx-auto grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      </div>
                      <span className="text-xs text-center text-gray-600 group-hover:text-yellow-700 transition-colors font-medium leading-tight max-w-[100px]">
                        {logo.name}
                      </span>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext 
                aria-label="Scroll right" 
                className="bg-white/80 hover:bg-white border-yellow-200 text-yellow-600 hover:text-yellow-700 shadow-lg hover:shadow-xl"
              />
            </Carousel>
          </div>

          <div className="text-center mt-12 pt-8 border-t border-gray-100">
            <p className="text-gray-500 text-sm mb-6">
              These affiliations ensure our training programs meet the highest national and international standards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg">
                <Trophy className="w-4 h-4" />
                <span>Excellence Recognized</span>
              </div>
              
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg border border-gray-200">
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
