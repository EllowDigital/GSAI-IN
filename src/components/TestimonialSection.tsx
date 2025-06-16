
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Shriti Yadav',
    quote:
      'Joining Ghatak Sports Academy India has been a life-changing experience. The coaches are highly skilled and motivating. Proud to be part of the GSAI family!',
    role: 'Taekwondo Student',
  },
  {
    name: 'Sandeep Yadav',
    quote:
      'As a parent, I appreciate the focus on discipline, fitness, and resilience. My child has grown so much since joining. Highly recommended for all ages.',
    role: 'Parent of Young Athlete',
  },
  {
    name: 'Sarwan Yadav',
    quote:
      'The range of programs and the supportive environment make every session enjoyable. I've gained new skills and lifelong friends!',
    role: 'Kalarippayattu Practitioner',
  },
  {
    name: 'Shivansh Yadav',
    quote:
      'The training, events, and community spirit at GSAI are unmatched. I feel stronger and more confident every day.',
    role: 'Martial Arts Enthusiast',
  },
];

export default function TestimonialSection() {
  return (
    <section
      id="testimonials"
      className="py-12 xs:py-16 md:py-20 px-2 xs:px-3 md:px-4 bg-gradient-to-br from-white via-yellow-50/30 to-red-50/20 border-b border-yellow-100/50 relative overflow-hidden"
      aria-labelledby="testimonial-heading"
    >
      {/* Glassmorphism Background Elements */}
      <div className="absolute top-16 right-10 w-36 h-36 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl backdrop-blur-sm" />
      <div className="absolute bottom-20 left-16 w-28 h-28 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-3xl backdrop-blur-sm" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-neumorphic border border-white/30">
            <Star className="text-yellow-400 w-6 h-6 mr-2" aria-hidden="true" />
            <span className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">Testimonials</span>
          </div>
          
          <h2
            className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight text-center w-full mb-2"
            id="testimonial-heading"
          >
            What Our GSAI Community Says
          </h2>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-xl">
            Hear from students and parents about their journey with Ghatak
            Sports Academy India.
          </p>
        </div>
        
        <div className="grid gap-6 xs:gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card
                className="bg-white/60 backdrop-blur-md border-white/30 shadow-neumorphic hover:shadow-neumorphic-hover rounded-xl hover:bg-white/70 transition-all duration-500 min-h-[260px] flex flex-col group"
                aria-label={`Testimonial by ${t.name}`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-red-500 group-hover:text-red-600 transition-colors duration-300">
                    {t.name}
                  </CardTitle>
                  <CardDescription className="text-yellow-500 font-medium group-hover:text-yellow-600 transition-colors duration-300">
                    {t.role}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-gray-700 italic text-base flex-1 flex items-center group-hover:text-gray-800 transition-colors duration-300">
                  <span>"{t.quote}"</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
