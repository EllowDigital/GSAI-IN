
import React from "react";
import { Medal, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
const founderImg = "/assets/img/founder.webp";

const containerVariants = {
  offscreen: {},
  onscreen: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  offscreen: { opacity: 0, y: 30 },
  onscreen: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 0.8,
    },
  },
};

export default function FounderSection() {
  return (
    <section
      id="founder"
      className="px-2 xs:px-4 py-10 xs:py-16 md:py-24 bg-yellow-50/80 border-b border-yellow-100 relative overflow-hidden"
    >
      {/* Decorative BG gradient flare */}
      <div className="absolute bottom-0 left-0 w-1/2 h-16 bg-gradient-to-r from-yellow-100 via-red-50 to-transparent opacity-65 pointer-events-none z-0" />
      {/* Subtle Sparkles top right */}
      <div className="absolute top-6 right-5 xs:top-8 xs:right-16 opacity-25 z-0 pointer-events-none">
        <Sparkles className="w-16 h-16 text-yellow-300 animate-pulse" />
      </div>
      <motion.div
        className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white/90 shadow-lg rounded-2xl p-6 xs:p-8 md:p-10 z-10 relative"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        <motion.div
          className="relative w-full flex justify-center md:block md:w-auto"
          variants={itemVariants}
        >
          <span className="absolute -top-4 -left-4 xs:-top-6 xs:-left-6 z-10 hidden md:block">
            <Medal size={42} className="text-yellow-400 drop-shadow" />
          </span>
          <span className="inline-block rounded-full p-1 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-100 shadow-lg transition-transform hover:scale-105">
            <img
              src={founderImg}
              alt="Founder - Mr. Nitesh Yadav"
              className="rounded-xl shadow-md object-cover w-40 xs:w-44 md:w-[210px] min-h-[200px] max-h-72 border-4 border-yellow-100"
              loading="lazy"
            />
          </span>
          <span className="absolute -bottom-3 -right-2 xs:-bottom-4 xs:-right-4 z-0">
            <Sparkles className="text-red-300/60 w-8 h-8 md:w-10 md:h-10" />
          </span>
        </motion.div>
        {/* Founder Details */}
        <motion.div className="flex-1 w-full md:w-auto" variants={itemVariants}>
          <div className="flex items-center justify-center md:justify-start mb-2 xs:mb-3 gap-2">
            <User className="text-yellow-400" size={24} />
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight text-center md:text-left relative">
              Meet <span className="text-yellow-400">the Founder</span>
              <span className="block h-1 w-12 xs:w-16 bg-gradient-to-r from-yellow-400 to-yellow-100 rounded-full mx-auto md:mx-0 mt-1" />
            </h2>
          </div>
          <div className="flex flex-row items-center gap-2 mb-3 xs:mb-4 justify-center md:justify-start">
            <span className="inline-block text-xs xs:text-sm font-semibold uppercase bg-yellow-200 text-yellow-900 px-2.5 py-1 rounded-full shadow-xs">
              Founder & Director
            </span>
            <span className="inline-block font-bold text-base xs:text-lg text-gray-900">
              Mr. Nitesh Yadav&nbsp;
              <span className="text-yellow-500 align-super text-xs">🥇</span>
            </span>
          </div>
          <p className="text-sm xs:text-base md:text-lg text-gray-700 mb-3 xs:mb-4 text-center md:text-justify">
            With a lifetime devoted to martial arts excellence, Mr. Nitesh Yadav <strong>inspires champions</strong> and empowers individuals to unlock their hidden potential. His unwavering dedication as a mentor instills discipline, confidence, and resilience in every student who steps into the academy.
          </p>
          <blockquote className="border-l-4 border-yellow-400 pl-4 py-2 italic text-base xs:text-lg font-semibold text-yellow-900 bg-yellow-100/60 rounded mb-4 text-center md:text-left shadow">
            <span>
              &ldquo;With decades of experience, I remain dedicated to the art of martial mastery and mentoring the champions of tomorrow.&rdquo;
            </span>
          </blockquote>
          <div className="text-sm xs:text-base text-gray-700 mt-2 text-center md:text-left">
            <span className="font-bold text-yellow-600">Champion values, lifelong growth:</span>{" "}
            Your journey to strength, honor, and self-mastery begins at <strong>Ghatak Sports Academy India™</strong>.
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
