import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { ProgressionRecord, ProgressStatus, useProgressionQuery } from '@/hooks/useProgressionQuery';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<ProgressStatus, { label: string; color: string; accent: string }> = {
  needs_work: { label: 'Needs Work', color: 'bg-red-50 text-red-700', accent: 'border-red-200' },
  ready: { label: 'Ready for Assessment', color: 'bg-amber-50 text-amber-700', accent: 'border-amber-200' },
  passed: { label: 'Passed', color: 'bg-emerald-50 text-emerald-700', accent: 'border-emerald-200' },
  deferred: { label: 'Deferred', color: 'bg-slate-100 text-slate-700', accent: 'border-slate-200' },
};

const STATUS_OPTIONS: ProgressStatus[] = ['needs_work', 'ready', 'passed', 'deferred'];

const formatDate = (value: string | null) => {
  if (!value) return 'Not assessed';
  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch (error) {
    return value;
  }
};

function ProgressionCard({ record, onUpdate }: { record: ProgressionRecord; onUpdate: (status: ProgressStatus) => void }) {
  const student = record.students;
  const belt = record.belt_levels;

  return (
    <Card className="border border-slate-200 shadow-sm bg-white/90">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            {student?.profile_image_url && (
              <AvatarImage src={student.profile_image_url} alt={student?.name ?? 'Student'} />
            )}
            <AvatarFallback>
              {student?.name?.slice(0, 2).toUpperCase() ?? 'ST'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900">{student?.name ?? 'Unknown Student'}</p>
            <p className="text-xs text-slate-500">{student?.program ?? 'Assign program'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            Belt: {belt?.color ?? 'Unassigned'}
          </Badge>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
            Rank #{belt?.rank ?? '-'}
          </Badge>
        </div>

        <div className="text-sm text-slate-600">
          <p className="font-medium text-slate-800">Assessment</p>
          <p>{formatDate(record.assessment_date)}</p>
          {record.coach_notes && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-3">{record.coach_notes}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={status === record.status ? 'default' : 'outline'}
              onClick={() => onUpdate(status)}
              className={cn('text-xs', status === record.status ? 'bg-slate-900' : 'text-slate-600')}
            >
              {STATUS_CONFIG[status].label.split(' ')[0]}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProgressionBoard() {
  const { grouped, isLoading, error, updateProgress } = useProgressionQuery();

  return (
    <Card className="bg-gradient-to-b from-white to-slate-50 border border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800">
          Progression Board
        </CardTitle>
        <p className="text-sm text-slate-500">Track belt readiness, upload evidence, and move athletes through the ladder.</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-4 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            Failed to load progression data: {error.message}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUS_OPTIONS.map((status) => {
            const config = STATUS_CONFIG[status];
            const list = grouped[status] ?? [];
            return (
              <div key={status} className="space-y-3">
                <div className={cn('px-3 py-2 rounded-xl border', config.accent)}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {config.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{list.length}</p>
                </div>
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {isLoading && list.length === 0 ? (
                    <p className="text-xs text-slate-500">Loading...</p>
                  ) : list.length === 0 ? (
                    <div className="text-xs text-slate-400 border border-dashed rounded-lg p-4 text-center">
                      No students yet
                    </div>
                  ) : (
                    list.map((record) => (
                      <ProgressionCard
                        key={record.id}
                        record={record}
                        onUpdate={(nextStatus) =>
                          updateProgress({ id: record.id, status: nextStatus })
                        }
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
