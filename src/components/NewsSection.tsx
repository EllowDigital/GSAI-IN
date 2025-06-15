import React from "react";
import { supabase } from "@/integrations/supabase/client";

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
    <section id="news" className="py-10 xs:py-14 md:py-20 px-2 xs:px-4 md:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold mb-5 xs:mb-8 text-yellow-400 text-center">
          🗞️ News
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 xs:gap-6 md:gap-9">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col animate-pulse h-60" />
            ))
          ) : news.length > 0 ? (
            news.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:scale-105 hover:shadow-lg transition cursor-pointer group">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-36 xs:h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-36 xs:h-44 w-full bg-yellow-100 flex items-center justify-center text-yellow-300">
                    No Image
                  </div>
                )}
                <div className="flex-1 p-4 xs:p-5 flex flex-col">
                  <span className="text-xs xs:text-sm font-semibold text-yellow-400 mb-1 xs:mb-2">
                    {item.date ? formatDate(item.date) : "--"}
                  </span>
                  <h3 className="text-base xs:text-lg font-bold mb-1 group-hover:text-red-600 transition">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{item.short_description ?? ""}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full font-semibold text-center text-gray-400 py-8">
              No news published yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
