
import React from 'react';
import { Heart, Shield, Target, Trophy, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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

  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'Dedicated to nurturing talent with heart and soul',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Discipline',
      description: 'Building character through structured training',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Trophy,
      title: 'Excellence',
      description: 'Striving for the highest standards in everything',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Creating bonds that last beyond the academy',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section
      id="about"
      className="relative py-20 md:py-32 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-16 md:mb-20" variants={itemVariants}>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700 tracking-wide">About Us</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Building Champions
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-600">
              For Life
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            At Ghatak Sports Academy India™, we believe in transforming lives through martial arts, 
            fitness, and character development. Our holistic approach creates champions both on and off the mat.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Content */}
          <motion.div className="space-y-8" variants={itemVariants}>
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                We are committed to providing world-class martial arts training that goes beyond physical techniques. 
                Our mission is to develop <strong className="text-gray-900">confident, disciplined, and resilient individuals</strong> who 
                carry these values into every aspect of their lives.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Through expert instruction, state-of-the-art facilities, and a supportive community environment, 
                we empower students of all ages to <strong className="text-yellow-600">unlock their potential</strong> and achieve their goals.
              </p>
            </div>

            {/* Achievement Highlights */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Students Trained</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-lg">
                <div className="text-3xl font-bold text-red-600 mb-2">10+</div>
                <div className="text-gray-600 font-medium">Programs Offered</div>
              </div>
            </div>
          </motion.div>

          {/* Image/Visual */}
          <motion.div className="relative" variants={itemVariants}>
            <div className="relative bg-gradient-to-br from-yellow-100 to-red-100 rounded-3xl p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
                  <Target className="w-8 h-8 text-yellow-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Goal Focused</h4>
                  <p className="text-sm text-gray-600">Structured programs to achieve your objectives</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
                  <Shield className="w-8 h-8 text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Safe Training</h4>
                  <p className="text-sm text-gray-600">Certified instructors ensure safety first</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
                  <Users className="w-8 h-8 text-green-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Community</h4>
                  <p className="text-sm text-gray-600">Supportive environment for all levels</p>
                </div>
                <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
                  <Trophy className="w-8 h-8 text-red-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Excellence</h4>
                  <p className="text-sm text-gray-600">Committed to the highest standards</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div variants={itemVariants}>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do and shape the character of our academy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${value.color} rounded-full mb-4 shadow-lg`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
