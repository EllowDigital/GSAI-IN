import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import StudentAvatarUploader from './StudentAvatarUploader';

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
    try {
      if (
        !values.name ||
        !values.aadhar_number ||
        !values.program ||
        !values.join_date ||
        !values.parent_name ||
        !values.parent_contact
      ) {
        toast.error('Please fill all required fields.');
        return;
      }
      // Uniqueness check for Aadhar Number on create
      if (!student) {
        const { data: existing, error: err1 } = await supabase
          .from('students')
          .select('id')
          .eq('aadhar_number', values.aadhar_number);
        if (err1) throw err1;
        if (existing && existing.length > 0) {
          toast.error('A student with this Aadhar Number already exists.');
          return;
        }
      }
      // Prepare DB payload (keep only DB fields)
      const payload = {
        name: values.name,
        aadhar_number: values.aadhar_number,
        program: values.program,
        join_date: values.join_date,
        parent_name: values.parent_name,
        parent_contact: values.parent_contact,
        profile_image_url: values.profile_image_url,
      };
      if (student) {
        const { error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', student.id);
        if (error) throw error;
        toast.success('Student updated.');
      } else {
        const { error } = await supabase.from('students').insert([payload]);
        if (error) throw error;
        toast.success('Student created.');
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error('Error saving student: ' + err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Student' : 'Add Student'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <StudentAvatarUploader
              url={form.watch('profile_image_url')}
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
