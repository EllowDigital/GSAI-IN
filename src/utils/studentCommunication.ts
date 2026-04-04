import { supabase } from '@/services/supabase/client';
import { sendEmail } from '@/utils/resendEmail';

interface StudentRecipient {
  email: string;
  parentName: string;
  studentName: string;
  parentPhone: string;
}

type EmailBuilder = (
  recipient: StudentRecipient
) => {
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
};

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

export async function sendAnnouncementToApprovedStudents(
  buildEmail: EmailBuilder
): Promise<{ total: number; sent: number; failed: number }> {
  const recipients = await getApprovedStudentRecipients();

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const payload = buildEmail(recipient);
    const ok = await sendEmail({ ...payload, to: recipient.email });
    if (ok) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return {
    total: recipients.length,
    sent,
    failed,
  };
}

export function openManualWhatsAppBroadcast(message: string): boolean {
  const text = message.trim();
  if (!text) return false;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
