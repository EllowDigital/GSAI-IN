import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpenText, Calendar, ArrowRight, Clock, User } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getReadingTime(description: string | null): string {
  if (!description) return '2 min read';
  const wordsPerMinute = 200;
  const wordCount = description.split(' ').length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
}

type Blog = {
  id: string;
  image_url: string | null;
  title: string;
  description: string | null;
  published_at: string | null;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
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
      className="relative py-16 md:py-24 px-4 md:px-6 bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-200/30 to-orange-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpenText className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-yellow-600 tracking-wide">
              Latest Insights
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Blog &
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Insights
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore stories, expert tips, and inspiration from Ghatak Sports
            Academy—community highlights, athlete journeys, and martial arts
            wisdom.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <motion.div
                key={idx}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                variants={itemVariants}
              >
                <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </motion.div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-yellow-200"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-48 overflow-hidden">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
                      <BookOpenText className="w-16 h-16 text-yellow-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {index === 0 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {post.published_at
                          ? formatDate(post.published_at)
                          : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{getReadingTime(post.description)}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors duration-300">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {post.description ||
                      'Discover insights and stories from our martial arts community...'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">GSAI Team</span>
                    </div>

                    <button className="inline-flex items-center gap-2 text-yellow-600 hover:text-orange-600 font-semibold text-sm transition-colors duration-200 group-hover:gap-3">
                      Read More
                      <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.div
              className="col-span-full max-w-2xl mx-auto text-center py-16"
              variants={itemVariants}
            >
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpenText className="w-12 h-12 text-yellow-500" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                No Blogs Yet
              </h3>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                We're working on creating amazing content for you. Stay tuned
                for our latest insights, training tips, and inspiring stories
                from the world of martial arts!
              </p>

              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-200">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-orange-700 font-medium">Coming Soon</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {posts.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
          >
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <span>View All Articles</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
