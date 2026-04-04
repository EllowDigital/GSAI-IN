import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import DisciplinesManager from '@/components/admin/disciplines/DisciplinesManager';
import BeltSetupManager from '@/components/admin/progression/BeltSetupManager';
import DisciplineLevelsManager from '@/components/admin/progression/DisciplineLevelsManager';
import { useDisciplines } from '@/hooks/useDisciplines';
import { useBeltLevels } from '@/hooks/useBeltLevels';
import { useDisciplineLevels } from '@/hooks/useDisciplineLevels';

export default function Disciplines() {
  const { disciplines = [], isLoading: disciplinesLoading } = useDisciplines();
  const { data: belts = [], isLoading: beltsLoading } = useBeltLevels();
  const { data: levels = [], isLoading: levelsLoading } = useDisciplineLevels();

  const beltDisciplines = disciplines.filter((item) => item.type === 'belt');
  const levelDisciplines = disciplines.filter((item) => item.type === 'level');
  const activeDisciplines = disciplines.filter((item) => item.is_active);
  const summaryLoading = disciplinesLoading || beltsLoading || levelsLoading;

  return (
    <div className="admin-page space-y-5 lg:space-y-6">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Progression Configuration Hub
              </Badge>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Disciplines Workspace
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Manage discipline structure, belt hierarchies, and level ladders
                  from one streamlined control center.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Active Disciplines
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {summaryLoading ? '...' : activeDisciplines.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Belt Tracks
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {summaryLoading ? '...' : beltDisciplines.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Level Entries
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {summaryLoading ? '...' : levels.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Configuration Sections
              </h2>
              <p className="text-sm text-muted-foreground">
                Switch between discipline records, belt presets, and level setup.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Fully responsive for mobile and desktop
            </div>
          </div>
        </div>

        <div className="admin-panel-body space-y-4">
          <Tabs defaultValue="disciplines" className="space-y-4">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl border border-border/60 bg-muted/40 p-1 sm:max-w-2xl">
              <TabsTrigger
                value="disciplines"
                className="flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Disciplines</span>
              </TabsTrigger>
              <TabsTrigger
                value="belts"
                className="flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
              >
                <Award className="h-4 w-4" />
                <span>Belt Setup</span>
              </TabsTrigger>
              <TabsTrigger
                value="levels"
                className="flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
              >
                <Layers className="h-4 w-4" />
                <span>Levels</span>
              </TabsTrigger>
            </TabsList>

            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5" />
                Tip: Start with discipline type, then configure belt or level
                structures for reliable progression tracking.
              </span>
            </div>

            <TabsContent value="disciplines" className="mt-0">
              <DisciplinesManager />
            </TabsContent>
            <TabsContent value="belts" className="mt-0">
              <BeltSetupManager />
            </TabsContent>
            <TabsContent value="levels" className="mt-0">
              <DisciplineLevelsManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/70 bg-card/80">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Disciplines</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {summaryLoading ? '...' : disciplines.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Belt Disciplines</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {summaryLoading ? '...' : beltDisciplines.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Level Disciplines</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {summaryLoading ? '...' : levelDisciplines.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Belt Entries</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {summaryLoading ? '...' : belts.length}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
