
import React from "react";
import { Medal, User } from "lucide-react";

const founderImg = "/assets/img/founder.webp";

export default function FounderSection() {
  return (
    <section
      id="founder"
      className="px-2 xs:px-4 py-10 xs:py-16 md:py-24 bg-yellow-50/70 border-b border-yellow-100 relative"
    >
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white/90 shadow-lg rounded-2xl p-6 xs:p-8 md:p-10">
        {/* Founder Image with accent ring */}
        <div className="relative w-full flex justify-center md:block md:w-auto">
          <span className="absolute -top-4 -left-4 xs:-top-6 xs:-left-6 z-10 hidden md:block">
            <Medal size={42} className="text-yellow-400 drop-shadow" />
          </span>
          <span className="inline-block rounded-full p-1 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-100 shadow-lg transition-transform hover:scale-105">
            <img
              src={founderImg}
              alt="Founder - Mr. Nitesh Yadav"
              className="rounded-xl shadow-md object-cover w-40 xs:w-44 md:w-[210px] min-h-[200px] max-h-72"
              loading="lazy"
            />
          </span>
        </div>
        {/* Founder Details */}
        <div className="flex-1 w-full md:w-auto">
          <div className="flex items-center mb-2 xs:mb-3">
            <User className="text-yellow-400 mr-2" size={24} />
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
              Meet <span className="text-yellow-400">the Founder</span>
            </h2>
          </div>
          <div className="flex flex-row items-center gap-2 mb-3 xs:mb-4">
            <span className="inline-block text-xs xs:text-sm font-semibold uppercase bg-yellow-200 text-yellow-900 px-2.5 py-1 rounded-full shadow-xs">
              Founder & Director
            </span>
            <span className="inline-block font-bold text-base xs:text-lg text-gray-900">
              Mr. Nitesh Yadav&nbsp;
              <span className="text-yellow-500 align-super text-xs">🥇</span>
            </span>
          </div>
          <p className="text-sm xs:text-base md:text-lg text-gray-700 mb-3 xs:mb-4 text-justify">
            With a lifetime devoted to martial arts excellence, Mr. Nitesh Yadav <strong>inspires champions</strong> and empowers individuals to unlock their hidden potential. His unwavering dedication as a mentor instills discipline, confidence, and resilience in every student who steps into the academy.
          </p>
          <blockquote className="border-l-4 border-yellow-400 pl-4 py-2 italic text-base xs:text-lg font-semibold text-yellow-900 bg-yellow-100/60 rounded mb-4">
            <span>
              &ldquo;With decades of experience, I remain dedicated to the art of martial mastery and mentoring the champions of tomorrow.&rdquo;
            </span>
          </blockquote>
          <div className="text-sm xs:text-base text-gray-700 mt-2">
            <span className="font-bold text-yellow-600">Champion values, lifelong growth:</span>{" "}
            Your journey to strength, honor, and self-mastery begins at <strong>Ghatak Sports Academy India™</strong>.
          </div>
        </div>
      </div>
    </section>
  );
}
