import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Save, Loader2, IndianRupee, Edit2, X } from 'lucide-react';
import { toast } from '@/hooks/useToast';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

const PROGRAMS = [
  { value: 'Karate', label: '🥋 Karate' },
  { value: 'Taekwondo', label: '🦵 Taekwondo' },
  { value: 'Boxing', label: '🥊 Boxing' },
  { value: 'Kickboxing', label: '🥋 Kickboxing' },
  { value: 'Grappling', label: '🤼 Grappling' },
  { value: 'MMA', label: '🥋 MMA' },
  { value: 'Kalaripayattu', label: '🕉️ Kalaripayattu' },
  { value: 'Self-Defense', label: '🛡️ Self-Defense' },
  { value: 'Fat Loss', label: '🏋️ Fat Loss' },
];

type ProgramFees = Record<string, number>;

export function useProgramFees() {
  return useQuery({
    queryKey: ['academy-settings', 'program_fees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_settings')
        .select('key, value')
        .like('key', 'program_fee_%');
      if (error) throw error;

      const fees: ProgramFees = {};
      (data || []).forEach((row) => {
        const program = row.key.replace('program_fee_', '');
        fees[program] = Number(row.value) || 2000;
      });
      return fees;
    },
  });
}

export default function FeeSettingsCard() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feeValues, setFeeValues] = useState<ProgramFees>({});

  const getFriendlySupabaseMessage = (error: unknown, fallback: string) => {
    const friendly = mapSupabaseErrorToFriendly(error);
    if (friendly?.message) return friendly.message;
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  // Fetch global default fee
  const { data: globalSetting } = useQuery({
    queryKey: ['academy-settings', 'default_monthly_fee'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academy_settings')
        .select('*')
        .eq('key', 'default_monthly_fee')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch per-program fees
  const { data: programFees } = useProgramFees();

  const globalFee = Number(globalSetting?.value || 2000);

  useEffect(() => {
    if (editing) {
      const initial: ProgramFees = {};
      PROGRAMS.forEach((p) => {
        initial[p.value] = programFees?.[p.value] ?? globalFee;
      });
      setFeeValues(initial);
    }
  }, [editing, programFees, globalFee]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const upserts = PROGRAMS.map((p) => ({
        key: `program_fee_${p.value}`,
        value: String(feeValues[p.value] ?? globalFee),
        updated_at: now,
      }));

      const { error } = await supabase
        .from('academy_settings')
        .upsert(upserts, { onConflict: 'key' });
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['academy-settings'] });
      toast({
        title: 'Program fees updated',
        description: 'All program fees have been saved.',
      });
      setEditing(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: getFriendlySupabaseMessage(
          err,
          'Failed to save program fees'
        ),
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  Program Fee Settings
                </p>
                <p className="text-xs text-muted-foreground">
                  Set different fees for each program
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Fees
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {PROGRAMS.map((p) => {
              const fee = programFees?.[p.value] ?? globalFee;
              return (
                <div
                  key={p.value}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/40"
                >
                  <span className="text-sm">{p.label.split(' ')[0]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {p.value}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      ₹{fee.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <IndianRupee className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                Edit Program Fees
              </p>
              <p className="text-xs text-muted-foreground">
                Set monthly fee for each program
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROGRAMS.map((p) => (
            <div
              key={p.value}
              className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background"
            >
              <span className="text-lg w-8 text-center">
                {p.label.split(' ')[0]}
              </span>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-muted-foreground">
                  {p.value}
                </label>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    min={0}
                    value={feeValues[p.value] ?? globalFee}
                    onChange={(e) =>
                      setFeeValues((prev) => ({
                        ...prev,
                        [p.value]: Number(e.target.value) || 0,
                      }))
                    }
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
