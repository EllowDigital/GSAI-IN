import { supabase } from '@/integrations/supabase/client';

const CERTIFICATE_PUBLIC_PREFIX = '/storage/v1/object/public/certificates/';
const CERTIFICATE_SIGNED_PREFIX = '/storage/v1/object/sign/certificates/';

const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-');

export const extractCertificateStoragePath = (certificateUrl: string): string | null => {
  if (!certificateUrl) return null;

  if (!certificateUrl.startsWith('http')) {
    return certificateUrl.replace(/^certificates\//, '');
  }

  try {
    const parsed = new URL(certificateUrl);

    const publicIndex = parsed.pathname.indexOf(CERTIFICATE_PUBLIC_PREFIX);
    if (publicIndex !== -1) {
      return decodeURIComponent(parsed.pathname.slice(publicIndex + CERTIFICATE_PUBLIC_PREFIX.length));
    }

    const signedIndex = parsed.pathname.indexOf(CERTIFICATE_SIGNED_PREFIX);
    if (signedIndex !== -1) {
      return decodeURIComponent(parsed.pathname.slice(signedIndex + CERTIFICATE_SIGNED_PREFIX.length));
    }
  } catch {
    // Ignore URL parser errors and use regex fallback.
  }

  const pathMatch = certificateUrl.match(/certificates\/(.+?)(?:\?|#|$)/);
  return pathMatch?.[1] ? decodeURIComponent(pathMatch[1]) : null;
};

export const downloadCertificateFile = async ({
  certificateUrl,
  fileName,
}: {
  certificateUrl: string;
  fileName: string;
}) => {
  const storagePath = extractCertificateStoragePath(certificateUrl);

  if (!storagePath) {
    throw new Error('Invalid certificate path.');
  }

  const safeName = sanitizeFileName(fileName || 'certificate.pdf');

  const { data, error } = await supabase.storage
    .from('certificates')
    .createSignedUrl(storagePath, 3600, { download: safeName });

  if (error || !data?.signedUrl) {
    throw error || new Error('Failed to create certificate URL.');
  }

  const response = await fetch(data.signedUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch certificate file.');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(objectUrl);
};
