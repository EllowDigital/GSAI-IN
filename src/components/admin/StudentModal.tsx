import React, { useEffect } from 'react';
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
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import StudentAvatarUploader from './StudentAvatarUploader';
import {
  handleSupabaseError,
  safeAsync,
  formatErrorForDisplay,
} from '@/utils/errorHandling';
import {
  sanitizeText,
  validateAadharNumber,
  validatePhoneNumber,
} from '@/utils/inputValidation';
import { useBeltLevels } from '@/hooks/useBeltLevels';

// List of valid programs
const programOptions = [
  {
    value: 'Karate',
    label: '🥋 Karate - Traditional strikes & self-discipline',
  },
  { value: 'Taekwondo', label: '🦵 Taekwondo - Dynamic kicks & sparring' },
  { value: 'Boxing', label: '🥊 Boxing - Build stamina & precision' },
  { value: 'Kickboxing', label: '🥋 Kickboxing - Cardio meets combat' },
  { value: 'Grappling', label: '🤼 Grappling - Ground control tactics' },
  { value: 'MMA', label: '🥋 MMA - Striking & grappling combined' },
  {
    value: 'Kalaripayattu',
    label: '🕉️ Kalaripayattu - India’s ancient warrior art',
  },
  {
    value: 'Self-Defense',
    label: '🛡️ Self-Defense - Practical safety training',
  },
  { value: 'Fat Loss', label: '🏋️ Fat Loss - Burn fat, build agility' },
];

const StudentSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  aadhar_number: z.string().length(12, 'Aadhar Number must be 12 digits'),
  program: z.string().min(2, 'Program is required'),
  join_date: z.string(),
  parent_name: z.string().min(2, 'Parent Name is required'),
  parent_contact: z
    .string()
    .regex(/^\d{10}$/, 'Contact Number must be 10 digits'),
  profile_image_url: z.string().nullable(),
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

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(StudentSchema),
    defaultValues: {
      name: '',
      aadhar_number: '',
      program: '',
      join_date: '',
      parent_name: '',
      parent_contact: '',
      profile_image_url: null,
    },
  });

  // Set initial values if edit
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
      });
    } else {
      form.reset({
        name: '',
        aadhar_number: '',
        program: '',
        join_date: '',
        parent_name: '',
        parent_contact: '',
        profile_image_url: null,
      });
    }
  }, [student, open]);

  // Avatar Upload
  const handleAvatarUpload = (url: string) => {
    form.setValue('profile_image_url', url);
  };

  // Submit Handler
  const onSubmit = async (values: StudentFormValues) => {
    // Enhanced client-side validation with sanitization
    const sanitizedValues = {
      name: sanitizeText(values.name?.trim() || ''),
      aadhar_number: values.aadhar_number?.trim() || '',
      program: sanitizeText(values.program?.trim() || ''),
      join_date: values.join_date?.trim() || '',
      parent_name: sanitizeText(values.parent_name?.trim() || ''),
      parent_contact: values.parent_contact?.trim() || '',
      profile_image_url: values.profile_image_url,
    };

    // Validate required fields
    const missingFields = Object.entries(sanitizedValues)
      .filter(([key, value]) => key !== 'profile_image_url' && !value)
      .map(([field]) => field.replace('_', ' '));

    if (missingFields.length > 0) {
      toast.error(
        `Please fill all required fields: ${missingFields.join(', ')}`
      );
      return;
    }

    // Enhanced validation using utility functions
    const aadharValidation = validateAadharNumber(
      sanitizedValues.aadhar_number
    );
    if (!aadharValidation.isValid) {
      toast.error('Aadhar number must be exactly 12 digits.');
      return;
    }

    const phoneValidation = validatePhoneNumber(sanitizedValues.parent_contact);
    if (!phoneValidation.isValid) {
      toast.error(
        'Contact number must be exactly 10 digits starting with 6-9.'
      );
      return;
    }

    const { data: result, error } = await safeAsync(async () => {
      // Uniqueness check for Aadhar Number on create
      if (!student) {
        const { data: existing, error: checkError } = await supabase
          .from('students')
          .select('id, name')
          .eq('aadhar_number', aadharValidation.sanitized)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existing) {
          throw new Error(
            `A student with this Aadhar number already exists: ${existing.name}`
          );
        }
      }

      // Prepare payload with sanitized values
      const payload = {
        name: sanitizedValues.name,
        aadhar_number: aadharValidation.sanitized,
        program: sanitizedValues.program,
        join_date: sanitizedValues.join_date,
        parent_name: sanitizedValues.parent_name,
        parent_contact: phoneValidation.sanitized,
        profile_image_url: sanitizedValues.profile_image_url || null,
      };

      if (student) {
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

        // Assign white belt to new student for their discipline (ignore errors if already exists)
        const whiteBeltId = getWhiteBeltId(data.program);
        if (data && whiteBeltId) {
          const { error: progressError } = await supabase
            .from('student_progress')
            .insert({
              student_id: data.id,
              belt_level_id: whiteBeltId,
              status: 'needs_work',
            });

          // Log error but don't fail the student creation
          if (progressError) {
            console.warn(
              'Could not auto-assign white belt:',
              progressError.message
            );
          }
        }

        return data;
      }
    }, 'Student Form Submission');

    if (error) {
      toast.error(formatErrorForDisplay(error));
    } else {
      const action = student ? 'updated' : 'created';
      toast.success(`Student ${action} successfully: ${result?.name}`);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
          <DialogDescription>
            Provide enrollment details, guardian contact info, and the current
            training program for this student.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
            <FormField
              control={form.control}
              name="program"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
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

// This file is getting long (225+ lines). Consider splitting it into smaller files after this change.
