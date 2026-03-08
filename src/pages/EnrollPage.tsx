import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { ArrowLeft, Send, User, Phone, BookOpen, Shield, CheckCircle2, CreditCard, Star, Trophy, Users, Clock, MapPin, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { programs } from '@/data/programsData';
import { supabase } from '@/integrations/supabase/client';
import Seo from '@/components/Seo';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const enrollSchema = z.object({
  studentName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  studentEmail: z.string().trim().email('Enter a valid email address').max(255).optional().or(z.literal('')),
  studentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number').optional().or(z.literal('')),
  parentName: z.string().trim().min(2, 'Parent name is required').max(100),
  parentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  program: z.string().min(1, 'Select a program'),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number'),
  message: z.string().max(500).optional(),
});

type EnrollFormData = z.infer<typeof enrollSchema>;

const highlights = [
  { icon: Trophy, label: 'Government Recognized Academy' },
  { icon: Star, label: 'ISO 9001:2015 Certified' },
  { icon: Users, label: '500+ Students Trained' },
  { icon: Clock, label: 'Flexible Batch Timings' },
  { icon: MapPin, label: 'Lucknow, Uttar Pradesh' },
];

const steps = [
  { num: 1, text: 'Fill this enrollment form' },
  { num: 2, text: 'Our team contacts you within 24 hrs' },
  { num: 3, text: 'Visit the academy for a free trial class' },
  { num: 4, text: 'Complete registration & start training' },
];

export default function EnrollPage() {
  const [searchParams] = useSearchParams();
  const preselectedProgram = searchParams.get('program') || '';
  const [form, setForm] = useState<Partial<EnrollFormData>>({ program: preselectedProgram });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof EnrollFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = enrollSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const data = result.data;
    setSaving(true);

    try {
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id, name')
        .eq('aadhar_number', data.aadharNumber)
        .maybeSingle();

      if (existingStudent) {
        toast.error(`A student with this Aadhar number is already registered (${existingStudent.name}).`);
        setErrors(prev => ({ ...prev, aadharNumber: 'This Aadhar number is already registered' }));
        setSaving(false);
        return;
      }

      const { data: existingRequest } = await (supabase
        .from('enrollment_requests' as any)
        .select('id, student_name, status')
        .eq('aadhar_number', data.aadharNumber)
        .in('status', ['pending', 'contacted', 'approved']) as any);

      if (existingRequest && existingRequest.length > 0) {
        const status = existingRequest[0].status;
        const msg = status === 'approved'
          ? 'This Aadhar number is already registered. Please log in to the Student Portal.'
          : 'An enrollment request with this Aadhar number is already pending.';
        toast.error(msg);
        setErrors(prev => ({ ...prev, aadharNumber: msg }));
        setSaving(false);
        return;
      }

      const { error } = await supabase.from('enrollment_requests' as any).insert({
        student_name: data.studentName,
        age: parseInt(data.age),
        gender: data.gender,
        parent_name: data.parentName,
        parent_phone: data.parentPhone,
        program: data.program,
        aadhar_number: data.aadharNumber,
        student_email: data.studentEmail || null,
        student_phone: data.studentPhone || null,
        message: data.message || null,
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast.success('Enrollment request submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-[11px] mt-1 flex items-center gap-1">
        <span className="inline-block w-1 h-1 rounded-full bg-red-400" /> {errors[field]}
      </motion.p>
    ) : null;

  return (
    <>
      <Seo
        title="Enroll Now | Join Ghatak Sports Academy India"
        description="Register for martial arts training at GSAI. Learn Karate, Taekwondo, Kick Boxing & more. Government recognized academy in Lucknow."
      />
      <div className="min-h-[100dvh] bg-gray-950">
        <Navbar />

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center min-h-[80dvh] p-4"
            >
              <div className="text-center w-full max-w-md mx-auto space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center ring-2 ring-green-500/20"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Request Sent!</h1>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  Your enrollment request has been submitted successfully. Our team will contact you within <span className="text-yellow-400 font-medium">24 hours</span>.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Home
                  </Link>
                  <Button onClick={() => { setSubmitted(false); setForm({}); }} className="rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-semibold">
                    Submit Another
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-20 sm:pt-24"
            >
              <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
                {/* Back link */}
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6 text-xs sm:text-sm group">
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                  {/* Left: Info panel (hidden on mobile, shown on lg+) */}
                  <motion.aside
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2 space-y-6"
                  >
                    {/* Title area - visible on all screens */}
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[11px] font-semibold tracking-wide uppercase mb-4">
                        <Shield className="w-3.5 h-3.5" /> Enrollment Open
                      </div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                        Begin Your{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500">
                          Martial Arts
                        </span>{' '}
                        Journey
                      </h1>
                      <p className="text-gray-400 mt-3 text-sm leading-relaxed max-w-md">
                        Fill in the form and our team will reach out within 24 hours. No commitment required — start with a free trial class.
                      </p>
                    </div>

                    {/* Highlights - visible on lg+ */}
                    <div className="hidden lg:block space-y-5">
                      {/* Quick stats */}
                      <div className="space-y-2.5">
                        {highlights.map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                              <h.icon className="w-4 h-4 text-yellow-400" />
                            </div>
                            <span className="text-gray-300">{h.label}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* How it works */}
                      <div className="mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">How It Works</h3>
                        <div className="space-y-4">
                          {steps.map((s, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[11px] font-bold text-yellow-400">{s.num}</span>
                              </div>
                              <p className="text-sm text-gray-400 leading-snug">{s.text}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.aside>

                  {/* Right: Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-3"
                  >
                    <form
                      onSubmit={handleSubmit}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
                    >
                      {/* Form header */}
                      <div className="px-5 sm:px-7 pt-6 pb-4 border-b border-white/[0.06]">
                        <h2 className="text-lg font-bold text-white">Enrollment Form</h2>
                        <p className="text-xs text-gray-500 mt-1">All fields marked * are required</p>
                      </div>

                      <div className="px-5 sm:px-7 py-5 space-y-6">
                        {/* Section: Student Details */}
                        <fieldset className="space-y-4">
                          <legend className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                            <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center">
                              <User className="w-3.5 h-3.5 text-yellow-400" />
                            </div>
                            Student Details
                          </legend>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 sm:col-span-1">
                              <Label htmlFor="studentName" className="text-gray-400 text-xs font-medium">Student Name *</Label>
                              <Input
                                id="studentName"
                                placeholder="Full name"
                                value={form.studentName || ''}
                                onChange={e => handleChange('studentName', e.target.value)}
                                className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/40 h-10 text-sm rounded-xl"
                              />
                              <FieldError field="studentName" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="age" className="text-gray-400 text-xs font-medium">Age *</Label>
                                <Select value={form.age || ''} onValueChange={v => handleChange('age', v)}>
                                  <SelectTrigger className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white h-10 text-sm rounded-xl">
                                    <SelectValue placeholder="Age" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 46 }, (_, i) => i + 5).map(age => (
                                      <SelectItem key={age} value={String(age)}>{age} yrs</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FieldError field="age" />
                              </div>
                              <div>
                                <Label htmlFor="gender" className="text-gray-400 text-xs font-medium">Gender *</Label>
                                <Select value={form.gender || ''} onValueChange={v => handleChange('gender', v)}>
                                  <SelectTrigger className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white h-10 text-sm rounded-xl">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FieldError field="gender" />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="studentEmail" className="text-gray-400 text-xs font-medium">Student Email <span className="text-gray-600">(optional)</span></Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                                <Input
                                  id="studentEmail"
                                  type="email"
                                  placeholder="student@email.com"
                                  value={form.studentEmail || ''}
                                  onChange={e => handleChange('studentEmail', e.target.value)}
                                  className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/40 h-10 text-sm rounded-xl pl-9"
                                />
                              </div>
                              <FieldError field="studentEmail" />
                            </div>
                            <div>
                              <Label htmlFor="studentPhone" className="text-gray-400 text-xs font-medium">Student Phone <span className="text-gray-600">(optional)</span></Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 pointer-events-none" />
                                <Input
                                  id="studentPhone"
                                  type="tel"
                                  placeholder="10-digit mobile"
                                  value={form.studentPhone || ''}
                                  onChange={e => handleChange('studentPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                  className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/40 h-10 text-sm rounded-xl pl-9"
                                  maxLength={10}
                                  inputMode="numeric"
                                />
                              </div>
                              <FieldError field="studentPhone" />
                            </div>
                          </div>
                        </fieldset>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                        {/* Section: Identity */}
                        <fieldset className="space-y-4">
                          <legend className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                            <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center">
                              <CreditCard className="w-3.5 h-3.5 text-yellow-400" />
                            </div>
                            Identity Verification
                          </legend>
                          <div>
                            <Label htmlFor="aadharNumber" className="text-gray-400 text-xs font-medium">Aadhar Card Number *</Label>
                            <Input
                              id="aadharNumber"
                              placeholder="12-digit Aadhar number"
                              value={form.aadharNumber || ''}
                              onChange={e => handleChange('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/40 h-10 text-sm rounded-xl tracking-widest"
                              maxLength={12}
                              inputMode="numeric"
                            />
                            <p className="text-[10px] text-gray-600 mt-1.5 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Used to generate Student ID (last 4 digits) · Stored securely
                            </p>
                            <FieldError field="aadharNumber" />
                          </div>
                        </fieldset>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                        {/* Section: Parent Info */}
                        <fieldset className="space-y-4">
                          <legend className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                            <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center">
                              <Phone className="w-3.5 h-3.5 text-yellow-400" />
                            </div>
                            Parent / Guardian
                          </legend>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="parentName" className="text-gray-400 text-xs font-medium">Parent Name *</Label>
                              <Input
                                id="parentName"
                                placeholder="Parent / guardian name"
                                value={form.parentName || ''}
                                onChange={e => handleChange('parentName', e.target.value)}
                                className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/40 h-10 text-sm rounded-xl"
                              />
                              <FieldError field="parentName" />
                            </div>
                            <div>
                              <Label htmlFor="parentPhone" className="text-gray-400 text-xs font-medium">Phone Number *</Label>
                              <Input
                                id="parentPhone"
                                placeholder="10-digit mobile"
                                value={form.parentPhone || ''}
                                onChange={e => handleChange('parentPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/40 h-10 text-sm rounded-xl"
                                type="tel"
                                maxLength={10}
                                inputMode="numeric"
                              />
                              <FieldError field="parentPhone" />
                            </div>
                          </div>
                        </fieldset>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                        {/* Section: Program */}
                        <fieldset className="space-y-4">
                          <legend className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
                            <div className="w-6 h-6 rounded-md bg-yellow-500/10 flex items-center justify-center">
                              <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                            </div>
                            Program Selection
                          </legend>
                          <div>
                            <Label htmlFor="program" className="text-gray-400 text-xs font-medium">Choose Program *</Label>
                            <Select value={form.program || ''} onValueChange={v => handleChange('program', v)}>
                              <SelectTrigger className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white h-10 text-sm rounded-xl">
                                <SelectValue placeholder="Select a martial arts program" />
                              </SelectTrigger>
                              <SelectContent>
                                {programs.map(p => (
                                  <SelectItem key={p.slug} value={p.title}>
                                    {p.icon} {p.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError field="program" />
                          </div>
                          <div>
                            <Label htmlFor="message" className="text-gray-400 text-xs font-medium">Additional Message <span className="text-gray-600">(optional)</span></Label>
                            <Textarea
                              id="message"
                              placeholder="Any specific requirements, preferred batch timing, or questions..."
                              value={form.message || ''}
                              onChange={e => handleChange('message', e.target.value)}
                              className="mt-1.5 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-gray-600 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/40 min-h-[70px] text-sm rounded-xl resize-none"
                              maxLength={500}
                            />
                          </div>
                        </fieldset>
                      </div>

                      {/* Submit area */}
                      <div className="px-5 sm:px-7 py-5 border-t border-white/[0.06] bg-white/[0.01]">
                        <Button
                          type="submit"
                          size="lg"
                          disabled={saving}
                          className="w-full rounded-xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 hover:from-yellow-600 hover:via-orange-600 hover:to-red-700 text-white font-bold text-sm h-11 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all duration-300 group"
                        >
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Submitting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              Submit Enrollment Request
                            </span>
                          )}
                        </Button>
                        <p className="text-[10px] sm:text-xs text-gray-600 text-center mt-3">
                          By submitting, you agree to our{' '}
                          <Link to="/privacy" className="text-yellow-500/80 hover:text-yellow-400 hover:underline transition-colors">Privacy Policy</Link>{' '}
                          and{' '}
                          <Link to="/terms" className="text-yellow-500/80 hover:text-yellow-400 hover:underline transition-colors">Terms</Link>.
                        </p>
                      </div>
                    </form>

                    {/* Mobile-only: How it works */}
                    <div className="lg:hidden mt-6 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">How It Works</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {steps.map((s) => (
                          <div key={s.num} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[10px] font-bold text-yellow-400">{s.num}</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-snug">{s.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
