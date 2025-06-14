
import React from "react";
import { supabase } from "@/integrations/supabase/client";

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: "medium" });
}

type Blog = {
  id: string;
  image_url: string | null;
  title: string;
  description: string | null;
  published_at: string | null;
};

export default function BlogNewsSection() {
  const [posts, setPosts] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchBlogs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("blogs")
        .select("id, image_url, title, description, published_at")
        .order("published_at", { ascending: false })
        .limit(6); // Show only 6 latest blogs for main site
      if (!error && data && isMounted) {
        setPosts(data as Blog[]);
      }
      setLoading(false);
    }
    fetchBlogs();

    // Subscribe to re-fetch if changes in blogs (real-time)
    const channel = supabase
      .channel("blogs-public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blogs" },
        () => fetchBlogs()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="blog" className="py-10 xs:py-16 px-2 xs:px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold mb-6 xs:mb-8 text-yellow-400 text-center">
          📰 Blog &amp; News
        </h2>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-5 xs:gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col animate-pulse h-60" />
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col hover:scale-105 hover:shadow-lg transition cursor-pointer group">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
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
                    {post.published_at ? formatDate(post.published_at) : "--"}
                  </span>
                  <h3 className="text-base xs:text-lg font-bold mb-1 group-hover:text-red-600 transition">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {post.description ?? ""}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full font-semibold text-center text-gray-400 py-8">
              No blogs published yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
