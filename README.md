# TrueFace

Image authenticity analysis: detects editing, filtering, and AI generation
in face photos, and returns an authenticity score with explainable signals.

## Structure
- `apps/web`        Next.js frontend + app logic
- `services/detector`  FastAPI image/ML pipeline
- `packages`        Shared types (later)

## Status
MVP — detection only. No image reconstruction (see /docs for rationale).
