import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { programs } from '@/data/programsData';
import { Plus, Trash2, Star, Eye, EyeOff } from 'lucide-react';

interface Testimonial {
  id: string;
  program_slug: string;
  student_name: string;
  review: string;
  rating: number;
  is_published: boolean;
  created_at: string;
}

export default function TestimonialsManager() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    program_slug: '',
    student_name: '',
    review: '',
    rating: 5,
  });
  const { toast } = useToast();

  const {
    data: testimonials = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['admin-program-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_testimonials' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any as Testimonial[]) ?? [];
    },
  });

  const handleAdd = async () => {
    if (
      !form.program_slug ||
      !form.student_name.trim() ||
      !form.review.trim()
    ) {
      toast({
        title: 'Missing fields',
        description: 'Fill all required fields.',
        variant: 'error',
      });
      return;
    }
    const { error } = await supabase
      .from('program_testimonials' as any)
      .insert({
        program_slug: form.program_slug,
        student_name: form.student_name.trim(),
        review: form.review.trim(),
        rating: form.rating,
      } as any);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    } else {
      toast({ title: 'Added', description: 'Testimonial added successfully.' });
      setForm({ program_slug: '', student_name: '', review: '', rating: 5 });
      setShowForm(false);
      refetch();
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase
      .from('program_testimonials' as any)
      .update({ is_published: !current } as any)
      .eq('id', id);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    await supabase
      .from('program_testimonials' as any)
      .delete()
      .eq('id', id);
    refetch();
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Program Testimonials
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showForm && (
        <div className="bg-muted/50 rounded-xl p-4 sm:p-6 border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Program *
              </label>
              <select
                value={form.program_slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, program_slug: e.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select program</option>
                {programs.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Student Name *
              </label>
              <input
                value={form.student_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, student_name: e.target.value }))
                }
                maxLength={100}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Review *
            </label>
            <textarea
              value={form.review}
              onChange={(e) =>
                setForm((f) => ({ ...f, review: e.target.value }))
              }
              maxLength={500}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none"
              placeholder="Write the student's review..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: s }))}
                >
                  <Star
                    className={`w-6 h-6 ${s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-muted text-foreground font-semibold text-sm border border-border"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : testimonials.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No testimonials yet. Add your first one!
        </p>
      ) : (
        <div className="grid gap-4">
          {testimonials.map((t) => {
            const prog = programs.find((p) => p.slug === t.program_slug);
            return (
              <div
                key={t.id}
                className="bg-card rounded-xl p-4 border border-border flex flex-col sm:flex-row sm:items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">
                      {t.student_name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {prog?.title ?? t.program_slug}
                    </span>
                    {!t.is_published && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 font-medium">
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">"{t.review}"</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublish(t.id, t.is_published)}
                    title={t.is_published ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    {t.is_published ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
