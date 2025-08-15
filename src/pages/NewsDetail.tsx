import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Seo from '@/components/Seo';

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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="aspect-video bg-muted rounded-lg mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            News article not found
          </h1>
          <Button onClick={() => navigate('/')} variant="outline">
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

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Navigation */}
            <div className="mb-8">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="mb-4 hover:bg-muted"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>

            {/* Header */}
            <header className="mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {news.title}
                </h1>
                {news.status && (
                  <Badge
                    variant={
                      news.status === 'published' ? 'default' : 'secondary'
                    }
                  >
                    {news.status}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(news.date)}</span>
                </div>

                {news.created_by && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="text-sm">by {news.created_by}</span>
                  </div>
                )}

                <Button
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>

              {news.short_description && (
                <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {news.short_description}
                  </p>
                </div>
              )}
            </header>

            {/* Featured Image */}
            {news.image_url && (
              <div className="mb-8">
                <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={news.image_url}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Content */}
            <article className="mb-8">
              {/* Since the news table only has short_description, we'll expand on that */}
              <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {news.short_description}
                </p>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    Stay Connected with Ghatak Sports Academy India
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
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
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  About Our Programs
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Discover our comprehensive martial arts programs including
                  Karate, Taekwondo, Self-Defense, and Fitness training designed
                  for all age groups and skill levels.
                </p>
                <Button
                  onClick={() => navigate('/#programs')}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  View Programs
                </Button>
              </div>

              <div className="p-6 bg-muted/30 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Get in Touch
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Phone:</strong> +91 6394135988
                  </p>
                  <p>
                    <strong>Email:</strong> ghatakgsai@gmail.com
                  </p>
                  <p>
                    <strong>Location:</strong> Badshah kheda, Takrohi Rd, Indira
                    Nagar, Lucknow
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/#contact')}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Call to Action */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Join Our Martial Arts Community
              </h3>
              <p className="text-muted-foreground mb-4">
                Be part of Ghatak Sports Academy India and start your journey in
                martial arts with professional guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/#contact')}>
                  Start Your Journey
                </Button>
                <Button onClick={() => navigate('/#about')} variant="outline">
                  Learn More About Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
