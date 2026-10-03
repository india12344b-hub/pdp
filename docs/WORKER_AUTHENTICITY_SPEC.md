# Worker spec — Media Authenticity records

I could not see `worker/index.js` (it was not in the zip), so I did not edit it. The browser side already works
**without** any worker change: authenticity records are stored on the user's device (IndexedDB `ledger` store).

Until the worker stores them too, recruiters who open a profile on **another device** will see older/unlabelled
tiers ("Declared · not screened") instead of "Captured live" / "Declared · screened". Do the steps below to fix that.
Send me `worker/index.js` and I will write the exact patch.

## 1. D1 table
```sql
CREATE TABLE IF NOT EXISTS authenticity (
  id          TEXT NOT NULL,          -- media id, or "intro"
  token       TEXT NOT NULL,          -- X-PDP-Token owner
  kind        TEXT NOT NULL,          -- "evidence" | "intro"
  tier        TEXT NOT NULL,          -- live | declared | review
  decision    TEXT NOT NULL,          -- accept | review
  sha256      TEXT,
  record_json TEXT NOT NULL,          -- the full record (declaration text, screening, live evidence)
  created_at  TEXT NOT NULL,
  PRIMARY KEY (token, id)
);
CREATE INDEX IF NOT EXISTS idx_auth_token ON authenticity(token);
```
Apply: `npx wrangler d1 execute pdp-db --remote --command "<the SQL above>"`

## 2. Endpoints (same X-PDP-Token auth as /api/media)
| Method | Path | Behaviour |
|---|---|---|
| PUT | `/api/authenticity` | body = record JSON → upsert by (token, record.id); store `tier = record.screening.tier` |
| GET | `/api/authenticity` | returns `[record, …]` for the token (parse `record_json`) |
| DELETE | `/api/authenticity/:id` | delete that row (also delete when `/api/media/:id` or `/api/intro` is deleted) |

## 3. Public profile pages
The public page (`/<pdp-id>`) loads media through the profile owner's token. Return the same `GET /api/authenticity`
data for that profile so recruiters see the real badges. Return **only** these fields to the public:
`id, kind, source, file.sha256, screening.{tier,decision,badges,flags[title only],positives,limits}, declaration.{version,signedAt}` —
never the signer's full name, user-agent or live-evidence device details.

## 4. Strongly recommended next (tamper-proof live capture)
A browser alone cannot prove a "live" photo is live — a determined person can feed a file into the page.
To make "Captured live" hard to fake:
1. `POST /api/capture/start` → worker returns `{ nonce, expiresAt }` (60 s).
2. PDP camera stamps the nonce into the live-evidence log and uploads the photo within that window.
3. Worker checks: nonce valid and unused, upload arrives within the window, file hash matches, then signs
   `HMAC(sha256 | nonce | token | time)` and stores it as `liveEvidence.serverProof`.
Only items carrying a valid `serverProof` should earn full "live" credit.

## 5. Human review queue (for "Under review")
`SELECT … FROM authenticity WHERE tier='review'` → a simple admin page: show file + flags + declaration,
buttons **Clear** (set tier = `declared`) / **Remove proof**.
