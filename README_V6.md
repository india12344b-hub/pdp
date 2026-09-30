# PDP source update — navigation + professional profile URLs

Changes in this source:
- Page2.jsx renamed to ProfessionalsPage.jsx
- Page3.jsx renamed to PdpProfilePage.jsx
- CandidateMediaPage.jsx renamed to ProofOfWorkPage.jsx
- page2.css renamed to professionals.css
- page3.css renamed to pdpProfile.css
- Added SiteHeader.jsx: common sticky PDP navigation across homepage and inner pages
- Added root-level profile routing: /<accountId> (for example /navn5678)
- Added accountId/profilePath helpers
- Resume page now captures mobile number and shows the professional root URL
- Added public/_redirects for SPA deep-link fallback
- Added public/favicon.ico using the PDP logo

Important:
- The public root-level profile URL is the canonical presentation format.
- The current uploaded source does not include package.json/wrangler configuration, so Cloudflare deployment cannot be fully build-tested from this ZIP alone.
- The public profile URL is routed client-side. The production API still needs to resolve the accountId to the corresponding candidate record for multi-candidate public profiles.
