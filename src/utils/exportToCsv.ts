/**
 * Utility to export data arrays to CSV for Admin Dashboard
 */

type FeeItem = {
  student?: {
    name?: string;
    program?: string;
    default_monthly_fee?: number;
  };
  fee?: {
    month?: number;
    year?: number;
    monthly_fee?: number;
    paid_amount?: number;
    balance_due?: number;
    status?: string;
    notes?: string;
  };
};

type StudentItem = {
  name?: string;
  aadhar_number?: string;
  program?: string;
  join_date?: string;
  parent_name?: string;
  parent_contact?: string;
};

type NewsItem = {
  id?: string;
  title?: string;
  short_description?: string;
  date?: string;
  status?: string;
  image_url?: string;
  created_at?: string;
};

type BlogItem = {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  published_at?: string;
  created_at?: string;
  image_url?: string;
};

type GalleryItem = {
  id?: string;
  image_url?: string;
  caption?: string;
  tag?: string;
  created_at?: string;
};

/**
 * Escapes a value for CSV, handling commas and quotes
 */
function escapeCSV(value: any): string {
  if (value == null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Triggers CSV file download in browser
 */
function triggerCsvDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports fee records to CSV
 */
export function exportFeesToCsv(items: FeeItem[], month: number, year: number) {
  if (!Array.isArray(items) || items.length === 0) return;

  const headers = [
    'Student Name',
    'Program',
    'Month',
    'Year',
    'Monthly Fee',
    'Paid Amount',
    'Balance Due',
    'Status',
    'Notes',
  ];

  const rows = items.map((item) => {
    const student = item.student || {};
    const fee = item.fee || {};

    return [
      escapeCSV(student.name),
      escapeCSV(student.program),
      escapeCSV(fee.month ?? month),
      escapeCSV(fee.year ?? year),
      escapeCSV(fee.monthly_fee ?? student.default_monthly_fee ?? ''),
      escapeCSV(fee.paid_amount ?? ''),
      escapeCSV(fee.balance_due ?? ''),
      escapeCSV(fee.status ?? 'unpaid'),
      escapeCSV(fee.notes ?? ''),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerCsvDownload(csvContent, `fees_${month}_${year}.csv`);
}

/**
 * Exports student records to CSV
 */
export function exportStudentsToCsv(students: StudentItem[]) {
  if (!Array.isArray(students) || students.length === 0) return;

  const headers = [
    'Name',
    'Aadhar Number',
    'Program',
    'Join Date',
    'Parent Name',
    'Parent Contact',
  ];

  const rows = students.map((stu) =>
    [
      escapeCSV(stu.name),
      escapeCSV(stu.aadhar_number),
      escapeCSV(stu.program),
      escapeCSV(stu.join_date),
      escapeCSV(stu.parent_name),
      escapeCSV(stu.parent_contact),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerCsvDownload(csvContent, `students.csv`);
}

/**
 * Exports news records to CSV
 */
export function exportNewsToCsv(news: NewsItem[]) {
  if (!Array.isArray(news) || news.length === 0) return;

  const headers = [
    'Title',
    'Short Description',
    'Date',
    'Status',
    'Created At',
  ];

  const rows = news.map((item) =>
    [
      escapeCSV(item.title),
      escapeCSV(item.short_description),
      escapeCSV(item.date),
      escapeCSV(item.status),
      escapeCSV(item.created_at),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerCsvDownload(csvContent, `news.csv`);
}

/**
 * Exports blog records to CSV
 */
export function exportBlogsToCsv(blogs: BlogItem[]) {
  if (!Array.isArray(blogs) || blogs.length === 0) return;

  const headers = ['Title', 'Description', 'Published At', 'Created At'];

  const rows = blogs.map((item) =>
    [
      escapeCSV(item.title),
      escapeCSV(item.description),
      escapeCSV(item.published_at),
      escapeCSV(item.created_at),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerCsvDownload(csvContent, `blogs.csv`);
}

/**
 * Exports gallery records to CSV
 */
export function exportGalleryToCsv(images: GalleryItem[]) {
  if (!Array.isArray(images) || images.length === 0) return;

  const headers = ['Caption', 'Tag', 'Image URL', 'Created At'];

  const rows = images.map((item) =>
    [
      escapeCSV(item.caption),
      escapeCSV(item.tag),
      escapeCSV(item.image_url),
      escapeCSV(item.created_at),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  triggerCsvDownload(csvContent, `gallery.csv`);
}

/**
 * Types for progression export
 */
type ProgressionItem = {
  studentName?: string;
  program?: string;
  beltColor?: string;
  beltRank?: number;
  status?: string;
  stripeCount?: number;
  assessmentDate?: string;
  coachNotes?: string;
};

type PromotionItem = {
  studentName?: string;
  program?: string;
  fromBelt?: string;
  toBelt?: string;
  promotedAt?: string;
  notes?: string;
};

/**
 * Exports student progression records to CSV
 */
export function exportProgressionToCsv(items: ProgressionItem[]) {
  if (!Array.isArray(items) || items.length === 0) return;

  const headers = [
    'Student Name',
    'Program',
    'Current Belt',
    'Belt Rank',
    'Status',
    'Stripes',
    'Assessment Date',
    'Coach Notes',
  ];

  const rows = items.map((item) =>
    [
      escapeCSV(item.studentName),
      escapeCSV(item.program),
      escapeCSV(item.beltColor),
      escapeCSV(item.beltRank),
      escapeCSV(item.status),
      escapeCSV(item.stripeCount ?? 0),
      escapeCSV(item.assessmentDate),
      escapeCSV(item.coachNotes),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const date = new Date().toISOString().split('T')[0];
  triggerCsvDownload(csvContent, `progression_report_${date}.csv`);
}

/**
 * Exports promotion history to CSV
 */
export function exportPromotionHistoryToCsv(items: PromotionItem[]) {
  if (!Array.isArray(items) || items.length === 0) return;

  const headers = [
    'Student Name',
    'Program',
    'From Belt',
    'To Belt',
    'Promotion Date',
    'Notes',
  ];

  const rows = items.map((item) =>
    [
      escapeCSV(item.studentName),
      escapeCSV(item.program),
      escapeCSV(item.fromBelt),
      escapeCSV(item.toBelt),
      escapeCSV(item.promotedAt),
      escapeCSV(item.notes),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const date = new Date().toISOString().split('T')[0];
  triggerCsvDownload(csvContent, `promotion_history_${date}.csv`);
}
