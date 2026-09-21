# PDP — Professional Digital Profile

**Working positioning:** Professional Digital Profile
**Working tagline:** Your Performance Display Platform — Where Skills Are Visually Verified.

## Product direction
PDP is a recruiter-facing professional showcase platform, not a conventional resume/social network.

Core loops:
- Candidates create and showcase professional profiles for free initially.
- Recruiters/companies submit openings; PDP matches openings to the best candidate profiles.
- Paid candidate Spotlight placements can be added later.
- Company subscriptions become the primary monetisation path.

## Locked product principles
1. Mobile-first, premium/dark/cinematic visual language.
2. Featured career-introduction video is prominent on a candidate PDP.
3. Work experience uses expandable company cards.
4. Recruiters can contact candidates through permitted contact options.
5. No industry-comparison score is shown publicly on recruiter-facing PDPs.
6. Candidate media is strictly human-created/original. AI-generated images/videos are not permitted.
7. Every uploaded image/video goes through a local, API-free media screening pipeline.
8. False-positive flags must have a "Raise Concern" appeal path and human/admin review.
9. We do not automatically freeze an account solely because a detector is uncertain.
10. AI matching should be designed to run locally/open-source first; external APIs are optional fallbacks only if explicitly enabled later.

## Suggested stack for the API-free-first build
- Web: Next.js/React
- API: Node.js + Fastify/Express
- Database: PostgreSQL (local/dev) or Cloudflare D1 when deploying to Cloudflare
- Object storage: Cloudflare R2
- Search: PostgreSQL full-text initially; later Meilisearch/OpenSearch if needed
- AI/NLP: local/open-source models via Ollama or Transformers
- Media moderation: local metadata/provenance checks + image/video forensic models; uncertain cases go to review
- Auth: email/password or passwordless email; SMS/WhatsApp can be added later

## Important moderation note
No detector can reliably prove that every image/video is human-created. PDP should therefore use a confidence/risk workflow:

PASS → publish
REVIEW → temporarily hold media + let candidate raise concern
CONFIRMED VIOLATION → apply the published policy, including the proposed 7-day account freeze

This protects genuine candidates from accidental automated flags.
