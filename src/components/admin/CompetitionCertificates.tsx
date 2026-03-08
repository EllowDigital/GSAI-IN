import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/spinner';
import { Upload, Download, Trash2, UserCheck } from 'lucide-react';

interface Props {
  competition: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompetitionCertificates({ competition, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

  // Get registered students for this competition
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['competition-registrations', competition.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_registrations')
        .select('id, student_id, status, students(id, name, program)')
        .eq('competition_id', competition.id) as any;
      if (error) throw error;
      return data || [];
    },
  });

  // Get existing certificates
  const { data: certificates = [] } = useQuery({
    queryKey: ['competition-certificates', competition.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competition_certificates')
        .select('*')
        .eq('competition_id', competition.id) as any;
      if (error) throw error;
      return data || [];
    },
  });

  const certMap = new Map((certificates as any[]).map((c: any) => [c.student_id, c]));

  const handleUploadCert = async (studentId: string, file: File) => {
    setUploading(studentId);
    try {
      const filename = `${competition.id}/${studentId}-${Date.now()}.pdf`;
      const { error: uploadErr } = await supabase.storage.from('certificates').upload(filename, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(filename);

      // Upsert certificate record
      const { error } = await supabase.from('competition_certificates').upsert({
        competition_id: competition.id,
        student_id: studentId,
        certificate_url: urlData.publicUrl,
        uploaded_by: (await supabase.auth.getUser()).data.user?.email || null,
      } as any, { onConflict: 'competition_id,student_id' }) as any;
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['competition-certificates', competition.id] });
      toast.success('Certificate uploaded.');
    } catch (e: any) {
      toast.error('Upload failed: ' + e.message);
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (certId: string) => {
    const { error } = await supabase.from('competition_certificates').delete().eq('id', certId) as any;
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ['competition-certificates', competition.id] });
    toast.success('Certificate removed.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Certificates — {competition.name}</DialogTitle>
          <DialogDescription>Upload certificates for registered students.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size={20} /></div>
        ) : registrations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No students registered for this competition.</p>
        ) : (
          <div className="space-y-3">
            {(registrations as any[]).map((reg: any) => {
              const cert = certMap.get(reg.student_id);
              return (
                <div key={reg.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{reg.students?.name}</p>
                    <p className="text-xs text-muted-foreground">{reg.students?.program}</p>
                  </div>

                  {cert ? (
                    <div className="flex items-center gap-2">
                      <a href={(cert as any).certificate_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-1 text-xs">
                          <Download className="w-3 h-3" /> View
                        </Button>
                      </a>
                      <Button variant="destructive" size="sm" className="text-xs" onClick={() => handleDelete((cert as any).id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadCert(reg.student_id, file);
                        }}
                      />
                      <Button variant="outline" size="sm" className="gap-1 text-xs pointer-events-none" disabled={uploading === reg.student_id}>
                        {uploading === reg.student_id ? <Spinner size={12} /> : <Upload className="w-3 h-3" />}
                        Upload
                      </Button>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
