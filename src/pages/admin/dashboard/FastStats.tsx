
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DollarSign,
  Users,
  BookOpen,
  Newspaper,
  Image,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const entities = [
  { name: "Fees", icon: DollarSign, table: "fees", color: "text-green-600" },
  { name: "Students", icon: Users, table: "students", color: "text-blue-600" },
  { name: "Blogs", icon: BookOpen, table: "blogs", color: "text-pink-600" },
  { name: "News", icon: Newspaper, table: "news", color: "text-yellow-600" },
  { name: "Gallery", icon: Image, table: "gallery_images", color: "text-indigo-600" },
  { name: "Events", icon: Calendar, table: "events", color: "text-orange-600" },
];

export default function FastStats() {
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;

    async function fetchCounts() {
      setLoading(true);
      const results: Record<string, number> = {};
      for (const ent of entities) {
        // table param must be one of the fixed string values, so we must typecast it here
        const { count } = await supabase
          .from(ent.table as "fees" | "students" | "blogs" | "news" | "gallery_images" | "events")
          .select("id", { count: "exact", head: true });
        results[ent.name] = count ?? 0;
      }
      if (!ignore) {
        setCounts(results);
        setLoading(false);
      }
    }
    fetchCounts();
    return () => { ignore = true; };
  }, []);

  return (
    <div>
      <div className="text-xl font-bold mb-2 mt-3 text-gray-700">Fast Stats</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-4">
        {entities.map((e) => (
          <Card className="shadow flex-1" key={e.name}>
            <CardHeader className="pb-2">
              <CardTitle className={`flex items-center gap-2 text-xs ${e.color}`}>
                <e.icon className="w-5 h-5" />
                {e.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {loading ? "..." : counts[e.name] ?? 0}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
