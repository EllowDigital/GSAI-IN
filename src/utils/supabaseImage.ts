export type SupabaseImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
};

import { SUPABASE_URL } from '@/services/supabase/constants';

const DEFAULT_QUALITY = 72;

const OBJECT_PUBLIC_PREFIX = '/storage/v1/object/public/';
const RENDER_PUBLIC_PREFIX = '/storage/v1/render/image/public/';
const STORAGE_PREFIX = '/storage/v1/';

function toAbsoluteSupabaseUrl(rawUrl: string): URL | null {
  const value = rawUrl.trim();
  if (!value) return null;

  // Absolute URL.
  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value);
    } catch {
      return null;
    }
  }

  // Relative storage API URLs.
  if (SUPABASE_URL && value.startsWith(STORAGE_PREFIX)) {
    try {
      return new URL(value, SUPABASE_URL);
    } catch {
      return null;
    }
  }

  if (SUPABASE_URL && value.startsWith('storage/v1/')) {
    try {
      return new URL(`/${value}`, SUPABASE_URL);
    } catch {
      return null;
    }
  }

  // Bucket/object paths like "gallery/file.jpg".
  if (SUPABASE_URL && !value.startsWith('/')) {
    try {
      return new URL(`${OBJECT_PUBLIC_PREFIX}${value}`, SUPABASE_URL);
    } catch {
      return null;
    }
  }

  return null;
}

function isSupabaseStorageUrl(url: URL): boolean {
  let configuredHost = '';
  try {
    configuredHost = SUPABASE_URL ? new URL(SUPABASE_URL).hostname : '';
  } catch {
    configuredHost = '';
  }

  const isSupabaseHost =
    url.hostname.endsWith('.supabase.co') ||
    (configuredHost !== '' && url.hostname === configuredHost);

  return (
    isSupabaseHost &&
    (url.pathname.startsWith(OBJECT_PUBLIC_PREFIX) ||
      url.pathname.startsWith(RENDER_PUBLIC_PREFIX))
  );
}

function toTransformEndpoint(url: URL): URL {
  if (url.pathname.startsWith(RENDER_PUBLIC_PREFIX)) {
    return new URL(url.toString());
  }

  if (url.pathname.startsWith(OBJECT_PUBLIC_PREFIX)) {
    const transformed = new URL(url.toString());
    transformed.pathname = transformed.pathname.replace(
      OBJECT_PUBLIC_PREFIX,
      RENDER_PUBLIC_PREFIX
    );
    return transformed;
  }

  return new URL(url.toString());
}

export function optimizeSupabaseImageUrl(
  rawUrl: string | null | undefined,
  options: SupabaseImageOptions = {}
): string {
  if (!rawUrl) return '';

  const resolvedUrl = toAbsoluteSupabaseUrl(rawUrl);
  if (!resolvedUrl) return rawUrl;

  try {
    const url = resolvedUrl;

    if (!isSupabaseStorageUrl(url)) {
      return url.toString();
    }

    const transformUrl = toTransformEndpoint(url);

    const {
      width,
      height,
      quality = DEFAULT_QUALITY,
      format = 'webp',
      resize = 'cover',
    } = options;

    if (width) transformUrl.searchParams.set('width', String(width));
    if (height) transformUrl.searchParams.set('height', String(height));
    if (quality) transformUrl.searchParams.set('quality', String(quality));
    if (format !== 'origin') transformUrl.searchParams.set('format', format);
    if (resize) transformUrl.searchParams.set('resize', resize);

    return transformUrl.toString();
  } catch {
    return rawUrl;
  }
}
