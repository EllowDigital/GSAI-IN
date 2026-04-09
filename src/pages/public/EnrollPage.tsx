import React, { useState, useMemo, useCallback, memo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import {
  ArrowLeft,
  User,
  Phone,
  BookOpen,
  Shield,
  CheckCircle2,
  CreditCard,
  Star,
  Trophy,
  Users,
  MapPin,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/services/supabase/client';
import Seo from '@/components/seo/Seo';
import { toast } from '@/hooks/useToast';
import Navbar from '@/components/layout/Navbar';
import { useDisciplines } from '@/hooks/useDisciplines';
import { cn } from '@/lib/utils';

// --- Validation Logic ---
const enrollSchema = z.object({
  studentName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  age: z.string().min(1, 'Age is required'),
  gender: z.string().min(1, 'Gender is required'),
  parentName: z.string().trim().min(2, 'Parent name is required'),
  parentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian number'),
  program: z.string().min(1, 'Select a program'),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Enter valid 12-digit number'),
  message: z.string().max(500).optional(),
});

type EnrollFormData = z.infer<typeof enrollSchema>;

const HIGHLIGHTS = [
  { icon: Trophy, label: 'Govt. Recognized' },
  { icon: Star, label: 'ISO 9001 Certified' },
  { icon: Users, label: '500+ Students' },
  { icon: MapPin, label: 'Lucknow Center' },
];

const INPUT_CLASSES = "bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-600 focus-visible:ring-orange-500/30 focus-visible:border-orange-500/50 h-12 rounded-xl transition-all";
const LABEL_CLASSES = "text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1";

export default function EnrollPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<Partial<EnrollFormData>>({
    program: searchParams.get('program') || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { disciplineOptions } = useDisciplines();

  const handleFieldChange = useCallback((field: keyof EnrollFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }, [errors]);

  const FieldError = useMemo(() => memo(({ field }: { field: string }) => (
    <AnimatePresence>
      {errors[field] && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }}
          className="text-red-400 text-[10px] font-bold mt-1.5 flex items-center gap-1 ml-1"
        >
          <Info className="w-3.5 h-3.5" /> {errors[field]}
        </motion.p>
      )}
    </AnimatePresence>
  )), [errors]);

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = enrollSchema.safeParse(form);
    if (!result.success) {
      const flatErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) flatErrors[err.path[0] as string] = err.message;
      });
      setErrors(flatErrors);
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('enrollment_requests' as any).insert({
        student_name: result.data.studentName,
        age: parseInt(result.data.age),
        gender: result.data.gender,
        parent_name: result.data.parentName,
        parent_phone: result.data.parentPhone,
        program: result.data.program,
        aadhar_number: result.data.aadharNumber,
        message: result.data.message || null,
      } as any);

      if (error) throw error;
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-orange-500/30">
      <Navbar />
      <Seo title="Apply for Admission | GSAI" description="Join India's premier martial arts academy." />

      {/* Background Orbs for Depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div 
                key="form-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
              >
                {/* Brand Side */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
                  <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm font-bold group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Portal
                  </Link>
                  
                  <div className="space-y-4">
                    <Badge variant="outline" className="border-orange-500/30 bg-orange-500/5 text-orange-500 rounded-full px-4 py-1.5 uppercase tracking-tighter font-bold">
                      Admission Session 2026-27
                    </Badge>
                    <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.1]">
                      Begin Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">Elite</span> Legacy
                    </h1>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                      Submit your secure application. Our admissions team will review your profile for assessment within 24 hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {HIGHLIGHTS.map((h, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm flex flex-col gap-2">
                        <h.icon className="w-5 h-5 text-orange-500" />
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">{h.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Side */}
                <div className="lg:col-span-7">
                  <form onSubmit={validateAndSubmit} className="space-y-6">
                    <Card className="bg-zinc-950/50 border-white/[0.08] shadow-2xl rounded-[2.5rem] backdrop-blur-md overflow-hidden">
                      <CardContent className="p-8 sm:p-12 space-y-10">
                        
                        {/* Section 1 */}
                        <div className="space-y-6">
                          <header className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <User className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-bold text-white tracking-tight">Candidate Profile</h2>
                          </header>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                              <Label className={LABEL_CLASSES}>Full Legal Name *</Label>
                              <Input 
                                placeholder="Enter student name" 
                                className={cn(INPUT_CLASSES, errors.studentName && "border-red-500/50")}
                                value={form.studentName || ''}
                                onChange={(e) => handleFieldChange('studentName', e.target.value)}
                              />
                              <FieldError field="studentName" />
                            </div>

                            <div className="space-y-6 md:space-y-0 md:flex md:gap-4 md:col-span-2">
                              <div className="flex-1">
                                <Label className={LABEL_CLASSES}>Age *</Label>
                                <Select onValueChange={(v) => handleFieldChange('age', v)} value={form.age}>
                                  <SelectTrigger className={INPUT_CLASSES}>
                                    <SelectValue placeholder="Select Age" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    {Array.from({ length: 40 }, (_, i) => i + 5).map(a => (
                                      <SelectItem key={a} value={String(a)}>{a} Years</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FieldError field="age" />
                              </div>
                              <div className="flex-1">
                                <Label className={LABEL_CLASSES}>Gender *</Label>
                                <Select onValueChange={(v) => handleFieldChange('gender', v)} value={form.gender}>
                                  <SelectTrigger className={INPUT_CLASSES}>
                                    <SelectValue placeholder="Identify as" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FieldError field="gender" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-6">
                          <header className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-bold text-white tracking-tight">Identity & Verification</h2>
                          </header>

                          <div className="space-y-6">
                            <div>
                              <Label className={LABEL_CLASSES}>Aadhaar Number (12 Digits) *</Label>
                              <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <Input 
                                  placeholder="0000 0000 0000" 
                                  maxLength={12}
                                  className={cn(INPUT_CLASSES, "pl-11 tracking-[0.2em] font-mono")}
                                  value={form.aadharNumber || ''}
                                  onChange={(e) => handleFieldChange('aadharNumber', e.target.value.replace(/\D/g, ''))}
                                />
                              </div>
                              <FieldError field="aadharNumber" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <Label className={LABEL_CLASSES}>Parent Name *</Label>
                                <Input 
                                  placeholder="Guardian name" 
                                  className={INPUT_CLASSES}
                                  value={form.parentName || ''}
                                  onChange={(e) => handleFieldChange('parentName', e.target.value)}
                                />
                                <FieldError field="parentName" />
                              </div>
                              <div>
                                <Label className={LABEL_CLASSES}>Contact Number *</Label>
                                <div className="relative">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                  <Input 
                                    placeholder="Primary phone" 
                                    maxLength={10}
                                    className={cn(INPUT_CLASSES, "pl-11")}
                                    value={form.parentPhone || ''}
                                    onChange={(e) => handleFieldChange('parentPhone', e.target.value.replace(/\D/g, ''))}
                                  />
                                </div>
                                <FieldError field="parentPhone" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-6">
                          <header className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <BookOpen className="w-5 h-5 text-orange-500" />
                            <h2 className="text-xl font-bold text-white tracking-tight">Program Selection</h2>
                          </header>

                          <div className="space-y-6">
                            <div>
                              <Label className={LABEL_CLASSES}>Selected Discipline *</Label>
                              <Select onValueChange={(v) => handleFieldChange('program', v)} value={form.program}>
                                <SelectTrigger className={INPUT_CLASSES}>
                                  <SelectValue placeholder="Choose program" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                  {disciplineOptions.map(d => (
                                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldError field="program" />
                            </div>
                            <div>
                              <Label className={LABEL_CLASSES}>Additional Notes</Label>
                              <Textarea 
                                placeholder="Previous experience or specific requirements..."
                                className={cn(INPUT_CLASSES, "h-32 resize-none pt-4")}
                                value={form.message || ''}
                                onChange={(e) => handleFieldChange('message', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isSaving}
                          className="w-full h-16 rounded-2xl bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-black text-lg shadow-xl shadow-orange-900/20 transition-all active:scale-[0.98]"
                        >
                          {isSaving ? "Processing Application..." : "Request Secure Admission"}
                        </Button>

                        <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          Secured by GSAI Cloud. By applying, you agree to our 
                          <Link to="/terms" className="text-orange-500 ml-1 hover:underline">Terms</Link>.
                        </p>
                      </CardContent>
                    </Card>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center min-h-[60vh]"
              >
                <div className="max-w-md w-full text-center space-y-8 p-12 rounded-[3rem] bg-zinc-900/50 border border-white/10 backdrop-blur-3xl shadow-2xl">
                   <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                     <CheckCircle2 className="w-10 h-10 text-green-500" />
                   </div>
                   <div>
                     <h2 className="text-3xl font-black text-white">Success!</h2>
                     <p className="text-zinc-400 mt-2">Your application has been received. A consultant will contact you within 24 hours.</p>
                   </div>
                   <Button asChild className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-500 font-bold text-lg">
                     <Link to="/">Back to Portal</Link>
                   </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}