* [ ]  Ensure backlinks/next/prev on blog/news WHEN multiple pages enabled

## Semantic HTML & Accessibility

- [X] All sections wrapped in `<section>`, `<main>`, `<footer>`, etc.
- [X] Proper heading hierarchy: h1 (once/page), h2/h3 sub-levels
- [X] ARIA labels for improved accessibility where relevant

## Performance & Best Practices

- [X] Images: use correct format (webp), optimized
- [X] Assets served with caching/ETag (inherit from hosting setup)
- [X] CSS: TailwindCSS only loads critical classes (tree-shaken)
- [ ] Route-based code splitting (React.lazy/Suspense if code grows)
- [ ] CDN usage for assets: recommend Netlify/Lovable CDN or similar

## Monitoring & Tools

- [X] robots.txt present, allows all crawlers
- [ ] sitemap.xml (suggest: add via deployment/server level)
- [X] Google Analytics/Search Console verified

## Proposed Content & Documentation Roadmap

- [ ] **Create Standalone FAQ Page:** Develop a dedicated `/faq` page to host all questions, allowing for categorization and better user navigation.
- [ ] **Develop Program-Specific Pages:** Build out detailed pages for each core program (e.g., `/programs/karate`, `/programs/mma`), covering curriculum, coach profiles, and schedules.
- [ ] **"Getting Started" Guide:** Create a comprehensive guide for new members detailing the enrollment process, what to bring, and academy etiquette.
- [ ] **Expand Blog/News Content:** Regularly publish articles on training tips, nutrition advice for athletes, and recaps of recent events to engage the community and attract organic traffic.
