import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { ArrowLeft, Send, User, Phone, BookOpen, Shield, CheckCircle2 } from 'lucide-react';
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
      // Save to database
      const { error } = await supabase.from('enrollment_requests' as any).insert({
        student_name: data.studentName,
        age: parseInt(data.age),
        gender: data.gender,
        parent_name: data.parentName,
        parent_phone: data.parentPhone,
        program: data.program,
        message: data.message || null,
      } as any);

      if (error) throw error;

      // Also send via WhatsApp
      const msg = `🥋 *New GSAI Enrollment Request*%0A%0A👤 Student: ${encodeURIComponent(data.studentName)}%0A📅 Age: ${data.age}%0A⚧ Gender: ${data.gender}%0A👨‍👩‍👦 Parent: ${encodeURIComponent(data.parentName)}%0A📱 Phone: ${data.parentPhone}%0A🏋️ Program: ${encodeURIComponent(data.program)}${data.message ? `%0A💬 Message: ${encodeURIComponent(data.message)}` : ''}`;
      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const waUrl = isMobile
        ? `https://wa.me/916394135988?text=${msg}`
        : `https://web.whatsapp.com/send?phone=916394135988&text=${msg}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setSubmitted(true);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto space-y-6"
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

  return (
    <>
      <Seo
        title="Enroll Now | Join Ghatak Sports Academy India"
        description="Register for martial arts training at GSAI. Learn Karate, Taekwondo, Kick Boxing & more. Government recognized academy in Lucknow."
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
        <Navbar />

        {/* Header */}
        <div className="relative overflow-hidden pt-24 sm:pt-28">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/5 to-red-500/10" />
          <div className="relative max-w-3xl mx-auto px-4 pb-6 sm:pb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
                <Shield className="w-3 h-3" /> Government Recognized • ISO 9001:2015
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
                Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">GSAI</span>
              </h1>
              <p className="text-gray-400 mt-3 text-sm sm:text-base lg:text-lg max-w-xl">
                Start your martial arts journey today. Fill in the form below and our team will reach out to you.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-3xl mx-auto px-4 pb-12">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-5 sm:space-y-6 bg-white/[0.03] border border-white/10 rounded-2xl p-5 sm:p-8 backdrop-blur-sm"
          >
            {/* Student Info */}
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> Student Details
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500">All fields marked are required</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <Label htmlFor="studentName" className="text-gray-300 text-xs sm:text-sm">Student Name *</Label>
                <Input
                  id="studentName"
                  placeholder="Full name"
                  value={form.studentName || ''}
                  onChange={e => handleChange('studentName', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 h-10 sm:h-11"
                />
                {errors.studentName && <p className="text-red-400 text-xs mt-1">{errors.studentName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="age" className="text-gray-300 text-xs sm:text-sm">Age *</Label>
                  <Select value={form.age || ''} onValueChange={v => handleChange('age', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 sm:h-11">
                      <SelectValue placeholder="Age" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 46 }, (_, i) => i + 5).map(age => (
                        <SelectItem key={age} value={String(age)}>{age} yrs</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                </div>
                <div>
                  <Label htmlFor="gender" className="text-gray-300 text-xs sm:text-sm">Gender *</Label>
                  <Select value={form.gender || ''} onValueChange={v => handleChange('gender', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 sm:h-11">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
                </div>
              </div>
            </div>

            {/* Parent Info */}
            <div className="space-y-1 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> Parent / Guardian
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <Label htmlFor="parentName" className="text-gray-300 text-xs sm:text-sm">Parent Name *</Label>
                <Input
                  id="parentName"
                  placeholder="Parent / guardian name"
                  value={form.parentName || ''}
                  onChange={e => handleChange('parentName', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 h-10 sm:h-11"
                />
                {errors.parentName && <p className="text-red-400 text-xs mt-1">{errors.parentName}</p>}
              </div>
              <div>
                <Label htmlFor="parentPhone" className="text-gray-300 text-xs sm:text-sm">Phone Number *</Label>
                <Input
                  id="parentPhone"
                  placeholder="10-digit mobile number"
                  value={form.parentPhone || ''}
                  onChange={e => handleChange('parentPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 h-10 sm:h-11"
                  type="tel"
                  maxLength={10}
                />
                {errors.parentPhone && <p className="text-red-400 text-xs mt-1">{errors.parentPhone}</p>}
              </div>
            </div>

            {/* Program Selection */}
            <div className="space-y-1 pt-2">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /> Program Selection
              </h2>
            </div>

            <div>
              <Label htmlFor="program" className="text-gray-300 text-xs sm:text-sm">Choose Program *</Label>
              <Select value={form.program || ''} onValueChange={v => handleChange('program', v)}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 sm:h-11">
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
              {errors.program && <p className="text-red-400 text-xs mt-1">{errors.program}</p>}
            </div>

            <div>
              <Label htmlFor="message" className="text-gray-300 text-xs sm:text-sm">Additional Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Any specific requirements or questions..."
                value={form.message || ''}
                onChange={e => handleChange('message', e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-yellow-500/30 focus-visible:border-yellow-500/50 min-h-[70px] sm:min-h-[80px]"
                maxLength={500}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={saving}
              className="w-full rounded-xl bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-bold text-sm sm:text-base h-11 sm:h-12 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
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
