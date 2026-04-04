import { supabase } from '@/services/supabase/client';

interface StudentRecipient {
  email: string;
  parentName: string;
  studentName: string;
  parentPhone: string;
}

interface BulkAnnouncementPayload {
  type: 'event' | 'competition';
  title: string;
  description?: string | null;
  date: string;
  endDate?: string | null;
  location?: string | null;
  pageUrl?: string | null;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function getApprovedStudentRecipients(): Promise<StudentRecipient[]> {
  const { data, error } = await supabase
    .from('enrollment_requests')
    .select('student_email, parent_name, student_name, parent_phone')
    .eq('status', 'approved')
    .not('student_email', 'is', null);

  if (error) {
    throw new Error(error.message || 'Failed to load student recipients');
  }

  const seenEmails = new Set<string>();
  const recipients: StudentRecipient[] = [];

  for (const row of data ?? []) {
    const email = normalizeEmail((row.student_email || '').toString());
    if (!email || seenEmails.has(email)) continue;

    seenEmails.add(email);
    recipients.push({
      email,
      parentName: (row.parent_name || '').toString().trim(),
      studentName: (row.student_name || '').toString().trim(),
      parentPhone: (row.parent_phone || '').toString().trim(),
    });
  }

  return recipients;
}

export async function sendQueuedAnnouncement(
  payload: BulkAnnouncementPayload
): Promise<{ total: number; sent: number; failed: number }> {
  const { data, error } = await supabase.functions.invoke(
    'send-bulk-announcement',
    {
      body: payload,
    }
  );

  if (error) {
    throw new Error(error.message || 'Failed to send bulk announcement');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    total: Number(data?.total || 0),
    sent: Number(data?.sent || 0),
    failed: Number(data?.failed || 0),
  };
}

export function openManualWhatsAppBroadcast(message: string): boolean {
  const text = message.trim();
  if (!text) return false;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
