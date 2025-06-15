
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, List, Users, BookOpen, Newspaper, Image, Calendar } from "lucide-react";
import {
  aggregateFees,
  studentsByProgram,
  getLatestTitlesAll,
  safeCount,
  getNextEvent
} from "@/utils/dashboardStats";

function useAdvancedStats() {
  const [data, setData] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;
    async function getStats() {
      setLoading(true);
      // Fetch all data in batches and only aggregate after fetch
      const [feesRes, studentsRes, blogsRes, newsRes, galleryRes, eventsRes] = await Promise.all([
        supabase.from("fees").select("*"),
        supabase.from("students").select("program"),
        supabase.from("blogs").select("title, published_at").order("published_at", { ascending: false }),
        supabase.from("news").select("title, date").order("date", { ascending: false }),
        supabase.from("gallery_images").select("id"),
        supabase.from("events").select("title, date").order("date", { ascending: true }),
      ]);

      const fees = Array.isArray(feesRes.data) ? feesRes.data : [];
      const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const blogs = Array.isArray(blogsRes.data) ? blogsRes.data : [];
      const news = Array.isArray(newsRes.data) ? newsRes.data : [];
      const gallery = Array.isArray(galleryRes.data) ? galleryRes.data : [];
      const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];

      // Perform robust/advanced aggregation
      const feesAgg = aggregateFees(fees);
      const studentsProg = studentsByProgram(students);
      const latestBlogs = getLatestTitlesAll(blogs, 3);
      const latestNews = getLatestTitlesAll(news, 3);
      const galleryCount = safeCount(gallery);
      const eventCount = safeCount(events);
      const nextEvent = getNextEvent(events);

      if (!ignore) {
        setData({
          ...feesAgg,
          ...studentsProg,
          latestBlogs,
          latestNews,
          galleryCount,
          eventCount,
          nextEvent,
        });
        setLoading(false);
      }
    }
    getStats();
    return () => { ignore = true; };
  }, []);

  return { data, loading };
}

export default function AdvancedStats() {
  const { data, loading } = useAdvancedStats();

  return (
    <div>
      <div className="text-xl font-bold mb-2 mt-6 text-gray-700">Advanced Stats</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fees block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="w-5 h-5" />
              Fees Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Loading..." : (
              <ul className="text-sm space-y-1">
                <li><b>Total Fee Records:</b> {data.total}</li>
                <li><b>Total Paid:</b> ₹{data.paidSum}</li>
                <li><b>Partial Paid:</b> ₹{data.partialSum}</li>
                <li><b>Completely Unpaid Count:</b> {data.unpaidCount}</li>
              </ul>
            )}
          </CardContent>
        </Card>
        {/* Students block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Users className="w-5 h-5" />
              Students Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Loading..." : data.total === 0 ? (
              <div>No students</div>
            ) : (
              <div>
                <ul className="text-sm space-y-1">
                  <li><b>Total Students:</b> {data.total}</li>
                  <li><b>By Program:</b></li>
                  <ul className="ml-4 list-disc">
                    {data && data.byProgram
                      ? Object.entries(data.byProgram).length === 0 ? (
                          <li>No programs</li>
                        ) : (
                          Object.entries(data.byProgram).map(([prog, count]) => (
                            <li key={prog}>{String(prog)}: {String(count)}</li>
                          ))
                        )
                      : <li>No programs</li>}
                  </ul>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Blogs block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <BookOpen className="w-5 h-5" />
              Latest Blogs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Loading..." : (
              <ol className="list-decimal ml-4 text-sm">
                {Array.isArray(data.latestBlogs) && data.latestBlogs.length > 0
                  ? data.latestBlogs.map((b: string, idx: number) => (
                      <li key={b + idx}>{b}</li>
                    ))
                  : <li>No blogs found.</li>
                }
              </ol>
            )}
          </CardContent>
        </Card>
        {/* News block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Newspaper className="w-5 h-5" />
              Latest News
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Loading..." : (
              <ol className="list-decimal ml-4 text-sm">
                {Array.isArray(data.latestNews) && data.latestNews.length > 0
                  ? data.latestNews.map((n: string, idx: number) => (
                      <li key={n + idx}>{n}</li>
                    ))
                  : <li>No news found.</li>
                }
              </ol>
            )}
          </CardContent>
        </Card>
        {/* Gallery block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Image className="w-5 h-5" />
              Gallery Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Loading..." : (
              <div>
                <span className="font-bold text-lg">{data.galleryCount}</span> images
              </div>
            )}
          </CardContent>
        </Card>
        {/* Events block */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Calendar className="w-5 h-5" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? "Loading..." : (
              <ul className="text-sm space-y-1">
                <li><b>Total Events:</b> {data.eventCount ?? 0}</li>
                <li><b>Next Event:</b> {data.nextEvent || "No upcoming"}</li>
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
