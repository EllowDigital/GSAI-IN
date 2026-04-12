import React from 'react';
import {
  Info,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Users,
  Sparkles,
  Building2,
  UserCircle2,
  Link as LinkIcon,
  Rocket,
  ArrowUpRight,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ADMIN_VERSION = 'v2.5.0';
const ADMIN_LAST_UPDATED = '12 Apr 2026';

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/ghataksportsacademy',
    icon: Instagram,
    hoverColor: 'group-hover:text-pink-500',
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/ghataksportsacademy',
    icon: Facebook,
    hoverColor: 'group-hover:text-blue-500',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@ghatakgsai',
    icon: Youtube,
    hoverColor: 'group-hover:text-red-500',
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/ghataksportsacademy',
    icon: Twitter,
    hoverColor: 'group-hover:text-sky-500',
  },
];

export default function About() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- HERO BANNER --- */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-100 shadow-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-8 lg:p-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between z-10">
          <div className="space-y-4 max-w-2xl">
            <Badge className="w-fit gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-slate-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              Build Metadata + Credits
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Admin Workspace
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                Transparent system credits, release snapshot information, and
                official academy channels all in one centralized view.
              </p>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[380px] shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Admin Version
              </p>
              <p className="mt-1 text-2xl font-bold text-white tracking-tight">
                {ADMIN_VERSION}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Last Update
              </p>
              <p className="mt-1 text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {ADMIN_LAST_UPDATED}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTENT GRID --- */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Credits Section */}
        <Card className="lg:col-span-2 border-border/60 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Info className="h-5 w-5 text-primary" />
              Made By & Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Creator */}
              <a
                href="https://github.com/devsarwan"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-muted/30 p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    Creator
                  </p>
                  <p className="mt-1.5 text-base font-medium text-foreground">
                    Sarwan Yadav
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-primary/80">
                  github.com/devsarwan
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>

              {/* Organization */}
              <a
                href="https://ellowdigital.space"
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-border/60 bg-muted/30 p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    Organization
                  </p>
                  <p className="mt-1.5 text-base font-medium text-foreground">
                    EllowDigital
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors group-hover:text-primary/80">
                  ellowdigital.space
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </a>
            </div>

            {/* Leadership */}
            <div className="rounded-xl border border-border/60 bg-muted/30 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Collaboration & Leadership
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Built in collaboration with{' '}
                <strong>Ghatak Sports Academy India</strong>. The academy is
                founded by <strong>Nitesh Yadav</strong>, owner and head coach,
                operating with a vision to provide international-level
                professional sports training.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Release Snapshot Section */}
        <Card className="border-border/60 shadow-sm flex flex-col">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Rocket className="h-5 w-5 text-primary" />
              Release Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 sm:p-6 space-y-4 flex-1">
            <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" /> Current Version
              </p>
              <p className="mt-1.5 text-xl font-bold text-foreground">
                {ADMIN_VERSION}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" /> Last Admin Update
              </p>
              <p className="mt-1.5 text-xl font-bold text-foreground">
                {ADMIN_LAST_UPDATED}
              </p>
            </div>

            <div className="mt-auto rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Stable Admin Build
              </p>
              <p className="mt-1.5 text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed">
                Includes optimized query caching, real-time sync, and a
                refreshed responsive UI system.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* --- SOCIAL LINKS --- */}
      <section className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Official Social Channels
          </h2>
          <p className="mt-1 text-sm text-muted-foreground font-medium">
            Connect with Ghatak Sports Academy India for updates, event
            highlights, and training content.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon, hoverColor }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 rounded-lg bg-muted/50 transition-colors ${hoverColor} group-hover:bg-muted`}
                >
                  <Icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-current" />
                </div>
                <LinkIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-primary group-hover:rotate-45" />
              </div>
              <div className="mt-5">
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                  View Official Profile
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
