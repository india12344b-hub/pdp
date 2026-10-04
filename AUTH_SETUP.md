# PDP Professional Authentication setup

The Professional Login page now uses the Cloudflare Worker authentication API.

## 1. Google
Create a Google OAuth Web Client ID for the PDP domain and allow the PDP origin.

Build-time frontend variable:
- `VITE_GOOGLE_CLIENT_ID`

Cloudflare Worker runtime variable:
- `GOOGLE_CLIENT_ID`

They should contain the same Google client ID.

## 2. Email OTP
The Worker sends one-time codes through Resend.

Cloudflare Worker secrets:
- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM` — for example `PDP <login@your-verified-domain.com>`

The sending domain must be verified with Resend before production use.

## 3. D1
The Worker lazily creates these tables on first authentication request:
- `accounts`
- `auth_otps`
- `auth_sessions`

It also adds `profiles.account_id` if that column is not already present.

## 4. Flow
Professionals -> Professional Login -> Google or email OTP -> authenticated PDP token -> Resume/PDP creation.

The authenticated token is stored by the existing PDP storage layer and is then used for profile, resume, media and authenticity API calls.

## Important
Do not put `RESEND_API_KEY` in the frontend or `VITE_*` variables. It is a server-side secret only.
