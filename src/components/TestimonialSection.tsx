import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Star } from 'lucide-react';

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
      'The range of programs and the supportive environment make every session enjoyable. I’ve gained new skills and lifelong friends!',
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
      className="py-12 xs:py-16 md:py-20 px-2 xs:px-3 md:px-4 bg-gradient-to-l from-white via-yellow-50 to-red-50 border-b border-yellow-100"
      aria-labelledby="testimonial-heading"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-2 justify-center w-full">
            <Star className="text-yellow-400" size={32} aria-hidden="true" />
            <h2
              className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow text-center w-full"
              id="testimonial-heading"
            >
              What Our GSAI Community Says
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-xl">
            Hear from students and parents about their journey with Ghatak
            Sports Academy India.
          </p>
        </div>
        <div className="grid gap-6 xs:gap-8 md:gap-10 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((t, i) => (
            <Card
              key={t.name}
              className="bg-white border-yellow-100 shadow-lg rounded-xl hover:shadow-xl transition-shadow min-h-[260px] flex flex-col"
              aria-label={`Testimonial by ${t.name}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-red-500">
                  {t.name}
                </CardTitle>
                <CardDescription className="text-yellow-500 font-medium">
                  {t.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-700 italic text-base flex-1 flex items-center">
                <span>“{t.quote}”</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
