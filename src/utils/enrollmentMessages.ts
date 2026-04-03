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

export const buildEnrollmentReceivedMessage = (
  data: EnrollmentMessageData
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `We have received the enrollment request for your ${relation}, ${data.studentName}, for the ${data.program} program at ${ACADEMY_NAME}.`,
    buildRegistrationDetails(data),
    'Our team will review the request and contact you shortly regarding batch timing, trial class, and the next steps.',
    buildAcademyContactDetails(),
    `Thank you for choosing ${ACADEMY_NAME}.`,
  ].join('\n\n');
};

export const buildEnrollmentContactedMessage = (
  data: EnrollmentMessageData
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `This is an update regarding the enrollment request for your ${relation}, ${data.studentName}, in the ${data.program} program at ${ACADEMY_NAME}.`,
    buildRegistrationDetails(data),
    compactLines([
      'Our team is ready to assist you further. Please reply on this WhatsApp or call us to confirm the next step for trial class, batch timing, and admission guidance.',
      data.notes ? `Admin Note: ${data.notes}` : null,
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    'We will be happy to help you complete the process smoothly.',
  ].join('\n\n');
};

export const buildEnrollmentApprovedMessage = (
  data: EnrollmentMessageData
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `We are pleased to inform you that the enrollment request for your ${relation}, ${data.studentName}, in the ${data.program} program has been approved by ${ACADEMY_NAME}.`,
    buildRegistrationDetails(data),
    compactLines([
      'Please keep your registered mobile number active. Our team will guide you for final joining formalities and student portal access.',
      data.notes ? `Admin Note: ${data.notes}` : null,
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    'Thank you for your trust in our academy.',
  ].join('\n\n');
};

export const buildEnrollmentRejectedMessage = (
  data: EnrollmentMessageData
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `After review, we are unable to proceed with the enrollment request for your ${relation}, ${data.studentName}, in the ${data.program} program at this time.`,
    buildRegistrationDetails(data),
    compactLines([
      data.notes ? `Reason / Note: ${data.notes}` : null,
      'If you would like more clarity or wish to discuss the next available option, please contact us directly.',
    ]).join('\n\n'),
    buildAcademyContactDetails(),
    `Thank you for your understanding.\n\n${ACADEMY_NAME}`,
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
    password: string;
    portalUrl: string;
  }
) => {
  const relation = getStudentRelation(data.gender);

  return [
    `Namaste ${data.parentName} ji,`,
    `Admission has been completed successfully for your ${relation}, ${data.studentName}, in the ${data.program} program at ${ACADEMY_NAME}.`,
    buildRegistrationDetails(data),
    [
      'Student Portal Login',
      `• Portal: ${data.portalUrl}`,
      `• Login ID: ${data.loginId}`,
      `• Password: ${data.password}`,
    ].join('\n'),
    'Please log in and change the password after the first sign-in.',
    buildAcademyContactDetails(),
    `Welcome to ${ACADEMY_NAME}.`,
  ].join('\n\n');
};