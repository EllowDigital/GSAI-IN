import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function FeeSettingsCard() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFee, setNewFee] = useState('');

  const { data: settings } = useQuery({
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

  const currentFee = settings?.value || '2000';

  const handleSave = async () => {
    if (!newFee || Number(newFee) < 0) {
      toast({
        title: 'Invalid fee',
        description: 'Fee must be a positive number',
        variant: 'error',
      });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('academy_settings')
        .update({ value: newFee, updated_at: new Date().toISOString() })
        .eq('key', 'default_monthly_fee');
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['academy-settings'] });
      toast({
        title: 'Default fee updated',
        description: `New default: ₹${newFee}/month`,
      });
      setEditing(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Default Monthly Fee (all new students)
            </p>
            {editing ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium">₹</span>
                <Input
                  type="number"
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  className="h-8 w-28"
                  min={0}
                  autoFocus
                />
              </div>
            ) : (
              <p className="text-lg font-bold text-foreground">
                ₹{Number(currentFee).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewFee(currentFee);
              setEditing(true);
            }}
          >
            Edit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
