# PDP Recruiter Page Update — 2026-10-06

## What was fixed
- `/recruiters` now uses the cinematic recruiter landing page design.
- `/recruiters/login` and `/recruiter-login` now render the dedicated recruiter login UI.
- `/` remains the normal PDP homepage route in `src/main.jsx`.
- Recruiter landing page has no job-opening upload form.
- Added PDP Pal as a major recruiter USP: requirement understanding, talent discovery guidance, evidence explanation and shortlist support.
- Added responsive layouts for desktop, laptop, tablet and mobile.

## Important deployment note
The previous recruiter redesign ZIP contained only source changes. If Cloudflare is serving an older `dist/` bundle, changing `src/` alone will not change the live website. Run a fresh production build from this project and deploy the newly generated `dist/` directory.

Recommended local check:
1. `npm install`
2. `npm run build`
3. `npm run preview`
4. Check `/`, `/recruiters`, `/recruiters/login`, and `/recruiter-login`.
5. Deploy the fresh `dist/` output to Cloudflare.
