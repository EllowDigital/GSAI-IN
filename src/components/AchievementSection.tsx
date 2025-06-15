
import { Award, Medal, Trophy } from "lucide-react";

const achievements = [
  {
    icon: <Trophy className="text-yellow-500 w-10 h-10 md:w-12 md:h-12" aria-hidden="true" />,
    title: "National Championship Gold",
    description: "Anant Sahu secured gold with exceptional skill and dedication.",
  },
  {
    icon: <Award className="text-red-500 w-10 h-10 md:w-12 md:h-12" aria-hidden="true" />,
    title: "Best Technique Award",
    description: "Awarded for innovative technique and flawless execution.",
  },
  {
    icon: <Medal className="text-blue-500 w-10 h-10 md:w-12 md:h-12" aria-hidden="true" />,
    title: "International Recognition",
    description: "Nitesh Yadav received global acclaim at a prestigious competition.",
  },
];

export default function AchievementSection() {
  return (
    <section
      id="achievements"
      className="py-12 md:py-20 bg-gradient-to-r from-red-50 via-yellow-50 to-blue-50 border-b border-yellow-100"
      aria-labelledby="achievements-heading"
    >
      <div className="max-w-5xl mx-auto px-3">
        <div className="flex flex-col items-center mb-8 gap-2">
          <h2
            id="achievements-heading"
            className="text-2xl xs:text-3xl md:text-4xl font-bold text-red-500 tracking-tight drop-shadow text-center"
          >
            Achievements
          </h2>
          <p className="text-base md:text-lg font-medium text-gray-600 text-center max-w-2xl">
            Proud moments and milestones achieved by our athletes.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {achievements.map((a, i) => (
            <div key={a.title} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover-scale border border-gray-100 transition-all" aria-label={a.title}>
              <div className="mb-3">{a.icon}</div>
              <h3 className="text-lg md:text-xl font-black text-yellow-900 text-center mb-2">
                {a.title}
              </h3>
              <p className="text-gray-600 text-center font-medium">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
