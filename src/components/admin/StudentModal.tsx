import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import StudentAvatarUploader from './StudentAvatarUploader';
import { safeAsync, formatErrorForDisplay } from '@/utils/errorHandling';
import {
  sanitizeText,
  validateAadharNumber,
  validatePhoneNumber,
} from '@/utils/inputValidation';
import { useBeltLevels } from '@/hooks/useBeltLevels';
import { useStudentPrograms } from '@/hooks/useStudentPrograms';
import { useDisciplines } from '@/hooks/useDisciplines';
import { X, Plus } from 'lucide-react';


const StudentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  aadhar_number: z.string().length(12, 'Aadhar Number must be 12 digits'),
  program: z.string().min(2, 'Primary program is required'),
  join_date: z.string(),
  parent_name: z.string().min(2, 'Parent Name is required'),
  parent_contact: z.string().regex(/^\d{10}$/, 'Contact must be 10 digits'),
  profile_image_url: z.string().nullable(),
  default_monthly_fee: z.number().min(0, 'Fee must be non-negative'),
  discount_percent: z.number().min(0).max(100, 'Discount must be 0-100'),
});

export type StudentFormValues = z.infer<typeof StudentSchema>;

interface StudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: any;
}

export default function StudentModal({
  open,
  onOpenChange,
  student,
}: StudentModalProps) {
  const { getWhiteBeltId } = useBeltLevels();
  const {
    programs: existingPrograms,
    addProgram,
    removeProgram,
  } = useStudentPrograms(student?.id);
  const [additionalPrograms, setAdditionalPrograms] = useState<string[]>([]);
  const [addingProgram, setAddingProgram] = useState('');
  const queryClient = useQueryClient();

  const { data: globalFee } = useQuery({
    queryKey: ['academy-settings', 'default_monthly_fee'],
    queryFn: async () => {
      const { data } = await supabase
        .from('academy_settings')
        .select('value')
        .eq('key', 'default_monthly_fee')
        .maybeSingle();
      return data?.value ? Number(data.value) : 2000;
    },
    enabled: !student,
  });

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
      name: '',
      aadhar_number: '',
      program: '',
      join_date: new Date().toISOString().slice(0, 10),
      parent_name: '',
      parent_contact: '',
      profile_image_url: null,
      default_monthly_fee: 2000,
      discount_percent: 0,
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name || '',
        aadhar_number: student.aadhar_number || '',
        program: student.program || '',
        join_date: student.join_date ? student.join_date.slice(0, 10) : '',
        parent_name: student.parent_name || '',
        parent_contact: student.parent_contact || '',
        profile_image_url: student.profile_image_url || null,
        default_monthly_fee: student.default_monthly_fee ?? 2000,
        discount_percent: student.discount_percent ?? 0,
      });
    } else {
      form.reset({
        name: '',
        aadhar_number: '',
        program: '',
        join_date: new Date().toISOString().slice(0, 10),
        parent_name: '',
        parent_contact: '',
        profile_image_url: null,
        default_monthly_fee: globalFee ?? 2000,
        discount_percent: 0,
      });
      setAdditionalPrograms([]);
    }
  }, [student, open, globalFee]);

  const handleAvatarUpload = (url: string) =>
    form.setValue('profile_image_url', url);

  const currentPrimary = useWatch({ control: form.control, name: 'program' });
  const enrolledProgramNames = student
    ? existingPrograms.map((p) => p.program_name)
    : [currentPrimary, ...additionalPrograms].filter(Boolean);

  const availableToAdd = programOptions.filter(
    (p) => !enrolledProgramNames.includes(p.value)
  );

  const handleAddAdditionalProgram = async () => {
    if (!addingProgram) return;
    if (student) {
      await addProgram(student.id, addingProgram, student.join_date);
    } else {
      setAdditionalPrograms((prev) => [...prev, addingProgram]);
    }
    setAddingProgram('');
  };

  const handleRemoveAdditionalProgram = async (programName: string) => {
    if (student) {
      const prog = existingPrograms.find(
        (p) => p.program_name === programName && !p.is_primary
      );
      if (prog) await removeProgram(prog.id, student.id);
    } else {
      setAdditionalPrograms((prev) => prev.filter((p) => p !== programName));
    }
  };

  const onSubmit = async (values: StudentFormValues) => {
    const sanitizedValues = {
      name: sanitizeText(values.name?.trim() || ''),
      aadhar_number: values.aadhar_number?.trim() || '',
      program: sanitizeText(values.program?.trim() || ''),
      join_date: values.join_date?.trim() || '',
      parent_name: sanitizeText(values.parent_name?.trim() || ''),
      parent_contact: values.parent_contact?.trim() || '',
      profile_image_url: values.profile_image_url,
    };

    const missingFields = Object.entries(sanitizedValues)
      .filter(([key, value]) => key !== 'profile_image_url' && !value)
      .map(([field]) => field.replace('_', ' '));
    if (missingFields.length > 0) {
      toast.error(`Please fill: ${missingFields.join(', ')}`);
      return;
    }

    const aadharValidation = validateAadharNumber(
      sanitizedValues.aadhar_number
    );
    if (!aadharValidation.isValid) {
      toast.error('Aadhar must be exactly 12 digits.');
      return;
    }

    const phoneValidation = validatePhoneNumber(sanitizedValues.parent_contact);
    if (!phoneValidation.isValid) {
      toast.error('Contact must be 10 digits starting with 6-9.');
      return;
    }

    const { data: result, error } = await safeAsync(async () => {
      if (!student) {
        const { data: existing } = await supabase
          .from('students')
          .select('id, name')
          .eq('aadhar_number', aadharValidation.sanitized)
          .maybeSingle();
        if (existing)
          throw new Error(`Student already exists: ${existing.name}`);
      }

      const payload = {
        name: sanitizedValues.name,
        aadhar_number: aadharValidation.sanitized,
        program: sanitizedValues.program, // Will be updated below with all programs
        join_date: sanitizedValues.join_date,
        parent_name: sanitizedValues.parent_name,
        parent_contact: phoneValidation.sanitized,
        profile_image_url: sanitizedValues.profile_image_url || null,
        default_monthly_fee: values.default_monthly_fee,
        discount_percent: values.discount_percent,
      };

      if (student) {
        // First update primary program in junction table
        await supabase
          .from('student_programs')
          .update({ is_primary: false })
          .eq('student_id', student.id);
        await supabase.from('student_programs').upsert(
          {
            student_id: student.id,
            program_name: sanitizedValues.program,
            joined_at: sanitizedValues.join_date,
            is_primary: true,
          },
          { onConflict: 'student_id,program_name' }
        );

        // Fetch all programs from junction table to sync students.program field
        const { data: allProgs } = await supabase
          .from('student_programs')
          .select('program_name')
          .eq('student_id', student.id)
          .order('is_primary', { ascending: false });

        const allProgramNames = allProgs?.map((p) => p.program_name) || [sanitizedValues.program];
        payload.program = allProgramNames.join(', ');

        const { data, error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', student.id)
          .select()
          .single();
        if (error) throw error;

        return data;
      } else {
        const { data, error } = await supabase
          .from('students')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;

        // Insert primary program
        await supabase.from('student_programs').insert({
          student_id: data.id,
          program_name: sanitizedValues.program,
          joined_at: sanitizedValues.join_date,
          is_primary: true,
        });

        // Insert additional programs
        if (additionalPrograms.length > 0) {
          await supabase.from('student_programs').insert(
            additionalPrograms.map((prog) => ({
              student_id: data.id,
              program_name: prog,
              joined_at: sanitizedValues.join_date,
              is_primary: false,
            }))
          );
        }

        // Assign white belt
        const whiteBeltId = getWhiteBeltId(data.program);
        if (data && whiteBeltId) {
          await supabase
            .from('student_progress')
            .insert({
              student_id: data.id,
              belt_level_id: whiteBeltId,
              status: 'needs_work',
            })
            .then(({ error }) => {
              if (error)
                console.warn(
                  'Could not auto-assign white belt:',
                  error.message
                );
            });
        }

        return data;
      }
    }, 'Student Form Submission');

    if (error) {
      toast.error(formatErrorForDisplay(error));
    } else {
      toast.success(
        `Student ${student ? 'updated' : 'created'}: ${result?.name}`
      );
      queryClient.invalidateQueries({ queryKey: ['all-student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students-portal-status'] });
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogDescription>
            Provide enrollment details, guardian info, and training programs.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <StudentAvatarUploader
              url={useWatch({
                control: form.control,
                name: 'profile_image_url',
                defaultValue: form.getValues('profile_image_url'),
              })}
              onUploaded={handleAvatarUpload}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Student Name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aadhar_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhar Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12 digit Aadhar"
                      maxLength={12}
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Program */}
            <FormField
              control={form.control}
              name="program"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Program</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Programs */}
            <div className="space-y-2">
              <FormLabel>Additional Programs</FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {(student
                  ? existingPrograms.filter((p) => !p.is_primary)
                  : additionalPrograms.map((p) => ({ program_name: p }))
                ).map((prog: any) => (
                  <Badge
                    key={prog.program_name}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {prog.program_name}
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveAdditionalProgram(prog.program_name)
                      }
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {availableToAdd.length > 0 && (
                <div className="flex gap-2">
                  <Select
                    value={addingProgram}
                    onValueChange={setAddingProgram}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs">
                      <SelectValue placeholder="Add another program..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToAdd.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={handleAddAdditionalProgram}
                    disabled={!addingProgram}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="join_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Join Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Parent Name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Contact</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="10 digit number"
                      maxLength={10}
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="default_monthly_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Fee (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="2000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{student ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
