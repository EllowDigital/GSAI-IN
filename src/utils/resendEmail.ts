import { supabase } from '@/integrations/supabase/client';

const ACADEMY_NAME = 'Ghatak Sports Academy India';
const ACADEMY_EMAIL = 'ghatakgsai@gmail.com';
const ACADEMY_PHONE = '+91 63941 35988';

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: params,
    });
    if (error) {
      console.error('Email send error:', error);
      return false;
    }
    if (data?.error) {
      console.error('Email API error:', data.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Email failed:', err);
    return false;
  }
}

// ── HTML builders for beautiful email templates ──

function infoRow(label: string, value: string): string {
  return `<p style="margin:4px 0;font-size:14px"><strong>${label}:</strong> ${value}</p>`;
}

function infoBox(rows: string): string {
  return `<div class="info-box">${rows}</div>`;
}

// ── Fee Reminder Email ──

export function buildFeeReminderEmail(params: {
  parentName: string;
  studentName: string;
  amount: number;
  month: string;
  year: number;
}): SendEmailParams & { to: string } {
  const { parentName, studentName, amount, month, year } = params;
  return {
    to: '', // caller must set
    subject: `Fee Reminder: ${studentName} - ${month} ${year}`,
    html: `
      <p>Namaste <strong>${parentName}</strong> ji,</p>
      <p>This is a friendly reminder that the training fee for your child is pending.</p>
      ${infoBox(
        infoRow('Student', studentName) +
        infoRow('Amount Due', `₹${amount.toLocaleString()}`) +
        infoRow('Period', `${month} ${year}`)
      )}
      <p>Kindly clear the dues at your earliest convenience. If already paid, please ignore this message.</p>
      <p style="margin-top:20px">For queries, contact us:</p>
      <p>📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Thank you,<br><strong>${ACADEMY_NAME}</strong></p>
    `,
  };
}

// ── Enrollment Stage Emails ──

export function buildEnrollmentReceivedEmail(params: {
  parentName: string;
  studentName: string;
  program: string;
  gender?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  return {
    subject: `Enrollment Received - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${params.parentName}</strong> ji,</p>
      <p>We have received the enrollment request for your ${relation}, <strong>${params.studentName}</strong>, in the <strong>${params.program}</strong> program.</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
        infoRow('Program', params.program) +
        infoRow('Parent', params.parentName)
      )}
      <p>Our team will review the request and contact you shortly regarding batch timing, trial class, and next steps.</p>
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Thank you for choosing <strong>${ACADEMY_NAME}</strong>.</p>
    `,
  };
}

export function buildEnrollmentContactedEmail(params: {
  parentName: string;
  studentName: string;
  program: string;
  gender?: string | null;
  notes?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  return {
    subject: `Enrollment Update - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${params.parentName}</strong> ji,</p>
      <p>This is an update regarding the enrollment of your ${relation}, <strong>${params.studentName}</strong>, in the <strong>${params.program}</strong> program.</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
        infoRow('Program', params.program)
      )}
      <p>Our team is ready to assist you. Please reply to this email or call us to confirm trial class, batch timing, and admission guidance.</p>
      ${params.notes ? `<p><strong>Note:</strong> ${params.notes}</p>` : ''}
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Thank you,<br><strong>${ACADEMY_NAME}</strong></p>
    `,
  };
}

export function buildEnrollmentApprovedEmail(params: {
  parentName: string;
  studentName: string;
  program: string;
  gender?: string | null;
  notes?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  return {
    subject: `🎉 Enrollment Approved - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${params.parentName}</strong> ji,</p>
      <p>We are pleased to inform you that the enrollment for your ${relation}, <strong>${params.studentName}</strong>, in the <strong>${params.program}</strong> program has been <strong style="color:#16a34a">approved</strong>!</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
        infoRow('Program', params.program) +
        infoRow('Status', '✅ Approved')
      )}
      <p>Our team will guide you for final joining formalities and student portal access. Please keep your registered mobile number active.</p>
      ${params.notes ? `<p><strong>Note:</strong> ${params.notes}</p>` : ''}
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Welcome to <strong>${ACADEMY_NAME}</strong>!</p>
    `,
  };
}

export function buildEnrollmentRejectedEmail(params: {
  parentName: string;
  studentName: string;
  program: string;
  gender?: string | null;
  notes?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  return {
    subject: `Enrollment Update - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${params.parentName}</strong> ji,</p>
      <p>After review, we are unable to proceed with the enrollment request for your ${relation}, <strong>${params.studentName}</strong>, in the <strong>${params.program}</strong> program at this time.</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
        infoRow('Program', params.program)
      )}
      ${params.notes ? `<p><strong>Reason:</strong> ${params.notes}</p>` : ''}
      <p>If you have questions or wish to explore other options, please contact us directly.</p>
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Thank you for your understanding.<br><strong>${ACADEMY_NAME}</strong></p>
    `,
  };
}

export function buildPortalCredentialsEmail(params: {
  parentName: string;
  studentName: string;
  program: string;
  loginId: string;
  password: string;
  portalUrl: string;
  gender?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  return {
    subject: `Student Portal Credentials - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${params.parentName}</strong> ji,</p>
      <p>Admission has been completed for your ${relation}, <strong>${params.studentName}</strong>, in the <strong>${params.program}</strong> program.</p>
      <p>Here are the Student Portal login credentials:</p>
      ${infoBox(
        infoRow('Portal URL', `<a href="${params.portalUrl}">${params.portalUrl}</a>`) +
        infoRow('Login ID', params.loginId) +
        infoRow('Password', params.password)
      )}
      <p>⚠️ Please change the password after first login for security.</p>
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Welcome to <strong>${ACADEMY_NAME}</strong>!</p>
    `,
  };
}

// ── Enrollment Stage Email Dispatcher ──

export type EnrollmentEmailStage = 'pending' | 'contacted' | 'approved' | 'rejected';

export function buildEnrollmentStageEmail(
  stage: EnrollmentEmailStage,
  params: {
    parentName: string;
    studentName: string;
    program: string;
    gender?: string | null;
    notes?: string | null;
  }
): Omit<SendEmailParams, 'to'> {
  switch (stage) {
    case 'contacted':
      return buildEnrollmentContactedEmail(params);
    case 'approved':
      return buildEnrollmentApprovedEmail(params);
    case 'rejected':
      return buildEnrollmentRejectedEmail(params);
    case 'pending':
    default:
      return buildEnrollmentReceivedEmail(params);
  }
}

// ── Helpers ──

function getRelation(gender?: string | null): string {
  const g = gender?.trim().toLowerCase();
  if (g === 'male') return 'son';
  if (g === 'female') return 'daughter';
  return 'child';
}
