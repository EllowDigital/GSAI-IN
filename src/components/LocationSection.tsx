import React from 'react';
import { MapPin, Navigation, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const mainCampus =
  'Badshah kheda, Takrohi Rd, nearby Balaji Chauraha, Indira Nagar, Lucknow, Uttar Pradesh 226028';
const branchCampus = 'Hardasi Kheda, Deva Road, Matiyari, Lucknow';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
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

const campusInfo = [
  {
    title: 'Main Campus',
    address: mainCampus,
    timing: 'Mon-Sat: 6:00 AM - 9:00 PM',
    features: [
      'Full Training Facilities',
      'Equipment Available',
      'Parking Available',
    ],
    color: 'from-yellow-500 to-orange-600',
    mapLink: 'https://maps.app.goo.gl/JQRsU9jEfZZY4TVL8',
  },
  {
    title: 'Branch Campus',
    address: branchCampus,
    timing: 'Mon-Sat: 6:00 AM - 9:00 PM',
    features: ['Training Facilities', 'Easy Access', 'Community Programs'],
    color: 'from-orange-500 to-red-600',
    mapLink: 'https://maps.app.goo.gl/za115VoiZEWWJcZa6',
  },
];

export default function LocationSection() {
  return (
    <section
      id="location"
      className="section-shell relative bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden py-12 md:py-20 lg:py-24"
      aria-labelledby="location-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-600 tracking-wide uppercase">
              Find Us
            </span>
          </div>

          <h2
            id="location-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
          >
            Our{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600">
              Locations
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Visit us at our main and branch campuses in Lucknow. Find directions
            and plan your visit to start your martial arts journey.
          </p>
        </motion.div>

        {/* Campus Cards */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {campusInfo.map((campus, index) => (
            <motion.div
              key={campus.title}
              className="group bg-white rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-yellow-200 flex flex-col h-full"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              <div className="flex items-start gap-4 sm:gap-6 mb-6">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${campus.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                >
                  <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-yellow-700 transition-colors">
                    {campus.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{campus.timing}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex-grow">
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <Navigation className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-medium">
                    {campus.address}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {campus.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-gray-600 text-sm"
                      >
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <a
                  href={campus.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center gap-2 py-3 text-base shadow-md hover:shadow-lg"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Map Section */}
        <motion.div
          className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl border border-gray-100"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Interactive Map
            </h3>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Explore our locations and plan your visit with our interactive map
            </p>
          </div>

          <div className="relative w-full rounded-2xl shadow-inner overflow-hidden h-[300px] sm:h-[400px] md:h-[500px] border border-gray-200 bg-gray-100 group">
            <iframe
              title="Ghatak Sports Academy Locations Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3558.268!2d81.035803!3d26.8949872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3999596def6ea9c7%3A0x23d2ceb539bff92!2sGhatak%20Sports%20Academy%20India!5e0!3m2!1sen!2sin!4v1734875064321!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            />
            
            {/* Overlay for better interaction hint */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors duration-300" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a
              href="https://www.google.com/maps/search/Ghatak+Sports+Academy+India/@26.8949872,81.035803,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto justify-center gap-2 px-8"
            >
              <MapPin className="w-4 h-4" />
              <span>View on Google Maps</span>
            </a>

            <a
              href="#contact"
              className="btn-secondary w-full sm:w-auto justify-center gap-2 px-8"
            >
              <Sparkles className="w-4 h-4" />
              <span>Contact Us</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
