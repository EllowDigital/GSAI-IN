import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import { motion } from 'framer-motion';

interface NewsItem {
  id: string;
  title: string;
  short_description: string | null;
  date: string;
  image_url: string | null;
  status: string | null;
  created_by: string | null;
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast.error('Failed to load news article');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    if (navigator.share && news) {
      try {
        await navigator.share({
          title: news.title,
          text: news.short_description || '',
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

  if (!news) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="text-center relative z-10">
          <h1 className="text-3xl font-bold text-white mb-4">
            News article not found
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
        title={`${news.title} | Ghatak Sports Academy India™`}
        description={
          news.short_description ||
          `Read the latest news: ${news.title} from Ghatak Sports Academy India, your premier martial arts training institute.`
        }
        canonical={`/news/${news.id}`}
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
                onClick={() => navigate('/news')}
                variant="ghost"
                className="mb-4 text-gray-400 hover:text-yellow-500 hover:bg-white/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </div>

            {/* Header */}
            <header className="mb-10">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {news.title}
                </h1>
                {news.status && (
                  <Badge
                    variant={
                      news.status === 'published' ? 'default' : 'secondary'
                    }
                    className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                  >
                    {news.status}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 border-b border-white/10 pb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-white">{formatDate(news.date)}</span>
                </div>

                {news.created_by && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-white">by {news.created_by}</span>
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

              {news.short_description && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <p className="text-gray-300 text-lg leading-relaxed italic">
                    "{news.short_description}"
                  </p>
                </div>
              )}
            </header>

            {/* Featured Image */}
            {news.image_url && (
              <div className="mb-12">
                <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl shadow-yellow-900/20 border border-white/10">
                  <img
                    src={news.image_url}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <article className="mb-12">
              {/* Since the news table only has short_description, we'll expand on that */}
              <div className="prose prose-lg max-w-none prose-invert prose-p:text-gray-300 prose-headings:text-white">
                <p className="leading-relaxed text-lg">
                  {news.short_description}
                </p>

                <div className="mt-10 p-8 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl border border-blue-500/20">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">
                    Stay Connected with Ghatak Sports Academy India
                  </h3>
                  <p className="text-blue-200/80 leading-relaxed">
                    Follow our latest news and announcements to stay updated
                    with all the exciting developments at Ghatak Sports Academy
                    India. From tournament results to new program launches, we
                    keep our community informed about everything happening in
                    our martial arts family.
                  </p>
                </div>
              </div>
            </article>

            {/* Related Information */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                <h3 className="text-lg font-bold text-white mb-3">
                  About Our Programs
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  Discover our comprehensive martial arts programs including
                  Karate, Taekwondo, Self-Defense, and Fitness training designed
                  for all age groups and skill levels.
                </p>
                <Button
                  onClick={() => navigate('/#programs')}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-yellow-500"
                >
                  View Programs
                </Button>
              </div>

              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                <h3 className="text-lg font-bold text-white mb-3">
                  Get in Touch
                </h3>
                <div className="space-y-3 text-sm text-gray-400 mb-4">
                  <p className="flex flex-col gap-1">
                    <strong className="text-white">Phone:</strong> 
                    <span className="hover:text-yellow-500 transition-colors">+91 6394135988</span>
                  </p>
                  <p className="flex flex-col gap-1">
                    <strong className="text-white">Email:</strong> 
                    <span className="hover:text-yellow-500 transition-colors">ghatakgsai@gmail.com</span>
                  </p>
                  <p className="flex flex-col gap-1">
                    <strong className="text-white">Location:</strong> 
                    <span>Badshah kheda, Takrohi Rd, Indira Nagar, Lucknow</span>
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/#contact')}
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-yellow-500"
                >
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Call to Action */}
            <div className="p-8 bg-gradient-to-r from-yellow-500/10 to-red-600/10 rounded-3xl border border-white/10 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Join Our Martial Arts Community
                </h3>
                <p className="text-gray-400 mb-6 max-w-2xl">
                  Be part of Ghatak Sports Academy India and start your journey in
                  martial arts with professional guidance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => navigate('/#contact')}
                    className="bg-gradient-to-r from-yellow-500 to-red-600 text-white border-0 hover:from-yellow-600 hover:to-red-700 shadow-lg shadow-orange-500/20"
                    size="lg"
                  >
                    Start Your Journey
                  </Button>
                  <Button 
                    onClick={() => navigate('/#about')} 
                    variant="outline"
                    className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-yellow-500"
                    size="lg"
                  >
                    Learn More About Us
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
