import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenText,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Clock,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Seo } from '@/components/Seo';
import { BlogPostModal } from '@/components/modals/BlogPostModal';
import { useEnhancedQuery } from '@/hooks/useEnhancedQuery';
import { supabase } from '@/integrations/supabase/client';

type Blog = {
  id: string;
  image_url: string | null;
  title: string;
  description: string | null;
  content: string;
  published_at: string | null;
};

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

const AllBlogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBlog, setSelectedBlog] = React.useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: posts = [], isLoading: loading } = useEnhancedQuery({
    queryKey: ['blogs', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, image_url, title, description, content, published_at')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data as Blog[]) || [];
    },
    enableRealtime: true,
    realtimeTable: 'blogs',
    staleTime: 1000 * 60 * 2,
    retryAttempts: 3,
  });

  const handleReadMore = async (postId: string) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', postId)
      .single();

    if (!error && data) {
      setSelectedBlog(data);
      setIsModalOpen(true);
    }
  };

  const handleViewFullPage = (id: string) => {
    setIsModalOpen(false);
    navigate(`/blog/${id}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  return (
    <>
      <Seo
        title="All Blog Articles - Ghatak Sports Academy India"
        description="Read all our blog articles covering martial arts insights, training tips, athlete journeys, and academy highlights. Expert guidance and inspiring stories from our community."
        keywords={[
          'martial arts blog',
          'karate training tips',
          'taekwondo articles',
          'sports academy blog',
          'martial arts insights',
        ]}
      />

      <Navbar />

      <main className="min-h-screen bg-black text-white">
        {/* Header Section */}
        <section className="relative py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-red-600/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-[url('/assets/img/noise.png')] opacity-[0.03] mix-blend-overlay" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Back Button */}
            <motion.button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 border border-white/5 hover:border-white/20"
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
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                <BookOpenText className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-bold text-yellow-500 tracking-wide uppercase">
                  All Articles
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                Blog &{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-gradient-x">
                  Insights
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Explore all our stories, expert tips, and inspiration from
                Ghatak Sports Academy—community highlights, athlete journeys,
                and martial arts wisdom.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Blog Content */}
        <section className="px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
            >
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    className="group bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <div className="h-48 bg-white/5 animate-pulse" />
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-white/5 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-20 animate-pulse" />
                      </div>
                      <div className="h-6 bg-white/5 rounded w-full animate-pulse" />
                      <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
                    </div>
                  </motion.div>
                ))
              ) : posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    className="group bg-[#0a0a0a] rounded-2xl shadow-lg hover:shadow-yellow-500/10 transition-all duration-500 overflow-hidden border border-white/10 hover:border-yellow-500/30"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.01 }}
                  >
                    <div className="relative h-52 overflow-hidden">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center border-b border-white/5">
                          <BookOpenText className="w-16 h-16 text-white/10 group-hover:text-yellow-500/20 transition-colors" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      {index === 0 && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-orange-500/20 uppercase tracking-wider">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                          <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                          <span>
                            {post.published_at
                              ? formatDate(post.published_at)
                              : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          <span>{getReadingTime(post.description)}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">
                        {post.title}
                      </h3>

                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                        {post.description ||
                          'Discover insights and stories from our martial arts community...'}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-red-600 flex items-center justify-center text-[10px] font-bold text-white">
                            GS
                          </div>
                          <span className="text-xs font-medium text-gray-400">
                            GSAI Team
                          </span>
                        </div>

                        <button
                          onClick={() => handleReadMore(post.id)}
                          className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 font-semibold text-sm transition-all duration-200 group-hover:gap-3"
                        >
                          Read More
                          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))
              ) : (
                <motion.div
                  className="col-span-full max-w-2xl mx-auto text-center py-20"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <BookOpenText className="w-10 h-10 text-gray-600" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Blogs Yet
                  </h3>

                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    We're working on creating amazing content for you. Stay
                    tuned for our latest insights, training tips, and inspiring
                    stories from the world of martial arts!
                  </p>

                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-300 font-medium">
                      Coming Soon
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <FooterSection />

      <BlogPostModal
        post={selectedBlog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewFullPage={handleViewFullPage}
      />
    </>
  );
};

export default AllBlogsPage;
