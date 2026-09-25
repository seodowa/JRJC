# Continuity

## Current state (2026-09-25) — read this first
- **Task:** UI redesign ("warm editorial" design system). Code-complete; in review.
- **Branches:** `ui-redesign` (feature) → `staging` (created from `main` for this task, per the
  AGENTS.md branch flow) → `main`. Both `ui-redesign` and `staging` are pushed and in sync.
- **PRs (github.com/seodowa/JRJC):**
  - #1 `ui-redesign` → `main` (opened by the first redesign session). Carries a colleague's
    CodeRabbit review (5 minor findings) — all fixed in commit "fix(shared): address CodeRabbit review on PR #1".
  - #2 `staging` → `main`: the intended release path. Suggest closing #1 in favour of #2 once
    the user agrees.
- **Vercel previews** build green for both branches.
- **Attribution rule (user, global AGENTS.md):** no `Co-Authored-By`, no AI/tool mentions in
  commits, merge commits, PRs, comments, or pushed files. History and PR bodies are already
  clean (see pass 6) — keep them that way.
- **History was rewritten and force-pushed on 2026-09-25** (both branches). Anyone with an older
  checkout must `git fetch && git reset --hard origin/<branch>` before pushing, or the old
  commits come back. Commit hashes from before that date no longer exist on these branches.

## Design reference
- Source of truth: the "JRJC redesign" design canvas (the user has the link) — boards: Landing,
  Book step 02, Admin Dashboard, Admin Bookings.
- Tokens: `app/globals.css` `@theme` — paper #F4EFE6, surface #FBF8F2, ink #1B1915,
  ink-2 #5E574C, line #DDD4C4, forest #1E4A36 (accent), clay #B8532A (totals, highlights).
  Tailwind gray/blue/red/green/yellow scales are re-pointed at the palette, so legacy utility
  classes follow it automatically. Radii 3–8px; shadows are hairline rings.
- Fonts (`lib/fonts.ts`): Fraunces (display), Schibsted Grotesk (UI), IBM Plex Mono (`.num`,
  IDs, dates, prices).
- Shared primitives — reuse, don't re-style ad hoc: `buttonClass()` (`components/ui/button.ts`),
  `Badge` + `toneForStatus()`, `SectionHeader`, `.field` / `.field-label` / `.eyebrow` / `.num`,
  `PickerProvider` (MUI theme). Copy is sentence case; labels have no trailing colons.
- Tailwind is v4: `bg-opacity-*` no longer exists — use `bg-ink/10` style modifiers.

## Work log
### Pass 1 (2026-09-23) — commit "Overhaul UI with warm editorial design system"
Token system, fonts, shared primitives, public pages, admin shell/dashboard/tables.

### Pass 2 — admin sweep
Settings → title + underline tabs; flat bordered panels; ad-hoc buttons → `buttonClass`;
large radii / white modal shells removed; Sonner toast colors re-pointed.

### Pass 3 — public polish
- Booking/status emails restyled (`app/api/admin/bookings/status/route.ts`,
  `app/services/bookingService.ts`).
- Footer rendered from `app/(client)/layout.tsx` on every public page; per-page viewport heights
  removed.
- New `components/BookingSummary.tsx` (canvas "Book step 02" sidebar) on booking steps 2–3.
- Hero italic word no longer collides; ID upload matches field size; sentence-case labels.

### Pass 4 — logged-in admin review
- Fixed: bookings table overflow at 1440px, dashboard pending date wrap, reviews + site-content
  page frames, settings avatar (Tailwind v4 opacity bug → solid black), settings tabs collapsing
  on mobile, remaining Title Case labels.
- The stored value "Booking Fee Paid through Cash" (`PaymentDetails.tsx`) is data, not a label —
  do not reword it.

### Pass 5 — CodeRabbit findings on PR #1
F1 About HTML in `<div>`; F2 dashboard date in Asia/Manila; F3 `ReviewStars` role=img +
hidden icons; F4 car-wash fee read from CMS `fees.car_wash_fee` in `CarsSection` (server);
F5 OTP modal heading "Enter your code." (modal is used for SMS too).

### Pass 6 — attribution cleanup (user request)
- Added the no-attribution rule to the global `projs/AGENTS.md` (Git Workflow section).
- Removed tool mentions from the PR #1 and PR #2 descriptions.
- Rewrote `ui-redesign` and `staging` history (commits not on `main` only; `main` untouched):
  one commit re-authored to the user, attribution trailers dropped from messages, and every
  past version of this file replaced with a clean one. The user ran the rewrite script; both
  branches were force-pushed with `--force-with-lease`. Only this file's content differed
  afterwards (commit hashes replaced by titles).
- Local-only backups of the pre-rewrite branches: `backup/ui-redesign-pre-rewrite`,
  `backup/staging-pre-rewrite`. Delete them once the user confirms; never push them.
- Old commits may stay reachable on GitHub by hash (and in PR #1's timeline) until GitHub
  garbage-collects them; only GitHub support can purge them sooner.

## Verification done
- `npx tsc --noEmit` clean; `npm run build` passes (latest: after pass 5).
- Headless Chromium screenshots of all public pages and logged-in admin pages at desktop and
  phone widths. Headless Chrome's minimum window is ~500px.
- No Playwright in this environment; admin pages were captured by driving Chrome over the
  DevTools protocol with a session cookie.

## Open items / blockers
- **Delete the temporary owner account** used for the admin review (the user knows which one;
  Settings → Manage employees). It lives on the production database.
- Not exercised: walk-in steps 2–3 and booking action modals (approve / finish / extend) — they
  act on real bookings in production. Needs a test booking or a non-production database.
- Send a test booking email and check rendering in a mail client.
- Decide PR path (#1 vs #2) and get the user's go-ahead before merging to `main`.
- Delete the local `backup/*-pre-rewrite` branches after the user confirms the rewrite.
- Tell collaborators (e.g. the CodeRabbit reviewer) to reset their checkouts of these branches.
- Page copy that comes from the CMS (e.g. the "About Us" title) is edited in Site content,
  not in code.
- `.env` points at the production Supabase project — avoid writes; prefer a branch/dev project.
