import React from 'react';
import ProgressionBoard from '@/components/admin/progression/ProgressionBoard';
import BeltTestCalendar from '@/components/admin/BeltTestCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, CalendarDays } from 'lucide-react';

export default function Progression() {
  return (
    <div className="w-full min-h-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1600px] mx-auto">
      <Tabs defaultValue="progression" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="progression" className="gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Progression</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Test Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progression">
          <ProgressionBoard />
        </TabsContent>

        <TabsContent value="calendar">
          <BeltTestCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}
