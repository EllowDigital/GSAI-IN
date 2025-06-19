import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Users,
  BookOpen,
  Newspaper,
  Image,
  Calendar,
} from 'lucide-react';
import {
  aggregateFees,
  studentsByProgram,
  getLatestTitlesAll,
  safeCount,
  getNextEvent,
} from '@/utils/dashboardStats';

type StatsData = {
  total?: number;
  paidSum?: number;
  partialSum?: number;
  unpaidCount?: number;
  byProgram?: Record<string, number>;
  latestBlogs?: string[];
  latestNews?: string[];
  galleryCount?: number;
  eventCount?: number;
  nextEvent?: string;
};

function useAdvancedStats() {
  const [stats, setStats] = useState<StatsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      const [feesRes, studentsRes, blogsRes, newsRes, galleryRes, eventsRes] =
        await Promise.all([
          supabase.from('fees').select('*'),
          supabase.from('students').select('program'),
          supabase
            .from('blogs')
            .select('title, published_at')
            .order('published_at', { ascending: false }),
          supabase
            .from('news')
            .select('title, date')
            .order('date', { ascending: false }),
          supabase.from('gallery_images').select('id'),
          supabase
            .from('events')
            .select('title, date')
            .order('date', { ascending: true }),
        ]);

      const fees = feesRes.data ?? [];
      const students = studentsRes.data ?? [];
      const blogs = blogsRes.data ?? [];
      const news = newsRes.data ?? [];
      const gallery = galleryRes.data ?? [];
      const events = eventsRes.data ?? [];

      const result: StatsData = {
        ...aggregateFees(fees),
        byProgram: studentsByProgram(students),
        latestBlogs: getLatestTitlesAll(blogs, 3),
        latestNews: getLatestTitlesAll(news, 3),
        galleryCount: safeCount(gallery),
        eventCount: safeCount(events),
        nextEvent: getNextEvent(events),
      };

      if (!cancelled) {
        setStats(result);
        setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { stats, loading };
}

export default function AdvancedStats() {
  const { stats, loading } = useAdvancedStats();

  return (
    <section>
      <h2 className="text-xl font-bold mb-2 mt-6 text-gray-700">
        Advanced Stats
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fees */}
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Fees Details"
          color="text-green-700"
          loading={loading}
        >
          <ul className="text-sm space-y-1">
            <li>
              <b>Total Records:</b> {stats.total ?? '-'}
            </li>
            <li>
              <b>Total Paid:</b> ₹{stats.paidSum ?? 0}
            </li>
            <li>
              <b>Partial Paid:</b> ₹{stats.partialSum ?? 0}
            </li>
            <li>
              <b>Unpaid Count:</b> {stats.unpaidCount ?? 0}
            </li>
          </ul>
        </StatCard>

        {/* Students */}
        <StatCard
          icon={<Users className="w-5 h-5" />}
          title="Students Breakdown"
          color="text-blue-700"
          loading={loading}
        >
          {stats.total === 0 ? (
            <p>No students found.</p>
          ) : (
            <ul className="text-sm space-y-1">
              <li>
                <b>Total Students:</b> {stats.total}
              </li>
              <li>
                <b>By Program:</b>
              </li>
              <ul className="ml-4 list-disc">
                {stats.byProgram && Object.keys(stats.byProgram).length > 0 ? (
                  Object.entries(stats.byProgram).map(([program, count]) => (
                    <li key={program}>
                      {program}: {count}
                    </li>
                  ))
                ) : (
                  <li>No programs found.</li>
                )}
              </ul>
            </ul>
          )}
        </StatCard>

        {/* Blogs */}
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          title="Latest Blogs"
          color="text-pink-700"
          loading={loading}
        >
          <ol className="list-decimal ml-4 text-sm">
            {stats.latestBlogs?.length ? (
              stats.latestBlogs.map((blog, idx) => <li key={idx}>{blog}</li>)
            ) : (
              <li>No blogs found.</li>
            )}
          </ol>
        </StatCard>

        {/* News */}
        <StatCard
          icon={<Newspaper className="w-5 h-5" />}
          title="Latest News"
          color="text-yellow-700"
          loading={loading}
        >
          <ol className="list-decimal ml-4 text-sm">
            {stats.latestNews?.length ? (
              stats.latestNews.map((news, idx) => <li key={idx}>{news}</li>)
            ) : (
              <li>No news found.</li>
            )}
          </ol>
        </StatCard>

        {/* Gallery */}
        <StatCard
          icon={<Image className="w-5 h-5" />}
          title="Gallery Stats"
          color="text-indigo-700"
          loading={loading}
        >
          <p>
            <span className="font-bold text-lg">{stats.galleryCount ?? 0}</span>{' '}
            images
          </p>
        </StatCard>

        {/* Events */}
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          title="Events"
          color="text-orange-700"
          loading={loading}
        >
          <ul className="text-sm space-y-1">
            <li>
              <b>Total Events:</b> {stats.eventCount ?? 0}
            </li>
            <li>
              <b>Next Event:</b> {stats.nextEvent ?? 'No upcoming'}
            </li>
          </ul>
        </StatCard>
      </div>
    </section>
  );
}

// Reusable stat card component
function StatCard({
  icon,
  title,
  color,
  loading,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${color}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted">Loading...</p> : children}
      </CardContent>
    </Card>
  );
}
