import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { useToast } from '@/hooks/useToast';
import { programs } from '@/constants/programsData';
import {
  Plus,
  Trash2,
  Star,
  Eye,
  EyeOff,
  MessageSquareText,
  Loader2,
  Sparkles,
  Quote,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  const queryClient = useQueryClient();
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
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  const invalidateTestimonials = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-program-testimonials'] });
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('program_testimonials' as any)
        .insert({
          program_slug: form.program_slug,
          student_name: form.student_name.trim(),
          review: form.review.trim(),
          rating: form.rating,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Added', description: 'Testimonial added successfully.' });
      setForm({ program_slug: '', student_name: '', review: '', rating: 5 });
      setShowForm(false);
      invalidateTestimonials();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add testimonial.',
        variant: 'error',
      });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: boolean }) => {
      const { error } = await supabase
        .from('program_testimonials' as any)
        .update({ is_published: !current } as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateTestimonials();
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Could not update publish status.',
        variant: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('program_testimonials' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Deleted', description: 'Testimonial removed.' });
      invalidateTestimonials();
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Could not delete testimonial.',
        variant: 'error',
      });
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

    addMutation.mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    deleteMutation.mutate(id);
  };

  const publishedCount = testimonials.filter((item) => item.is_published).length;
  const draftCount = testimonials.length - publishedCount;

  return (
    <div className="space-y-5">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Social Proof Control Room
              </Badge>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Testimonials Management
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Curate student feedback, control publishing, and maintain a
                  trustworthy program voice.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Total Reviews
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? '...' : testimonials.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Published
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? '...' : publishedCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Drafts
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {loading ? '...' : draftCount}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-toolbar">
            <div>
              <h3 className="text-base font-semibold text-foreground sm:text-lg">
                Content Operations
              </h3>
              <p className="text-sm text-muted-foreground">
                Add feedback entries and publish only high-quality testimonials.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
              type="button"
            >
              <Plus className="h-4 w-4" />
              {showForm ? 'Close Form' : 'Add Testimonial'}
            </Button>
          </div>
        </div>

        <div className="admin-panel-body space-y-4">
          {showForm && (
            <div className="rounded-xl border border-border/70 bg-muted/30 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquareText className="h-4 w-4 text-primary" />
                New Testimonial Entry
              </div>

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
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.review.length}/500 characters
                </p>
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
                      className="rounded-md p-0.5 hover:bg-muted"
                    >
                      <Star
                        className={`w-6 h-6 ${s <= form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={handleAdd}
                  disabled={addMutation.isPending}
                  className="gap-2"
                >
                  {addMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Save Testimonial
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center rounded-xl border border-border/70 bg-card p-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                Loading testimonials...
              </div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
              <Quote className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No testimonials yet. Add your first one to build social proof.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {testimonials.map((t) => {
                const prog = programs.find((p) => p.slug === t.program_slug);
                return (
                  <div
                    key={t.id}
                    className="rounded-xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-foreground text-sm">
                            {t.student_name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {prog?.title ?? t.program_slug}
                          </span>
                          {!t.is_published && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-medium">
                              <Clock3 className="h-3 w-3" />
                              Draft
                            </span>
                          )}
                        </div>

                        <div className="flex gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          "{t.review}"
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            togglePublishMutation.mutate({
                              id: t.id,
                              current: t.is_published,
                            })
                          }
                          disabled={togglePublishMutation.isPending}
                          title={t.is_published ? 'Unpublish' : 'Publish'}
                          className="gap-1.5"
                        >
                          {t.is_published ? (
                            <>
                              <Eye className="w-4 h-4 text-emerald-600" />
                              <span className="hidden sm:inline">Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                              <span className="hidden sm:inline">Publish</span>
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(t.id)}
                          disabled={deleteMutation.isPending}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/80">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Published Ratio</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {loading || testimonials.length === 0
                ? '...'
                : `${Math.round((publishedCount / testimonials.length) * 100)}%`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/80">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Average Rating</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {loading || testimonials.length === 0
                ? '...'
                : (
                    testimonials.reduce((acc, item) => acc + item.rating, 0) /
                    testimonials.length
                  ).toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/80 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Quality Tip</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              Keep reviews specific with outcome-based details for higher trust.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
