
import React from 'react';
import { Trophy, Medal, Star, Award, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AchievementSection() {
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

  const achievements = [
    {
      icon: Trophy,
      number: '100+',
      title: 'Championships Won',
      description: 'Our students have claimed victories in national and international competitions',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      icon: Medal,
      number: '500+',
      title: 'Students Trained',
      description: 'Thousands of lives transformed through our comprehensive training programs',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Star,
      number: '8+',
      title: 'Years of Excellence',
      description: 'Building champions and character since our founding',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Award,
      number: '50+',
      title: 'Certified Instructors',
      description: 'Expert guidance from nationally and internationally certified coaches',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const milestones = [
    {
      year: '2016',
      title: 'Academy Founded',
      description: 'Ghatak Sports Academy India™ was established with a vision to create champions',
    },
    {
      year: '2018',
      title: 'First National Victory',
      description: 'Our students won their first national championship, marking our entry into competitive success',
    },
    {
      year: '2020',
      title: 'Digital Training Launch',
      description: 'Adapted to digital platforms, ensuring uninterrupted training during challenging times',
    },
    {
      year: '2024',
      title: 'Excellence Recognition',
      description: 'Recognized as one of the premier martial arts academies in the region',
    },
  ];

  return (
    <section
      id="achievements"
      className="relative py-20 md:py-32 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl animate-float" />
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
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700 tracking-wide">Our Achievements</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Celebrating
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-600">
              Success Stories
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our commitment to excellence has resulted in numerous achievements and recognition. 
            Here's a glimpse of our journey and the milestones we've achieved together.
          </p>
        </motion.div>

        {/* Achievement Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center group"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${achievement.color} rounded-full mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <achievement.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{achievement.number}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{achievement.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{achievement.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <motion.div variants={itemVariants}>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Journey</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From our humble beginnings to becoming a recognized academy, here's our story of growth and success
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-yellow-500 to-red-500 rounded-full hidden md:block" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Content */}
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-bold text-gray-900 mb-3">{milestone.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center shadow-lg hidden md:flex">
                    <Target className="w-8 h-8 text-white" />
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16 md:mt-20"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-3xl p-8 md:p-12 shadow-2xl">
            <Zap className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Be Part of Our Success Story
            </h3>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Join our academy and become the next success story. Your journey to excellence starts here!
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Start Your Journey</span>
              <Trophy className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
