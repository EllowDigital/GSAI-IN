import { supabase } from '@/services/supabase/client';
import { ACADEMY_CONTACT_EMAIL, RESEND_DOMAIN_SENDERS } from '@/config/contact';

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
  senderPurpose?: keyof typeof RESEND_DOMAIN_SENDERS;
}

function isUnauthorizedInvokeError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeError = error as { message?: unknown; context?: unknown; status?: unknown };
  if (typeof maybeError.status === 'number' && maybeError.status === 401) {
    return true;
  }

  if (typeof maybeError.message === 'string' && /\b401\b|unauthorized/i.test(maybeError.message)) {
    return true;
  }

  const context = maybeError.context as { status?: unknown } | undefined;
  return typeof context?.status === 'number' && context.status === 401;
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
 * Optimized for Indian mobile users (Premium, readable, professional UI)
 */
function buildBrandedEmailHtml(subject: string, bodyHtml: string): string {
  const safeSubject = escapeHtml(subject);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 30px 15px; }
    .card { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; }
    .logo { height: 56px; max-width: 220px; object-fit: contain; display: block; margin: 0 auto 12px; }
    .academy { color: #f8fafc; font-size: 16px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
    .content { padding: 40px 32px; color: #374151; line-height: 1.6; font-size: 16px; }
    .content h2 { margin: 0 0 24px; color: #111827; font-size: 22px; font-weight: 700; text-align: center; }
    .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 0 20px; border-radius: 12px; margin: 28px 0; }
    .info-row { padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-size: 13px; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px; letter-spacing: 0.5px; }
    .info-value { color: #0f172a; font-size: 16px; font-weight: 500; display: block; word-break: break-word; }
    .btn-container { text-align: center; margin: 32px 0 16px; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); }
    .hindi-text { color: #475569; font-size: 15px; margin: 12px 0 20px 0; display: block; border-left: 3px solid #cbd5e1; background-color: #f8fafc; padding: 10px 14px; border-radius: 0 6px 6px 0; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e5e7eb; padding: 32px 24px; text-align: center; color: #64748b; font-size: 13px; }
    .footer strong { color: #0f172a; font-size: 15px; display: block; margin-bottom: 8px; }
    .footer a { color: #2563eb; text-decoration: none; font-weight: 500; }
    .contact-line { margin: 12px 0; padding: 12px 0; border-top: 1px dashed #cbd5e1; border-bottom: 1px dashed #cbd5e1; }
    @media only screen and (max-width: 480px) {
      .content { padding: 30px 20px; }
      .header { padding: 24px 16px; }
    }
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
        <strong>${ACADEMY_NAME}</strong>
        <div class="contact-line">
          WhatsApp/Phone: ${ACADEMY_PHONE}<br/>
          Email: <a href="mailto:${ACADEMY_EMAIL}">${ACADEMY_EMAIL}</a>
        </div>
        <p style="margin-top:16px; font-size: 12px;">This is an automated message from our official academy portal. Please do not reply directly to this email.</p>
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

    let { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });

    if (error && isUnauthorizedInvokeError(error)) {
      const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && refreshed.session) {
        const retryResult = await supabase.functions.invoke('send-email', {
          body: payload,
        });
        data = retryResult.data;
        error = retryResult.error;
      }
    }

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
  return `
    <div class="info-row">
      <span class="info-label">${safeLabel}</span>
      <span class="info-value">${safeValue}</span>
    </div>`;
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
    subject: `Fee Reminder: ${studentName}`,
    html: `
      <p>Namaste <strong>${escapeHtml(parentName)}</strong> ji,</p>
      <p>This is a friendly reminder that the training fee for your child is currently pending.</p>
      <span class="hindi-text">आपके बच्चे की ट्रेनिंग फीस अभी पेंडिंग है। कृपया जल्द भुगतान करें।</span>
      ${infoBox(
        infoRow('Student', studentName) +
          infoRow('Amount Due', `₹${amount.toLocaleString('en-IN')}`) +
          infoRow('Billing Period', `${month} ${year}`)
      )}
      <p>Kindly clear the dues at your earliest convenience. If you have already paid, please ignore this message.</p>
      <p style="margin-top:24px">For any queries, please reach out to our accounts department.</p>
      <p style="margin-top:24px">Thank you,<br><strong>Accounts Dept, ${ACADEMY_NAME}</strong></p>
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
    subject: `Enrollment Received`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>We have successfully received the enrollment request for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong>, for the <strong>${escapeHtml(params.program)}</strong> program.</p>
      <span class="hindi-text">हमने आपका नामांकन अनुरोध (Enrollment request) सफलतापूर्वक प्राप्त कर लिया है।</span>
      ${infoBox(
        infoRow('Student Name', params.studentName) +
          infoRow('Selected Program', params.program) +
          infoRow('Parent Name', params.parentName)
      )}
      <p>Our team will contact you within 24 hours regarding the trial class and batch timings.</p>
      <span class="hindi-text">हमारी टीम 24 घंटे के भीतर आपको ट्रायल क्लास और बैच की जानकारी के लिए कॉल करेगी।</span>
      <p style="margin-top:24px">Regards,<br><strong>Team ${ACADEMY_NAME}</strong></p>
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
    subject: `Admission Process Initiated`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>Our team has initiated the admission process for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong>.</p>
      <span class="hindi-text">आपके बच्चे का एडमिशन प्रोसेस शुरू हो चुका है।</span>
      ${infoBox(
        infoRow('Student Name', params.studentName) +
          infoRow('Program', params.program)
      )}
      <p>Please call or WhatsApp us at your earliest convenience to confirm the trial class timing.</p>
      <span class="hindi-text">ट्रायल क्लास का समय कन्फर्म करने के लिए कृपया हमें कॉल या व्हाट्सएप करें।</span>
      ${params.notes ? `<p style="margin-top:20px; padding: 12px; background: #fef3c7; border-radius: 8px; color: #92400e;"><strong>Note:</strong> ${escapeHtml(params.notes)}</p>` : ''}
      <p style="margin-top:24px">Thank you,<br><strong>${ACADEMY_NAME}</strong></p>
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
    subject: `Enrollment Approved - Welcome to the Academy!`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>Good news! The enrollment for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong>, has been <strong style="color:#16a34a;">Approved</strong>.</p>
      <span class="hindi-text">खुशखबरी! आपका नामांकन स्वीकार (Approve) कर लिया गया है। घाटंक स्पोर्ट्स अकादमी में आपका स्वागत है।</span>
      ${infoBox(
        infoRow('Student Name', params.studentName) +
          infoRow('Enrolled Program', params.program) +
          infoRow('Application Status', '✅ Approved') +
          infoRow('Default Password', STUDENT_PORTAL_DEFAULT_PASSWORD)
      )}
      <p style="color: #b91c1c; font-weight: 500;"><strong>Important Security Note:</strong> Please log in to the portal and change your password immediately after your first sign-in.</p>
      <span class="hindi-text">महत्वपूर्ण: सुरक्षा कारणों से, कृपया पहली बार लॉगिन करने के बाद अपना पासवर्ड तुरंत बदलें।</span>
      ${params.notes ? `<p style="margin-top:16px;"><strong>Additional Note:</strong> ${escapeHtml(params.notes)}</p>` : ''}
      
      <div class="btn-container">
        <a href="${safePortalUrl}" class="btn">Access Student Portal</a>
      </div>
      
      <p style="margin-top:24px">Welcome to the <strong>${ACADEMY_NAME}</strong> family!</p>
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
    subject: `Enrollment Update`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>After careful review, we regret to inform you that we are unable to proceed with the enrollment for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong>, at this time.</p>
      <span class="hindi-text">समीक्षा के बाद, हमें खेद है कि हम इस समय नामांकन प्रक्रिया को आगे नहीं बढ़ा पाएंगे।</span>
      ${infoBox(
        infoRow('Student Name', params.studentName) +
          infoRow('Requested Program', params.program)
      )}
      ${params.notes ? `<p style="margin-top:16px; color: #4b5563;"><strong>Reason:</strong> ${escapeHtml(params.notes)}</p>` : ''}
      <p style="margin-top:24px">If you need guidance regarding future options or have any questions, please do not hesitate to contact us.</p>
      <p style="margin-top:24px">Thank you for your understanding,<br><strong>${ACADEMY_NAME}</strong></p>
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
    subject: `Your Student Portal Login Details`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName)}</strong> ji,</p>
      <p>The admission process is now fully complete for your ${relation}, <strong>${escapeHtml(params.studentName)}</strong> (${escapeHtml(params.program)}).</p>
      <p>Please use the secured credentials below to access the student portal for schedules, updates, and more:</p>
      <span class="hindi-text">एडमिशन पूरा हो गया है। कृपया छात्र पोर्टल तक पहुंचने के लिए नीचे दिए गए लॉगिन विवरण का उपयोग करें:</span>
      ${infoBox(
        infoRow('Login ID (Email/Phone)', params.loginId) +
          infoRow('Default Password', safeDefaultPassword) +
          infoRow(
            'Portal Link',
            `<a href="${safePortalUrl}" rel="noopener noreferrer">${escapeHtml(safePortalUrl)}</a>`,
            { valueIsHtml: true }
          )
      )}
      <p style="color: #b91c1c;"><strong>Security Warning:</strong> For your privacy, please change this default password upon your first login.</p>
      <span class="hindi-text">सुरक्षा के लिए पहली लॉगिन के बाद पासवर्ड जरूर बदलें।</span>
      
      <div class="btn-container">
        <a href="${safePortalUrl}" class="btn">Login to Portal Now</a>
      </div>
      
      <p style="margin-top:24px">Regards,<br><strong>Team ${ACADEMY_NAME}</strong></p>
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
    subject: `Upcoming Academy Event: ${params.title}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName || 'Parent')}</strong> ji,</p>
      <p>We are thrilled to announce a new upcoming event at the academy!</p>
      ${infoBox(
        infoRow('Event Name', params.title) +
          infoRow('Starts On', params.fromDate) +
          (params.endDate ? infoRow('Ends On', params.endDate) : '') +
          (params.location ? infoRow('Location', params.location) : '')
      )}
      ${params.description ? `<p style="margin-top:16px; color: #4b5563;"><strong>Event Details:</strong> ${escapeHtml(params.description)}</p>` : ''}
      <p style="margin-top:24px">To view the complete schedule and details, please visit our events page:</p>
      
      <div class="btn-container">
        <a class="btn" href="${safePortalUrl}" rel="noopener noreferrer">View Full Event Details</a>
      </div>
      
      <p style="margin-top:24px">We look forward to your participation!<br><strong>${ACADEMY_NAME}</strong></p>
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
    subject: `New Competition Update: ${params.name}`,
    html: `
      <p>Namaste <strong>${escapeHtml(params.parentName || 'Parent')}</strong> ji,</p>
      <p>A new competition opportunity is now available for <strong>${escapeHtml(params.studentName || 'Student')}</strong>.</p>
      ${infoBox(
        infoRow('Competition Name', params.name) +
          infoRow('Start Date', params.date) +
          (params.endDate ? infoRow('End Date', params.endDate) : '') +
          (params.location ? infoRow('Location', params.location) : '')
      )}
      ${params.description ? `<p style="margin-top:16px; color: #4b5563;"><strong>Details:</strong> ${escapeHtml(params.description)}</p>` : ''}
      <p style="margin-top:24px">Please check the student portal for registration guidelines and deadlines:</p>
      
      <div class="btn-container">
        <a class="btn" href="${safeUrl}" rel="noopener noreferrer">Open Student Portal</a>
      </div>
      
      <p style="margin-top:24px">Best of luck with the preparations,<br><strong>Team ${ACADEMY_NAME}</strong></p>
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
