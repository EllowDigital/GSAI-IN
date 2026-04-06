import { supabase } from '@/services/supabase/client';

const ACADEMY_NAME = 'Ghatak Sports Academy India';
const ACADEMY_EMAIL = 'ghatakgsai@gmail.com';
const ACADEMY_PHONE = '+91 63941 35988';
const STUDENT_PORTAL_DEFAULT_PASSWORD = 'GSAI-STUDENT-2026';
const ACADEMY_LOGO_URL =
  'https://ghataksportsacademy.com/assets/images/logo.webp';

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function isFullHtmlDocument(value: string): boolean {
  return /<html[\s>]/i.test(value);
}

function buildBrandedEmailHtml(subject: string, bodyHtml: string): string {
  const safeSubject = escapeHtml(subject);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <style>
    body{margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937}
    .wrapper{max-width:640px;margin:0 auto;padding:24px 14px}
    .card{background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,.06)}
    .header{background:#0f172a;padding:20px 26px;text-align:center}
    .logo{height:46px;max-width:220px;object-fit:contain;display:block;margin:0 auto 8px}
    .academy{color:#e2e8f0;font-size:14px;font-weight:600;letter-spacing:.2px}
    .content{padding:26px;color:#1f2937;line-height:1.65;font-size:15px}
    .content h2{margin:0 0 14px;color:#0f172a;font-size:19px}
    .info-box{background:#f8fafc;border:1px solid #dbeafe;border-left:4px solid #2563eb;padding:12px 14px;border-radius:10px;margin:16px 0}
    .info-box p{margin:4px 0;font-size:14px}
    .btn{display:inline-block;background:#1d4ed8;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600}
    .footer{background:#f8fafc;border-top:1px solid #e5e7eb;padding:16px 26px;text-align:center;color:#64748b;font-size:12px}
    .footer a{color:#1d4ed8;text-decoration:none}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <img class="logo" src="${ACADEMY_LOGO_URL}" alt="${ACADEMY_NAME} logo" />
        <div class="academy">${ACADEMY_NAME}</div>
      </div>
      <div class="content">
        <h2>${safeSubject}</h2>
        ${bodyHtml}
      </div>
      <div class="footer">
        <p>${ACADEMY_NAME}</p>
        <p>Phone / WhatsApp: ${ACADEMY_PHONE} | Email: <a href="mailto:${ACADEMY_EMAIL}">${ACADEMY_EMAIL}</a></p>
        <p style="margin-top:8px">This is an automated email from the academy portal.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const normalizedHtml = params.html?.trim();
    const payload: SendEmailParams = {
      ...params,
      to: params.to.trim(),
      subject: sanitizeSubject(params.subject),
      html: normalizedHtml
        ? isFullHtmlDocument(normalizedHtml)
          ? normalizedHtml
          : buildBrandedEmailHtml(params.subject, normalizedHtml)
        : undefined,
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

function infoRow(
  label: string,
  value: string,
  options?: { valueIsHtml?: boolean }
): string {
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
  portalUrl?: string;
  gender?: string | null;
  notes?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  const safeParentName = escapeHtml(params.parentName);
  const safeStudentName = escapeHtml(params.studentName);
  const safeProgram = escapeHtml(params.program);
  const safeRelation = escapeHtml(relation);
  const safeNotes = params.notes ? escapeHtml(params.notes) : null;
  const safePortalUrl = params.portalUrl
    ? validateHttpsUrl(params.portalUrl, 'portalUrl')
    : 'https://ghataksportsacademy.com/student/login';
  return {
    subject: `Enrollment Approved - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>We are pleased to inform you that the enrollment for your ${safeRelation}, <strong>${safeStudentName}</strong>, in the <strong>${safeProgram}</strong> program has been <strong style="color:#16a34a">approved</strong>!</p>
      ${infoBox(
        infoRow('Student', params.studentName) +
          infoRow('Program', params.program) +
          infoRow('Status', '✅ Approved') +
          infoRow(
            'Student Portal',
            `<a href="${safePortalUrl}" rel="noopener noreferrer">${escapeHtml(safePortalUrl)}</a>`,
            { valueIsHtml: true }
          ) +
          infoRow('Default Password', STUDENT_PORTAL_DEFAULT_PASSWORD)
      )}
      <p>Please sign in to the student portal using your Login ID and the default password above, then change your password from inside the portal.</p>
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
  portalUrl: string;
  defaultPassword?: string;
  gender?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  const safeParentName = escapeHtml(params.parentName);
  const safeStudentName = escapeHtml(params.studentName);
  const safeProgram = escapeHtml(params.program);
  const safeRelation = escapeHtml(relation);
  const safePortalUrl = validateHttpsUrl(params.portalUrl, 'portalUrl');
  const safeDefaultPassword = escapeHtml(
    params.defaultPassword?.trim() || STUDENT_PORTAL_DEFAULT_PASSWORD
  );

  return {
    subject: `Student Portal Access - ${params.studentName} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>Admission has been completed for your ${safeRelation}, <strong>${safeStudentName}</strong>, in the <strong>${safeProgram}</strong> program.</p>
      <p>Use these credentials to sign in. After first login, update the password from inside the student portal.</p>
      ${infoBox(
        infoRow(
          'Portal URL',
          `<a href="${safePortalUrl}" rel="noopener noreferrer">${escapeHtml(safePortalUrl)}</a>`,
          {
            valueIsHtml: true,
          }
        ) +
          infoRow('Login ID', params.loginId) +
          infoRow('Default Password', safeDefaultPassword)
      )}
      <p>For security, change this default password immediately after sign-in.</p>
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Welcome to <strong>${ACADEMY_NAME}</strong>!</p>
    `,
  };
}

// ── Enrollment Stage Email Dispatcher ──

export type EnrollmentEmailStage =
  | 'pending'
  | 'contacted'
  | 'approved'
  | 'rejected';

export function buildEventAnnouncementEmail(params: {
  parentName: string;
  studentName: string;
  title: string;
  fromDate: string;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
  eventsPageUrl?: string;
}): Omit<SendEmailParams, 'to'> {
  const safeParentName = escapeHtml(params.parentName || 'Parent');
  const safeStudentName = escapeHtml(params.studentName || 'Student');
  const safeTitle = escapeHtml(params.title);
  const safeFromDate = escapeHtml(params.fromDate);
  const safeEndDate = params.endDate ? escapeHtml(params.endDate) : null;
  const safeLocation = params.location ? escapeHtml(params.location) : null;
  const safeDescription = params.description
    ? escapeHtml(params.description)
    : null;
  const safeEventsPageUrl = params.eventsPageUrl
    ? validateHttpsUrl(params.eventsPageUrl, 'eventsPageUrl')
    : 'https://ghataksportsacademy.com/events';

  return {
    subject: `New Event: ${params.title} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>We are excited to share a new academy event update for <strong>${safeStudentName}</strong>.</p>
      ${infoBox(
        infoRow('Event', safeTitle) +
          infoRow('Starts On', safeFromDate) +
          (safeEndDate ? infoRow('Ends On', safeEndDate) : '') +
          (safeLocation ? infoRow('Location', safeLocation) : '')
      )}
      ${safeDescription ? `<p><strong>Details:</strong> ${safeDescription}</p>` : ''}
      <p>View complete event details here:</p>
      <p><a class="btn" href="${safeEventsPageUrl}" rel="noopener noreferrer">View Events</a></p>
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Regards,<br><strong>${ACADEMY_NAME}</strong></p>
    `,
  };
}

export function buildCompetitionAnnouncementEmail(params: {
  parentName: string;
  studentName: string;
  name: string;
  date: string;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
  competitionsPageUrl?: string;
}): Omit<SendEmailParams, 'to'> {
  const safeParentName = escapeHtml(params.parentName || 'Parent');
  const safeStudentName = escapeHtml(params.studentName || 'Student');
  const safeName = escapeHtml(params.name);
  const safeDate = escapeHtml(params.date);
  const safeEndDate = params.endDate ? escapeHtml(params.endDate) : null;
  const safeLocation = params.location ? escapeHtml(params.location) : null;
  const safeDescription = params.description
    ? escapeHtml(params.description)
    : null;
  const safeCompetitionsPageUrl = params.competitionsPageUrl
    ? validateHttpsUrl(params.competitionsPageUrl, 'competitionsPageUrl')
    : 'https://ghataksportsacademy.com/student/dashboard';

  return {
    subject: `Competition Update: ${params.name} | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${safeParentName}</strong> ji,</p>
      <p>A new competition update is available for <strong>${safeStudentName}</strong>.</p>
      ${infoBox(
        infoRow('Competition', safeName) +
          infoRow('Date', safeDate) +
          (safeEndDate ? infoRow('End Date', safeEndDate) : '') +
          (safeLocation ? infoRow('Location', safeLocation) : '')
      )}
      ${safeDescription ? `<p><strong>Details:</strong> ${safeDescription}</p>` : ''}
      <p>Please check the student portal for registration and updates:</p>
      <p><a class="btn" href="${safeCompetitionsPageUrl}" rel="noopener noreferrer">Open Student Portal</a></p>
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Regards,<br><strong>${ACADEMY_NAME}</strong></p>
    `,
  };
}

export function buildEnrollmentStageEmail(
  stage: EnrollmentEmailStage,
  params: {
    parentName: string;
    studentName: string;
    program: string;
    portalUrl?: string;
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
