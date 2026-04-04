import React, { useEffect, useMemo, useState } from 'react';
import {
  Info,
  CalendarClock,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  ShieldCheck,
  Users,
  Sparkles,
  Building2,
  UserCircle2,
  Link as LinkIcon,
  Sparkles,
  Rocket,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type LastUpdatedPayload = {
  lastUpdated?: string;
};

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/ghataksportsacademy',
    icon: Instagram,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/ghataksportsacademy',
    icon: Facebook,
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@ghatakgsai',
    icon: Youtube,
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/ghataksportsacademy',
    icon: Twitter,
  },
];

export default function About() {
  const [lastUpdated, setLastUpdated] = useState('2026-04-04T00:00:00.000Z');

  useEffect(() => {
    let isMounted = true;

    const loadLastUpdated = async () => {
      try {
        const response = await fetch('/last-updated.json', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as LastUpdatedPayload;
        if (isMounted && payload.lastUpdated) {
          setLastUpdated(payload.lastUpdated);
        }
      } catch {
        // Keep fallback date if fetch fails.
      }
    };

    loadLastUpdated();
    return () => {
      isMounted = false;
    };
  }, []);

  const formattedDate = useMemo(() => {
    const parsed = new Date(lastUpdated);
    if (Number.isNaN(parsed.getTime())) return 'Not available';
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }, [lastUpdated]);

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
                Build Metadata + Credits
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  About Admin Workspace
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Transparent credits, release information, and official academy
                  channels in one clean view.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[360px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Admin Version
                  </p>
                  <p className="mt-1 text-2xl font-semibold">v2.4.0</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Last Update
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{formattedDate}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="admin-panel lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
              <Info className="h-4 w-4 text-primary" />
              Made By and Credits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <UserCircle2 className="h-4 w-4 text-primary" />
                  Creator
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sarwan Yadav
                </p>
                <a
                  href="https://github.com/devsarwan"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  github.com/devsarwan
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </article>

              <article className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  Organization
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  EllowDigital
                </p>
                <a
                  href="https://ellowdigital.space"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  ellowdigital.space
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </article>
            </div>

            <article className="rounded-xl border border-border/70 bg-muted/20 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="h-4 w-4 text-primary" />
                Collaboration and Leadership
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Built in collaboration with Ghatak Sports Academy India. The
                academy is founded by Nitesh Yadav, owner and coach, with an
                international-level professional training vision.
              </p>
            </article>
          </CardContent>
        </Card>

        <Card className="admin-panel">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Rocket className="h-4 w-4 text-primary" />
              Release Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Current Version
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">v2.4.0</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Last Admin Update
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">{formattedDate}</p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Stable Admin Build
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Includes optimized caching and refreshed admin UI system.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
            <Users className="h-4 w-4 text-primary" />
            Ghatak Sports Academy India Social Media
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Official channels for updates, events, and academy highlights.
          </p>
        </div>
        <div className="admin-panel-body">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-xl border border-border/70 bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.05]"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-primary" />
                  <LinkIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">Open official profile</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
