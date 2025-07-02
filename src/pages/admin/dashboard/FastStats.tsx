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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
          Quick Overview
        </h2>
        <div className="h-px flex-1 bg-border"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {entities.map((e) => (
          <Card
            className="border border-border bg-card hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[100px] sm:min-h-[120px]"
            key={e.name}
          >
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4">
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted ${e.color}`}
                >
                  <e.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <CardTitle
                  className={`text-xs sm:text-sm font-bold tracking-wide text-center leading-tight ${e.color}`}
                >
                  {e.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-2 sm:py-3 p-3 sm:p-4 pt-0">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground">
                {loading ? (
                  <span className="animate-pulse text-muted-foreground">
                    ...
                  </span>
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
