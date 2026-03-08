import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import Spinner from '@/components/ui/spinner';
import { Upload, Download, Trash2, FileCheck, AlertCircle } from 'lucide-react';
import { downloadCertificateFile } from '@/utils/certificateDownload';

interface Props {
  competition: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompetitionCertificates({ competition, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);

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
  const certCount = certificates.length;
  const totalStudents = registrations.length;

  const handleUploadCert = async (studentId: string, file: File) => {
    setUploading(studentId);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const filename = `${competition.id}/${studentId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('certificates').upload(filename, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(filename);
      const userEmail = (await supabase.auth.getUser()).data.user?.email || null;

      // Check if certificate already exists for this student+competition
      const existing = certMap.get(studentId);
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('competition_certificates')
          .update({ certificate_url: urlData.publicUrl, uploaded_by: userEmail } as any)
          .eq('id', (existing as any).id) as any;
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('competition_certificates')
          .insert({
            competition_id: competition.id,
            student_id: studentId,
            certificate_url: urlData.publicUrl,
            uploaded_by: userEmail,
          } as any) as any;
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['competition-certificates', competition.id] });
      toast.success('Certificate uploaded!');
    } catch (e: any) {
      console.error('Certificate upload error:', e);
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
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Certificates — {competition.name}
          </DialogTitle>
          <DialogDescription>
            Upload certificates for registered students. Supports PDF, JPG, PNG, WebP.
          </DialogDescription>
        </DialogHeader>

        {/* Stats */}
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            {certCount} / {totalStudents} uploaded
          </Badge>
          {certCount === totalStudents && totalStudents > 0 && (
            <Badge variant="outline" className="text-xs border-green-500/30 text-green-600 bg-green-500/5">
              ✓ All done
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner size={20} /></div>
        ) : registrations.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-2 text-muted-foreground">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">No students registered for this competition.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(registrations as any[]).map((reg: any) => {
              const cert = certMap.get(reg.student_id);
              return (
                <div key={reg.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{reg.students?.name}</p>
                    <p className="text-xs text-muted-foreground">{reg.students?.program}</p>
                  </div>

                  {cert ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600">Uploaded</Badge>
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-8" onClick={async () => {
                        try {
                          const url = (cert as any).certificate_url as string;
                          const pathMatch = url.match(/certificates\/(.+)$/);
                          if (!pathMatch) { window.open(url, '_blank'); return; }
                          const { data, error } = await supabase.storage.from('certificates').createSignedUrl(pathMatch[1], 3600);
                          if (error || !data?.signedUrl) { window.open(url, '_blank'); return; }
                          window.open(data.signedUrl, '_blank');
                        } catch { window.open((cert as any).certificate_url, '_blank'); }
                      }}>
                        <Download className="w-3 h-3" /> View
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete((cert as any).id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadCert(reg.student_id, file);
                        }}
                      />
                      <Button variant="outline" size="sm" className="gap-1 text-xs h-8 pointer-events-none" disabled={uploading === reg.student_id}>
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
