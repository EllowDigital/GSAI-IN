import React, { useState, useRef } from 'react';
import { useStudentAuth } from '@/pages/student/StudentAuthProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarDays, Award, Dumbbell, Camera, Pencil, Save, X } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { toast } from '@/hooks/use-toast';

const BELT_COLORS: Record<string, string> = {
  white: 'bg-gray-100 text-gray-800 border-gray-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  orange: 'bg-orange-100 text-orange-800 border-orange-400',
  green: 'bg-green-100 text-green-800 border-green-400',
  blue: 'bg-blue-100 text-blue-800 border-blue-400',
  purple: 'bg-purple-100 text-purple-800 border-purple-400',
  brown: 'bg-amber-100 text-amber-900 border-amber-600',
  red: 'bg-red-100 text-red-800 border-red-400',
  black: 'bg-gray-900 text-white border-gray-700',
};

export default function StudentProfileCard() {
  const { profile } = useStudentAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', parent_name: '', parent_contact: '' });

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-profile', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('name, program, join_date, profile_image_url, parent_name, parent_contact')
        .eq('id', profile!.studentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.studentId,
  });

  // Fetch all enrolled programs
  const { data: enrolledPrograms = [] } = useQuery({
    queryKey: ['student-all-programs', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_programs')
        .select('program_name, is_primary, joined_at')
        .eq('student_id', profile!.studentId)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.studentId,
  });

  const { data: currentBelt } = useQuery({
    queryKey: ['student-belt', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_progress')
        .select('belt_level_id, stripe_count, belt_levels(color, rank)')
        .eq('student_id', profile!.studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() as any;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.studentId,
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.studentId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('student-avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('student-avatars').getPublicUrl(path);
      const { error: updateErr } = await supabase.from('students').update({ profile_image_url: urlData.publicUrl }).eq('id', profile.studentId);
      if (updateErr) throw updateErr;
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenEdit = () => {
    if (!student) return;
    setEditForm({ name: student.name || '', parent_name: student.parent_name || '', parent_contact: student.parent_contact || '' });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    if (editForm.name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    if (editForm.parent_contact && !/^[6-9]\d{9}$/.test(editForm.parent_contact)) { toast.error('Phone must be 10 digits starting with 6-9'); return; }

    setSaving(true);
    try {
      const { error } = await supabase.from('students').update({
        name: editForm.name.trim(), parent_name: editForm.parent_name.trim(), parent_contact: editForm.parent_contact.trim(),
      }).eq('id', profile.studentId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile updated!');
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size={20} /></div>;
  if (!student) return null;

  const beltColor = currentBelt?.belt_levels?.color?.toLowerCase() || 'white';
  const beltStyle = BELT_COLORS[beltColor] || BELT_COLORS.white;
  const initials = student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const programsToShow = enrolledPrograms.length > 0
    ? enrolledPrograms
    : [{ program_name: student.program, is_primary: true }];

  return (
    <>
      <Card className="border border-border overflow-hidden">
        <CardContent className="p-0">
          {/* Profile Header */}
          <div className="bg-primary/5 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-primary/20">
                <AvatarImage src={student.profile_image_url || ''} alt={student.name} />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? <Spinner size={16} /> : <Camera className="w-5 h-5 text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
              <p className="text-sm text-muted-foreground font-mono">{profile?.loginId}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={handleOpenEdit}>
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-5">
            {/* Programs - shows all enrolled programs */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Dumbbell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Programs</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {programsToShow.map((p: any) => (
                    <Badge key={p.program_name} variant={p.is_primary ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                      {p.program_name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CalendarDays className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-semibold text-foreground">{format(new Date(student.join_date), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Award className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Current Belt</p>
                <Badge variant="outline" className={`${beltStyle} border capitalize`}>
                  {beltColor} Belt
                  {currentBelt?.stripe_count > 0 && ` • ${currentBelt.stripe_count} stripe${currentBelt.stripe_count > 1 ? 's' : ''}`}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Parent / Guardian Name</label>
              <Input value={editForm.parent_name} onChange={e => setEditForm(f => ({ ...f, parent_name: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Parent Contact</label>
              <Input value={editForm.parent_contact} onChange={e => setEditForm(f => ({ ...f, parent_contact: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="mt-1" maxLength={10} placeholder="10-digit number" />
            </div>
            <p className="text-xs text-muted-foreground">Programs and join date can only be changed by admin.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="flex-1 gap-1"><X className="w-3.5 h-3.5" /> Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={saving} className="flex-1 gap-1"><Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
