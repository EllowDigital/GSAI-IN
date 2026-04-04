import React, { useEffect, useMemo, useState } from 'react';
import {
  Info,
  CalendarClock,
  Globe,
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="admin-page">
      <div className="admin-panel">
        <div className="admin-panel-header bg-gradient-to-r from-primary/5 via-background to-primary/10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground sm:text-xl">
            <Info className="h-5 w-5 text-primary" />
            About Admin Panel
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Project credits, collaboration details, version metadata, and
            official social links.
          </p>
        </div>

        <div className="admin-panel-body">
          <Card className="border-border/60 bg-gradient-to-br from-card to-primary/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
                <Sparkles className="h-4 w-4 text-primary" />
                Made By And Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground sm:text-[15px]">
              <ul className="space-y-3">
                <li className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    Creator
                  </p>
                  <p className="mt-1">
                    Sarwan Yadav (
                    <a
                      href="https://github.com/devsarwan"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      github.com/devsarwan
                    </a>
                    )
                  </p>
                </li>

                <li className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    Organization
                  </p>
                  <p className="mt-1">
                    EllowDigital (
                    <a
                      href="https://ellowdigital.space"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      ellowdigital.space
                    </a>
                    )
                  </p>
                </li>

                <li className="rounded-lg border border-border/60 bg-background/70 p-3">
                  <p className="flex items-center gap-2 font-semibold text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    Collaboration
                  </p>
                  <p className="mt-1">
                    Built in collaboration with Ghatak Sports Academy India.
                  </p>
                </li>
              </ul>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-foreground">
                  Ghatak Sports Academy India is founded by Nitesh Yadav, who
                  is owner and coach, leading the academy with an
                  international-level and professional vision.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card className="border-border/60">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Last Admin Update
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                    {formattedDate}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Admin Version
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground sm:text-base">
                    v2.4.0
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
                <Users className="h-4 w-4 text-primary" />
                Ghatak Sports Academy India Social Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-sm text-foreground transition-all hover:border-primary/30 hover:bg-primary/[0.06]"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{label}</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
                      Open
                      <LinkIcon className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
