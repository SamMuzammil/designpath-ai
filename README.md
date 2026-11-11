# DesignPath AI

This repository currently hosts the **interactive browser preview** of DesignPath AI.

## Status

- `index.html` is a responsive, standalone demo of the training dashboard, 24-week course, assignments, AI-tutor demonstration, portfolio, and job tracker.
- The demo saves data **only in the browser's localStorage**. Data is not synced between devices.
- The tutor is **scripted demonstration content**, not a live OpenAI integration.
- This deployment does **not** provide private login or Supabase persistence.
- **Do not enter personal, confidential, or sensitive details** into this public demo.

The full Next.js + Supabase + OpenAI implementation was produced separately. It needs source upload, environment configuration, end-to-end verification, and a proper Node.js web service deployment before it can be treated as the private production application.

## Render static preview

Build command: `mkdir -p public && cp index.html public/index.html`

Publish directory: `public`

Keep the preview separate from the future Next.js service. Do not put any API keys or passwords in this repo.