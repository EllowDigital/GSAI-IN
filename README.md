# 🌟 Ghatak Sports Academy India™ (GSAI) Platform
# ISO 9001:2015 Certified Martial Arts Management System

<div align="center">

A modern platform for martial arts academy administration, belt progression,
student management, and fitness tracking.

</div>

------------------------------------------------------------

📖 PROJECT OVERVIEW

The GSAI Platform is a full-featured martial arts management system offering:

- Student registration & profiles
- Belt progression workflow
- Admin dashboard
- Public academy portal
- Examination management
- Fitness and training monitoring

------------------------------------------------------------

🏛️ ACADEMY BACKGROUND

Ghatak Sports Academy India (GSAI) integrates:

- Karate
- Mixed Martial Arts (MMA)
- Kalaripayattu
- Modern Fitness Training

Recognitions:
- Government of India
- Fit India Movement
- Khelo India Initiative

------------------------------------------------------------

🛠️ TECH STACK

Category            | Technologies
--------------------|---------------------------------------------
Frontend            | React, TypeScript, Vite
Styling             | Tailwind CSS, Lucide Icons
Backend / Database  | Supabase (PostgreSQL, Auth, Realtime)
Testing             | Vitest, Jest, React Testing Library
CI/CD               | Netlify, GitHub Actions
PWA                 | Vite PWA Plugin (Custom Install Flow)

------------------------------------------------------------

✨ KEY FEATURES

🥋 Belt Progression System
- Drag-and-drop interface for belt exams and student ranking
- Supabase-powered dynamic workflows

📱 Progressive Web App (PWA)
- Fully installable
- Custom beforeinstallprompt logic for admin routes

🔐 Role-Based Authentication
- Supabase Auth
- Session persistence via sessionStorage

🌍 Internationalization Support
- English
- Hindi
- Urdu
- Arabic

🧪 Testing Pipeline
- Unit and integration tests with Vitest & RTL

------------------------------------------------------------

🚀 GETTING STARTED

1. PREREQUISITES
- Node.js v20 recommended
- NPM or Yarn

2. ENVIRONMENT CONFIGURATION
Create `.env` or `.env.local`:

VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

4. ADMIN PWA SESSION RULES
- Installed PWAs launch at `/admin/dashboard`; if there is no active session you are redirected to `/admin/login` automatically.
- Regular browser refreshes keep the Supabase session alive because tokens are stored in `sessionStorage`.
- Fully closing the tab/PWA (or launching it fresh) purges the session, so the next load lands on the login screen.
- Netlify deploys must define the same `VITE_SUPABASE_*` variables; never commit a `.env` file to the repository.

3. INSTALLATION & DEVELOPMENT

# Install dependencies
npm install

# Start local development server
npm run dev

# Lint code
npm run lint

# Run test suite
npm run test

------------------------------------------------------------

📦 DEPLOYMENT (NETLIFY)

- Build command handled via netlify.toml
- Node runtime pinned automatically
- Add environment variables in Netlify dashboard:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY

LOVABLE.DEV SUPPORT:
lovable-tagger auto-activates when:
LOVABLE_DEV_SERVER=true

------------------------------------------------------------

📞 CONTACT & SUPPORT

EllowDigital Enterprise
Developer: Sarwan Yadav
Email: ghatakgsai@gmail.com
Location: Indira Nagar, Lucknow, Uttar Pradesh

------------------------------------------------------------

📄 LICENSE

MIT License  
See LICENSE file for details.

© 2025 EllowDigital Enterprise
