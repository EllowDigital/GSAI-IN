import React from 'react';
import { Briefcase, Users, Award } from 'lucide-react';

export default function CorporateSection() {
  return (
    <section
      id="corporate"
      className="section-shell relative bg-[#050505] overflow-hidden py-16 md:py-24"
      aria-labelledby="corporate-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2
            id="corporate-heading"
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            Corporate & MNC Training Programs
          </h2>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Tailored self-defense, team-building and workplace wellness programs
            for organisations across Lucknow and Uttar Pradesh. We partner with
            HR and L&D teams to deliver measurable outcomes — safety training,
            confidence building, leadership under pressure, and resilience
            programs designed for corporate settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
            <div className="mx-auto w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">
              Corporate Self‑Defense
            </h3>
            <p className="text-gray-400 text-sm">
              Practical workshops for employees covering personal safety,
              situational awareness and de-escalation techniques.
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
            <div className="mx-auto w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">
              Team Building & Leadership
            </h3>
            <p className="text-gray-400 text-sm">
              Bespoke experiences focusing on communication, trust, crisis
              response and leadership in high-pressure situations.
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
            <div className="mx-auto w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">
              Executive Coaching
            </h3>
            <p className="text-gray-400 text-sm">
              One-on-one coaching for executives to improve confidence, presence
              and physical wellness as part of leadership development.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 text-white font-semibold shadow-lg"
          >
            Request a Corporate Proposal
          </a>
        </div>
      </div>
    </section>
  );
}
