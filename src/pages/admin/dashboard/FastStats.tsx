import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign,
  Users,
  BookOpen,
  Newspaper,
  Image,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { safeCount } from '@/utils/dashboardStats';

const entities = [
  { name: 'Fees', icon: DollarSign, table: 'fees', color: 'text-green-600' },
  { name: 'Students', icon: Users, table: 'students', color: 'text-blue-600' },
  { name: 'Blogs', icon: BookOpen, table: 'blogs', color: 'text-pink-600' },
  { name: 'News', icon: Newspaper, table: 'news', color: 'text-yellow-600' },
  {
    name: 'Gallery',
    icon: Image,
    table: 'gallery_images',
    color: 'text-indigo-600',
  },
  { name: 'Events', icon: Calendar, table: 'events', color: 'text-orange-600' },
];

export default function FastStats() {
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let ignore = false;
    async function fetchCounts() {
      setLoading(true);
      const promises = entities.map(async (ent) => {
        const { count } = await supabase
          .from(ent.table as any)
          .select('id', { count: 'exact', head: true });
        return [ent.name, count ?? 0] as const;
      });
      const results = await Promise.all(promises);

      if (!ignore) {
        setCounts(Object.fromEntries(results));
        setLoading(false);
      }
    }
    fetchCounts();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <div className="text-lg md:text-xl font-semibold mb-3 mt-2 text-gray-700">
        Fast Stats
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-2">
        {entities.map((e) => (
          <Card
            className="shadow border-0 bg-gradient-to-b from-yellow-50 to-white hover:scale-105 transition-transform"
            key={e.name}
          >
            <CardHeader className="pb-2 flex flex-row gap-2 items-center justify-center">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 ${e.color}`}
              >
                <e.icon className="w-5 h-5" />
              </span>
              <CardTitle
                className={`text-xs font-bold tracking-wide ${e.color}`}
              >
                {e.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-3">
              <span className="text-xl md:text-2xl font-extrabold text-gray-900 drop-shadow-sm">
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  (counts[e.name] ?? 0)
                )}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
