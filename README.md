# DesignPath AI — Product Design Career Studio

Private learning app for a 24-week transition to Product Design.

**Links**
- [Full application](https://designpath-ai.onrender.com) (private, requires configuration)
- [Public interface preview](https://designpath-ai-preview.onrender.com) (demo only)
- [Full application on Render](https://dashboard.render.com/web/srv-dbqav8sipgvc73a1cbp0)

## Features
- 24 guided weekly lessons, progress checkmarks, study-time tracking.
- Assignment studio with problem statement, design reasoning, Figma link and AI written-work review.
- AI tutor through OpenAI Responses API, with private chat history.
- Portfolio project log and job application tracker.
- Private Supabase Auth, Row Level Security and persistent cloud data.

## Configure Supabase
1. Create a Supabase project at https://supabase.com/dashboard.
2. Run `supabase/schema.sql` using SQL Editor.
3. In Supabase Authentication > Users, create an owner account with a strong password and verified email. Use the same email as `PRIVATE_EMAIL`.
4. In Render > designpath-ai > Environment add:
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Public/anon/publishable API key (NOT service-role).
   - `PRIVATE_EMAIL` — Only permitted login address.
   - `OPENAI_API_KEY` — OpenAI Platform secret API key.
   - `OPENAI_MODEL` — e.g. `gpt-4.1-mini`, subject to model access.
5. Allow the Render server to redeploy after environment changes. Test `/api/health`.
6. Sign in at `/login`, complete a lesson, reload, and confirm persistence.

**Do not commit passwords, OpenAI keys, or Supabase service-role keys.** The application source repo is currently public: keep your secrets in Render, and change GitHub repository visibility to Private if desired.

## Deployment
Next.js 16 with Node.js 22 on Render. Build `npm install --no-audit --no-fund && npm run build`; run `npm start`. Route handlers serve the preserved dashboard markup and private APIs. The public preview static site remains separate. Render's free web service may spin down on inactivity.

## Security / scope
Only the configured `PRIVATE_EMAIL` can authenticate. Supabase policies enforce per-user access. AI reviews grade only written evidence, not external Figma screens they haven't actually inspected. The Figma link is stored as a reference only, not fetched for AI. This is an MVP: no user uploads or third-party OAuth, no formal security audit, and per-instance in-memory AI rate limiting.

## API and costs
OpenAI API usage is billed independently from ChatGPT. Set OpenAI Platform usage budgets/alerts. Without credentials, the full app shows a safe setup page (not a live AI tutor). The preview site does not sync progress between devices.

## Curriculum
6 months; 24 weeks; goal is a strong portfolio and interview preparation, not a guaranteed ₹12–16 LPA offer.
