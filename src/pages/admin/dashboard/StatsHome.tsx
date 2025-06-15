
import React from "react";
import { LayoutDashboard, Activity, UserCheck, BookText, Image as GalleryIcon, Calendar, Newspaper } from "lucide-react";

const cards = [
  {
    label: "Active Users",
    count: 1254,
    icon: Activity,
    color: "bg-green-100 text-green-800",
  },
  {
    label: "Students",
    count: 494,
    icon: UserCheck,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    label: "Total Blogs",
    count: 58,
    icon: BookText,
    color: "bg-blue-100 text-blue-800",
  },
  {
    label: "Gallery",
    count: 242,
    icon: GalleryIcon,
    color: "bg-pink-100 text-pink-700",
  },
  {
    label: "Events",
    count: 17,
    icon: Calendar,
    color: "bg-purple-100 text-purple-800",
  },
  {
    label: "News",
    count: 35,
    icon: Newspaper,
    color: "bg-orange-100 text-orange-700",
  },
];

export default function StatsHome() {
  const admin = {
    name: "Admin",
    avatar: "/favicon.ico",
    role: "Super Admin",
  };

  return (
    <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-8 py-6 w-full animate-fade-in">
      {/* Admin Greeting/Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center rounded-full bg-yellow-200 shadow p-3">
            <LayoutDashboard className="text-yellow-700 w-8 h-8" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-yellow-500 drop-shadow">
              Welcome, {admin.name}!
            </h1>
            <span className="mt-1 inline-block bg-yellow-100 text-yellow-700 text-xs rounded px-2 py-1 font-bold shadow">
              {admin.role}
            </span>
          </div>
        </div>
        <img
          src={admin.avatar}
          alt="Admin Avatar"
          className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-yellow-300 shadow"
        />
      </div>

      {/* Responsive card stats grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        {cards.map(({ label, count, icon: Icon, color }) => (
          <div key={label} className={`flex flex-col items-center justify-center rounded-2xl shadow-md p-5 ${color}`}>
            <Icon className="w-8 h-8 mb-2" />
            <span className="text-2xl font-extrabold">{count}</span>
            <span className="text-sm font-bold opacity-80">{label}</span>
          </div>
        ))}
      </div>

      {/* Example Advanced Panel */}
      <section className="rounded-2xl shadow bg-white/90 px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold mb-4 text-yellow-600">Dashboard Overview</h2>
        <div className="flex flex-col lg:flex-row gap-7">
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-lg p-5 bg-gradient-to-br from-yellow-100/70 to-yellow-50 border border-yellow-200 shadow-sm">
              <h3 className="font-bold mb-2 text-yellow-800">Quick Tips</h3>
              <ul className="list-disc ml-4 text-gray-700 text-sm space-y-1">
                <li>Use the sidebar to access all main modules.</li>
                <li>Data is updated in real-time.</li>
                <li>All sections are mobile friendly.</li>
                <li>Contact support for any issues.</li>
              </ul>
            </div>
            <div className="rounded-lg p-4 bg-yellow-50 border border-yellow-100 shadow">
              <h4 className="font-bold text-yellow-700 mb-1">Latest Announcements</h4>
              <ul className="text-sm text-gray-700 list-disc ml-4">
                <li className="mb-1">Website redesign launched 🎉</li>
                <li>More dashboard analytics coming soon!</li>
              </ul>
            </div>
          </div>
          {/* Placeholder for analytics */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="rounded-xl p-6 bg-gradient-to-tr from-yellow-100 via-white to-yellow-50 border border-yellow-200 shadow">
              <h3 className="text-base font-bold text-gray-800 mb-2">Analytics (Coming Soon)</h3>
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
                [Charts & Data Visualizations]
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
