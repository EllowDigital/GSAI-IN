import React, { useEffect, useCallback } from 'react';
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
  type CarouselApi,
} from '@/components/ui/carousel';
import { Star, Quote, User, Award } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Autoplay from 'embla-carousel-autoplay';

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
      "The range of programs and the supportive environment make every session enjoyable. I've gained new skills and lifelong friends!",
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
      "The holistic approach to fitness and mental well-being at GSAI is remarkable. It's not just about physical training but overall personality development.",
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
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300 fill-gray-300'
        }
      />
    ))}
  </div>
);

export default function TestimonialSection() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section
      id="testimonials"
      className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24"
      aria-labelledby="testimonial-heading"
    >
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-24 left-12 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-yellow-500/20 to-red-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-12 w-64 h-64 md:w-80 md:h-80 bg-gradient-to-r from-red-600/20 to-yellow-500/20 rounded-full blur-3xl" />
      </div>

      <div className="section-stack container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Community Voices
            </span>
          </div>
          <h2
            id="testimonial-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight"
          >
            What Our{' '}
            <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              GSAI Community Says
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-2">
            Real voices from students, parents, and athletes who’ve grown with
            Ghatak Sports Academy India.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {[
            { label: 'Happy Students', value: '500+', icon: User },
            { label: 'Success Stories', value: '10+', icon: Award },
            { label: 'Average Rating', value: '5 ★', icon: Star },
            { label: 'Years Experience', value: '8+', icon: Quote },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div
              key={label}
              className="text-center bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg p-4 sm:p-6 hover:shadow-xl hover:shadow-yellow-500/10 transition-all"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                {value}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 font-medium">
                {label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
          className="relative"
        >
          <Carousel
            opts={{ align: 'start', loop: true }}
            plugins={[plugin.current]}
            setApi={setApi}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((t, i) => (
                <CarouselItem
                  key={`${t.name}-${i}`}
                  className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 rounded-2xl flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-yellow-500 to-red-600 text-white flex items-center justify-center font-bold shadow-md text-sm sm:text-base">
                              {t.avatar}
                            </div>
                            <div>
                              <CardTitle className="text-sm sm:text-base font-semibold text-white">
                                {t.name}
                              </CardTitle>
                              <StarRating rating={t.rating} />
                            </div>
                          </div>
                          <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500/40" />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs rounded-full font-semibold border border-yellow-500/20">
                            {t.program}
                          </span>
                          <span className="bg-red-500/10 text-red-500 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs rounded-full font-semibold border border-red-500/20">
                            {t.experience}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col">
                        <blockquote className="relative text-gray-300 text-sm leading-relaxed flex-grow">
                          <span className="absolute -top-2 -left-1 text-2xl sm:text-3xl text-yellow-500/50">
                            “
                          </span>
                          <span className="pl-4 block">{t.quote}</span>
                          <span className="absolute -bottom-4 right-1 text-2xl sm:text-3xl text-yellow-500/50">
                            ”
                          </span>
                        </blockquote>
                        <CardDescription className="pt-4 border-t border-white/10 mt-4 text-yellow-500 font-medium text-xs">
                          {t.role}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="hidden md:block">
              <CarouselPrevious className="absolute -left-4 lg:-left-12 top-1/2 -translate-y-1/2 bg-black/50 border border-white/10 text-yellow-500 hover:text-yellow-400 hover:bg-black/70 shadow-md w-10 h-10 transition-all backdrop-blur-sm" />
              <CarouselNext className="absolute -right-4 lg:-right-12 top-1/2 -translate-y-1/2 bg-black/50 border border-white/10 text-yellow-500 hover:text-yellow-400 hover:bg-black/70 shadow-md w-10 h-10 transition-all backdrop-blur-sm" />
            </div>
          </Carousel>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-6 sm:mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === current
                    ? 'w-6 sm:w-8 bg-gradient-to-r from-yellow-500 to-red-600'
                    : 'w-1.5 sm:w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12 md:mt-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-900/20 via-red-900/20 to-black border border-white/10 rounded-3xl shadow-md p-6 sm:p-10">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-6 sm:mb-8">
              Join hundreds who have transformed their lives through our
              world-class programs in martial arts, fitness, and character
              development.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <a
                href="/#contact"
                className="btn-primary w-full sm:w-auto justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-400 hover:to-red-500 border-0 text-white"
              >
                Join Our Community <Award className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.instagram.com/ghatakgsai/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full sm:w-auto justify-center gap-2 py-2.5 sm:py-3 text-sm sm:text-base bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-yellow-500"
              >
                Read More Stories <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
