# PDP Original Media Policy — Draft

PDP does not permit AI-generated images or AI-generated videos to be presented as a candidate's original work or professional evidence.

## Upload flow
1. Candidate uploads image/video.
2. Server records SHA-256 hash, file metadata and provenance signals.
3. Local screening checks metadata/provenance where available and runs local forensic classifiers where available.
4. Result is one of: PASS, REVIEW, CONFIRMED_VIOLATION.
5. REVIEW items are not treated as guilty automatically.
6. Candidate can press **Raise Concern** and submit an explanation/evidence.
7. Admin reviews the case.

## Proposed enforcement
- Confirmed prohibited AI-generated media: account freeze for 7 days, subject to the final Terms/Policy.
- Repeat or deliberate violations can receive stronger action under the published policy.
- False positives must be reversible after review.

## Product warning
The upload screen should clearly say:
"PDP is a proof-of-performance platform. Upload only authentic, human-created photos/videos that you have the right to use."
