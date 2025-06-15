import React from "react";
import { Users, Info } from "lucide-react";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative px-2 xs:px-4 py-14 xs:py-20 md:py-28 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-gray-100"
    >
      {/* Decorative Icon */}
      <div className="absolute top-5 right-6 xs:top-4 xs:right-10 opacity-10 pointer-events-none hidden md:block">
        <Users size={82} />
      </div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 md:gap-14 items-center">
        {/* Left: Logo/Icon or illustration */}
        <div className="w-full md:w-2/5 flex flex-col items-center justify-center">
          <div className="bg-yellow-400 rounded-full shadow-md flex items-center justify-center mb-5 p-4">
            <Info size={44} className="text-white" />
          </div>
          <div className="font-extrabold text-xl xs:text-2xl text-yellow-400 text-center mb-2">
            About Ghatak Sports Academy India™
          </div>
          <div className="text-base xs:text-lg font-medium text-gray-700 text-center mb-1">
            <span className="block">Where Tradition meets Excellence</span>
            <span className="block text-red-500 font-semibold mt-1">Martial Arts &amp; Self-Development</span>
          </div>
        </div>
        {/* Right: Content */}
        <div className="w-full md:w-3/5 space-y-5 xs:space-y-7">
          <p className="text-base xs:text-lg leading-relaxed text-justify text-gray-800 font-semibold text-center xs:text-justify">
            <span className="text-yellow-500 font-bold">Empowering Champions Since Inception:</span>{" "}
            We are dedicated to building confident, disciplined, and skilled individuals through the transformative power of martial arts and personal development.
          </p>
          <ul className="list-none pl-0 mb-3 flex flex-col gap-2">
            <li className="flex items-start xs:items-center">
              <span className="inline-block w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center mr-2 text-lg font-bold">✔</span>
              <span className="text-gray-800">
                <strong>Holistic Training:</strong> Merging <span className="text-red-500 font-medium">traditional martial arts</span> and <span className="text-yellow-500 font-medium">modern fitness</span> for total self-improvement.
              </span>
            </li>
            <li className="flex items-start xs:items-center">
              <span className="inline-block w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center mr-2 text-lg font-bold">✔</span>
              <span className="text-gray-800">
                <strong>Values-Driven Growth:</strong> Fostering <span className="text-yellow-400 font-medium">respect, confidence, and personal excellence</span>.
              </span>
            </li>
            <li className="flex items-start xs:items-center">
              <span className="inline-block w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center mr-2 text-lg font-bold">✔</span>
              <span className="text-gray-800">
                <strong>Empowerment for All:</strong> Programs tailored for <span className="text-red-500 font-medium">every age and skill level</span>, guiding you on a journey of <em>self-mastery</em> and <em>empowerment</em>.
              </span>
            </li>
          </ul>
          <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-base xs:text-lg font-semibold bg-yellow-50/60 rounded text-center xs:text-left">
            "Join our thriving community and discover your true potential—physically, mentally, and morally!"
          </blockquote>
        </div>
      </div>
    </section>
  );
}
