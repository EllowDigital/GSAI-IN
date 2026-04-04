export type EnrollmentMessageStage =
  | 'pending'
  | 'contacted'
  | 'approved'
  | 'rejected';

export interface EnrollmentMessageData {
  parentName: string;
  parentPhone: string;
  studentName: string;
  age?: number | null;
  gender?: string | null;
  program: string;
  studentEmail?: string | null;
  studentPhone?: string | null;
  notes?: string | null;
}

const ACADEMY_NAME = 'Ghatak Sports Academy India';
const ACADEMY_PHONE = '+91 63941 35988';
const ACADEMY_EMAIL = 'ghatakgsai@gmail.com';
const STUDENT_PORTAL_DEFAULT_PASSWORD = 'GSAI-STUDENT-2026';

const compactLines = (lines: Array<string | null | undefined | false>) =>
  lines.filter((line): line is string => Boolean(line && line.trim()));

const getStudentRelation = (gender?: string | null) => {
  const normalized = gender?.trim().toLowerCase();

  if (normalized === 'male') return 'son';
  if (normalized === 'female') return 'daughter';

  return 'child';
};

const buildRegistrationDetails = (data: EnrollmentMessageData) =>
  compactLines([
    'Registered Details',
    `• Student: ${data.studentName}`,
    `• Program: ${data.program}`,
    data.age != null && data.gender
      ? `• Age / Gender: ${data.age} yrs / ${data.gender}`
      : null,
    `• Parent: ${data.parentName}`,
    `• Parent Mobile: ${data.parentPhone}`,
    data.studentPhone ? `• Student Mobile: ${data.studentPhone}` : null,
    data.studentEmail ? `• Student Email: ${data.studentEmail}` : null,
  ]).join('\n');

const buildAcademyContactDetails = () =>
  [
    'Academy Contact',
    `• Phone / WhatsApp: ${ACADEMY_PHONE}`,
    `• Email: ${ACADEMY_EMAIL}`,
  ].join('\n');

export const getEnrollmentStageActionLabel = (
  stage: EnrollmentMessageStage
) => {
  switch (stage) {
    case 'contacted':
      return 'Send Contact Update';
    case 'approved':
      return 'Send Approval Update';
    case 'rejected':
      return 'Send Rejection Update';
    case 'pending':
    default:
      return 'Send Received Update';
  }
};

export const buildEnrollmentReceivedMessage = (data: EnrollmentMessageData) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `Enrollment request received for your ${relation}, ${data.studentName} (${data.program}).`,
    'Our team will contact you within 24 hours for next steps.',
    buildAcademyContactDetails(),
    `Regards, ${ACADEMY_NAME}`,
  ].join('\n\n');
};

export const buildEnrollmentContactedMessage = (
  data: EnrollmentMessageData
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `Update: enrollment request for your ${relation}, ${data.studentName} (${data.program}).`,
    compactLines([
      'Please reply on WhatsApp or call us to confirm trial class and batch timing.',
      data.notes ? `Admin Note: ${data.notes}` : null,
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    `Regards, ${ACADEMY_NAME}`,
  ].join('\n\n');
};

export const buildEnrollmentApprovedMessage = (data: EnrollmentMessageData) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `Good news. Enrollment approved for your ${relation}, ${data.studentName} (${data.program}).`,
    compactLines([
      'Student portal credentials and joining details will be shared shortly.',
      data.notes ? `Admin Note: ${data.notes}` : null,
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    `Regards, ${ACADEMY_NAME}`,
  ].join('\n\n');
};

export const buildEnrollmentRejectedMessage = (data: EnrollmentMessageData) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `After review, we are unable to proceed with enrollment for your ${relation}, ${data.studentName} (${data.program}) at this time.`,
    compactLines([
      data.notes ? `Reason / Note: ${data.notes}` : null,
      'For clarification or alternate options, please contact us.',
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    `Regards, ${ACADEMY_NAME}`,
  ].join('\n\n');
};

export const buildEnrollmentStageMessage = (
  stage: EnrollmentMessageStage,
  data: EnrollmentMessageData
) => {
  switch (stage) {
    case 'contacted':
      return buildEnrollmentContactedMessage(data);
    case 'approved':
      return buildEnrollmentApprovedMessage(data);
    case 'rejected':
      return buildEnrollmentRejectedMessage(data);
    case 'pending':
    default:
      return buildEnrollmentReceivedMessage(data);
  }
};

export const buildEnrollmentPortalMessage = (
  data: EnrollmentMessageData & {
    loginId: string;
    portalUrl: string;
    defaultPassword?: string;
  }
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `Admission completed for your ${relation}, ${data.studentName} (${data.program}).`,
    [
      'Student Portal Login',
      `• Portal: ${data.portalUrl}`,
      `• Login ID: ${data.loginId}`,
      `• Default Password: ${data.defaultPassword || STUDENT_PORTAL_DEFAULT_PASSWORD}`,
    ].join('\n'),
    'Please sign in and change the default password immediately.',
    buildAcademyContactDetails(),
    `Welcome to ${ACADEMY_NAME}.`,
  ].join('\n\n');
};
