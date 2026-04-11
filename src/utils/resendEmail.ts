import { supabase } from '@/services/supabase/client';
import { ACADEMY_CONTACT_EMAIL } from '@/config/contact';

/**
 * ACADEMY CONFIGURATION
 */
const ACADEMY_NAME = 'Ghatak Sports Academy India';
const ACADEMY_EMAIL = ACADEMY_CONTACT_EMAIL;
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

// ── UTILITY FUNCTIONS ──

export function escapeHtml(value: string): string {
  if (!value) return '';
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

/**
 * BRANDED EMAIL WRAPPER
 * Optimized for Indian mobile users (Clean, readable, professional)
 */
function buildBrandedEmailHtml(subject: string, bodyHtml: string): string {
  const safeSubject = escapeHtml(subject);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <style>
    body{margin:0;padding:0;background:#f4f7f9;font-family:'Helvetica Neue',Arial,sans-serif;color:#1f2937}
    .wrapper{max-width:600px;margin:0 auto;padding:20px 10px}
    .card{background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05)}
    .header{background:#0f172a;padding:24px;text-align:center}
    .logo{height:48px;max-width:200px;object-fit:contain;display:block;margin:0 auto 10px}
    .academy{color:#f8fafc;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase}
    .content{padding:30px 24px;color:#374151;line-height:1.7;font-size:16px}
    .content h2{margin:0 0 16px;color:#111827;font-size:20px;font-weight:bold;border-bottom:2px solid #f1f5f9;padding-bottom:10px}
    .info-box{background:#f0f9ff;border:1px solid #bae6fd;border-left:5px solid #0284c7;padding:16px;border-radius:8px;margin:20px 0}
    .info-box p{margin:6px 0;font-size:14px;color:#0c4a6e}
    .btn{display:inline-block;background:#1d4ed8;color:#ffffff !important;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:10px}
    .footer{background:#f9fafb;border-top:1px solid #f1f5f9;padding:20px;text-align:center;color:#6b7280;font-size:12px}
    .footer a{color:#1d4ed8;text-decoration:none;font-weight:600}
    .hindi-text{color:#4b5563;font-style:italic;font-size:14px;margin-top:4px;display:block}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <img class="logo" src="${ACADEMY_LOGO_URL}" alt="${ACADEMY_NAME}" />
        <div class="academy">${ACADEMY_NAME}</div>
      </div>
      <div class="content">
        <h2>${safeSubject}</h2>
        ${bodyHtml}
      </div>
      <div class="footer">
        <p><strong>${ACADEMY_NAME}</strong></p>
        <p>WhatsApp/Phone: ${ACADEMY_PHONE} | Email: <a href="mailto:${ACADEMY_EMAIL}">${ACADEMY_EMAIL}</a></p>
        <p style="margin-top:10px">This is an automated message from our official academy portal.</p>
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

// ── HTML BUILDERS ──

function infoRow(
  label: string,
  value: string,
  options?: { valueIsHtml?: boolean }
): string {
  const safeLabel = escapeHtml(label);
  const safeValue = options?.valueIsHtml ? value : escapeHtml(value);
  return `<p><strong>${safeLabel}:</strong> ${safeValue}</p>`;
}

function infoBox(rows: string): string {
  return `<div class="info-box">${rows}</div>`;
}

function getRelation(gender?: string | null): string {
  const g = gender?.trim().toLowerCase();
  if (g === 'male') return 'son';
  if (g === 'female') return 'daughter';
  return 'child';
}

// ── EMAIL TEMPLATES ──

export function buildFeeReminderEmail(params: {
  parentName: string;
  studentName: string;
  amount: number;
  month: string;
  year: number;
}): SendEmailParams & { to: string } {
  const { parentName, studentName, amount, month, year } = params;
  return {
    to: '',
    subject: `Fee Reminder: ${studentName} - ${month} ${year}`,
    html: `
      <p>Namaste <strong>${escapeHtml(parentName)}</strong> ji,</p>
      <p>This is a friendly reminder that the training fee for your child is currently pending.</p>
      <span class="hindi-text">आपके बच्चे की ट्रेनिंग फीस अभी पेंडिंग है।</span>
      ${infoBox(
        infoRow('Student', studentName) +
          infoRow('Amount Due', `₹${amount.toLocaleString('en-IN')}`) +
          infoRow('Period', `${month} ${year}`)
      )}
      <p>Kindly clear the dues at your earliest convenience. If already paid, please ignore this message.</p>
      <p style="margin-top:20px">For any queries, contact us:</p>
      <p>📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Thank you,<br><strong>Accounts Dept, ${ACADEMY_NAME}</strong></p>
    `,
  };
}

export function buildEnrollmentReceivedEmail(params: {
  parentName: string;
  studentName: string;
  program: string;
  gender?: string | null;
}): Omit<SendEmailParams, 'to'> {
  const relation = getRelation(params.gender);
  return {
    subject: `Enrollment Received | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>We have received the enrollment request for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong>, for <strong>${escapeHtml(params.program)}</strong>.</p>
      <span class="hindi-text">हमने आपका नामांकन अनुरोध (Enrollment request) प्राप्त कर लिया है।</span>
      ${infoBox(
        infoRow('Student', params.studentName) +
          infoRow('Program', params.program) +
          infoRow('Parent', params.parentName)
      )}
      <p>Our team will contact you within 24 hours regarding the trial class and batch timings.</p>
      <span class="hindi-text">हमारी टीम 24 घंटे में आपको ट्रायल क्लास और बैच की जानकारी के लिए कॉल करेगी।</span>
      <p style="margin-top:20px">📞 <strong>${ACADEMY_PHONE}</strong> | ✉️ <strong>${ACADEMY_EMAIL}</strong></p>
      <p style="margin-top:16px">Regards,<br><strong>Team ${ACADEMY_NAME}</strong></p>
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
    subject: `Enrollment Contacted | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>Our team has initiated the admission process for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong> (${escapeHtml(params.program)}).</p>
      <span class="hindi-text">आपके बच्चे का एडमिशन प्रोसेस शुरू हो चुका है।</span>
      ${infoBox(
        infoRow('Student', params.studentName) +
          infoRow('Program', params.program)
      )}
      <p>Please call or WhatsApp us to confirm the trial class timing.</p>
      <span class="hindi-text">ट्रायल क्लास का समय कन्फर्म करने के लिए हमें कॉल या व्हाट्सएप करें।</span>
      ${params.notes ? `<p style="margin-top:10px"><strong>Note:</strong> ${escapeHtml(params.notes)}</p>` : ''}
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
  const safePortalUrl = params.portalUrl
    ? validateHttpsUrl(params.portalUrl, 'portalUrl')
    : 'https://ghataksportsacademy.com/student/login';

  return {
    subject: `Enrollment Approved - Welcome to ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>Good news! Enrollment for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong>, is <strong style="color:#16a34a">Approved</strong>.</p>
      <span class="hindi-text">खुशखबरी, आपका नामांकन स्वीकार (Approve) कर लिया गया है।</span>
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
      <p><strong>Important:</strong> Please login and change your password after the first sign-in.</p>
      <span class="hindi-text">महत्वपूर्ण: पहली बार लॉगिन करने के बाद पासवर्ड तुरंत बदलें।</span>
      ${params.notes ? `<p><strong>Note:</strong> ${escapeHtml(params.notes)}</p>` : ''}
      <p><a href="${safePortalUrl}" class="btn">Go to Student Portal</a></p>
      <p style="margin-top:20px">Welcome to <strong>${ACADEMY_NAME}</strong> family!</p>
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
    subject: `Enrollment Update | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>After review, we are unable to proceed with the enrollment for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong>, at this time.</p>
      <span class="hindi-text">समीक्षा के बाद, अभी हम नामांकन प्रक्रिया को आगे नहीं बढ़ा पाएंगे।</span>
      ${infoBox(
        infoRow('Student', params.studentName) +
          infoRow('Program', params.program)
      )}
      ${params.notes ? `<p><strong>Reason:</strong> ${escapeHtml(params.notes)}</p>` : ''}
      <p>Please contact us if you need any guidance regarding future options.</p>
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
  const safePortalUrl = validateHttpsUrl(params.portalUrl, 'portalUrl');
  const safeDefaultPassword = escapeHtml(
    params.defaultPassword?.trim() || STUDENT_PORTAL_DEFAULT_PASSWORD
  );

  return {
    subject: `Admission Complete - Login Details | ${ACADEMY_NAME}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>Admission is now complete for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong> (${escapeHtml(params.program)}).</p>
      <p>Please use the credentials below to access the student portal:</p>
      <span class="hindi-text">एडमिशन पूरा हो गया है। कृपया नीचे दिए गए लॉगिन डिटेल्स का उपयोग करें:</span>
      ${infoBox(
        infoRow(
          'Portal URL',
          `<a href="${safePortalUrl}" rel="noopener noreferrer">${escapeHtml(safePortalUrl)}</a>`,
          { valueIsHtml: true }
        ) +
          infoRow('Login ID', params.loginId) +
          infoRow('Default Password', safeDefaultPassword)
      )}
      <p><strong>Note:</strong> Security के लिए पहली लॉगिन के बाद पासवर्ड जरूर बदलें।</p>
      <p><a href="${safePortalUrl}" class="btn">Login Now</a></p>
      <p style="margin-top:20px">Regards,<br><strong>Team ${ACADEMY_NAME}</strong></p>
    `,
  };
}

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
  const safePortalUrl = params.eventsPageUrl
    ? validateHttpsUrl(params.eventsPageUrl, 'eventsPageUrl')
    : 'https://ghataksportsacademy.com/events';

  return {
    subject: `New Academy Event: ${params.title}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName || 'Parent')}</strong> ji,</p>
      <p>We are excited to announce a new academy event for our students.</p>
      ${infoBox(
        infoRow('Event', params.title) +
          infoRow('Starts On', params.fromDate) +
          (params.endDate ? infoRow('Ends On', params.endDate) : '') +
          (params.location ? infoRow('Location', params.location) : '')
      )}
      ${params.description ? `<p><strong>Details:</strong> ${escapeHtml(params.description)}</p>` : ''}
      <p>View complete details on our events page:</p>
      <p><a class="btn" href="${safePortalUrl}" rel="noopener noreferrer">View All Events</a></p>
      <p style="margin-top:20px">Regards,<br><strong>${ACADEMY_NAME}</strong></p>
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
  const safeUrl = params.competitionsPageUrl
    ? validateHttpsUrl(params.competitionsPageUrl, 'competitionsPageUrl')
    : 'https://ghataksportsacademy.com/student/dashboard';

  return {
    subject: `Competition Update: ${params.name}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName || 'Parent')}</strong> ji,</p>
      <p>A new competition update is available for <strong>${escapeHtml(params.studentName || 'Student')}</strong>.</p>
      ${infoBox(
        infoRow('Competition', params.name) +
          infoRow('Date', params.date) +
          (params.endDate ? infoRow('End Date', params.endDate) : '') +
          (params.location ? infoRow('Location', params.location) : '')
      )}
      ${params.description ? `<p><strong>Details:</strong> ${escapeHtml(params.description)}</p>` : ''}
      <p>Check the student portal for registration details:</p>
      <p><a class="btn" href="${safeUrl}" rel="noopener noreferrer">Open Student Portal</a></p>
      <p style="margin-top:20px">Best of luck,<br><strong>Team ${ACADEMY_NAME}</strong></p>
    `,
  };
}

// ── DISPATCHER ──

export type EnrollmentEmailStage =
  | 'pending'
  | 'contacted'
  | 'approved'
  | 'rejected';

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
