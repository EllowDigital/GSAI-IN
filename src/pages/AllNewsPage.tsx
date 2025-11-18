import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowRight,
  ArrowLeft,
  Clock,
  Newspaper,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Seo } from '@/components/Seo';
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

const AllNewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: news = [],
    isLoading: loading,
    error,
    refresh,
  } = useEnhancedQuery({
    queryKey: ['news', 'all', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(
          'id, title, short_description, date, image_url, status, created_by'
        )
        .eq('status', 'Published')
        .order('date', { ascending: false });

      if (error) throw error;
      return (data as NewsItem[]) || [];
    },
    enableRealtime: true,
    realtimeTable: 'news',
    staleTime: 1000 * 60 * 2,
    retryAttempts: 3,
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
    <>
      <Seo
        title="All News - Ghatak Sports Academy India"
        description="Read all the latest news, announcements, and achievements from Ghatak Sports Academy India. Stay updated with our martial arts community updates."
        keywords={[
          'martial arts news',
          'sports academy news',
          'karate updates',
          'taekwondo news',
          'academy announcements',
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30">
        {/* Header Section */}
        <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Decorative Blurs */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-200/40 to-orange-200/40 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-200/30 to-orange-300/30 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 text-gray-600 hover:text-yellow-600 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>

            {/* Page Header */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-semibold text-yellow-600 tracking-wide">
                  All News
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                News &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
                  Highlights
                </span>
              </h1>

              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Stay updated with all the latest announcements, achievements,
                and inspiring moments from Ghatak Sports Academy.
              </p>
            </motion.div>
          </div>
        </section>

        {/* News Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl"
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
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
                news.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-yellow-300 transition-all duration-300 transform hover:-translate-y-2"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
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
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg flex items-center gap-2 text-gray-700 text-sm font-semibold">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.date)}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <Clock className="w-4 h-4" />
                        <span>Recently published</span>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-yellow-600 transition-colors duration-300">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {item.short_description || 'No description available'}
                      </p>

                      <button
                        onClick={() => handleReadMore(item)}
                        className="flex items-center gap-2 text-yellow-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                      >
                        <span>Read more</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="col-span-full"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Newspaper className="w-10 h-10 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No News Yet
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      We'll share exciting updates and achievements here soon.
                      Stay tuned!
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <FooterSection />

      <NewsModal
        news={selectedNews}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewFullPage={handleViewFullPage}
      />
    </>
  );
};

export default AllNewsPage;
