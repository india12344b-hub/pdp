# API-Free AI / Matching Architecture

## Candidate profile processing
Resume/document → local parser → structured profile JSON → local NLP enrichment → database.

## Recruiter opening processing
Job description upload/paste → local parser → normalized requirements → skill/entity extraction → candidate retrieval → ranking → explanation.

## Initial matching score components
- Required skill overlap
- Preferred skill overlap
- Experience duration match
- Role/title similarity
- Industry/domain match
- Project/evidence relevance
- Location/work-mode match
- Certification match

The ranking must show evidence, not just a mysterious score. Example:
"Matched because: React, Node.js, 5.2 years experience, 2 relevant projects."

## Local model strategy
Start with deterministic rules + embeddings/local models. Use Ollama/Transformers locally for development. Keep the matching service behind an internal interface so an external API can be added later without changing the product.
