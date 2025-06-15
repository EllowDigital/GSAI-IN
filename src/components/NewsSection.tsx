import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, Image as ImageIcon } from "lucide-react";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: "medium" });
}

type News = {
  id: string;
  title: string;
  short_description: string;
  date: string;
  image_url?: string | null;
};

export default function NewsSection() {
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchNews() {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("id, title, short_description, date, image_url, status")
        .eq("status", "Published")
        .order("date", { ascending: false })
        .limit(6);
      if (!error && data && isMounted) {
        setNews(data as News[]);
      }
      setLoading(false);
    }
    fetchNews();

    // Subscribe to re-fetch if changes in news (real-time)
    const channel = supabase
      .channel("news-public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "news" },
        () => fetchNews()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section
      id="news"
      className="py-14 px-2 xs:px-4 md:px-6 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-yellow-100"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="flex items-center gap-2 justify-center w-full">
            <Newspaper size={32} className="text-yellow-400" />
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow text-center w-full">
              Latest News & Highlights
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-xl">
            Stay updated with the most recent announcements, achievements, and moments from Ghatak Sports Academy.
          </p>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/80 shadow-lg animate-pulse h-64 flex flex-col"
              >
                <div className="h-36 bg-yellow-100 w-full rounded-t-2xl" />
                <div className="p-4 flex-1 space-y-2">
                  <div className="h-5 bg-yellow-100 w-1/2 rounded" />
                  <div className="h-3 bg-gray-100 w-full rounded" />
                  <div className="h-3 bg-gray-100 w-3/4 rounded" />
                </div>
              </div>
            ))
          ) : news.length > 0 ? (
            news.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl shadow-xl bg-white ring-1 ring-yellow-100 overflow-hidden flex flex-col hover:scale-[1.03] hover:shadow-2xl transition-transform duration-200"
              >
                <div className="relative w-full h-36 xs:h-44 bg-yellow-50 flex items-center justify-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-200 group-hover:brightness-95"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <ImageIcon size={36} className="text-yellow-300" />
                      <span className="text-yellow-300 text-sm font-semibold">No Image</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-0.5 text-xs font-bold text-yellow-500 shadow">
                    {item.date ? formatDate(item.date) : "--"}
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-5">
                  <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 text-sm line-clamp-3 flex-1">{item.short_description ?? ""}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full max-w-xl mx-auto text-center pt-8 pb-10">
              <div className="flex flex-col items-center gap-2">
                <Newspaper size={34} className="text-gray-300 mb-1" />
                <h4 className="text-gray-400 text-lg font-semibold">No news published yet.</h4>
                <p className="text-gray-500 text-sm max-w-xs">We'll post updates and highlights here soon. Stay tuned!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
