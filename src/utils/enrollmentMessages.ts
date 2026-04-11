import { ACADEMY_CONTACT_EMAIL } from '@/config/contact';

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
const ACADEMY_EMAIL = ACADEMY_CONTACT_EMAIL;
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

/* =========================
   ACTION LABEL
========================= */

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

/* =========================
   MESSAGES
========================= */

export const buildEnrollmentReceivedMessage = (data: EnrollmentMessageData) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `We have received the enrollment request for your ${relation}, ${data.studentName}, for the ${data.program} program.`,
    `Our team will contact you within the next 24 hours to guide you through the next steps.`,
    buildAcademyContactDetails(),
    `Regards,\n${ACADEMY_NAME}`,
  ].join('\n\n');
};

export const buildEnrollmentContactedMessage = (
  data: EnrollmentMessageData
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `This is an update regarding the enrollment request for your ${relation}, ${data.studentName} (${data.program}).`,
    compactLines([
      `Please connect with us via WhatsApp or call to confirm the trial class and batch timing.`,
      data.notes ? `Note from Admin: ${data.notes}` : null,
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    `Regards,\n${ACADEMY_NAME}`,
  ].join('\n\n');
};

export const buildEnrollmentApprovedMessage = (data: EnrollmentMessageData) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `Good news! The enrollment for your ${relation}, ${data.studentName}, in the ${data.program} program has been approved.`,
    compactLines([
      `Student portal credentials and joining instructions will be shared with you shortly.`,
      data.notes ? `Note from Admin: ${data.notes}` : null,
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    `Regards,\n${ACADEMY_NAME}`,
  ].join('\n\n');
};

export const buildEnrollmentRejectedMessage = (data: EnrollmentMessageData) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `After careful review, we are unable to proceed with the enrollment for your ${relation}, ${data.studentName}, in the ${data.program} program at this time.`,
    compactLines([
      data.notes ? `Reason: ${data.notes}` : null,
      `For further clarification or alternative options, please feel free to contact us.`,
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    `Regards,\n${ACADEMY_NAME}`,
  ].join('\n\n');
};

/* =========================
   MASTER SWITCH
========================= */

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

/* =========================
   PORTAL MESSAGE
========================= */

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
    `Admission has been successfully completed for your ${relation}, ${data.studentName}, in the ${data.program} program.`,
    [
      'Student Portal Login Details',
      `• Portal: ${data.portalUrl}`,
      `• Login ID: ${data.loginId}`,
      `• Default Password: ${
        data.defaultPassword || STUDENT_PORTAL_DEFAULT_PASSWORD
      }`,
    ].join('\n'),
    `For security reasons, please log in and change the default password immediately.`,
    buildAcademyContactDetails(),
    `Welcome to ${ACADEMY_NAME}.`,
  ].join('\n\n');
};
