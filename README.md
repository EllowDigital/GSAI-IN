# Ghatak Sports Academy India (GSAI) Platform

A responsive web platform for Ghatak Sports Academy India, bringing public academy information and digital administration workflows into one interface.

> This repository contains application source code. Academy branding, certifications, affiliations, and third-party assets should be verified with the relevant rights holder before reuse.

## Project capabilities

The application is designed to support workflows such as:

- Student registration and profile management
- Belt progression and examination workflows
- Administrative dashboards
- Training, fitness, and academy information pages
- Authentication and data-backed features built around Supabase
- Responsive layouts for desktop and mobile browsers

Available features depend on the active deployment and its configured services.

## Technology

- React, TypeScript, and Vite
- Tailwind CSS and reusable UI components
- Supabase / PostgreSQL for configured data and authentication features
- Vitest and frontend quality tooling
- Netlify-based deployment configuration

## Requirements

- Node.js and npm (use the version supported by the lockfile and build environment)
- A development Supabase project for features that require a backend
- Environment variables appropriate for your own development deployment

## Local development

```bash
git clone https://github.com/EllowDigital/GSAI-IN.git
cd GSAI-IN
npm ci
npm run dev
```

Create a local environment file based on `.env.example` and replace placeholders with values from services you control. Never commit `.env` or real credentials.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Run the configured production checks and build |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest tests |
| `npm run sitemap` | Generate the sitemap |

Check `package.json` for the authoritative command list.

## Environment and security

- Values with the `VITE_` prefix are bundled into browser code. Treat them as public.
- Supabase browser clients should use only the project's intended public/publishable key and appropriate database policies.
- Never put `RESEND_API_KEY`, service-role keys, database passwords, email-provider secrets, or other privileged credentials in a `VITE_*` variable.
- Keep email-sending and administrative operations on a trusted server or serverless function. Verify authentication and authorization on every privileged operation.
- Use a separate development project and synthetic data when testing.

## Deployment

The repository contains Netlify configuration. Connect the repository to a Netlify site, configure environment variables in the hosting dashboard, and use the build command documented in `package.json`. Verify all configured services and security policies before promoting a deployment to production.

## Contributing

Before making a substantial change, open an issue or contact the project maintainer to agree on the scope. Do not include customer data, private credentials, or production exports in issues or pull requests.

## License and third-party assets

See [LICENSE](LICENSE) for the repository's current usage notice. Third-party packages, fonts, icons, images, brand assets, and content may have separate terms. Do not assume this client-facing project is open source unless the applicable rights holder grants permission.
