import React from 'react';
import StudentManager from '@/components/admin/StudentManager';
import StudentPortalManager from '@/components/admin/StudentPortalManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, GraduationCap } from 'lucide-react';

export default function Students() {
  return (
    <div className="admin-page">
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid grid-cols-2 max-w-xs mb-4">
          <TabsTrigger value="students" className="gap-1.5 text-xs sm:text-sm">
            <Users className="w-3.5 h-3.5" /> Students
          </TabsTrigger>
          <TabsTrigger value="portal" className="gap-1.5 text-xs sm:text-sm">
            <GraduationCap className="w-3.5 h-3.5" /> Portal
          </TabsTrigger>
        </TabsList>
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
