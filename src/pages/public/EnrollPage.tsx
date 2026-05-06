import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
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
  Mail,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Lock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';
import { ACADEMY_CONTACT_EMAIL, ADMIN_CC_EMAIL } from '@/config/contact';
import { buildFaqStructuredData, enrollFaqs } from '@/utils/faqStructuredData';

// --- Validation Logic ---
const enrollSchema = z.object({
  studentName: z.string().trim().min(2, 'Name required'),
  age: z.string().min(1, 'Age required'),
  gender: z.string().min(1, 'Gender required'),
  studentEmail: z.string().trim().email().optional().or(z.literal('')),
  studentPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .or(z.literal('')),
  parentName: z.string().trim().min(2, 'Parent name required'),
  parentEmail: z.string().trim().email().optional().or(z.literal('')),
  parentPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone'),
  program: z.string().min(1, 'Select a program'),
  aadharNumber: z.string().regex(/^\d{12}$/, '12 digits required'),
  message: z.string().max(500).optional(),
});

type EnrollFormData = z.infer<typeof enrollSchema>;

const isStep1Ready = (form: Partial<EnrollFormData>) =>
  (form.studentName?.trim().length || 0) >= 2 && !!form.age && !!form.gender;

const isStep2Ready = (form: Partial<EnrollFormData>) =>
  (form.aadharNumber?.length || 0) === 12 &&
  (form.parentName?.trim().length || 0) >= 2 &&
  (form.parentPhone?.length || 0) === 10;

const isStep3Ready = (form: Partial<EnrollFormData>) => !!form.program;

const HIGHLIGHTS = [
  { icon: Trophy, label: 'Govt. Recognized' },
  { icon: Star, label: 'ISO 9001 Certified' },
  { icon: Users, label: '500+ Students' },
  { icon: MapPin, label: 'Lucknow Center' },
];

const INPUT_CLASSES =
  'bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-600 focus-visible:ring-orange-500/30 focus-visible:border-orange-500/50 h-12 rounded-xl transition-all';
const LABEL_CLASSES =
  'text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1';

const FieldError = memo(({ error }: { error?: string }) => (
  <AnimatePresence>
    {error && (
      <motion.p
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="text-red-400 text-[10px] font-bold mt-1.5 flex items-center gap-1 ml-1"
      >
        <Info className="w-3.5 h-3.5" /> {error}
      </motion.p>
    )}
  </AnimatePresence>
));

type FormSectionProps = {
  step: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
  expandAll: boolean;
  activeStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
};

