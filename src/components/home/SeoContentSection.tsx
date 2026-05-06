import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Long-form SEO content block for the homepage.
 * Adds 800+ words of keyword-rich copy with descriptive internal links
 * to /enroll, /student/login, /programs, and /locations/lucknow.
 */
export default function SeoContentSection() {
  return (
    <section
      id="about-academy"
      aria-labelledby="seo-content-heading"
      className="section-shell relative bg-[#070707] py-16 md:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-yellow-500">
            India's Premier Martial Arts Academy
          </p>
          <h2
            id="seo-content-heading"
            className="mt-3 text-3xl sm:text-4xl font-bold text-white"
          >
            Karate, Taekwondo, MMA, Boxing & Self-Defense Training in Lucknow
          </h2>
        </header>

        <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed space-y-6">
          <p>
            <strong>Ghatak Sports Academy India™ (GSAI)</strong> is a
            government-recognised martial arts and combat sports institute
            headquartered in <strong>Lucknow, Uttar Pradesh</strong>. For more
            than a decade we have trained children, teenagers, women, working
            professionals and law-enforcement officers in disciplined,
            world-class martial arts. From beginners stepping onto the mat for
            the very first time to national-level athletes preparing for
            championships, our certified coaches deliver structured curricula
            in <Link to="/programs" className="text-yellow-400 hover:underline">Karate</Link>,
            {' '}
            <Link to="/programs" className="text-yellow-400 hover:underline">Taekwondo</Link>,
            {' '}
            <Link to="/programs" className="text-yellow-400 hover:underline">Mixed Martial Arts (MMA)</Link>,
            {' '}
            <Link to="/programs" className="text-yellow-400 hover:underline">Boxing</Link>,
            {' '}
            <Link to="/programs" className="text-yellow-400 hover:underline">Kickboxing</Link>,
            {' '}
            <Link to="/programs" className="text-yellow-400 hover:underline">Brazilian Jiu-Jitsu (BJJ)</Link>,
            {' '}Kalaripayattu and modern Self-Defense.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            Why GSAI is the Best Martial Arts Academy in Lucknow
          </h3>
          <p>
            Choosing the right academy shapes a student's confidence, fitness
            and long-term success in combat sports. GSAI combines traditional
            martial arts values — respect, discipline and perseverance — with
            modern sports science. Every program is led by{' '}
            <strong>certified black-belt instructors</strong> with national and
            international competition experience. Our purpose-built training
            halls in <strong>Indira Nagar</strong> and{' '}
            <strong>Naubasta Kala, Jankipuram</strong> feature professional
            mats, focus pads, heavy bags, MMA cages and dedicated areas for
            grappling and conditioning. Visit our{' '}
            <Link to="/locations/lucknow" className="text-yellow-400 hover:underline">
              Lucknow training centre page
            </Link>{' '}
            for directions, hours and a full facility tour.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            Karate Classes in Lucknow for Kids and Adults
          </h3>
          <p>
            Karate at GSAI follows the <strong>Shotokan and World Karate
            Federation (WKF)</strong> syllabus, with a transparent belt-grading
            system from White Belt through Black Belt Dan ranks. Children as
            young as four learn coordination, balance and self-control through
            playful, structured drills. Teen and adult karateka develop kihon
            (basics), kata (forms) and kumite (sparring) under coaches who have
            represented India at international tournaments. Each promotion is
            tracked through our digital{' '}
            <Link to="/student/login" className="text-yellow-400 hover:underline">
              student portal
            </Link>{' '}
            so parents and athletes can review attendance, fees and belt
            history at any time.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            Taekwondo Coaching with Olympic-Style Sparring
          </h3>
          <p>
            Our Taekwondo program is affiliated with the World Taekwondo (WT)
            framework. Students train Olympic-style sparring, breaking
            techniques and Poomsae forms. Dynamic kicking drills, plyometrics
            and flexibility work make Taekwondo one of the most popular
            disciplines for young athletes in <strong>Lucknow and Uttar
            Pradesh</strong>. We regularly send students to district, state and
            national selections, with multiple medallists every season.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            MMA, Boxing and Kickboxing for Real-World Combat Fitness
          </h3>
          <p>
            For older teens and adults seeking high-intensity combat training,
            our <strong>MMA, Boxing and Kickboxing</strong> programs blend
            striking, clinch work and ground fighting. Sessions are programmed
            in periodised blocks — fundamentals, technical sparring, strength
            and conditioning, and competition prep. Whether your goal is to
            compete in amateur boxing, train for fitness, or simply learn to
            defend yourself, GSAI offers a clear, measurable progression path.
            Browse the full{' '}
            <Link to="/programs" className="text-yellow-400 hover:underline">
              list of programs and fees
            </Link>{' '}
            to compare disciplines.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            Women's Self-Defense Training in Lucknow
          </h3>
          <p>
            Personal safety is a fundamental right. Our{' '}
            <strong>self-defense classes for women and girls</strong> in
            Lucknow focus on situational awareness, verbal de-escalation, and
            practical techniques against the most common threats. We also run
            corporate workshops for IT companies, schools and colleges across
            Uttar Pradesh, building safer communities one cohort at a time.
            Schools, NGOs and corporates can request a tailored proposal
            through our{' '}
            <Link to="/enroll" className="text-yellow-400 hover:underline">
              enrolment page
            </Link>.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            Kalaripayattu — India's Oldest Martial Art
          </h3>
          <p>
            Few academies in North India teach <strong>Kalaripayattu</strong>,
            the ancient Keralite martial art often called the mother of all
            combat systems. GSAI proudly preserves this heritage with weekend
            sessions covering Meipayattu (body conditioning), Kolthari (stick
            fighting) and Angathari (weapon forms). It is a unique opportunity
            for students in <strong>Lucknow</strong> to connect with a 3,000-year-old
            Indian tradition.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            How to Join — Easy Online Enrolment
          </h3>
          <p>
            Joining GSAI is simple. Visit our{' '}
            <Link to="/enroll" className="text-yellow-400 hover:underline">
              online enrolment page
            </Link>, choose your discipline, pick a batch, and complete the
            form. You will receive WhatsApp and email confirmation within
            hours, along with a <strong>free trial class</strong> invitation.
            Existing students can log in to the{' '}
            <Link to="/student/login" className="text-yellow-400 hover:underline">
              GSAI student portal
            </Link>{' '}
            to view fee history, belt promotions, upcoming events and
            certificates.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            Recognition, Affiliations and Certifications
          </h3>
          <p>
            GSAI is registered under the Government of India's MSME initiative
            and affiliated with multiple state and national federations
            including Karate, Taekwondo, MMA and Boxing associations. Our
            certificates are recognised for school sports quotas, government
            job applications and university admissions across India. To
            request a press kit, certificate copies or testimonials for
            partnerships, please contact us via the{' '}
            <a href="#contact" className="text-yellow-400 hover:underline">
              contact section
            </a>.
          </p>

          <h3 className="text-2xl font-bold text-white mt-8">
            Train in Lucknow, Compete Across India
          </h3>
          <p>
            Our students have won medals at district, state and national
            championships in Karate, Taekwondo, MMA and Boxing. We provide
            athlete welfare support, nutrition guidance and mental conditioning
            so every student can perform at their peak. Whether you are a
            parent in <strong>Indira Nagar</strong>, a college student in{' '}
            <strong>Gomti Nagar</strong>, or a working professional in{' '}
            <strong>Hazratganj</strong>, GSAI is the trusted name for martial
            arts training in <strong>Lucknow, Uttar Pradesh</strong>. Come
            train with India's most awarded coaches and discover the warrior
            within.
          </p>
        </div>
      </div>
    </section>
  );
}
