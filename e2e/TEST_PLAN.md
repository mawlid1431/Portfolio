# Devmalitos — Full E2E Test Plan

## Goal

End-to-end confidence across **frontend**, **Next.js API routes**, **Convex backend**, and **admin CMS** — including auth, forgot-password, breached-password checks, and CRUD.

## Stack

| Layer | Tool |
|-------|------|
| E2E runner | Playwright (`@playwright/test`) |
| API tests | Playwright `request` fixture |
| UI tests | Playwright browser |
| Backend seeding | Convex `e2e` mutations (gated by `E2E_TEST_SECRET`) |

## Prerequisites

1. `npx convex dev` running (or deployed dev URL in `.env.local`)
2. `npm run dev` running (or Playwright starts it)
3. `.env.local` with:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` — existing admin credentials
   - `E2E_TEST_SECRET` — shared secret for test-only Convex helpers
4. Set Convex env: `npx convex env set E2E_TEST_SECRET <same-value>`

## Test Suites

### 1. API — Auth (`e2e/api/auth.api.spec.ts`)

| Endpoint | Cases |
|----------|-------|
| `POST /api/auth/login` | 400 missing fields, 401 bad credentials, 200 + cookie on success |
| `GET /api/auth/me` | 401 without cookie, 200 with admin shape |
| `POST /api/auth/logout` | clears session |
| `POST /api/auth/forgot-password` | 404 unknown email, 200 known email |
| `POST /api/auth/verify-reset-code` | 400 bad code, 200 valid seeded code |
| `POST /api/auth/reset-password` | 400 mismatch/weak, 200 with seeded code |
| `POST /api/auth/change-password` | 401, 400 wrong current, 400 leaked password, 200 success |
| `GET/DELETE /api/auth/sessions` | 401, 200 list, revoke other session |

### 2. API — Public & Admin (`e2e/api/routes.api.spec.ts`)

| Endpoint | Cases |
|----------|-------|
| `POST /api/contact` | 400 missing, 200 valid (skips email if SMTP fails) |
| `GET /api/messages` | 401, 200 when authed |
| `GET/POST /api/projects` | 401, 200 list, 400 validation, 201 create |
| `POST /api/setup` | 403 bad key, 400 when admin exists |
| `POST /api/admin/test-email` | 401, 400 bad template |

### 3. UI — Auth flows (`e2e/ui/auth.spec.ts`)

- Admin login page renders
- Wrong password shows error
- Successful login redirects to dashboard
- Forgot password: unknown email → error
- Forgot password: known email → success screen
- Reset password: code step before password fields
- Invalid code stays on step 1
- Valid seeded code → set password → redirect

### 4. UI — Admin CRUD (`e2e/ui/admin-crud.spec.ts`)

- Dashboard loads overview
- Create project via UI → appears in list → delete
- Create experience → delete
- Create FAQ → delete
- Contact message via API → mark read → delete in UI

### 5. UI — Public site (`e2e/ui/public.spec.ts`)

- Home page loads
- Projects page loads public projects
- Contact page form validation
- Contact form submit (API success)

### 6. Security — Leaked passwords (`e2e/api/leaked-password.api.spec.ts`)

- `change-password` rejects known breached password
- `reset-password` rejects known breached password
- `setup` rejects breached password (if no admin)

## Commands

```bash
npm run test:e2e          # full suite
npm run test:e2e:api      # API only (fast)
npm run test:e2e:ui       # browser UI only
npm run test:e2e:report   # open HTML report
```

## CI (future)

- GitHub Actions: `convex dev` + `next build && next start` + `playwright test`
- Store `E2E_TEST_SECRET`, admin creds, Convex URL as secrets
