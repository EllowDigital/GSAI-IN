import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpenText } from 'lucide-react';

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: 'medium' });
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
        .from('blogs')
        .select('id, image_url, title, description, published_at')
        .order('published_at', { ascending: false })
        .limit(6);
      if (!error && data && isMounted) {
        setPosts(data as Blog[]);
      }
      setLoading(false);
    }
    fetchBlogs();

    // Subscribe to re-fetch if changes in blogs (real-time)
    const channel = supabase
      .channel('blogs-public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blogs' },
        () => fetchBlogs()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section
      id="blog"
      className="py-12 xs:py-16 md:py-20 px-2 xs:px-4 md:px-6 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-yellow-100"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-7 gap-2">
          <div className="flex items-center gap-2 justify-center w-full">
            <BookOpenText size={32} className="text-yellow-400" />
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow text-center w-full">
              Blog & Insights
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-xl">
            Explore stories, tips, and inspiration from Ghatak Sports
            Academy—expert advice, community highlights, and athlete journeys.
          </p>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white/80 shadow-lg animate-pulse h-60 flex flex-col"
              >
                <div className="h-36 bg-yellow-100 w-full rounded-t-2xl" />
                <div className="p-4 flex-1 space-y-2">
                  <div className="h-5 bg-yellow-100 w-1/2 rounded" />
                  <div className="h-3 bg-gray-100 w-full rounded" />
                  <div className="h-3 bg-gray-100 w-3/4 rounded" />
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="group rounded-2xl shadow-xl bg-white ring-1 ring-yellow-100 overflow-hidden flex flex-col hover:scale-[1.03] hover:shadow-2xl transition-transform duration-200"
              >
                <div className="relative w-full h-36 xs:h-44 bg-yellow-50 flex items-center justify-center">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-200 group-hover:brightness-95"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-yellow-100 flex items-center justify-center text-yellow-300 text-lg font-semibold">
                      No Image
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-0.5 text-xs font-bold text-yellow-500 shadow">
                    {post.published_at ? formatDate(post.published_at) : '--'}
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-5">
                  <h3 className="text-lg md:text-xl font-bold mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-700 text-sm line-clamp-3 flex-1">
                    {post.description ?? ''}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full max-w-xl mx-auto text-center pt-8 pb-10">
              <div className="flex flex-col items-center gap-2">
                <BookOpenText size={34} className="text-gray-300 mb-1" />
                <h4 className="text-gray-400 text-lg font-semibold">
                  No blogs published yet.
                </h4>
                <p className="text-gray-500 text-sm max-w-xs">
                  Stay tuned for our latest insights and updates!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
