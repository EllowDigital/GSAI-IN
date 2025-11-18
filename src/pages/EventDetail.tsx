import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Seo from '@/components/Seo';

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

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Event not found
          </h1>
          <Button onClick={() => navigate('/')} variant="outline">
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
                  {event.title}
                </h1>
                {event.tag && (
                  <Badge variant="secondary" className="text-sm">
                    {event.tag}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium">
                      {dateInfo.display}
                    </span>
                    {dateInfo.isMultiDay && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>Multi-day event</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    Ghatak Sports Academy India, Lucknow
                  </span>
                </div>

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
            </header>

            {/* Featured Image */}
            {event.image_url && (
              <div className="mb-8">
                <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2 space-y-6">
                {event.description && (
                  <section>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      Event Details
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  </section>
                )}

                <section>
                  <h2 className="text-2xl font-semibold text-foreground mb-4">
                    What to Expect
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium text-foreground mb-2">
                        Professional Training
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Learn from certified martial arts coaches
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium text-foreground mb-2">
                        All Skill Levels
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Suitable for beginners to advanced practitioners
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium text-foreground mb-2">
                        Equipment Provided
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        All necessary training equipment included
                      </p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h3 className="font-medium text-foreground mb-2">
                        Certificate
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Receive completion certificate
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Event Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium text-foreground">
                        {dateInfo.isMultiDay ? 'Multiple Days' : 'Single Day'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Venue:</span>
                      <span className="font-medium text-foreground">
                        GSAI Campus
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium text-foreground">
                        {event.tag || 'General Event'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Phone:</strong> +91 6394135988
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Email:</strong> ghatakgsai@gmail.com
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Address:</strong> Badshah kheda, Takrohi Rd,
                      Indira Nagar, Lucknow
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Interested in This Event?
              </h3>
              <p className="text-muted-foreground mb-4">
                Contact us to register or learn more about upcoming events at
                Ghatak Sports Academy India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/#contact')}
                  className="flex-1 sm:flex-none"
                >
                  Contact Us
                </Button>
                <Button
                  onClick={() => navigate('/#programs')}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  View All Programs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
