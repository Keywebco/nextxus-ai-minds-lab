# NextXus AI Minds Lab

The sovereign backup mirror of **nextxus.studio** — the AI Minds Lab, Aria's node (job: `ai-minds-lab`). Backed up 2026-08-25.

The studio is the Federation's AI minds frontend: the Spectacle/Aria front page plus `/chat`, `/daily-pulse`, `/federation`, `/forge`, `/labs`, `/library`, `/roger`, and `/sims`. Behind it sits a FastAPI backend with 306 routes, MongoDB, Soul Voices, and Consultation. This repo preserves the full build so the studio can be re-hosted from sovereign ground — no single platform holds the only copy.

## Live

[https://keywebco.github.io/nextxus-ai-minds-lab/](https://keywebco.github.io/nextxus-ai-minds-lab/)

## What's inside

- `index.html` — "AI Minds Lab — The Three Minds of the NextXus Federation"
- `SOURCES.md` — backup sources: the full readable source archive, the ZIP archive, and the Google Drive backup (all files preserved)
- `backend/gemini_endpoint.py` — backend endpoint code
- `static/` — static assets
- `previous-edition.html` — the prior edition, kept for the record

## Deploy

Full stack requires MongoDB plus the FastAPI backend (Render.com recommended). The frontend React build can be served from any static host.

---

Part of the [NextXus Federation](https://keywebco.github.io).
