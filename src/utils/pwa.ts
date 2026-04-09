export type PortalPwaScope = 'admin' | 'student' | 'public';

const MANIFEST_BY_SCOPE: Record<PortalPwaScope, string> = {
  admin: '/manifest-admin.webmanifest',
  student: '/manifest-student.webmanifest',
  public: '/manifest.webmanifest',
};

export function getPortalPwaScope(pathname: string): PortalPwaScope {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/student')) return 'student';
  return 'public';
}

export function getManifestHrefForPath(pathname: string): string {
  const scope = getPortalPwaScope(pathname);
  return MANIFEST_BY_SCOPE[scope];
}

export function syncManifestForPath(pathname: string) {
  if (typeof document === 'undefined') return;

  const href = getManifestHrefForPath(pathname);
  const manifestLink = document.querySelector<HTMLLinkElement>(
    'link[rel="manifest"]'
  );

  if (manifestLink) {
    if (manifestLink.getAttribute('href') !== href) {
      manifestLink.setAttribute('href', href);
    }
    return;
  }

  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = href;
  document.head.appendChild(link);
}

export function isPortalLoginPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname === '/student/login';
}
