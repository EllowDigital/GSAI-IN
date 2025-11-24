import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { BookOpenText, Calendar, ArrowRight, Clock, User } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { BlogPostModal } from '@/components/modals/BlogPostModal';

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
  content: string;
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
  const navigate = useNavigate();
  const [posts, setPosts] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedBlog, setSelectedBlog] = React.useState<Blog | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchBlogs() {
      setLoading(true);
      const { data, error } = await supabase
        .from('blogs')
        .select('id, image_url, title, description, content, published_at')
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

  const handleReadMore = async (postId: string) => {
    // Fetch full post data including content
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
    <section
      id="blog"
      className="section-shell relative bg-[#0a0a0a] overflow-hidden py-12 md:py-20 lg:py-24"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-yellow-500/20 to-red-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-64 h-64 md:w-80 md:h-80 bg-gradient-to-r from-red-600/20 to-yellow-500/20 rounded-full blur-3xl" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={itemVariants}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <BookOpenText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-500 tracking-wide uppercase">
              Latest Insights
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Blog &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500">
              Insights
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            Explore stories, expert tips, and inspiration from Ghatak Sports
            Academy—community highlights, athlete journeys, and martial arts
            wisdom.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-yellow-500" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-pulse" />
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500" />
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-red-500 to-transparent" />
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <motion.div
                key={idx}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/10"
                variants={itemVariants}
              >
                <div className="h-48 bg-white/5 animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
                  </div>
                  <div className="h-6 bg-white/10 rounded w-full animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                </div>
              </motion.div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
              <motion.article
                key={post.id}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 overflow-hidden border border-white/10 hover:border-yellow-500/30 flex flex-col h-full"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center">
                      <BookOpenText className="w-12 h-12 sm:w-16 sm:h-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {index === 0 && (
                    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-yellow-500 to-red-600 text-white px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                      <span>
                        {post.published_at
                          ? formatDate(post.published_at)
                          : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                      <span>{getReadingTime(post.description)}</span>
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-yellow-500 transition-colors duration-300">
                    {post.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {post.description ||
                      'Discover insights and stories from our martial arts community...'}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-400">
                        GSAI Team
                      </span>
                    </div>

                    <button
                      onClick={() => handleReadMore(post.id)}
                      className="inline-flex items-center gap-1.5 text-yellow-500 hover:text-red-500 font-bold text-sm transition-colors duration-200 group-hover:gap-2.5"
                    >
                      Read More
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))
          ) : (
            <motion.div
              className="col-span-full max-w-2xl mx-auto text-center py-12 sm:py-16"
              variants={itemVariants}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-white/10">
                <BookOpenText className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">
                No Blogs Yet
              </h3>

              <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                We're working on creating amazing content for you. Stay tuned
                for our latest insights, training tips, and inspiring stories
                from the world of martial arts!
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/5 rounded-full border border-white/10">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="text-gray-300 font-medium text-sm sm:text-base">
                  Coming Soon
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {posts.length > 0 && (
          <motion.div
            className="text-center mt-12 md:mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={itemVariants}
          >
            <button
              onClick={() => navigate('/blogs')}
              className="btn-primary gap-2 px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </motion.div>
        )}
      </div>

      <BlogPostModal
        post={selectedBlog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onViewFullPage={handleViewFullPage}
      />
    </section>
  );
}
