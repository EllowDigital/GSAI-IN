import React from 'react';
import { format } from 'date-fns';
import { Award, ArrowRight, Calendar, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PromotionHistoryItem {
  id: string;
  promoted_at: string;
  notes: string | null;
  from_belt?: { id: string; color: string; rank: number } | null;
  to_belt?: { id: string; color: string; rank: number } | null;
  students?: {
    id: string;
    name: string;
    profile_image_url: string | null;
  } | null;
}

interface ProgressionTimelineProps {
  history: PromotionHistoryItem[];
  isLoading: boolean;
}

const BELT_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  white: {
    bg: 'bg-slate-50 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-200',
    border: 'border-slate-300 dark:border-slate-600',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-400 dark:border-yellow-600',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-400 dark:border-orange-600',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-400 dark:border-green-600',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-400 dark:border-blue-600',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-400 dark:border-purple-600',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-400 dark:border-red-600',
  },
  brown: {
    bg: 'bg-amber-100 dark:bg-amber-900/40',
    text: 'text-amber-800 dark:text-amber-200',
    border: 'border-amber-600 dark:border-amber-500',
  },
  black: {
    bg: 'bg-slate-800 dark:bg-slate-950',
    text: 'text-white',
    border: 'border-slate-600 dark:border-slate-700',
  },
};

function getBeltStyle(color: string) {
  return BELT_COLORS[color?.toLowerCase()] || BELT_COLORS.white;
}

export default function ProgressionTimeline({
  history,
  isLoading,
}: ProgressionTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No promotion history yet</p>
        <p className="text-xs mt-1">
          Promotions will appear here as students progress
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[60vh]">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

        <div className="space-y-4">
          {history.map((item, index) => {
            const fromStyle = getBeltStyle(item.from_belt?.color ?? 'white');
            const toStyle = getBeltStyle(item.to_belt?.color ?? 'white');

            return (
              <div key={item.id} className="relative pl-14">
                {/* Timeline dot */}
                <div className="absolute left-4 top-4 z-10">
                  <div
                    className={`h-5 w-5 rounded-full border-2 border-background shadow-sm ${toStyle.bg} ${toStyle.border}`}
                  >
                    <div className="h-full w-full rounded-full flex items-center justify-center">
                      <Award className={`h-2.5 w-2.5 ${toStyle.text}`} />
                    </div>
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`rounded-xl border bg-card p-4 transition-all hover:shadow-md ${index === 0 ? 'ring-2 ring-primary/20' : ''}`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      {item.students?.profile_image_url ? (
                        <AvatarImage
                          src={item.students.profile_image_url}
                          alt={item.students?.name}
                        />
                      ) : (
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {item.students?.name?.slice(0, 2).toUpperCase() ??
                            'ST'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {item.students?.name ?? 'Unknown Student'}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(item.promoted_at),
                          'MMM dd, yyyy • h:mm a'
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Belt progression */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${fromStyle.bg} ${fromStyle.text} ${fromStyle.border}`}
                    >
                      <Award className="h-3 w-3" />
                      {item.from_belt?.color ?? 'Start'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${toStyle.bg} ${toStyle.text} ${toStyle.border}`}
                    >
                      <Award className="h-3 w-3" />
                      {item.to_belt?.color ?? 'Unknown'}
                    </span>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 border border-border/50">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
