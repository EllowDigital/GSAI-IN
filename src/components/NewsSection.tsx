import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  Clock,
  Newspaper,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { NewsModal } from '@/components/modals/NewsModal';
import { useEnhancedQuery } from '@/hooks/useEnhancedQuery';
import { supabase } from '@/integrations/supabase/client';
import { formatErrorForDisplay } from '@/utils/errorHandling';

type NewsItem = {
  id: string;
  title: string;
  short_description: string | null;
  date: string;
  image_url: string | null;
  status: string | null;
  created_by: string | null;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function NewsSection() {
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enhanced data fetching with retry mechanism
  const {
    data: news = [],
    isLoading: loading,
    error,
    refresh,
  } = useEnhancedQuery({
    queryKey: ['news', 'public', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(
          'id, title, short_description, date, image_url, status, created_by'
        )
        .eq('status', 'Published')
        .order('date', { ascending: false })
        .limit(6);

      if (error) throw error;
      return (data as NewsItem[]) || [];
    },
    enableRealtime: true,
    realtimeTable: 'news',
    staleTime: 1000 * 60 * 2, // 2 minutes for news
    retryAttempts: 3,
  });

  const handleReadMore = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    setIsModalOpen(true);
  };

  const handleViewFullPage = (id: string) => {
    setIsModalOpen(false);
    navigate(`/news/${id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
  };

  return (
    <section
      id="news"
      className="section-shell relative bg-gradient-to-br from-slate-50 via-white to-yellow-50/30 overflow-hidden py-12 md:py-20 lg:py-24"
    >
      {/* Decorative Blurs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 md:w-72 md:h-72 bg-yellow-200/40 to-orange-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 md:w-80 md:h-80 bg-amber-200/30 to-orange-300/30 rounded-full blur-3xl" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 lg:mb-20"
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-600 tracking-wide uppercase">
              Latest Updates
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            News &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Highlights
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Stay updated with the latest announcements, achievements, and
            inspiring moments from Ghatak Sports Academy.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-yellow-400" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400" />
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-orange-400 to-transparent" />
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Failed to load news</p>
                <p className="text-sm text-red-600 mt-1">
                  {formatErrorForDisplay(error)}
                </p>
              </div>
              <button
                onClick={() => refresh()}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                title="Retry loading news"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* News Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-6 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                </div>
              </motion.div>
            ))
          ) : news.length > 0 ? (
            news.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-yellow-300 transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center flex-col">
                      <Newspaper className="w-12 h-12 text-yellow-400 mb-2" />
                      <span className="text-orange-500 text-sm font-medium">
                        No Image
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-lg flex items-center gap-2 text-gray-700 text-xs sm:text-sm font-semibold">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" />
                    {formatDate(item.date)}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 font-medium">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                    <span>Recently published</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors duration-300">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {item.short_description || 'No description available'}
                  </p>

                  <button
                    onClick={() => handleReadMore(item)}
                    className="flex items-center gap-2 text-yellow-600 font-bold text-sm group-hover:gap-3 transition-all duration-300 mt-auto"
                  >
                    <span>Read more</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div variants={cardVariants} className="col-span-full">
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Newspaper className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  No News Yet
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                  We'll share exciting updates and achievements here soon. Stay
                  tuned!
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* CTA */}
        {news.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12 md:mt-16"
          >
            <button
              onClick={() => navigate('/news')}
              className="btn-primary gap-2 px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20"
            >
              <span>View All News</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        )}
      </div>

      <NewsModal
        news={selectedNews}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewFullPage={handleViewFullPage}
      />
    </section>
  );
}
