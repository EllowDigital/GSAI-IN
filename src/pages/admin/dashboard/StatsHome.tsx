
import React from "react";
import { User, BookOpen, Newspaper, Image as GalleryIcon, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const CARD_BG = [
  "bg-yellow-400 text-black",
  "bg-blue-200 text-blue-900",
  "bg-pink-200 text-pink-900",
  "bg-violet-200 text-violet-900",
  "bg-lime-200 text-lime-900",
];

// Stat fetchers
async function getTotal(table: string): Promise<number> {
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default function StatsHome() {
  const { data: students = 0, isLoading: loadingStudents } = useQuery({
    queryKey: ["stats", "students"],
    queryFn: () => getTotal("students"),
  });
  const { data: blogs = 0, isLoading: loadingBlogs } = useQuery({
    queryKey: ["stats", "blogs"],
    queryFn: () => getTotal("blogs"),
  });
  const { data: news = 0, isLoading: loadingNews } = useQuery({
    queryKey: ["stats", "news"],
    queryFn: () => getTotal("news"),
  });
  const { data: gallery = 0, isLoading: loadingGallery } = useQuery({
    queryKey: ["stats", "gallery_images"],
    queryFn: () => getTotal("gallery_images"),
  });
  const { data: events = 0, isLoading: loadingEvents } = useQuery({
    queryKey: ["stats", "events"],
    queryFn: () => getTotal("events"),
  });

  const stats = [
    {
      label: "Total Students",
      value: students,
      icon: <User />,
      loading: loadingStudents,
      bg: CARD_BG[0],
    },
    {
      label: "Total Blogs",
      value: blogs,
      icon: <BookOpen />,
      loading: loadingBlogs,
      bg: CARD_BG[1],
    },
    {
      label: "News Posted",
      value: news,
      icon: <Newspaper />,
      loading: loadingNews,
      bg: CARD_BG[2],
    },
    {
      label: "Gallery Images",
      value: gallery,
      icon: <GalleryIcon />,
      loading: loadingGallery,
      bg: CARD_BG[3],
    },
    {
      label: "Events",
      value: events,
      icon: <Calendar />,
      loading: loadingEvents,
      bg: CARD_BG[4],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`rounded-2xl shadow-lg p-6 flex items-center gap-6 ${s.bg} min-w-[230px]`}
        >
          <div className="bg-white/70 rounded-xl p-3 flex items-center justify-center shadow">{s.icon}</div>
          <div>
            <div className="text-3xl font-bold">
              {s.loading ? <Skeleton className="h-7 w-16" /> : s.value}
            </div>
            <div className="text-sm font-semibold mt-1">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
