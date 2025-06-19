
import React from 'react';
import { Star, Quote, Heart, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TestimonialSection() {
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

  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Student Parent',
      content: 'My son has been training at GSAI for 2 years now. The transformation in his confidence and discipline is remarkable. The instructors are patient, skilled, and truly care about each student\'s development.',
      rating: 5,
      image: '👨‍💼',
    },
    {
      name: 'Priya Patel',
      role: 'Adult Student',
      content: 'As a working professional, I was looking for a way to stay fit and learn self-defense. GSAI provided exactly what I needed. The flexible timing and supportive environment made my journey enjoyable.',
      rating: 5,
      image: '👩‍💼',
    },
    {
      name: 'Arjun Singh',
      role: 'Competitive Athlete',
      content: 'Training at GSAI prepared me for national competitions. The advanced techniques, personalized coaching, and mental conditioning helped me achieve my goals. Highly recommend for serious athletes.',
      rating: 5,
      image: '🏆',
    },
    {
      name: 'Meera Gupta',
      role: 'Beginner Student',
      content: 'I was nervous about starting martial arts at 35, but the welcoming atmosphere at GSAI made me feel comfortable from day one. The step-by-step approach helped me progress steadily.',
      rating: 5,
      image: '👩‍🎓',
    },
    {
      name: 'Vikram Kumar',
      role: 'Student Parent',
      content: 'The values taught at GSAI go beyond martial arts. My daughter has learned respect, perseverance, and leadership. It\'s more than a sports academy - it\'s a character-building institution.',
      rating: 5,
      image: '👨‍👧',
    },
    {
      name: 'Ananya Reddy',
      role: 'Teen Student',
      content: 'GSAI helped me overcome my shyness and build self-confidence. The anti-bullying skills and self-defense techniques have made me feel empowered. The community here feels like family.',
      rating: 5,
      image: '👧',
    },
  ];

  return (
    <section
      id="testimonials"
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
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700 tracking-wide">Testimonials</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            What Our Community
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-600">
              Says About Us
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear from our students, parents, and athletes about their transformative experiences at 
            Ghatak Sports Academy India™. These stories inspire us to continue our mission of excellence.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              {/* Quote Icon */}
              <div className="flex items-center justify-between mb-4">
                <Quote className="w-8 h-8 text-yellow-500 opacity-50" />
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {testimonial.image}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-16 md:mt-20"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
            <Trophy className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Join Our Success Community
            </h3>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Over 500+ students have transformed their lives with us. Be the next success story and 
              experience the difference that quality training and community support can make.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-yellow-100 text-sm">Happy Students</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
                <div className="text-yellow-100 text-sm">Average Rating</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="text-3xl font-bold text-white mb-2">8+</div>
                <div className="text-yellow-100 text-sm">Years Experience</div>
              </div>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span>Start Your Journey Today</span>
              <Heart className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
