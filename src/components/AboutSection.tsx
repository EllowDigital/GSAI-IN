
const founderImg =
  "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?auto=format&fit=crop&w=600&q=80"; // Placeholder

export default function AboutSection() {
  return (
    <section id="about" className="px-4 py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <img
            src={founderImg}
            alt="Founder - Mr. Nitesh Yadav"
            className="rounded-xl shadow-lg object-cover w-full max-h-[400px]"
            loading="lazy"
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-3">
            About GSAI
          </h2>
          <p className="text-base leading-relaxed text-justify mb-4">
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
          <p className="mb-4 text-justify">
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
          <p className="mb-4 text-justify">
            At GSAI, we foster a spirit of <strong>respect, confidence, and excellence</strong>, guiding every student
            on a journey of <em>self-mastery</em> and <em>empowerment</em>. 💖
          </p>
          <blockquote className="border-l-4 border-yellow-400 pl-4 italic mt-6">
            <strong>
              “With decades of experience, I remain dedicated to the art of martial mastery and mentoring the champions of tomorrow.”
            </strong>
            <br />
            <span className="text-sm text-gray-500">
              – Mr. Nitesh Yadav, Founder &amp; Director 🥇
            </span>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
