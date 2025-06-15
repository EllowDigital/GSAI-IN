import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeDollarSign,
  Users,
  BookOpen,
  Newspaper,
  Image as GalleryIcon,
  Calendar,
} from "lucide-react";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import AnalyticsChart from "@/components/admin/dashboard/AnalyticsChart";
import AdvancedPanel from "@/components/admin/dashboard/AdvancedPanel";

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

const fetchAllCounts = async () => {
  const promises = cardsConfig.map(async ({ key, table }) => {
    const { count } = await supabase
      .from(table as any)
      .select("id", { count: "exact", head: true });
    return [key, count ?? 0] as const;
  });
  const results = await Promise.all(promises);
  return Object.fromEntries(results);
};

export default function StatsHome() {
  const queryClient = useQueryClient();
  const { data: counts, isLoading: loading } = useQuery({
    queryKey: ["dashboardCounts"],
    queryFn: fetchAllCounts,
  });

  React.useEffect(() => {
    const channels = cardsConfig.map(({ table }) =>
      supabase
        .channel(`public:${table}:stats-home`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: table },
          () => queryClient.invalidateQueries({ queryKey: ["dashboardCounts"] })
        )
        .subscribe()
    );

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  // Prepare data for analytics chart
  const analyticsData = cardsConfig.map(({ key, label }) => ({
    name: label,
    count: counts?.[key] ?? 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-8 py-6 w-full animate-fade-in">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-yellow-600 drop-shadow">
          Dashboard Overview
        </h1>
        <div className="mt-1 text-base text-gray-500 font-medium">
          Your admin panel analytics and quick stats.
        </div>
      </div>

      {/* Responsive card stats grid */}
      <StatsCards cardsConfig={cardsConfig} counts={counts} loading={loading} />

      {/* Analytics Chart */}
      <AnalyticsChart analyticsData={analyticsData} />

      {/* Improved Advanced Panel */}
      <AdvancedPanel />
    </div>
  );
}
