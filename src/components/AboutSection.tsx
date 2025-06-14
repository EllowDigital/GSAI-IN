import React from "react";

const AboutSection = () => {
  return (
    <section id="about" className="px-4 py-20 md:py-28 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">
          About GSAI
        </h2>
        <p className="text-lg leading-relaxed text-justify text-gray-800 mb-4">
          Ghatak Sports Academy India™ (GSAI) is a{" "}
          <span className="text-yellow-400 font-semibold">
            Government-recognized
          </span>{" "}
          and{" "}
          <span className="text-red-500 font-semibold">
            ISO 9001:2015 certified
          </span>{" "}
          institution committed to empowering individuals through{" "}
          <strong>martial arts and self-defense</strong>. 💪✨
        </p>
        <p className="mb-4 text-justify text-gray-700">
          We seamlessly blend{" "}
          <span className="text-red-500 font-medium">
            traditional martial arts
          </span>{" "}
          with modern fitness techniques, unlocking your{" "}
          <span className="text-yellow-400 font-medium">
            physical strength
          </span>
          ,{" "}
          <span className="text-yellow-400 font-medium">
            mental focus
          </span>
          , and{" "}
          <span className="text-yellow-400 font-medium">
            moral discipline
          </span>
          . 🌟
        </p>
        <p className="text-justify text-gray-700">
          At GSAI, we foster a spirit of <strong>respect, confidence, and excellence</strong>, guiding every student
          on a journey of <em>self-mastery</em> and <em>empowerment</em>. 💖
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
