import React from 'react';
import StudentManager from '@/components/admin/StudentManager';
import StudentPortalManager from '@/components/admin/StudentPortalManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap } from 'lucide-react';

export default function Students() {
  return (
    <div className="w-full h-full p-2 sm:p-3 lg:p-4">
      <Tabs defaultValue="students" className="w-full h-full">
        <TabsList className="grid grid-cols-2 max-w-xs">
          <TabsTrigger value="students" className="gap-1.5 text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5" /> Students
          </TabsTrigger>
          <TabsTrigger value="portal" className="gap-1.5 text-xs sm:text-sm">
            <GraduationCap className="w-3.5 h-3.5" /> Portal
          </TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="mt-3">
          <StudentManager />
        </TabsContent>
        <TabsContent value="portal" className="mt-3">
          <StudentPortalManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
