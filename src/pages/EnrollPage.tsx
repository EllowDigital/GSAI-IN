import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { ArrowLeft, Send, User, Phone, BookOpen, Shield, CheckCircle2, CreditCard } from 'lucide-react';
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
  parentName: z.string().trim().min(2, 'Parent name is required').max(100),
  parentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number'),
  program: z.string().min(1, 'Select a program'),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhar number'),
  message: z.string().max(500).optional(),
});

type EnrollFormData = z.infer<typeof enrollSchema>;

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
        .in('status', ['pending', 'contacted']) as any);

      if (existingRequest && existingRequest.length > 0) {
        toast.error(`An enrollment request with this Aadhar number is already pending.`);
        setErrors(prev => ({ ...prev, aadharNumber: 'Enrollment already pending for this Aadhar' }));
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

  if (submitted) {
    return (
      <>
        <Seo title="Enrollment Submitted | GSAI" description="Thank you for enrolling at Ghatak Sports Academy India." />
        <div className="min-h-[100dvh] bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-sm mx-auto space-y-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Request Sent!</h1>
            <p className="text-gray-400 text-sm sm:text-base">Your enrollment request has been submitted successfully. Our team will contact you shortly.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-all">
                <ArrowLeft className="w-4 h-4" /> Home
              </Link>
              <Button onClick={() => { setSubmitted(false); setForm({}); }} variant="default" className="rounded-xl">
                Submit Another
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-red-400 text-[11px] mt-1">{errors[field]}</p> : null;

  return (
    <>
      <Seo
        title="Enroll Now | Join Ghatak Sports Academy India"
        description="Register for martial arts training at GSAI. Learn Karate, Taekwondo, Kick Boxing & more. Government recognized academy in Lucknow."
      />
      <div className="min-h-[100dvh] bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <Navbar />

        <div className="relative overflow-hidden pt-20 sm:pt-24 lg:pt-28">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-red-500/10" />
          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-xs sm:text-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] sm:text-xs font-medium mb-3">
                <Shield className="w-3 h-3" /> Government Recognized • ISO 9001:2015
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold text-white tracking-tight">
                Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">GSAI</span>
              </h1>
              <p className="text-gray-400 mt-2 text-xs sm:text-sm lg:text-base max-w-lg">
                Start your martial arts journey today. Fill in the form below and our team will reach out.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm"
          >
            {/* Student Info Header */}
            <div className="flex items-center gap-2 pb-1 border-b border-white/5">
              <User className="w-4 h-4 text-yellow-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white">Student Details</h2>
            </div>

            {/* Name + Age/Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="studentName" className="text-gray-300 text-xs">Student Name *</Label>
                <Input
                  id="studentName"
                  placeholder="Full name"
                  value={form.studentName || ''}
                  onChange={e => handleChange('studentName', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 h-9 sm:h-10 text-sm"
                />
                <FieldError field="studentName" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor="age" className="text-gray-300 text-xs">Age *</Label>
                  <Select value={form.age || ''} onValueChange={v => handleChange('age', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 sm:h-10 text-sm">
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
                  <Label htmlFor="gender" className="text-gray-300 text-xs">Gender *</Label>
                  <Select value={form.gender || ''} onValueChange={v => handleChange('gender', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 sm:h-10 text-sm">
                      <SelectValue placeholder="Gender" />
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

            {/* Aadhar */}
            <div className="flex items-center gap-2 pb-1 border-b border-white/5 pt-2">
              <CreditCard className="w-4 h-4 text-yellow-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white">Identity Verification</h2>
            </div>
            <div>
              <Label htmlFor="aadharNumber" className="text-gray-300 text-xs">Aadhar Card Number *</Label>
              <Input
                id="aadharNumber"
                placeholder="12-digit Aadhar number"
                value={form.aadharNumber || ''}
                onChange={e => handleChange('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 h-9 sm:h-10 text-sm"
                maxLength={12}
                inputMode="numeric"
              />
              <p className="text-[10px] text-gray-500 mt-0.5">Used to generate Student ID (last 4 digits)</p>
              <FieldError field="aadharNumber" />
            </div>

            {/* Parent Info */}
            <div className="flex items-center gap-2 pb-1 border-b border-white/5 pt-2">
              <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white">Parent / Guardian</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="parentName" className="text-gray-300 text-xs">Parent Name *</Label>
                <Input
                  id="parentName"
                  placeholder="Parent / guardian name"
                  value={form.parentName || ''}
                  onChange={e => handleChange('parentName', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 h-9 sm:h-10 text-sm"
                />
                <FieldError field="parentName" />
              </div>
              <div>
                <Label htmlFor="parentPhone" className="text-gray-300 text-xs">Phone Number *</Label>
                <Input
                  id="parentPhone"
                  placeholder="10-digit mobile number"
                  value={form.parentPhone || ''}
                  onChange={e => handleChange('parentPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 h-9 sm:h-10 text-sm"
                  type="tel"
                  maxLength={10}
                  inputMode="numeric"
                />
                <FieldError field="parentPhone" />
              </div>
            </div>

            {/* Program Selection */}
            <div className="flex items-center gap-2 pb-1 border-b border-white/5 pt-2">
              <BookOpen className="w-4 h-4 text-yellow-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white">Program Selection</h2>
            </div>

            <div>
              <Label htmlFor="program" className="text-gray-300 text-xs">Choose Program *</Label>
              <Select value={form.program || ''} onValueChange={v => handleChange('program', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-9 sm:h-10 text-sm">
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
              <Label htmlFor="message" className="text-gray-300 text-xs">Additional Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Any specific requirements or questions..."
                value={form.message || ''}
                onChange={e => handleChange('message', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 min-h-[60px] sm:min-h-[70px] text-sm"
                maxLength={500}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-bold text-sm h-10 sm:h-11 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
            >
              <Send className="w-4 h-4 mr-2" /> {saving ? 'Submitting...' : 'Submit Enrollment Request'}
            </Button>

            <p className="text-[10px] sm:text-xs text-gray-500 text-center">
              By submitting, you agree to our{' '}
              <Link to="/privacy" className="text-yellow-500 hover:underline">Privacy Policy</Link>{' '}
              and{' '}
              <Link to="/terms" className="text-yellow-500 hover:underline">Terms</Link>.
            </p>
          </motion.form>
        </div>
      </div>
    </>
  );
}
