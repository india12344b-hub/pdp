# PDP — Live Data / Cloudflare setup

This version removes the demo candidate from the real candidate journey.

## 1. Keep the existing React/Vite project
Copy the updated `src/` files into the existing PDP project. Do not replace your existing `package.json` or build settings.

## 2. Create Cloudflare storage
Run from the project root:

```bash
npx wrangler d1 create pdp-db
npx wrangler r2 bucket create pdp-media
```

Put the returned D1 database ID into `wrangler.toml` in place of `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

## 3. Create the tables

```bash
npx wrangler d1 execute pdp-db --remote --file=schema.sql
```

## 4. Build and deploy

```bash
npm run build
npx wrangler deploy
```

The existing PDP Wrangler setup already uses `dist` as the static asset directory; this version adds the API Worker in `worker/index.js`.

## What is now persisted

- Candidate profile fields
- Original resume in R2
- Career introduction video in R2
- Proof photos/videos in R2
- Company attached to each proof item
- Experience category + evidence note

The browser also keeps a local fallback so development does not break when the Cloudflare API is not yet deployed.

## Important production step

The current token is an unguessable per-browser profile token. It is suitable for this MVP/live prototype, but before opening candidate registration publicly, add real account authentication (email/OTP or another identity provider). Do not treat the current token mechanism as final production authentication.
