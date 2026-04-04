import React from 'react';
import StudentManager from '@/components/admin/StudentManager';
import StudentPortalManager from '@/components/admin/StudentPortalManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap } from 'lucide-react';

export default function Students() {
  return (
    <div className="admin-page">
      <Tabs defaultValue="students" className="w-full space-y-4">
        <section className="admin-panel overflow-hidden">
          <div className="admin-panel-body bg-gradient-to-r from-primary/5 via-background to-background">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  Students And Portal
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage student records and portal accounts from one unified
                  workspace.
                </p>
              </div>
              <TabsList className="grid h-10 w-full grid-cols-2 rounded-xl border border-border/70 bg-card p-1 sm:w-[260px]">
                <TabsTrigger
                  value="students"
                  className="gap-1.5 rounded-lg text-xs sm:text-sm"
                >
                  <Users className="h-3.5 w-3.5" /> Students
                </TabsTrigger>
                <TabsTrigger
                  value="portal"
                  className="gap-1.5 rounded-lg text-xs sm:text-sm"
                >
                  <GraduationCap className="h-3.5 w-3.5" /> Portal
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </section>

        <TabsContent value="students">
          <StudentManager />
        </TabsContent>
        <TabsContent value="portal">
          <StudentPortalManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
