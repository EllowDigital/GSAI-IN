
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Newspaper, Calendar, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

type News = {
  id: string;
  title: string;
  short_description: string;
  date: string;
  image_url?: string | null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function NewsSection() {
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchNews() {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('id, title, short_description, date, image_url, status')
        .eq('status', 'Published')
        .order('date', { ascending: false })
        .limit(6);
      if (!error && data && isMounted) {
        setNews(data as News[]);
      }
      setLoading(false);
    }
    fetchNews();

    // Subscribe to re-fetch if changes in news (real-time)
    const channel = supabase
      .channel('news-public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
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
      className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-blue-600 tracking-wide">Latest Updates</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            News &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Highlights
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest announcements, achievements, and inspiring moments from Ghatak Sports Academy
          </p>
        </motion.div>

        {/* News Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </motion.div>
            ))
          ) : news.length > 0 ? (
            news.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <div className="text-center">
                        <Newspaper className="w-12 h-12 text-blue-300 mx-auto mb-2" />
                        <span className="text-blue-400 text-sm font-medium">No Image</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Date Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {item.date ? formatDate(item.date) : '--'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Clock className="w-4 h-4" />
                    <span>Recently published</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {item.short_description || 'No description available'}
                  </p>
                  
                  {/* Read more indicator */}
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                    <span>Read more</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Empty state
            <motion.div
              variants={cardVariants}
              className="col-span-full"
            >
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Newspaper className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No News Yet</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We'll share exciting updates and achievements here soon. Stay tuned for the latest news from our academy!
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Call to action */}
        {news.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <span>View All News</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
