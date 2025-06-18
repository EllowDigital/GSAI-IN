
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star, Quote, User, Award } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const testimonials = [
  {
    name: 'Shriti Yadav',
    quote:
      'Joining Ghatak Sports Academy India has been a life-changing experience. The coaches are highly skilled and motivating. Proud to be part of the GSAI family!',
    role: 'Taekwondo Student',
    program: 'Taekwondo',
    experience: '2+ years',
    rating: 5,
    avatar: 'S',
  },
  {
    name: 'Sandeep Yadav',
    quote:
      'As a parent, I appreciate the focus on discipline, fitness, and resilience. My child has grown so much since joining. Highly recommended for all ages.',
    role: 'Parent of Young Athlete',
    program: 'Youth Program',
    experience: '1+ years',
    rating: 5,
    avatar: 'S',
  },
  {
    name: 'Sarwan Yadav',
    quote:
      'The range of programs and the supportive environment make every session enjoyable. I\'ve gained new skills and lifelong friends!',
    role: 'Kalarippayattu Practitioner',
    program: 'Kalarippayattu',
    experience: '3+ years',
    rating: 5,
    avatar: 'S',
  },
  {
    name: 'Shivansh Yadav',
    quote:
      'The training, events, and community spirit at GSAI are unmatched. I feel stronger and more confident every day.',
    role: 'Martial Arts Enthusiast',
    program: 'Mixed Martial Arts',
    experience: '2+ years',
    rating: 5,
    avatar: 'S',
  },
  {
    name: 'Dr. Priya Sharma',
    quote:
      'The holistic approach to fitness and mental well-being at GSAI is remarkable. It\'s not just about physical training but overall personality development.',
    role: 'Fitness Enthusiast & Doctor',
    program: 'Fitness Training',
    experience: '1+ years',
    rating: 5,
    avatar: 'P',
  },
  {
    name: 'Rahul Kumar',
    quote:
      'From being a complete beginner to competing at state level - GSAI has transformed my journey. The personal attention and world-class training make all the difference.',
    role: 'Competitive Athlete',
    program: 'Competition Training',
    experience: '4+ years',
    rating: 5,
    avatar: 'R',
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

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${
            i < rating
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 fill-gray-300'
          } transition-colors duration-200`}
        />
      ))}
    </div>
  );
};

export default function TestimonialSection() {
  return (
    <section
      id="testimonials"
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
      aria-labelledby="testimonial-heading"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-red-200/30 to-yellow-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
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
              <Quote className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Community Voices
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            What Our
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700">
              GSAI Community Says
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Hear authentic stories from students, parents, and athletes who have experienced
            transformation, growth, and success at Ghatak Sports Academy India.
          </p>
        </motion.div>

        {/* Statistics Bar */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {[
            { label: 'Happy Students', value: '500+', icon: User },
            { label: 'Success Stories', value: '100+', icon: Award },
            { label: 'Average Rating', value: '4.9★', icon: Star },
            { label: 'Years Experience', value: '10+', icon: Quote },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <stat.icon className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={itemVariants}
        >
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem
                  key={testimonial.name}
                  className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="group h-full bg-white/80 backdrop-blur-sm border-yellow-100/50 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl overflow-hidden">
                    {/* Header with Avatar and Rating */}
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                              {testimonial.name}
                            </CardTitle>
                            <StarRating rating={testimonial.rating} />
                          </div>
                        </div>
                        <Quote className="w-8 h-8 text-yellow-400/30 group-hover:text-yellow-400/50 transition-colors duration-300" />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          {testimonial.program}
                        </span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          {testimonial.experience}
                        </span>
                      </div>
                    </CardHeader>

                    {/* Quote Content */}
                    <CardContent className="pt-0">
                      <blockquote className="text-gray-700 leading-relaxed text-base mb-4 relative">
                        <span className="text-yellow-400 text-4xl absolute -top-2 -left-1 font-serif leading-none">
                          "
                        </span>
                        <span className="pl-6">{testimonial.quote}</span>
                        <span className="text-yellow-400 text-4xl absolute -bottom-4 right-0 font-serif leading-none">
                          "
                        </span>
                      </blockquote>

                      <div className="pt-4 border-t border-gray-100">
                        <CardDescription className="text-yellow-600 font-semibold text-sm">
                          {testimonial.role}
                        </CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Buttons */}
            <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-yellow-200 text-yellow-600 hover:text-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 w-12 h-12" />
            <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-yellow-200 text-yellow-600 hover:text-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 w-12 h-12" />
          </Carousel>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-3xl p-8 md:p-12 border border-yellow-100/50 shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of satisfied students and families who have transformed their lives
              through our world-class martial arts and fitness programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <span>Join Our Community</span>
                <Award className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-yellow-200/50 transition-all duration-300 transform hover:scale-105">
                <span>Read More Stories</span>
                <Quote className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
