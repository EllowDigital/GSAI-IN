
# Technical SEO Checklist – Ghatak Sports Academy India

_Last updated: 15 June 2025_

A tailored checklist for this project's React/Tailwind/SPA codebase.

## Meta/Tags
- [x] Unique, optimized title/description on each page (`Seo` component)
- [x] Canonical URLs and hreflang set globally
- [x] Meta OpenGraph/Twitter cards for social sharing
- [x] Page-specific JSON-LD structured data as needed

## Structured Data Types
- [x] Organization (`SportsOrganization`)
- [ ] Article (for news/blog pages: implement if/when editable)
- [x] FAQ (for FAQSection — **Implemented via JSON-LD on homepage**)
- [ ] Event (for EventsSection: recommend on future update)

## Images
- [x] Descriptive alt text for all critical images
- [x] File names readable, hyphenated
- [x] `loading="lazy"` for all non-above-the-fold images

## Internal Linking & URLs
- [x] Use semantic, descriptive anchor text
- [x] Link frequently to homepage & top sections (navbar, footer, related sections)
- [ ] Ensure backlinks/next/prev on blog/news WHEN multiple pages enabled

## Semantic HTML & Accessibility
- [x] All sections wrapped in `<section>`, `<main>`, `<footer>`, etc.
- [x] Proper heading hierarchy: h1 (once/page), h2/h3 sub-levels
- [x] ARIA labels for improved accessibility where relevant

## Performance & Best Practices
- [x] Images: use correct format (webp), optimized
- [x] Assets served with caching/ETag (inherit from hosting setup)
- [x] CSS: TailwindCSS only loads critical classes (tree-shaken)
- [ ] Route-based code splitting (React.lazy/Suspense if code grows)
- [ ] CDN usage for assets: recommend Netlify/Lovable CDN or similar

## Monitoring & Tools
- [x] robots.txt present, allows all crawlers
- [ ] sitemap.xml (suggest: add via deployment/server level)
- [ ] Google Analytics/Search Console verified
- [ ] Lighthouse: Run before/after deploy, resolve major warnings

---

## Proposed Content & Documentation Roadmap
- [ ] **Create Standalone FAQ Page:** Develop a dedicated `/faq` page to host all questions, allowing for categorization and better user navigation.
- [ ] **Develop Program-Specific Pages:** Build out detailed pages for each core program (e.g., `/programs/karate`, `/programs/mma`), covering curriculum, coach profiles, and schedules.
- [ ] **"Getting Started" Guide:** Create a comprehensive guide for new members detailing the enrollment process, what to bring, and academy etiquette.
- [ ] **Expand Blog/News Content:** Regularly publish articles on training tips, nutrition advice for athletes, and recaps of recent events to engage the community and attract organic traffic.

---
**Use this as part of ongoing code reviews and deployments.**
