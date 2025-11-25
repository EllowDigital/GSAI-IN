Public folder contents (GSAI-IN)

Structure (professional & formal):

- `/assets/` - static site assets (images, icons, illustrations). Keep organized into subfolders by purpose: `img/`, `slider/`, `gsai-illustrations/`, `af_img/`.
- `/favicon_io/` - favicon image set generated for multiple sizes.
- `/pages/` - small static pages used by external services (e.g., `success.html`, `privacy.html`). These are intentionally minimal and are kept separate from the React SPA to make form redirects and crawlers simpler.
- `/manifest.webmanifest` - PWA manifest describing how the site behaves when installed.
- `/robots.txt` - crawler rules.
- `/sitemap.xml` - generated sitemap for SEO.
- `/_redirects` - Netlify redirects file (if using Netlify).

Notes & best practices:
- Avoid moving or renaming files that are referenced directly by forms or external providers (for example, the contact form posts to `pages/success.html` or `/?success=1`). If you rename them, update references in `src` and any third-party forms.
- Keep static pages in `public/pages/` so they remain accessible at predictable paths (e.g., `/pages/success.html`).
- Serve `manifest.webmanifest` with the correct content-type on your host for reliable PWA behavior.

If you want, I can further reorganize `assets/` into strictly named subfolders and produce a small script to validate that no code references break. Approve and I will proceed.