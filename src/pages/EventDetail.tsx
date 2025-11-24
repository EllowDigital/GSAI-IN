import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Seo from '@/components/Seo';
import { motion } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  from_date: string | null;
  end_date: string | null;
  image_url: string | null;
  tag: string | null;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const formatDateRange = (
    fromDate: string | null,
    endDate: string | null,
    fallbackDate: string
  ) => {
    const startDate = fromDate || fallbackDate;
    const start = new Date(startDate);

    if (endDate && endDate !== startDate) {
      const end = new Date(endDate);
      return {
        display: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        isMultiDay: true,
      };
    }

    return {
      display: start.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      isMultiDay: false,
    };
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || '',
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

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="text-center relative z-10">
          <h1 className="text-3xl font-bold text-white mb-4">
            Event not found
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

  const dateInfo = formatDateRange(event.from_date, event.end_date, event.date);

  return (
    <>
      <Seo
        title={`${event.title} | Ghatak Sports Academy India™`}
        description={
          event.description ||
          `Join us for ${event.title} - An exciting event at Ghatak Sports Academy India, your premier martial arts training institute.`
        }
        canonical={`/event/${event.id}`}
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
                onClick={() => navigate('/events')}
                variant="ghost"
                className="mb-4 text-gray-400 hover:text-yellow-500 hover:bg-white/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </div>

            {/* Header */}
            <header className="mb-10">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                  {event.title}
                </h1>
                {event.tag && (
                  <Badge
                    variant="secondary"
                    className="text-sm bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                  >
                    {event.tag}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8 border-b border-white/10 pb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-yellow-500" />
                  <div>
                    <span className="text-sm font-medium text-white">
                      {dateInfo.display}
                    </span>
                    {dateInfo.isMultiDay && (
                      <div className="flex items-center gap-1 text-xs text-yellow-500/80 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>Multi-day event</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-white">
                    Ghatak Sports Academy India, Lucknow
                  </span>
                </div>

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
            </header>

            {/* Featured Image */}
            {event.image_url && (
              <div className="mb-12">
                <div className="aspect-video w-full overflow-hidden rounded-2xl shadow-2xl shadow-yellow-900/20 border border-white/10">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="md:col-span-2 space-y-8">
                {event.description && (
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1 h-8 bg-yellow-500 rounded-full"></span>
                      Event Details
                    </h2>
                    <div className="prose prose-lg max-w-none prose-invert prose-p:text-gray-300 prose-headings:text-white">
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-8 bg-red-500 rounded-full"></span>
                    What to Expect
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                      <h3 className="font-bold text-white mb-2">
                        Professional Training
                      </h3>
                      <p className="text-sm text-gray-400">
                        Learn from certified martial arts coaches
                      </p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                      <h3 className="font-bold text-white mb-2">
                        All Skill Levels
                      </h3>
                      <p className="text-sm text-gray-400">
                        Suitable for beginners to advanced practitioners
                      </p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                      <h3 className="font-bold text-white mb-2">
                        Equipment Provided
                      </h3>
                      <p className="text-sm text-gray-400">
                        All necessary training equipment included
                      </p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                      <h3 className="font-bold text-white mb-2">Certificate</h3>
                      <p className="text-sm text-gray-400">
                        Receive completion certificate
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                    Event Information
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Duration:</span>
                      <span className="font-medium text-white bg-white/10 px-2 py-1 rounded">
                        {dateInfo.isMultiDay ? 'Multiple Days' : 'Single Day'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Venue:</span>
                      <span className="font-medium text-white text-right">
                        GSAI Campus
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Category:</span>
                      <span className="font-medium text-yellow-500">
                        {event.tag || 'General Event'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-300 flex flex-col gap-1">
                      <strong className="text-white">Phone:</strong>
                      <span className="text-gray-400 hover:text-yellow-500 transition-colors">
                        +91 6394135988
                      </span>
                    </p>
                    <p className="text-gray-300 flex flex-col gap-1">
                      <strong className="text-white">Email:</strong>
                      <span className="text-gray-400 hover:text-yellow-500 transition-colors">
                        ghatakgsai@gmail.com
                      </span>
                    </p>
                    <p className="text-gray-300 flex flex-col gap-1">
                      <strong className="text-white">Address:</strong>
                      <span className="text-gray-400">
                        Badshah kheda, Takrohi Rd, Indira Nagar, Lucknow
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="p-8 bg-gradient-to-r from-yellow-500/10 to-red-600/10 rounded-3xl border border-white/10 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Interested in This Event?
                </h3>
                <p className="text-gray-400 mb-6 max-w-2xl">
                  Contact us to register or learn more about upcoming events at
                  Ghatak Sports Academy India.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate('/#contact')}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-yellow-500 to-red-600 text-white border-0 hover:from-yellow-600 hover:to-red-700 shadow-lg shadow-orange-500/20"
                    size="lg"
                  >
                    Contact Us
                  </Button>
                  <Button
                    onClick={() => navigate('/#programs')}
                    variant="outline"
                    className="bg-transparent flex-1 sm:flex-none border-white/20 text-white hover:bg-white/10 hover:text-yellow-500"
                    size="lg"
                  >
                    View All Programs
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
