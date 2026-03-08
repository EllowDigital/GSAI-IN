import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Testimonial {
  id: string;
  student_name: string;
  review: string;
  rating: number;
}

interface ProgramTestimonialsProps {
  programSlug: string;
  programTitle: string;
}

export default function ProgramTestimonials({ programSlug, programTitle }: ProgramTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('program_testimonials' as any)
        .select('id, student_name, review, rating')
        .eq('program_slug', programSlug)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      setTestimonials((data as any as Testimonial[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [programSlug]);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-12 md:py-16 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white mb-8">
          What Students Say About{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
            {programTitle}
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10 relative"
            >
              <Quote className="w-6 h-6 text-yellow-500/30 absolute top-4 right-4" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${s < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.review}"</p>
              <p className="text-white font-semibold text-sm">— {t.student_name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
