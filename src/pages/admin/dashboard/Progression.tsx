import React from 'react';
import ProgressionBoard from '@/components/admin/progression/ProgressionBoard';
import BeltTestCalendar from '@/components/admin/BeltTestCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, CalendarDays } from 'lucide-react';

export default function Progression() {
  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 max-w-[1600px] mx-auto">
      <Tabs defaultValue="progression" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="progression" className="gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Progression</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Belt Exams</span>
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
