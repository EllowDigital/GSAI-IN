import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, MapPin, Trophy } from 'lucide-react';

const heroImages = [
  '/assets/hero/slider0.webp',
  '/assets/hero/slider2.webp',
  '/assets/hero/slider4.webp',
  '/assets/hero/slider6.webp',
];

const programs = [
  { name: 'Mixed Martial Arts', href: '/programs/mma' },
  { name: 'Karate Do', href: '/programs/karate' },
  { name: 'Taekwondo', href: '/programs/taekwondo' },
  { name: 'Boxing & Kickboxing', href: '/programs/boxing' },
];

/**
 * Bento-grid hero for the homepage.
 * Charcoal & Ember palette, Bebas Neue display type, modular tiles.
 */
export default function HeroBento() {
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setImgIndex((i) => (i + 1) % heroImages.length),
      5000
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      className="bg-ink text-white/90 font-body px-4 pt-24 pb-8 md:px-8 md:pt-28 md:pb-12"
      aria-label="Academy overview"
    >
      <div className="mx-auto grid w-full max-w-7xl auto-rows-[150px] grid-cols-1 gap-4 md:grid-cols-4">
        {/* Hero tile */}
        <div className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-ink-line bg-ink-elevated p-6 sm:p-8 md:col-span-2 md:row-span-3">
          {heroImages.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                i === imgIndex
                  ? 'opacity-25 group-hover:opacity-35'
                  : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="relative z-20">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-ember px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ember-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Lucknow&apos;s Premier Dojo
            </span>
            <h1 className="mb-4 font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-7xl md:text-8xl">
              Ghatak Sports <span className="text-ember">Academy</span>
            </h1>
            <p className="mb-6 max-w-md text-sm text-white/70 sm:text-base">
              Government recognised, ISO 9001:2015 certified training in martial
              arts, self-defense and fitness for kids, women and adults.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/enroll"
                className="rounded-xl bg-ember px-6 py-3 font-bold text-ember-foreground transition-colors hover:bg-ember-strong"
              >
                Start Training
              </Link>
              <Link
                to="/about"
                className="rounded-xl border border-white/20 px-6 py-3 font-bold text-white transition-colors hover:bg-white/10"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Programs */}
        <div className="flex flex-col justify-between rounded-3xl border border-ink-line bg-ink-elevated p-6 md:col-span-1 md:row-span-2">
          <h2 className="font-display text-2xl tracking-wide text-ember">
            Elite Programs
          </h2>
          <ul className="mt-4 space-y-3">
            {programs.map((p) => (
              <li key={p.name}>
                <Link
                  to={p.href}
                  className="flex items-center justify-between border-b border-white/5 pb-2 text-sm text-white/85 transition-colors hover:text-ember"
                >
                  <span>{p.name}</span>
                  <ArrowRight className="h-4 w-4 text-ink-line" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Stat */}
        <div className="flex flex-col items-center justify-center rounded-3xl bg-ember p-6 text-center text-ember-foreground md:col-span-1 md:row-span-1">
          <span className="font-display text-5xl leading-none">500+</span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">
            Active Athletes
          </span>
        </div>

        {/* Achievements */}
        <div className="flex flex-col justify-between rounded-3xl border border-ink-line bg-ink-elevated p-6 md:col-span-1 md:row-span-2">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl tracking-wide text-white">
              <Trophy className="h-5 w-5 text-ember" /> Medals Won
            </h2>
            <p className="mt-2 text-sm text-white/50">
              State, national and international representation.
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-ink p-3 text-center">
              <div className="font-display text-2xl text-ember">120</div>
              <div className="text-[10px] uppercase tracking-wider text-white/50">
                Gold
              </div>
            </div>
            <div className="rounded-xl bg-ink p-3 text-center">
              <div className="font-display text-2xl text-white/70">85</div>
              <div className="text-[10px] uppercase tracking-wider text-white/50">
                Silver
              </div>
            </div>
          </div>
        </div>

        {/* About snippet */}
        <div className="flex items-center gap-5 rounded-3xl border border-ink-line bg-ink-elevated p-6 md:col-span-2 md:row-span-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ember">
            <ShieldCheck className="h-6 w-6 text-ember-foreground" />
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            Founded by Sensei Nitesh Yadav, GSAI is Lucknow&apos;s hub for
            combat sports — built on discipline, mental toughness and technical
            mastery.
          </p>
        </div>

        {/* Gallery */}
        <Link
          to="/gallery"
          className="group relative overflow-hidden rounded-3xl border border-ink-line bg-ink-elevated md:col-span-1 md:row-span-1"
          aria-label="View academy gallery"
        >
          <img
            src="/assets/hero/slider3.webp"
            alt="Students training at Ghatak Sports Academy India"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs font-bold uppercase tracking-widest text-white opacity-0 transition-opacity group-hover:opacity-100">
            View Gallery
          </span>
        </Link>

        {/* CTA */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-ember/30 bg-ink-elevated p-6 text-center md:col-span-1 md:row-span-1">
          <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ember">
            Join the pack
          </span>
          <h2 className="font-display text-2xl tracking-wide text-white">
            Free Trial Class
          </h2>
          <Link
            to="/enroll"
            className="mt-2 text-sm text-white/80 underline decoration-ember underline-offset-4 hover:text-white"
          >
            Book Now
          </Link>
        </div>

        {/* Location */}
        <div className="flex items-center gap-4 rounded-3xl border border-ink-line bg-ink-elevated p-6 md:col-span-4 md:row-span-1">
          <MapPin className="h-6 w-6 shrink-0 text-ember" />
          <p className="text-sm text-white/70">
            <span className="font-semibold text-white">Two Lucknow centres</span>{' '}
            — Badshah Kheda, Takrohi Road, Indira Nagar &amp; Matiyari branch.
            Mon–Sat 4:00 PM–8:00 PM, Sun 7:00 AM–11:00 AM.
          </p>
          <Link
            to="/contact"
            className="ml-auto hidden shrink-0 rounded-xl border border-white/20 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:inline-block"
          >
            Visit Us
          </Link>
        </div>
      </div>
    </section>
  );
}
