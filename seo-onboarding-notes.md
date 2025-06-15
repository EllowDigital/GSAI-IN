
# SEO Onboarding – For Developers & Content Managers

> Welcome to the SEO ops for Ghatak Sports Academy India. This file summarizes **how to maintain and extend world-class SEO**.

---

## Page Meta Management
- All page meta titles, descriptions, canonical, social open graph, etc are controlled by `src/components/Seo.tsx`.
- Add or edit meta for a new page by including a `<Seo />` at the *top level* of the page, and customizing its props.
- For blog/news/events: implement structured data via the `structuredData` prop (see schema.org examples).

## Structured Data
- Main org JSON-LD added on homepage; add FAQ/Article/Event JSON-LD to respective pages/components.
- For FAQs, export an array of question/answer JSON objects and pass via the Seo component. 

## Images & Media
- Alt text for every image is required. Use real-world, descriptive alternatives (not "image1.webp").
- Use .webp or modern formats for all new assets.
- Add `loading="lazy"` on images *unless above the fold*.

## Content, Linking & Headings
- H1 should only appear ONCE per page. Each major section should start with H2.
- Use semantic HTML (section, article, nav, header, footer, main...).
- Internal links: update nav/footer when new main content is added.

## Performance
- All images and heavy assets are lazy-loaded.
- Tailwind ensures critical above-the-fold CSS.
- For new features, consider React.lazy/Suspense for code splitting.

## Monitoring & Tools
- Use Google Search Console & Lighthouse regularly to audit site (best: >90/100 for SEO, a11y, performance).
- Ensure canonical URLs (via Seo component) are always up to date.

## Extending/Fixing SEO
- When adding new features or changing routes, always:
  1. Add a proper page `<Seo />` config at the top of the React page.
  2. Confirm semantic HTML structure.
  3. Run an automated SEO audit (Lighthouse, ScreamingFrog, etc).
  4. Update `seo-checklist.md` if new types of structured data or routes are added.

---

**Any dev/content editor should read this before making content, menu, or meta changes.**