const FormSection = ({
  step,
  title,
  icon: Icon,
  completed,
  expandAll,
  activeStep,
  onStepChange,
  children,
}: FormSectionProps) => {
  const isOpen = expandAll || activeStep === step;
  const panelId = `enroll-step-panel-${step}`;
  const buttonId = `enroll-step-button-${step}`;

  return (
    <div
      className={cn(
        'border-b border-white/5 last:border-0 transition-all duration-500',
        !isOpen && 'opacity-60'
      )}
    >
      <button
        id={buttonId}
        type="button"
        onClick={() => onStepChange(step)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between p-6 sm:p-8 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              isOpen
                ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                : 'bg-zinc-900 text-zinc-500'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500/80">
              Step 0{step}
            </span>
            <h3 className="text-lg font-bold text-white leading-none mt-1">
              {title}
            </h3>
            <span
              className={cn(
                'mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                completed
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/60'
              )}
            >
              {completed ? 'Completed' : 'Incomplete'}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-zinc-600 transition-transform duration-500',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-8 sm:px-8 sm:pb-10 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function EnrollPage() {
  const [searchParams] = useSearchParams();
  const hasQueryParams = searchParams.toString().length > 0;
  const [activeStep, setActiveStep] = useState<number>(1);
  const [expandAllSections, setExpandAllSections] = useState(false);
  const readinessRef = useRef({ step1: false, step2: false });
  const [form, setForm] = useState<Partial<EnrollFormData>>({
    program: searchParams.get('program') || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitWarning, setSubmitWarning] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { disciplineOptions } = useDisciplines();
  const step1Completed = isStep1Ready(form);
  const step2Completed = isStep2Ready(form);
  const step3Completed = isStep3Ready(form);

  const enrollKeywords = [
    'ghatak',
    'ghatak sports',
    'ghatak sports academy',
    'ghatak sports academy india',
    'ghatak sports academy admission',
    'ghatak sports academy enroll',
    'ghatak admission',
    'ghatak sports admission',
    'ghatak sports academy admission',
    'ghatak sports academy india admission',
    'ghatak enroll',
    'ghatak sports enroll',
    'ghatak sports academy india enroll',
    'martial arts admission lucknow',
    'boxing academy enrollment',
    'self defense training admission',
    'grappling classes enroll',
    'martial arts coaching lucknow',
    'sports academy admission lucknow',
    'ghatak admission form',
    'ghatak enrollment form',
  ];

  const enrollStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://ghataksportsacademy.com/#organization',
        name: 'Ghatak Sports Academy India',
        alternateName: 'Ghatak Sports',
        url: 'https://ghataksportsacademy.com',
        email: ACADEMY_CONTACT_EMAIL,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Lucknow',
          addressLocality: 'Lucknow',
          addressRegion: 'Uttar Pradesh',
          addressCountry: 'IN',
        },
        sameAs: [
          'https://ghataksportsacademy.com',
          'https://ghataksportsacademy.com/enroll',
        ],
        knowsAbout: [
          'Martial Arts Training',
          'Boxing Academy',
          'Grappling Classes',
          'Self Defense',
        ],
      },
      {
        '@type': 'SportsActivityLocation',
        name: 'Ghatak Sports Academy India',
        url: 'https://ghataksportsacademy.com/enroll',
        sport: ['Martial Arts', 'Boxing', 'Grappling', 'Self Defense'],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Lucknow',
          addressRegion: 'Uttar Pradesh',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'Service',
        name: 'Ghatak Sports Academy Enrollment',
        provider: {
          '@type': 'LocalBusiness',
          '@id': 'https://ghataksportsacademy.com/#organization',
          name: 'Ghatak Sports Academy India',
        },
        url: 'https://ghataksportsacademy.com/enroll',
        description:
          'Official enrollment page for Ghatak Sports Academy India. Apply for Boxing, Grappling, Self Defense, and Martial Arts training in Lucknow.',
        areaServed: {
          '@type': 'City',
          name: 'Lucknow',
        },
      },
      {
        '@type': 'WebPage',
        '@id': 'https://ghataksportsacademy.com/enroll',
        name: 'Ghatak Sports Admission & Enroll',
        url: 'https://ghataksportsacademy.com/enroll',
        description:
          'Official Ghatak Sports admission & enroll page. Apply now for martial arts training in Lucknow.',
        isPartOf: { '@id': 'https://ghataksportsacademy.com/#organization' },
      },
    ],
  };

  // --- Auto-Expand Logic ---
  useEffect(() => {
    const step1Ready = isStep1Ready(form);
    const step2Ready = isStep2Ready(form);

    const step1BecameReady = !readinessRef.current.step1 && step1Ready;
    const step2BecameReady = !readinessRef.current.step2 && step2Ready;

    // Expand Step 2 if Step 1 basics are done
    if (activeStep === 1 && step1BecameReady) {
      setActiveStep(2);
    }
    // Expand Step 3 if Step 2 basics are done
    if (activeStep === 2 && step2BecameReady) {
      setActiveStep(3);
    }

    readinessRef.current = { step1: step1Ready, step2: step2Ready };
  }, [
    activeStep,
    form.studentName,
    form.age,
    form.gender,
    form.aadharNumber,
    form.parentName,
    form.parentPhone,
  ]);

  const handleFieldChange = useCallback(
    (field: keyof EnrollFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }

      if (submitWarning) {
        setSubmitWarning('');
      }
    },
    [errors, submitWarning]
  );

  const validateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = enrollSchema.safeParse(form);
    if (!result.success) {
      const flatErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) flatErrors[err.path[0] as string] = err.message;
      });
      setErrors(flatErrors);
      setExpandAllSections(true);
      setSubmitWarning(
        `Please fix ${Object.keys(flatErrors).length} highlighted field(s) before submitting.`
      );
      toast.error('Please fill all required fields correctly');
      return;
    }

    setExpandAllSections(false);
    setSubmitWarning('');

    setIsSaving(true);
    const d = result.data;

    const blockWithAadhaarMessage = (message: string) => {
      setErrors((prev) => ({ ...prev, aadharNumber: message }));
      setExpandAllSections(true);
      setSubmitWarning(
        'Please review the highlighted field before submitting.'
      );
      setActiveStep(2);
      toast.error(message);
    };

    try {
      // Resubmission is intentionally allowed when existing requests are only rejected.
      const { error: insertError } = await supabase
        .from('enrollment_requests' as any)
        .insert({
          student_name: d.studentName,
          age: parseInt(d.age),
          gender: d.gender,
          student_email: d.studentEmail || null,
          student_phone: d.studentPhone || null,
          parent_name: d.parentName,
          parent_email: d.parentEmail || null,
          parent_phone: d.parentPhone,
          program: d.program,
          aadhar_number: d.aadharNumber,
          message: d.message || null,
        } as any);

      if (insertError) {
        const friendlyInsertError = mapSupabaseErrorToFriendly(insertError);
        if (friendlyInsertError?.field === 'aadharNumber') {
          blockWithAadhaarMessage(friendlyInsertError.message);
          return;
        }

        throw insertError;
      }

      void supabase.functions
        .invoke('send-enrollment-received-email', {
          body: {
            to: ACADEMY_CONTACT_EMAIL,
            cc: ADMIN_CC_EMAIL,
            studentName: d.studentName,
            program: d.program,
            parentName: d.parentName,
            parentPhone: d.parentPhone,
            notificationType: 'admin',
          },
        })
        .then(({ error: invokeError }) => {
          if (invokeError) {
            console.error(
              'Enrollment admin email function returned error:',
              invokeError
            );
          }
        })
        .catch((invokeError) => {
          console.error(
            'Failed to invoke enrollment admin email function:',
            invokeError
          );
        });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const friendlyError = mapSupabaseErrorToFriendly(err);
      toast.error(
        friendlyError?.message ||
          'We could not submit your enrollment right now. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-orange-500/30">
      <Navbar />
      <Seo
        title="Enroll Online — Martial Arts & Boxing Admission in Lucknow | GSAI"
        description="Apply online for admission at Ghatak Sports Academy India, Lucknow. Karate, Taekwondo, Boxing, MMA, BJJ, Kickboxing & Self-Defense classes for kids, teens & adults."
        canonical="/enroll"
        keywords={enrollKeywords}
        structuredData={[
          enrollStructuredData,
          buildFaqStructuredData(enrollFaqs),
        ]}
      />

      <main className="relative pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid lg:grid-cols-12 gap-12 items-start"
              >
                {/* Left Side Content */}
                <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-orange-500 transition-colors text-sm font-bold group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Return to Portal
                  </Link>
                  <div className="space-y-4">
                    <Badge
                      variant="outline"
                      className="border-orange-500/30 bg-orange-500/5 text-orange-500 rounded-full px-4 py-1.5 font-black text-[10px]"
                    >
                      ADMISSION OPEN 2026
                    </Badge>
                    <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                      Ghatak Sports Admission & Enroll Now Online
                    </h1>
                    <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                      Begin Your{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                        Elite
                      </span>{' '}
                      Legacy
                    </h2>
                    <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
                      Start your Ghatak sports enrollment today through our
                      official admission portal. Ghatak Sports Academy India
                      welcomes aspiring martial artists for Boxing, Grappling,
                      Self Defense, and more. Whether you searched for
                      &quot;ghatak sports admission,&quot; &quot;ghatak sports
                      enroll,&quot; or &quot;ghatak admission,&quot; this is the
                      official page to apply now.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {HIGHLIGHTS.map((h, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col gap-2"
                      >
                        <h.icon className="w-5 h-5 text-orange-500" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                          {h.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated Form Sidebar */}
                <div className="lg:col-span-7">
                  <form onSubmit={validateAndSubmit}>
                    <div className="mb-4 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setExpandAllSections((prev) => !prev)}
                        className="h-9 rounded-xl border-white/15 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07]"
                      >
                        {expandAllSections ? (
                          <>
                            <ChevronsDownUp className="mr-2 h-4 w-4" /> Collapse
                            all sections
                          </>
                        ) : (
                          <>
                            <ChevronsUpDown className="mr-2 h-4 w-4" /> Expand
                            all sections
                          </>
                        )}
                      </Button>
                    </div>
                    <AnimatePresence>
                      {submitWarning && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
                        >
                          <p className="text-sm font-semibold text-amber-200">
                            {submitWarning}
                          </p>
                          <p className="text-xs text-amber-100/80 mt-1">
                            Required fields are marked with *
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Card className="bg-zinc-950/40 border-white/[0.08] shadow-2xl rounded-[2.5rem] backdrop-blur-xl overflow-hidden">
                      {/* Step 1 */}
                      <FormSection
                        step={1}
                        title="Candidate Profile"
                        icon={User}
                        completed={step1Completed}
                        expandAll={expandAllSections}
                        activeStep={activeStep}
                        onStepChange={(step) => {
                          setExpandAllSections(false);
                          setActiveStep(step);
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="md:col-span-2">
                            <Label className={LABEL_CLASSES}>
                              Full Legal Name *
                            </Label>
                            <Input
                              placeholder="Enter student name"
                              className={cn(
                                INPUT_CLASSES,
                                errors.studentName && 'border-red-500/50'
                              )}
                              value={form.studentName || ''}
                              onChange={(e) =>
                                handleFieldChange('studentName', e.target.value)
                              }
                            />
                            <FieldError error={errors.studentName} />
                          </div>
                          <div className="flex gap-4 md:col-span-2">
                            <div className="flex-1">
                              <Label className={LABEL_CLASSES}>Age *</Label>
                              <Select
                                onValueChange={(v) =>
                                  handleFieldChange('age', v)
                                }
                                value={form.age}
                              >
                                <SelectTrigger className={INPUT_CLASSES}>
                                  <SelectValue placeholder="Age" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                  {Array.from(
                                    { length: 41 },
                                    (_, i) => i + 5
                                  ).map((a) => (
                                    <SelectItem key={a} value={String(a)}>
                                      {a} yrs
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FieldError error={errors.age} />
                            </div>
                            <div className="flex-1">
                              <Label className={LABEL_CLASSES}>Gender *</Label>
                              <Select
                                onValueChange={(v) =>
                                  handleFieldChange('gender', v)
                                }
                                value={form.gender}
                              >
                                <SelectTrigger className={INPUT_CLASSES}>
                                  <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FieldError error={errors.gender} />
                            </div>
                          </div>
                          <div>
                            <Label className={LABEL_CLASSES}>
                              Student Email
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                              <Input
                                type="email"
                                placeholder="Optional"
                                className={cn(INPUT_CLASSES, 'pl-11')}
                                value={form.studentEmail || ''}
                                onChange={(e) =>
                                  handleFieldChange(
                                    'studentEmail',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label className={LABEL_CLASSES}>
                              Student Phone
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                              <Input
                                placeholder="Optional"
                                maxLength={10}
                                className={cn(INPUT_CLASSES, 'pl-11')}
                                value={form.studentPhone || ''}
                                onChange={(e) =>
                                  handleFieldChange(
                                    'studentPhone',
                                    e.target.value.replace(/\D/g, '')
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </FormSection>

                      {/* Step 2 */}
                      <FormSection
                        step={2}
                        title="Identity & Parent Details"
                        icon={Shield}
                        completed={step2Completed}
                        expandAll={expandAllSections}
                        activeStep={activeStep}
                        onStepChange={(step) => {
                          setExpandAllSections(false);
                          setActiveStep(step);
                        }}
                      >
                        <div className="space-y-5">
                          <div>
                            <Label className={LABEL_CLASSES}>
                              Aadhaar Card Number *
                            </Label>
                            <div className="relative">
                              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                              <Input
                                placeholder="12-digit number"
                                maxLength={12}
                                className={cn(
                                  INPUT_CLASSES,
                                  'pl-11 tracking-[0.2em] font-mono'
                                )}
                                value={form.aadharNumber || ''}
                                onChange={(e) =>
                                  handleFieldChange(
                                    'aadharNumber',
                                    e.target.value.replace(/\D/g, '')
                                  )
                                }
                              />
                            </div>
                            <FieldError error={errors.aadharNumber} />
                          </div>
                          <div className="grid md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                              <Label className={LABEL_CLASSES}>
                                Parent/Guardian Name *
                              </Label>
                              <Input
                                placeholder="Enter guardian name"
                                className={INPUT_CLASSES}
                                value={form.parentName || ''}
                                onChange={(e) =>
                                  handleFieldChange(
                                    'parentName',
                                    e.target.value
                                  )
                                }
                              />
                              <FieldError error={errors.parentName} />
                            </div>
                            <div>
                              <Label className={LABEL_CLASSES}>
                                Parent Email
                              </Label>
                              <Input
                                type="email"
                                placeholder="Optional"
                                className={INPUT_CLASSES}
                                value={form.parentEmail || ''}
                                onChange={(e) =>
                                  handleFieldChange(
                                    'parentEmail',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label className={LABEL_CLASSES}>
                                Primary Contact *
                              </Label>
                              <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                <Input
                                  placeholder="10-digit number"
                                  maxLength={10}
                                  className={cn(INPUT_CLASSES, 'pl-11')}
                                  value={form.parentPhone || ''}
                                  onChange={(e) =>
                                    handleFieldChange(
                                      'parentPhone',
                                      e.target.value.replace(/\D/g, '')
                                    )
                                  }
                                />
                              </div>
                              <FieldError error={errors.parentPhone} />
                            </div>
                          </div>
                        </div>
                      </FormSection>

                      {/* Step 3 */}
                      <FormSection
                        step={3}
                        title="Program Selection"
                        icon={BookOpen}
                        completed={step3Completed}
                        expandAll={expandAllSections}
                        activeStep={activeStep}
                        onStepChange={(step) => {
                          setExpandAllSections(false);
                          setActiveStep(step);
                        }}
                      >
                        <div className="space-y-5">
                          <div>
                            <Label className={LABEL_CLASSES}>
                              Desired Discipline *
                            </Label>
                            <Select
                              onValueChange={(v) =>
                                handleFieldChange('program', v)
                              }
                              value={form.program}
                            >
                              <SelectTrigger className={INPUT_CLASSES}>
                                <SelectValue placeholder="Choose discipline" />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                {disciplineOptions.map((d) => (
                                  <SelectItem key={d.value} value={d.value}>
                                    {d.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FieldError error={errors.program} />
                          </div>
                          <div>
                            <Label className={LABEL_CLASSES}>
                              Additional Notes / Experience
                            </Label>
                            <Textarea
                              placeholder="Specific goals or requirements..."
                              className={cn(
                                INPUT_CLASSES,
                                'h-28 resize-none pt-4'
                              )}
                              value={form.message || ''}
                              onChange={(e) =>
                                handleFieldChange('message', e.target.value)
                              }
                            />
                          </div>

                          <div className="pt-4">
                            <Button
                              type="submit"
                              disabled={isSaving}
                              className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white font-black text-lg shadow-xl shadow-orange-900/20 group transition-all duration-500"
                            >
                              {isSaving
                                ? 'LOGGING DATA...'
                                : 'SECURE ADMISSION'}
                              {!isSaving && (
                                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              )}
                            </Button>
                            <p className="text-center text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                              <Lock className="w-3 h-3" /> End-to-End Encrypted
                              Admission
                            </p>
                          </div>
                        </div>
                      </FormSection>
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
                  <h2 className="text-3xl font-black text-white">
                    Application Logged
                  </h2>
                  <p className="text-zinc-400">
                    A consultant will contact you at {form.parentPhone} within
                    24 hours for evaluation.
                  </p>
                  <Button
                    asChild
                    className="w-full h-14 rounded-2xl bg-orange-600 font-bold text-lg"
                  >
                    <Link to="/">Return to Portal</Link>
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
