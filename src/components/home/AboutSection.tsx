import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, Heart } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Holistic Training',
    description:
      'Merging traditional martial arts with modern fitness for total self-improvement and mastery.',
  },
  {
    icon: Heart,
    title: 'Values-Driven Growth',
    description:
      'Fostering respect, confidence, and personal excellence in every student who walks through our doors.',
  },
  {
    icon: Award,
    title: 'Empowerment for All',
    description:
      'Programs tailored for every age and skill level, guiding you on a journey of self-mastery.',
  },
];

const stats = [
  { number: '50+', label: 'Active Students' },
  { number: '⭐ 5.0', label: 'Google Rating' },
  { number: '12+', label: 'Professional Programs' },
  { number: 'Mar 2025', label: 'Established' },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      role="region"
      aria-label="About Ghatak Sports Academy India"
      className="section-shell relative bg-[#0a0a0a] overflow-hidden"
    >
      {/* Modern Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-red-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-16 w-72 h-72 bg-gradient-to-br from-red-600/10 to-yellow-500/10 rounded-full blur-3xl" />

      <div className="section-stack relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center p-3 mb-8 bg-yellow-500/10 rounded-full backdrop-blur-sm border border-yellow-500/20">
            <Users className="w-6 h-6 text-yellow-500 mr-3" />
            <span className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">
              About Us
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Where Tradition Meets{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Excellence
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed font-medium">
            Empowering champions since inception through the transformative
            power of martial arts, personal development, and unwavering
            dedication to excellence.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-20">
          {/* Left: Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Building Confident, Disciplined & Skilled Individuals
              </h3>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                At Ghatak Sports Academy India, we don't just teach martial arts
                – we transform lives. Our comprehensive approach combines
                ancient wisdom with modern training methods to create champions
                both inside and outside the dojo.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual Element */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-600/10 rounded-3xl p-8 shadow-2xl border border-white/10">
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-600 rounded-full blur-lg opacity-40"></div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-500 rounded-full blur-lg opacity-30"></div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center p-6 bg-black/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm md:text-base font-semibold text-gray-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Central Logo/Icon */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/20"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 1,
                  type: 'spring',
                  bounce: 0.4,
                }}
                viewport={{ once: true }}
                whileHover={{ rotate: 360 }}
                style={{ transition: 'transform 0.8s ease-in-out' }}
              >
                <Users className="w-12 h-12 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          className="text-center bg-gradient-to-r from-yellow-900/20 via-red-900/20 to-black rounded-3xl p-12 md:p-16 shadow-2xl border border-white/10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Begin Your Journey?
          </h3>
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their lives through
            our proven training methods.
          </p>
          <motion.a
            href="#programs"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Our Programs
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
