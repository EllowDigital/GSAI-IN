import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/useToast';
import { Users, Trophy, Medal, X, UserMinus, Search } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

interface Registration {
  id: string;
  student_id: string;
  competition_id: string;
  status: string;
  position: string | null;
  position_notes: string | null;
  registered_at: string;
  students: { name: string; program: string } | null;
}

const POSITIONS = [
  {
    value: 'gold',
    label: '🥇 Gold',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  },
  {
    value: 'silver',
    label: '🥈 Silver',
    className: 'bg-gray-100 text-gray-700 border-gray-400',
  },
  {
    value: 'bronze',
    label: '🥉 Bronze',
    className: 'bg-orange-100 text-orange-800 border-orange-400',
  },
  {
    value: 'participant',
    label: '🏅 Participant',
    className: 'bg-blue-100 text-blue-700 border-blue-400',
  },
];

interface Props {
  competition: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getFriendlySupabaseMessage = (error: unknown, fallback: string) => {
  const friendly = mapSupabaseErrorToFriendly(error);
  if (friendly?.message) return friendly.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export default function CompetitionRegistrations({
  competition,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['comp-registrations', competition.id],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('competition_registrations')
        .select('*, students(name, program)')
        .eq('competition_id', competition.id)
        .order('registered_at', { ascending: true })) as any;
      if (error) throw error;
      return (data || []) as Registration[];
    },
    enabled: open,
  });

  const updatePositionMutation = useMutation({
    mutationFn: async ({
      id,
      position,
    }: {
      id: string;
      position: string | null;
    }) => {
      const { error } = (await supabase
        .from('competition_registrations')
        .update({ position } as any)
        .eq('id', id)) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comp-registrations', competition.id],
      });
      toast.success('Position updated');
    },
    onError: (e: Error) =>
      toast.error(getFriendlySupabaseMessage(e, 'Failed to update position')),
  });

  const unregisterMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = (await supabase
        .from('competition_registrations')
        .delete()
        .eq('id', id)) as any;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comp-registrations', competition.id],
      });
      queryClient.invalidateQueries({ queryKey: ['competition-reg-counts'] });
      toast.success('Student unregistered');
    },
    onError: (e: Error) =>
      toast.error(
        getFriendlySupabaseMessage(e, 'Failed to unregister student')
      ),
  });

  const filtered = registrations.filter(
    (r) =>
      r.students?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.students?.program?.toLowerCase().includes(search.toLowerCase())
  );

  const goldCount = registrations.filter((r) => r.position === 'gold').length;
  const silverCount = registrations.filter(
    (r) => r.position === 'silver'
  ).length;
  const bronzeCount = registrations.filter(
    (r) => r.position === 'bronze'
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> {competition.name} —
            Registrations
          </DialogTitle>
          <DialogDescription>
            {registrations.length} registered • Assign positions and manage
            participants
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-300"
          >
            🥇 {goldCount}
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-600 border-gray-300"
          >
            🥈 {silverCount}
          </Badge>
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-300"
          >
            🥉 {bronzeCount}
          </Badge>
          <Badge variant="outline">{registrations.length} total</Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size={20} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            {registrations.length === 0
              ? 'No students registered yet.'
              : 'No matches found.'}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((reg) => {
              const posConfig = POSITIONS.find((p) => p.value === reg.position);
              return (
                <Card key={reg.id} className="border border-border">
                  <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {reg.students?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reg.students?.program}
                      </p>
                      {posConfig && (
                        <Badge
                          variant="outline"
                          className={`mt-1 text-[10px] ${posConfig.className}`}
                        >
                          {posConfig.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={reg.position || 'none'}
                        onValueChange={(val) =>
                          updatePositionMutation.mutate({
                            id: reg.id,
                            position: val === 'none' ? null : val,
                          })
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Set position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No position</SelectItem>
                          {POSITIONS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Unregister ${reg.students?.name}?`))
                            unregisterMutation.mutate(reg.id);
                        }}
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
