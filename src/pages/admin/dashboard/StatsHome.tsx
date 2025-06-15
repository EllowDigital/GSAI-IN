import React from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BadgeDollarSign,
  Users,
  BookOpen,
  Newspaper,
  Image as GalleryIcon,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const cardsConfig = [
  {
    key: "fees",
    label: "Fee Records",
    icon: BadgeDollarSign,
    color: "bg-green-100 text-green-800",
    table: "fees",
  },
  {
    key: "students",
    label: "Students",
    icon: Users,
    color: "bg-yellow-100 text-yellow-800",
    table: "students",
  },
  {
    key: "blogs",
    label: "Blogs",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-800",
    table: "blogs",
  },
  {
    key: "news",
    label: "News",
    icon: Newspaper,
    color: "bg-orange-100 text-orange-700",
    table: "news",
  },
  {
    key: "gallery",
    label: "Gallery Images",
    icon: GalleryIcon,
    color: "bg-pink-100 text-pink-700",
    table: "gallery_images",
  },
  {
    key: "events",
    label: "Events",
    icon: Calendar,
    color: "bg-purple-100 text-purple-800",
    table: "events",
  },
];

export default function StatsHome() {
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;
    async function fetchAllCounts() {
      setLoading(true);
      const newCounts: Record<string, number> = {};
      for (const { key, table } of cardsConfig) {
        const { count } = await supabase
          .from(table as any)
          .select("id", { count: "exact", head: true });
        newCounts[key] = count ?? 0;
      }
      if (!ignore) {
        setCounts(newCounts);
        setLoading(false);
      }
    }
    fetchAllCounts();
    return () => { ignore = true; };
  }, []);

  // Prepare data for analytics chart
  const analyticsData = cardsConfig.map(({ key, label }) => ({
    name: label,
    count: counts[key] ?? 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-8 py-6 w-full animate-fade-in">
      {/* Dashboard Header (clean, no logo/avatar/role) */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-yellow-600 drop-shadow">
          Dashboard Overview
        </h1>
        <div className="mt-1 text-base text-gray-500 font-medium">
          Your admin panel analytics and quick stats.
        </div>
      </div>

      {/* Responsive card stats grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
        {cardsConfig.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className={`flex flex-col items-center justify-center rounded-2xl shadow-md p-4 sm:p-5 min-h-[120px] w-full ${color}`}
          >
            <Icon className="w-7 h-7 sm:w-8 sm:h-8 mb-2" />
            <span className="text-xl sm:text-2xl font-extrabold">
              {loading ? <span className="animate-pulse">...</span> : counts[key] ?? 0}
            </span>
            <span className="text-xs sm:text-sm font-bold opacity-80 text-center">{label}</span>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <section className="rounded-2xl shadow bg-white/90 px-2 xs:px-4 sm:px-6 py-5 mb-8 sm:mb-10">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-600">
          Analytics
        </h2>
        <div className="w-full h-[240px] xs:h-[300px] md:h-[380px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" className="text-gray-100" />
              <XAxis
                dataKey="name"
                tick={{ fontWeight: 600, fontSize: 10, fill: "#a16207" }} // yellow-700
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontWeight: 600, fontSize: 11, fill: "#78716c" }}
                axisLine={false}
                width={30}
              />
              <Tooltip
                cursor={{ fill: "rgba(251, 191, 36, 0.13)" }}
                contentStyle={{
                  borderRadius: "0.5rem",
                  borderColor: "#fde68a",
                  backgroundColor: "#fff",
                  fontWeight: 600,
                }}
                labelStyle={{
                  color: "#ca8a04", // yellow-600
                  fontWeight: 700,
                }}
              />
              <Bar dataKey="count" fill="#FACC15" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Improved Advanced Panel */}
      <section className="rounded-2xl shadow bg-white/90 px-2 xs:px-4 sm:px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-7">
          <div className="flex-1 flex flex-col gap-3">
            <div className="rounded-lg p-4 sm:p-5 bg-gradient-to-br from-yellow-100/70 to-yellow-50 border border-yellow-200 shadow-sm">
              <h3 className="font-bold mb-2 text-yellow-800 text-sm sm:text-base">Quick Tips</h3>
              <ul className="list-disc ml-4 text-gray-700 text-xs sm:text-sm space-y-1">
                <li>Use the sidebar to access all main modules.</li>
                <li>Data is updated in real-time.</li>
                <li>All sections are mobile friendly.</li>
                <li>Contact support for any issues.</li>
              </ul>
            </div>
            <div className="rounded-lg p-3 sm:p-4 bg-yellow-50 border border-yellow-100 shadow">
              <h4 className="font-bold text-yellow-700 mb-1 text-xs sm:text-base">Latest Announcements</h4>
              <ul className="text-xs sm:text-sm text-gray-700 list-disc ml-4">
                <li className="mb-1">Website redesign launched 🎉</li>
                <li>More dashboard analytics coming soon!</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
