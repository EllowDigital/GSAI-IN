export type SupabaseImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
};

const DEFAULT_QUALITY = 72;

const OBJECT_PUBLIC_PREFIX = '/storage/v1/object/public/';
const RENDER_PUBLIC_PREFIX = '/storage/v1/render/image/public/';

function isSupabaseStorageUrl(url: URL): boolean {
  return (
    url.hostname.endsWith('.supabase.co') &&
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

  try {
    const url = new URL(rawUrl);

    if (!isSupabaseStorageUrl(url)) {
      return rawUrl;
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
