import React from 'react';
import ProgressionBoard from '@/components/admin/progression/ProgressionBoard';
import BeltTestCalendar from '@/components/admin/BeltTestCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, CalendarDays } from 'lucide-react';

export default function Progression() {
  return (
    <div className="admin-page">
      <Tabs defaultValue="progression" className="space-y-4">
        <section className="admin-panel overflow-hidden">
          <div className="admin-panel-body bg-gradient-to-r from-primary/5 via-background to-background">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  Progression Workspace
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track student advancement, assessments, and belt exam
                  planning.
                </p>
              </div>
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-border/70 bg-card p-1 sm:w-[300px]">
                <TabsTrigger
                  value="progression"
                  className="gap-2 rounded-lg text-xs sm:text-sm"
                >
                  <Award className="w-4 h-4" />
                  <span>Progression</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="gap-2 rounded-lg text-xs sm:text-sm"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Belt Exams</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </section>

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
