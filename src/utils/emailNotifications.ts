/**
 * Send email via FormSubmit.co (free transactional email service)
 * Docs: https://formsubmit.co/
 */

const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/ghataksportsacademy@gmail.com';

interface EmailPayload {
  to?: string;
  subject: string;
  message: string;
  replyTo?: string;
  name?: string;
}

export async function sendFormSubmitEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const body: Record<string, string> = {
      _subject: payload.subject,
      message: payload.message,
      _captcha: 'false',
      _template: 'table',
    };

    if (payload.name) body.name = payload.name;
    if (payload.replyTo) body._replyto = payload.replyTo;

    const response = await fetch(FORMSUBMIT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    return response.ok;
  } catch {
    console.error('FormSubmit email failed');
    return false;
  }
}

export function buildRejectionMessage(
  parentName: string,
  studentName: string,
  program: string,
  notes?: string
): string {
  return `Dear ${parentName},

We regret to inform you that the enrollment request for ${studentName} in the ${program} program has not been approved at this time.

${notes ? `Reason: ${notes}\n` : ''}If you have any questions, please contact us.

Best regards,
Ghatak Sports Academy India`;
}

export function buildFeeReminderMessage(
  parentName: string,
  studentName: string,
  month: string,
  amount: number
): string {
  return `Dear ${parentName},

This is a friendly reminder that the fee of ₹${amount} for ${studentName} for the month of ${month} is pending.

Please make the payment at your earliest convenience. If already paid, please ignore this message.

Best regards,
Ghatak Sports Academy India`;
}

export function buildCompetitionAnnouncementMessage(
  studentName: string,
  competitionName: string,
  date: string,
  location?: string
): string {
  return `Dear Student,

We are excited to announce an upcoming competition!

🏆 ${competitionName}
📅 Date: ${date}
${location ? `📍 Location: ${location}\n` : ''}
Log in to the Student Portal to register: ${window.location.origin}/student/login

Best regards,
Ghatak Sports Academy India`;
}
