
import React from 'react';
import { Zap, Users, Clock, Award, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgramsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const programs = [
    {
      title: 'Karate',
      description: 'Traditional martial art focusing on striking techniques, discipline, and mental fortitude.',
      features: ['Traditional Forms', 'Self Defense', 'Competition Training', 'Character Building'],
      duration: '1-2 hours',
      level: 'All Levels',
      color: 'from-red-500 to-pink-500',
      popular: true,
    },
    {
      title: 'Taekwondo',
      description: 'Korean martial art emphasizing high kicks, fast hand techniques, and mental discipline.',
      features: ['Olympic Sport', 'High Kicks', 'Flexibility Training', 'Mental Focus'],
      duration: '1-2 hours',
      level: 'Beginner to Advanced',
      color: 'from-blue-500 to-indigo-500',
      popular: false,
    },
    {
      title: 'Kickboxing',
      description: 'High-intensity combat sport combining punches, kicks, and cardiovascular conditioning.',
      features: ['Cardio Workout', 'Strike Training', 'Fitness Focus', 'Stress Relief'],
      duration: '45-60 minutes',
      level: 'All Levels',
      color: 'from-yellow-500 to-orange-500',
      popular: false,
    },
    {
      title: 'MMA Training',
      description: 'Mixed martial arts combining various fighting disciplines for comprehensive combat training.',
      features: ['Ground Fighting', 'Stand-up Combat', 'Conditioning', 'Competition Prep'],
      duration: '1-2 hours',
      level: 'Intermediate to Advanced',
      color: 'from-purple-500 to-violet-500',
      popular: false,
    },
    {
      title: 'Boxing',
      description: 'The sweet science focusing on punching techniques, footwork, and defensive skills.',
      features: ['Punching Techniques', 'Footwork', 'Defense', 'Cardio Training'],
      duration: '1 hour',
      level: 'All Levels',
      color: 'from-green-500 to-emerald-500',
      popular: false,
    },
    {
      title: 'Cricket',
      description: 'Professional cricket training with focus on batting, bowling, and fielding techniques.',
      features: ['Batting Skills', 'Bowling Techniques', 'Fielding', 'Match Strategy'],
      duration: '2-3 hours',
      level: 'All Levels',
      color: 'from-amber-500 to-yellow-500',
      popular: true,
    },
  ];

  return (
    <section
      id="programs"
      className="relative py-20 md:py-32 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700 tracking-wide">Our Programs</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Train Like A
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-600">
              Champion
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of martial arts and sports programs designed for all ages and skill levels. 
            Each program is carefully crafted to build strength, character, and confidence.
          </p>
        </motion.div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <motion.div
              key={program.title}
              className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              {/* Popular Badge */}
              {program.popular && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3" />
                  Popular
                </div>
              )}

              {/* Program Header */}
              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${program.color} rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{program.title}</h3>
                <p className="text-gray-600 leading-relaxed">{program.description}</p>
              </div>

              {/* Program Features */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">What You'll Learn:</h4>
                <ul className="space-y-2">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Program Details */}
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{program.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{program.level}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full group/btn flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16 md:mt-20"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who have transformed their lives through our programs. 
              Book your free trial class today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span>Book Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="tel:+916394135988"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105"
              >
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
