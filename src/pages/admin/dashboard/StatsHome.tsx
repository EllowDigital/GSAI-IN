import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, Image } from 'lucide-react';

interface DashboardCounts {
  students: number;
  blogs: number;
  events: number;
  gallery_images: number;
}

export default function StatsHome() {
  const { data: counts, isLoading } = useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: async () => {
      const tables = ['students', 'blogs', 'events', 'gallery_images'] as const;
      const results: Record<string, number> = {};

      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        if (error) {
          console.error(`Error fetching ${table} count:`, error);
          results[table] = 0;
        } else {
          results[table] = count || 0;
        }
      }

      return results;
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : counts?.students || 0}
            </div>
            <p className="text-xs text-gray-500">Registered in the academy</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : counts?.blogs || 0}
            </div>
            <p className="text-xs text-gray-500">Published on the website</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : counts?.events || 0}
            </div>
            <p className="text-xs text-gray-500">Scheduled this month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gallery Images
            </CardTitle>
            <Image className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : counts?.gallery_images || 0}
            </div>
            <p className="text-xs text-gray-500">Uploaded to the gallery</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
