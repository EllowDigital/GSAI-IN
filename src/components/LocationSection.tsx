import React from 'react';
import { MapPin, Navigation, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const mainCampus = 'Naubasta Pulia, Takrohi Road, Indira Nagar, Lucknow';
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
    color: 'from-yellow-500 to-red-500',
  },
  {
    title: 'Branch Campus',
    address: branchCampus,
    timing: 'Mon-Sat: 6:00 AM - 9:00 PM',
    features: ['Training Facilities', 'Easy Access', 'Community Programs'],
    color: 'from-red-500 to-yellow-500',
  },
];

export default function LocationSection() {
  return (
    <section
      id="location"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="location-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
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
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Find Us
            </span>
          </div>

          <h2
            id="location-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              Locations
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Visit us at our main and branch campuses in Lucknow. Find directions
            and plan your visit to start your martial arts journey.
          </p>
        </motion.div>

        {/* Campus Cards */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {campusInfo.map((campus, index) => (
            <motion.div
              key={campus.title}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-yellow-200/50"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${campus.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                    {campus.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{campus.timing}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    {campus.address}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Features
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {campus.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full"></div>
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Get Directions</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Map Section */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Interactive Map
            </h3>
            <p className="text-gray-600 text-lg">
              Explore our locations and plan your visit with our interactive map
            </p>
          </div>

          <div className="relative w-full rounded-2xl shadow-xl overflow-hidden h-64 md:h-96 border-4 border-yellow-100/40 group">
            <iframe
              title="Ghatak Sports Academy Locations Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3557.7127555156358!2d81.02444217597154!3d26.912609860094033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3999596def6ea9c7%3A0x23d2ceb539bff92!2sGhatak%20Sports%20Academy%20India!5e0!3m2!1sen!2sin!4v1739461937485!5m2!1sen!2sin"
              width="100%"
              height="100%"
              allowFullScreen={true}
              loading="lazy"
              className="absolute inset-0 w-full h-full border-0 group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 mb-4">
              Map powered by Google Maps. Both campuses are shown for your
              reference.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Ghatak+Sports+Academy+India"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <MapPin className="w-4 h-4" />
                <span>View on Google Maps</span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Contact Us</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
