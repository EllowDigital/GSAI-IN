import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import { motion } from 'framer-motion';

interface BlogPost {
  id: string;
  title: string;
  description: string | null;
  content: string;
  image_url: string | null;
  published_at: string | null;
  created_by: string | null;
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Failed to load blog post');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description || '',
          url: window.location.href,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-white/10 rounded w-3/4"></div>
              <div className="aspect-video bg-white/10 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="text-center relative z-10">
          <h1 className="text-3xl font-bold text-white mb-4">
            Blog post not found
          </h1>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 hover:text-yellow-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={`${post.title} | Ghatak Sports Academy India™`}
        description={
          post.description ||
          `Read ${post.title} - Latest blog post from Ghatak Sports Academy India, your premier martial arts training institute.`
        }
        canonical={`/blog/${post.id}`}
      />

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            {/* Navigation */}
            <div className="mb-8">
              <Button
                onClick={() => navigate('/blogs')}
                variant="ghost"
                className="mb-4 text-gray-400 hover:text-yellow-500 hover:bg-white/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </div>

            {/* Header */}
            <header className="mb-10">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 border-b border-white/10 pb-8">
                {post.published_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {formatDate(post.published_at)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {getReadingTime(post.content)}
                  </span>
                </div>

                {post.created_by && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      by {post.created_by}
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {post.description && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-300 text-lg leading-relaxed italic">
                    "{post.description}"
                  </p>
                </div>
              )}
            </header>

            {/* Featured Image */}
            {post.image_url && (
              <div className="mb-12">
                <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl shadow-yellow-900/20 border border-white/10">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <article className="prose prose-lg max-w-none prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300 prose-a:text-yellow-500 hover:prose-a:text-yellow-400">
              <div
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Call to Action */}
            <div className="mt-16 p-8 bg-gradient-to-br from-yellow-500/10 to-red-600/10 rounded-3xl border border-white/10 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Ready to Start Your Martial Arts Journey?
                </h3>
                <p className="text-gray-400 mb-6 max-w-2xl">
                  Join Ghatak Sports Academy India and train with certified
                  professional coaches. Transform your life through discipline
                  and strength.
                </p>
                <Button
                  onClick={() => navigate('/#contact')}
                  className="bg-gradient-to-r from-yellow-500 to-red-600 text-white border-0 hover:from-yellow-600 hover:to-red-700 shadow-lg shadow-orange-500/20"
                  size="lg"
                >
                  Contact Us Today
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
