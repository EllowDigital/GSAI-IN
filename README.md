# 🌟 Welcome to **Ghatak Sports Academy India™ (GSAI)** 🌟

<div align="center">

## 📊 Project Status & Hosting

[![Netlify Status](https://api.netlify.com/api/v1/badges/0fded24e-0eac-4352-bfbe-e89fe368499f/deploy-status)](https://app.netlify.com/projects/ghatakgsai/deploys)
[![GitHub Repo](https://img.shields.io/badge/Source-GitHub-blue?logo=github)](https://github.com/EllowDigital/gsai-curd)
[![Live Website](https://img.shields.io/website?label=Visit%20Site&url=https%3A%2F%2Fghatakgsai.netlify.app)](https://ghatakgsai.netlify.app)

---

## 📦 Repository Insights

| **Metric**        | **Status**                                                                                                                                                            |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 🕒 Last Commit    | [![GitHub last commit](https://img.shields.io/github/last-commit/EllowDigital/gsai-curd?logo=github)](https://github.com/EllowDigital/gsai-curd/commits/main)        |
| 🐛 Open Issues    | [![GitHub issues](https://img.shields.io/github/issues/EllowDigital/gsai-curd?logo=github)](https://github.com/EllowDigital/gsai-curd/issues)                        |
| 🔄 Pull Requests  | [![GitHub pull requests](https://img.shields.io/github/issues-pr/EllowDigital/gsai-curd?logo=github)](https://github.com/EllowDigital/gsai-curd/pulls)               |
| 🍴 Forks          | [![GitHub forks](https://img.shields.io/github/forks/EllowDigital/gsai-curd?style=social&logo=github)](https://github.com/EllowDigital/gsai-curd/network/members)    |
| ⭐ Stars          | [![GitHub stars](https://img.shields.io/github/stars/EllowDigital/gsai-curd?style=social&logo=github)](https://github.com/EllowDigital/gsai-curd/stargazers)         |

</div>

---

## 🥋 About Us

**Ghatak Sports Academy India™ (GSAI)** is a **Government-recognized and ISO 9001:2015 certified institution** committed to empowering individuals through martial arts and self-defense. 💪✨  
We blend **traditional martial arts** with **modern fitness techniques**, helping students unlock their **strength, discipline, and confidence**.  
From kids to professionals, we guide everyone on a journey of **self-mastery and personal growth**.

---

## 👤 Founder’s Message

### **Mr. Nitesh Yadav**  
**Founder & Director** 🥇 *Black Belt 1st Dan* | International/National Gold Medalist | Self-Defense Instructor

> “With decades of experience, I remain dedicated to mentoring the champions of tomorrow.”  
> — **Mr. Nitesh Yadav**

---

## 🥊 Programs Offered

- 🥋 Karate  
- 🦵 Taekwondo  
- 🥊 Boxing  
- 🥋 Kickboxing  
- 🤼 Grappling  
- 🥋 MMA  
- 🕉️ Kalaripayattu  
- 🛡️ Self-Defense  
- 🏋️ Fat Loss Programs  
- 🏏 Cricket & Kabaddi

---

## ❓ Frequently Asked Questions

**💡 Fees**: Contact us for program-wise fees  
**🕒 Schedule**: Morning & evening batches  
**🎯 Trial Classes**: Available for all  
**👶 Age Groups**: Kids to adults  
**🏠 Hostel**: Available  
**📝 Registration**: Online or in-person  
**💸 Discounts**: Yes — seasonal & promotional  
**🤝 Personal Coaching**: Available  
**🔁 Refund Policy**: Varies by program

---

## 📞 Contact Us

📧 Email: [ghatakgsai@gmail.com](mailto:ghatakgsai@gmail.com)  
📞 Phone: +91 63941 35988 | +91 83550 62424

🏢 Main Campus:  
Naubasta Pulia, Takrohi Road, Amrai Gaon, Indira Nagar, Lucknow, U.P. – 226028

🏢 Branch:  
**Fitness & Fun Arena (TCC)**, Hardasi Kheda, Deva Road, near Baba Hospital Road, Matiyari, Lucknow, U.P.

---

## 🏆 Recognitions & Affiliations

- 🇮🇳 Government of India  
- 🏅 Ministry of Youth Affairs & Sports  
- 💪 Fit India Movement  
- 🏃 Khelo India  
- 🏢 MSME Certified  
- ✅ ISO 9001:2015 Certified  
- 🏫 School Games Federation of India  
- 🏋️ Uttar Pradesh Olympic Association  
- 🕉️ UP Kalaripayattu Association  
- 🥋 Taekwondo Federation  

---

## 🧪 Test Coverage & CI/CD

We maintain code quality through continuous integration pipelines and testing tools.

- ✅ **CI/CD** via [Netlify Deploys](https://app.netlify.com/projects/ghatakgsai)
- 🧪 **Planned Test Coverage** (unit + integration) using:
  - `Vitest` or `Jest`
  - `React Testing Library`
  - `Cypress` for E2E (coming soon)
- 🛠 **Linting & Formatting**:
  - ESLint
  - Prettier
- 🔄 GitHub Actions (CI/CD pipeline under development)

---

## 🛠️ Local Development & QA

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server (defaults to port 8080) |
| `npm run lint` | ESLint over `.ts/.tsx/.js/.jsx` |
| `npm run test` | Headless Vitest run (jsdom, globals, coverage) |
| `npm run test:watch` | Interactive Vitest watcher |
| `npm run build` | Production Vite build plus sitemap generation |
| `npm run preview` | Serve the built app locally via Vite preview |
| `npm run generate:sitemap` | Run the Supabase-powered sitemap generator |

> Tip: copy `.env` to `.env.local` and adjust the Supabase values before running `npm run dev`.

There are no Git hooks included; feel free to wire up Husky/lefthook if you need automated checks before commits.

---

## 🚀 Deployment Profiles

### Netlify (production + previews)

- `netlify.toml` pins the build command (`npm run build`), publish directory (`dist`), and Node 20 runtime so installs stay deterministic.
- Required environment variables (set in Netlify UI or CLI):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
  - `SUPABASE_URL` and `SUPABASE_ANON_KEY` (for `generate-sitemap.js`) — can reuse the same values as the Vite vars.
- Optional: override `SITE_URL` if you use a custom domain; otherwise Netlify injects `URL`/`DEPLOY_PRIME_URL` automatically and the sitemap falls back to those.

### Lovable.dev sandbox

- The `lovable-tagger` plugin now loads **only** when `LOVABLE_DEV_SERVER=true` and `npm run dev` runs in development mode.
- Set `LOVABLE_DEV_SERVER=true` in the Lovable environment (already provided via `netlify.toml` template env). Local devs outside Lovable do not need the plugin.
- Keep `lovable-tagger` installed (devDependency) so component tagging works when you open the repo inside Lovable.

### Manual static hosting

- Run `npm run build` and deploy the `dist/` folder.
- Ensure the same Supabase environment variables are available when running `npm run generate:sitemap`; otherwise only static marketing routes are emitted.

---

## 📱 PWA Install & Deferred Prompt Flow

- The browser’s `beforeinstallprompt` event is intercepted in `src/App.tsx` so we can show a custom CTA (`PWAInstallToast`).
- The toast appears only on admin routes, when the app isn’t already installed, and after the event fires. Dismissing or successfully installing clears the saved prompt.
- To customize the copy or placement, edit `src/components/PWAInstallToast.tsx`. If you prefer the default browser banner, remove the `event.preventDefault()` call in `App.tsx`.

---

## 🥋 Belt Progression Workflow

- **Database schema**: `supabase/migrations/20251117120000_add_belt_progression.sql` creates `belt_levels` (ranked colors + requirements) and `student_progress` (status per student/belt). `20251117153000_backfill_belt_links.sql` links each belt to its successor via `next_level_id` so promotions know the next color.
- **Backend access control**: RLS policies in `supabase/migrations/20251117143000_update_progression_policies.sql` allow admins/instructors to read and update belts, statuses, and evidence with optimistic locking via `is_progress_status_unchanged()`.
- **Frontend hooks**: `src/hooks/useBeltLevels.ts` fetches belt metadata (id, color, rank). `src/hooks/useProgressionQuery.ts` handles listing, filtering, drag/drop status changes, uploading evidence, *assigning* students to belts, and *promoting* them to the next level.
- **UI flow**: Open **Admin → Students → Progression**. Use the new “Assign student” button to pick any roster student + belt + starting status. Each card shows the current belt, evidence, and status chips. When a card is in **Passed**, click “Promote to …” to move the student to the next color—this resets the status to “Needs work” and keeps the history in Supabase.
- **Filters**: Search by name/program/notes, slice by program, belt, or coach, and reset quickly via the header button. Columns map to the four statuses (`needs_work`, `ready`, `passed`, `deferred`).

---

## 🔐 Supabase Environment Variables

Create an `.env` (or `.env.local`) with the following client-safe values before running the app locally or deploying:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=project-id-or-reference
```

These map to `src/integrations/supabase` helpers and the admin data hooks (`useRealtime`, `useEventsQuery`, etc.). Never commit service-role keys—only the anon/publishable key belongs here.

---

## 🌍 Internationalization

We aim to serve a global audience with support for multiple languages (in development):

- 🌐 Default: English (🇺🇸)
- 🌏 Planned: Hindi (🇮🇳), Urdu (🇵🇰), Arabic (🇸🇦)
- 📦 Tools:
  - `i18next`
  - `react-i18next`
  - Locale-based route detection & fallback

---

## 📄 License

This project is licensed under the **MIT License**.

```text
MIT License

Copyright (c) 2025 EllowDigitals

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
