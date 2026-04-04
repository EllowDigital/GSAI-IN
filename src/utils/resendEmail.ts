import { supabase } from '@/services/supabase/client';

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

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sanitizeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

function validateHttpsUrl(value: string, fieldName: string): string {
  const trimmed = value.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`${fieldName} must use HTTPS`);
  }

  return parsed.toString();
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const payload: SendEmailParams = {
      ...params,
      to: params.to.trim(),
      subject: sanitizeSubject(params.subject),
      replyTo: params.replyTo?.trim(),
    };

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });

    if (error) {
      console.error('Email send error:', error);
      return false;
    }

    if (!data?.success) {
      console.error('Email API error:', data?.error || data);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email failed:', err);
    return false;
  }
}

// ── HTML builders for beautiful email templates ──

function infoRow(label: string, value: string, options?: { valueIsHtml?: boolean }): string {
  const safeLabel = escapeHtml(label);
  const safeValue = options?.valueIsHtml ? value : escapeHtml(value);
  return `<p style="margin:4px 0;font-size:14px"><strong>${safeLabel}:</strong> ${safeValue}</p>`;
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
  const safeParentName = escapeHtml(parentName);
  return {
    to: '', // caller must set
    subject: `Fee Reminder: ${studentName} - ${month} ${year}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
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
  const safeParentName = escapeHtml(params.parentName);
  const safeStudentName = escapeHtml(params.studentName);
  const safeProgram = escapeHtml(params.program);
  const safeRelation = escapeHtml(relation);
  return {
    subject: `Enrollment Received - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>We have received the enrollment request for your ${safeRelation}, <strong>${safeStudentName}</strong>, in the <strong>${safeProgram}</strong> program.</p>
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
  const safeParentName = escapeHtml(params.parentName);
  const safeStudentName = escapeHtml(params.studentName);
  const safeProgram = escapeHtml(params.program);
  const safeRelation = escapeHtml(relation);
  const safeNotes = params.notes ? escapeHtml(params.notes) : null;
  return {
    subject: `Enrollment Update - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>This is an update regarding the enrollment of your ${safeRelation}, <strong>${safeStudentName}</strong>, in the <strong>${safeProgram}</strong> program.</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
        infoRow('Program', params.program)
      )}
      <p>Our team is ready to assist you. Please reply to this email or call us to confirm trial class, batch timing, and admission guidance.</p>
      ${safeNotes ? `<p><strong>Note:</strong> ${safeNotes}</p>` : ''}
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
  const safeParentName = escapeHtml(params.parentName);
  const safeStudentName = escapeHtml(params.studentName);
  const safeProgram = escapeHtml(params.program);
  const safeRelation = escapeHtml(relation);
  const safeNotes = params.notes ? escapeHtml(params.notes) : null;
  return {
    subject: `🎉 Enrollment Approved - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>We are pleased to inform you that the enrollment for your ${safeRelation}, <strong>${safeStudentName}</strong>, in the <strong>${safeProgram}</strong> program has been <strong style="color:#16a34a">approved</strong>!</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
        infoRow('Program', params.program) +
        infoRow('Status', '✅ Approved')
      )}
      <p>Our team will guide you for final joining formalities and student portal access. Please keep your registered mobile number active.</p>
      ${safeNotes ? `<p><strong>Note:</strong> ${safeNotes}</p>` : ''}
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
  const safeParentName = escapeHtml(params.parentName);
  const safeStudentName = escapeHtml(params.studentName);
  const safeProgram = escapeHtml(params.program);
  const safeRelation = escapeHtml(relation);
  const safeNotes = params.notes ? escapeHtml(params.notes) : null;
  return {
    subject: `Enrollment Update - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>After review, we are unable to proceed with the enrollment request for your ${safeRelation}, <strong>${safeStudentName}</strong>, in the <strong>${safeProgram}</strong> program at this time.</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
        infoRow('Program', params.program)
      )}
      ${safeNotes ? `<p><strong>Reason:</strong> ${safeNotes}</p>` : ''}
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
  setupLink: string;
  portalUrl: string;
  gender?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  const safeParentName = escapeHtml(params.parentName);
  const safeStudentName = escapeHtml(params.studentName);
  const safeProgram = escapeHtml(params.program);
  const safeRelation = escapeHtml(relation);
  const safePortalUrl = validateHttpsUrl(params.portalUrl, 'portalUrl');
  const safeSetupLink = validateHttpsUrl(params.setupLink, 'setupLink');

  return {
    subject: `Student Portal Access - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>Admission has been completed for your ${safeRelation}, <strong>${safeStudentName}</strong>, in the <strong>${safeProgram}</strong> program.</p>
      <p>Use the one-time secure link below to set the student portal password:</p>
      ${infoBox(
        infoRow('Portal URL', `<a href="${safePortalUrl}" rel="noopener noreferrer">${escapeHtml(safePortalUrl)}</a>`, {
          valueIsHtml: true,
        }) +
        infoRow('Login ID', params.loginId) +
        infoRow('Password Setup Link', `<a href="${safeSetupLink}" rel="noopener noreferrer">Set Password Securely</a>`, {
          valueIsHtml: true,
        })
      )}
      <p>⚠️ Do not share this setup link publicly. It should be used only once by the student/parent.</p>
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
