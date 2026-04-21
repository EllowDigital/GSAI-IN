export type SupabaseImageOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'origin' | 'webp' | 'avif';
  resize?: 'cover' | 'contain' | 'fill';
};

const DEFAULT_QUALITY = 72;

function isSupabaseStorageUrl(url: URL): boolean {
  return (
    url.hostname.endsWith('.supabase.co') &&
    url.pathname.includes('/storage/v1/object/')
  );
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

    const {
      width,
      height,
      quality = DEFAULT_QUALITY,
      format = 'webp',
      resize = 'cover',
    } = options;

    if (width) url.searchParams.set('width', String(width));
    if (height) url.searchParams.set('height', String(height));
    if (quality) url.searchParams.set('quality', String(quality));
    if (format !== 'origin') url.searchParams.set('format', format);
    if (resize) url.searchParams.set('resize', resize);

    return url.toString();
  } catch {
    return rawUrl;
  }
}
