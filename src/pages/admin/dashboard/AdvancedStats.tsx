
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, List, Users, BookOpen, Newspaper, Image, Calendar } from "lucide-react";

function useAdvancedStats() {
  const [data, setData] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;
    async function getStats() {
      setLoading(true);
      // Fees breakdown
      let paidSum = 0, unpaidCount = 0, totalFees = 0;
      {
        const { data: fees } = await supabase.from("fees").select("*");
        if (Array.isArray(fees)) {
          paidSum = fees.filter((f: any) => f.status === "paid").reduce((sum: number, f: any) => sum + Number(f.paid_amount ?? 0), 0);
          unpaidCount = fees.filter((f: any) => f.status !== "paid").length;
          totalFees = fees.length;
        }
      }
      // Student by program
      let programCounts: Record<string, number> = {};
      let studentTotal = 0;
      {
        const { data: studs } = await supabase.from("students").select("program");
        if (Array.isArray(studs)) {
          studentTotal = studs.length;
          for (const s of studs) {
            if (!s.program) continue;
            programCounts[s.program] = (programCounts[s.program] || 0) + 1;
          }
        }
      }
      // Blogs recent
      let latestBlogs: string[] = [];
      {
        const { data: blogs } = await supabase.from("blogs").select("title").order("published_at", { ascending: false }).limit(3);
        if (Array.isArray(blogs)) latestBlogs = blogs.map((b: any) => b.title);
      }
      // News recent
      let latestNews: string[] = [];
      {
        const { data: news } = await supabase.from("news").select("title").order("date", { ascending: false }).limit(3);
        if (Array.isArray(news)) latestNews = news.map((n: any) => n.title);
      }
      // Gallery images count
      let galleryCount = 0;
      {
        const { count } = await supabase.from("gallery_images").select("id", { count: "exact", head: true });
        galleryCount = count ?? 0;
      }
      // Events latest
      let eventCount = 0;
      let nextEvent: string | null = null;
      {
        const { data: events } = await supabase.from("events").select("title, date").order("date", { ascending: true });
        if (Array.isArray(events)) {
          eventCount = events.length;
          const now = new Date();
          const next = events.find((e: any) => new Date(e.date) >= now);
          if (next) nextEvent = `${next.title} (${next.date})`;
        }
      }
      if (!ignore) {
        setData({
          paidSum,
          unpaidCount,
          totalFees,
          programCounts,
          studentTotal,
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
                <li><b>Total Fee Records:</b> {data.totalFees}</li>
                <li><b>Total Paid:</b> ₹{data.paidSum}</li>
                <li><b>Unpaid/Other:</b> {data.unpaidCount}</li>
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
            {loading ? "Loading..." : data.studentTotal === 0 ? (
              <div>No students</div>
            ) : (
              <div>
                <ul className="text-sm space-y-1">
                  <li><b>Total Students:</b> {data.studentTotal}</li>
                  <li><b>By Program:</b></li>
                  <ul className="ml-4 list-disc">
                    {Object.entries(data.programCounts ?? {}).map(([prog, count]) => (
                      <li key={prog}>{prog}: {count}</li>
                    ))}
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
                {data.latestBlogs?.length
                  ? data.latestBlogs.map((b: string) => <li key={b}>{b}</li>)
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
                {data.latestNews?.length
                  ? data.latestNews.map((n: string) => <li key={n}>{n}</li>)
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
