import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Award, Layers, Settings } from 'lucide-react';
import DisciplinesManager from '@/components/admin/disciplines/DisciplinesManager';
import BeltSetupManager from '@/components/admin/progression/BeltSetupManager';
import DisciplineLevelsManager from '@/components/admin/progression/DisciplineLevelsManager';

export default function Disciplines() {
  return (
    <div className="w-full p-2 sm:p-3 lg:p-4">
      <Tabs defaultValue="disciplines" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="disciplines" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Disciplines</span>
          </TabsTrigger>
          <TabsTrigger value="belts" className="gap-2">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Belt Setup</span>
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Levels</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="disciplines">
          <DisciplinesManager />
        </TabsContent>

        <TabsContent value="belts">
          <BeltSetupManager />
        </TabsContent>

        <TabsContent value="levels">
          <DisciplineLevelsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
