
import React from "react";

const founderImg =
  "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?auto=format&fit=crop&w=600&q=80"; // Placeholder

export default function FounderSection() {
  return (
    <section id="founder" className="px-2 xs:px-4 py-10 xs:py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-10">
        <img
          src={founderImg}
          alt="Founder - Mr. Nitesh Yadav"
          className="rounded-xl shadow-lg object-cover w-full max-w-xs md:max-w-[210px] min-h-[200px] mb-5 md:mb-0"
          loading="lazy"
        />
        <div className="w-full">
          <h2 className="text-xl xs:text-2xl md:text-3xl font-bold text-yellow-400 mb-2">Meet the Founder</h2>
          <h3 className="text-base xs:text-lg font-semibold text-gray-800 mb-2">Mr. Nitesh Yadav, Founder &amp; Director 🥇</h3>
          <p className="text-sm xs:text-base text-justify mb-3 xs:mb-4">
            With decades of experience and a lifelong dedication to the martial arts, Mr. Yadav is committed to cultivating champions and empowering individuals to reach their full potential. As a mentor, he instills the values of discipline, resilience, and excellence in every student.
          </p>
          <blockquote className="border-l-4 border-yellow-400 pl-4 italic text-sm xs:text-base">
            <strong>
              “With decades of experience, I remain dedicated to the art of martial mastery and mentoring the champions of tomorrow.”
            </strong>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
