# Core Data Model

## users
id, email, phone, password_hash, status, created_at, updated_at

## candidate_profiles
id, user_id, pdp_number, slug, name, headline, summary, location, experience_years, visibility, created_at, updated_at

## companies
id, name, domain, logo_url, verified, created_at

## experiences
id, candidate_id, company_id, title, start_date, end_date, current, summary, details

## projects
id, candidate_id, title, description, role, technologies, proof_status

## achievements
id, candidate_id, title, description, date, proof_status

## skills
id, name

## candidate_skills
candidate_id, skill_id, level, years

## media
id, candidate_id, type, object_key, sha256, metadata_json, moderation_status, moderation_reason, created_at

## media_appeals
id, media_id, candidate_id, message, evidence_object_key, status, admin_note, created_at, resolved_at

## job_openings
id, company_id, title, description, source_url, status, created_at

## job_matches
id, opening_id, candidate_id, rank, score, evidence_json, created_at

## subscriptions
id, company_id, plan, status, starts_at, ends_at
