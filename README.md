# Devmalitos

> **Personal portfolio & headless CMS** for [malitos.dev](https://malitos.dev) — built by Mowlid Haibe (Malitos).

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-Backend-FF5C35)](https://convex.dev/)
[![Bun](https://img.shields.io/badge/Bun-package_manager-000)](https://bun.sh/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000)](https://vercel.com/)

> **Diagrams:** All architecture charts use [Mermaid](https://mermaid.js.org/). They render as graphics on **GitHub** when you open this README in the repo. Vercel and other hosts show the raw code blocks unless Mermaid is enabled.

---

## Documentation index

| Part | Section | Description |
|:----:|---------|-------------|
| **1** | [Project overview](#part-1--project-overview) | What this app is, features, stack, prerequisites |
| **2** | [Architecture](#part-2--architecture) | System design, components, request lifecycle |
| **3** | [Database & backend](#part-3--database--backend) | Schema, tables, Convex function reference |
| **4** | [Flows & diagrams](#part-4--flows--diagrams) | Sequence diagrams for every major flow |
| **5** | [Getting started](#part-5--getting-started) | Install, run locally, first admin setup |
| **6** | [Configuration](#part-6--configuration) | Environment variables, build config |
| **7** | [Application reference](#part-7--application-reference) | Routes, API, components, modules |
| **8** | [Admin CMS guide](#part-8--admin-cms-guide) | How to manage all content |
| **9** | [Deployment](#part-9--deployment) | Vercel + Convex production |
| **10** | [Security](#part-10--security) | Auth model, hardening, checklist |
| **11** | [Design system](#part-11--design-system) | Brand colors, typography, UI patterns |
| **12** | [Troubleshooting](#part-12--troubleshooting) | Common errors and fixes |
| **13** | [Glossary](#part-13--glossary) | Terms used in this project |

---

# Part 1 — Project overview

## 1.1 What is Devmalitos?

Devmalitos is a **full-stack portfolio website** with a built-in **content management system (CMS)**. It serves two audiences:

| Audience | Experience |
|----------|------------|
| **Visitors** | Scroll-driven portfolio — projects, about, contact, FAQ |
| **Admin (you)** | Password-protected dashboard to edit all site content without touching code |

Content lives in **Convex** (database). Images live in **Cloudinary** (CDN). The frontend is **Next.js** on **Vercel**.

## 1.2 Feature list

### Public site

- [x] Home page with scroll-driven hero, stats, pillars, featured work
- [x] About page with experience timeline
- [x] Projects grid + individual project detail pages (`/projects/[slug]`)
- [x] Contact form with email notifications
- [x] FAQ accordion
- [x] Privacy & Terms pages
- [x] Branded 404 page with playable dino game
- [x] Dark / light theme toggle
- [x] Mobile-responsive layout (nav drawer, touch targets, safe areas)
- [x] Smooth scroll (desktop only; native scroll on mobile)

### Admin CMS

- [x] Secure login with httpOnly session cookies
- [x] Dashboard with 8 panels: Overview, Projects, Images, Experience, Messages, FAQ, Socials, Settings
- [x] Real-time content updates via Convex subscriptions
- [x] Cloudinary image upload from admin
- [x] Draft / live project status + featured flag
- [x] Contact message inbox (read / unread)
- [x] Forgot password with 6-digit email code
- [x] Password change + active session management
- [x] One-time admin bootstrap via setup key

### Platform

- [x] Rate limiting (login, contact, password reset)
- [x] Idempotent contact form submissions
- [x] bcrypt password hashing + HIBP breach check
- [x] SSR with CMS fallbacks to `lib/data.ts`
- [x] Automated Convex deploy on Vercel build

## 1.3 Tech stack

| Layer | Technology | Role |
|-------|------------|------|
| **Runtime** | Bun | Package manager & scripts (not npm) |
| **Framework** | Next.js 16 (App Router) | Pages, API routes, SSR |
| **UI** | React 19, Tailwind CSS 4 | Components & styling |
| **Animation** | Framer Motion, Lenis | Scroll effects & smooth scroll |
| **Backend** | Convex | Database, queries, mutations, actions |
| **Images** | Cloudinary | Upload, transform, CDN delivery |
| **Email** | Nodemailer + Gmail SMTP | Contact & reset emails |
| **Hosting** | Vercel | Frontend deployment (region: `cdg1`) |
| **Auth** | Custom (bcrypt + sessions) | Admin-only; no third-party auth provider |

## 1.4 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| [Bun](https://bun.sh/) | Latest | Required — do not use npm |
| Node.js | 18+ | Used by some tooling |
| Convex account | — | [dashboard.convex.dev](https://dashboard.convex.dev) |
| Cloudinary account | — | Free tier works |
| Gmail account | — | With [App Password](https://myaccount.google.com/apppasswords) for SMTP |
| Vercel account | — | For production deploy |

---

# Part 2 — Architecture

## 2.1 System architecture

```mermaid
flowchart TB
  subgraph Clients["Clients"]
    Browser["Browser / Mobile"]
  end

  subgraph Vercel["Vercel - Next.js 16"]
    Pages["App Router Pages"]
    AdminUI["Admin UI"]
    API["API Routes"]
    MW["Middleware"]
    SSR["Server Components"]
  end

  subgraph ConvexCloud["Convex Cloud"]
    Q["Queries"]
    M["Mutations"]
    Act["Actions"]
    DB[("Document DB")]
  end

  subgraph External["External Services"]
    CL["Cloudinary CDN"]
    SMTP["Gmail SMTP"]
  end

  Browser --> Pages
  Browser --> AdminUI
  Browser --> API
  Pages --> MW
  AdminUI --> MW
  Pages --> SSR
  SSR --> Q
  AdminUI --> Q
  AdminUI --> M
  API --> Act
  API --> Q
  API --> M
  Q --> DB
  M --> DB
  Act --> DB
  API --> CL
  API --> SMTP
  Pages --> CL
```

## 2.2 How data is read and written

| Surface | Read path | Write path |
|---------|-----------|------------|
| **Public pages** | Server Component → Convex public query → fallback `lib/data.ts` | Contact form → `/api/contact` → Convex + email |
| **Admin dashboard** | Client `useQuery()` — live reactive | Convex mutations + `/api/upload` |
| **Auth** | `/api/auth/me` → Convex session lookup | `/api/auth/login` → Convex action → cookie |

## 2.3 High-level route map

```mermaid
flowchart LR
  subgraph Public["Public routes"]
    H["Home"]
    Ab["About"]
    P["Projects"]
    PS["Project detail"]
    C["Contact"]
    PR["Privacy"]
    T["Terms"]
    NF["404"]
  end

  subgraph AdminRoutes["Admin routes"]
    AL["Login"]
    AD["Dashboard"]
    AR["Reset password"]
  end

  subgraph CMS["Dashboard panels"]
    O["Overview"]
    PJ["Projects"]
    IM["Images"]
    EX["Experience"]
    MG["Messages"]
    FQ["FAQ"]
    SO["Socials"]
    ST["Settings"]
  end

  AD --> O
  AD --> PJ
  AD --> IM
  AD --> EX
  AD --> MG
  AD --> FQ
  AD --> SO
  AD --> ST
  AL --> AD
  AL --> AR
```

## 2.4 Request lifecycle (public page)

```mermaid
sequenceDiagram
  participant U as User
  participant N as Next.js Server
  participant C as Convex
  participant CL as Cloudinary

  U->>N: GET projects page
  N->>C: projects.listPublic
  alt CMS has data
    C-->>N: Project documents
  else Empty CMS
    N->>N: Fallback to static data
  end
  N->>N: Build image URLs
  N-->>U: HTML response
  U->>CL: Fetch optimized images
```

## 2.5 Content fallback strategy

Public pages **always render**, even before CMS is populated:

1. Server fetches from Convex public queries (`listPublic`, etc.)
2. If Convex returns **empty** or **errors**, falls back to static defaults in `lib/data.ts`
3. Once you add content in admin, Convex data takes over automatically

| Content type | Convex query | Fallback file |
|--------------|--------------|---------------|
| Projects | `projects.listPublic` | `lib/data.ts` → `PROJECTS` |
| FAQ | `faqs.listPublic` | `lib/data.ts` → `FAQS` |
| Experience | `experiences.listPublic` | `lib/data.ts` → `EXPERIENCE` |
| Social links | `socialLinks.listPublic` | `lib/data.ts` → `SOCIALS` |
| Site images | `siteImages.listPublic` | `lib/data.ts` → `IMAGES` |

---

# Part 3 — Database & backend

## 3.1 Entity relationship diagram

```mermaid
erDiagram
  admins ||--o{ sessions : has
  admins ||--o{ passwordResetTokens : has

  admins {
    string email
    string passwordHash
    string name
    number createdAt
    number updatedAt
  }

  sessions {
    string adminId
    string tokenHash
    string deviceLabel
    string userAgent
    string ipHash
    number expiresAt
  }

  projects {
    string slug
    string title
    string pitch
    string tag
    number year
    string imagePath
    boolean featured
    string status
  }

  siteImages {
    string key
    string label
    string cloudinaryPath
  }

  experiences {
    string role
    string org
    string period
    string text
    number sortOrder
  }

  faqs {
    string question
    string answer
    number sortOrder
  }

  socialLinks {
    string label
    string href
    number sortOrder
  }

  contactMessages {
    string name
    string email
    string budget
    string message
    boolean read
  }

  passwordResetTokens {
    string adminId
    string tokenHash
    number expiresAt
  }

  rateLimits {
    string key
    number count
    number windowStart
  }

  idempotencyKeys {
    string key
    string resultId
    number expiresAt
  }
```

## 3.2 Tables reference

| Table | Purpose | Indexes |
|-------|---------|---------|
| `admins` | Admin user accounts | `by_email` |
| `sessions` | Active login sessions (token hashed) | `by_token`, `by_admin` |
| `projects` | Portfolio case studies | `by_slug`, `by_created`, `by_year` |
| `siteImages` | Hero, portrait, section images | `by_key` |
| `experiences` | Work history entries | `by_sort` |
| `faqs` | FAQ Q&A pairs | `by_sort` |
| `socialLinks` | Footer / social URLs | `by_sort` |
| `contactMessages` | Inbound contact submissions | `by_created` |
| `passwordResetTokens` | Hashed 6-digit reset codes | `by_token`, `by_admin` |
| `rateLimits` | Sliding-window rate limits | `by_key` |
| `idempotencyKeys` | Prevent duplicate contact submits | `by_key` |

## 3.3 Convex function reference

### Auth (`convex/auth.ts`, `authActions.ts`, `authMutations.ts`)

| Function | Type | Auth | Description |
|----------|------|:----:|-------------|
| `authActions.login` | action | — | Verify password, create session |
| `authActions.changePassword` | action | tokenHash | Change password + HIBP check |
| `authActions.resetPassword` | action | — | Verify OTP, set new password |
| `authActions.initializeAdmin` | action | setupKey | Bootstrap first admin |
| `auth.me` | query | tokenHash | Get current admin from session |
| `auth.logout` | mutation | tokenHash | Delete session |
| `auth.requestPasswordReset` | mutation | — | Store hashed reset code |
| `auth.listSessions` | query | tokenHash | List admin's active sessions |
| `auth.revokeSession` | mutation | tokenHash | Revoke a session by ID |

### CMS modules

| Module | Public query | Admin query | Mutations |
|--------|--------------|-------------|-----------|
| `projects.ts` | `listPublic`, `getBySlugPublic` | `list` | `create`, `update`, `remove` |
| `siteImages.ts` | `listPublic` | `list` | `upsert`, `remove` |
| `experiences.ts` | `listPublic` | `list` | `create`, `update`, `remove` |
| `faqs.ts` | `listPublic` | `list` | `create`, `update`, `remove` |
| `socialLinks.ts` | `listPublic` | `list` | `create`, `update`, `remove` |
| `messages.ts` | — | `list` | `create`, `markRead`, `markUnread`, `remove` |
| `dashboard.ts` | — | `overview` | `importDefaults` |

> All admin mutations require a valid `tokenHash` from the session cookie.

---

# Part 4 — Flows & diagrams

## 4.1 Contact form flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as ContactForm
  participant API as Contact API
  participant C as Convex
  participant E as Gmail

  U->>F: Fill form and submit
  F->>API: POST contact JSON
  API->>C: Check rate limit
  API->>C: messages.create
  API->>E: Email to CONTACT_TO
  API->>E: Confirmation to visitor
  API-->>F: 200 OK
  F-->>U: Thank you message
```

## 4.2 Admin login flow

```mermaid
sequenceDiagram
  participant A as Admin
  participant L as Login API
  participant C as Convex Login Action
  participant DB as Convex DB

  A->>L: email and password
  L->>L: IP rate limit key
  L->>C: login with tokenHash
  C->>DB: Verify bcrypt hash
  C->>DB: Insert session
  L->>L: Set httpOnly cookie
  L-->>A: Redirect to dashboard
```

## 4.3 Password reset flow

```mermaid
sequenceDiagram
  participant A as Admin
  participant F as Forgot password UI
  participant R as Reset page
  participant API as Auth API
  participant C as Convex
  participant E as Email

  A->>F: Enter email
  F->>API: POST forgot-password
  API->>C: requestPasswordReset
  API->>E: Send 6-digit code
  API-->>F: maskedEmail display
  A->>R: email code new password
  R->>API: POST reset-password
  API->>C: resetPassword action
  API-->>A: Success redirect to admin
```

## 4.4 Image upload flow

```mermaid
flowchart TD
  A["Admin picks image"] --> B["POST upload API"]
  B --> C{"Session cookie valid?"}
  C -->|No| D["401 Unauthorized"]
  C -->|Yes| E{"Folder is devmalitos?"}
  E -->|No| F["400 Bad request"]
  E -->|Yes| G{"Valid image under 8MB?"}
  G -->|No| H["400 Bad request"]
  G -->|Yes| I["Upload to Cloudinary"]
  I --> J["Return publicId"]
  J --> K["Admin saves to Convex"]
```

## 4.5 Session protection (defense in depth)

```mermaid
flowchart TD
  R["Dashboard request"] --> M{"Middleware checks cookie?"}
  M -->|Missing| L["Redirect to login"]
  M -->|Present| P["Page loads"]
  P --> Q{"GET auth me API"}
  Q -->|Invalid| L
  Q -->|Valid| CMS["Dashboard with tokenHash"]
  CMS --> W{"Convex mutation"}
  W --> V{"assertSession check"}
  V -->|Fail| E["Unauthorized error"]
  V -->|Pass| OK["Write to database"]
```

## 4.6 Development workflow

```mermaid
flowchart TD
  A["git clone"] --> B["bun install"]
  B --> C["cp .env.example .env.local"]
  C --> D["Configure env vars"]
  D --> E["Terminal 1: bunx convex dev"]
  D --> F["Terminal 2: bun dev"]
  E --> G["localhost:3000"]
  F --> G
  G --> H{"Admin exists?"}
  H -->|No| I["POST setup API"]
  H -->|Yes| J["Login at admin"]
  I --> J
  J --> K["Edit CMS content live on site"]
```

## 4.7 Production deployment workflow

```mermaid
flowchart TD
  A["git push main"] --> B["Vercel webhook"]
  B --> C["bun install"]
  C --> D["bun run build"]
  D --> E["bunx convex deploy"]
  E --> F["Inject NEXT_PUBLIC_CONVEX_URL"]
  F --> G["next build"]
  G --> H["Deploy to Vercel"]
  E --> I["Update Convex production"]
```

## 4.8 Environment variable split

```mermaid
flowchart LR
  subgraph LocalEnv["Local env file"]
    L1["CONVEX_DEPLOYMENT"]
    L2["NEXT_PUBLIC_CONVEX_URL"]
    L3["All service keys"]
  end

  subgraph VercelEnv["Vercel production"]
    V1["CONVEX_DEPLOY_KEY"]
    V2["ADMIN_SETUP_KEY"]
    V3["Cloudinary and SMTP"]
    V4["NEXT_PUBLIC_SITE_URL"]
  end

  subgraph ConvexProd["Convex production env"]
    C1["ADMIN_SETUP_KEY"]
  end

  V2 -.->|must match| C1
```

---

# Part 5 — Getting started

## 5.1 Quick start (5 minutes)

```bash
# 1. Install dependencies
bun install

# 2. Create local environment file
cp .env.example .env.local
# → Edit .env.local with your Convex, Cloudinary, and SMTP credentials

# 3. Terminal 1 — start Convex (keep running)
bunx convex dev

# 4. Terminal 2 — start Next.js
bun dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

## 5.2 Create your first admin

Only works when **no admin exists** in the database:

```bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "YourSecurePassword123",
    "name": "Your Name",
    "setupKey": "YOUR_ADMIN_SETUP_KEY_FROM_ENV"
  }'
```

Then sign in at **[http://localhost:3000/unknown](http://localhost:3000/unknown)**.

## 5.3 Day-to-day development

| Task | Command |
|------|---------|
| Start frontend dev server | `bun dev` |
| Start Convex sync | `bunx convex dev` |
| Local production build (no Convex deploy) | `bun run build:local` |
| Lint codebase | `bun run lint` |
| Seed default Cloudinary images | `bun run seed:images` |
| Verify deploy env vars | `bun run verify:deploy` |

## 5.4 Recommended dev setup

```
Terminal 1                    Terminal 2
──────────                    ──────────
bunx convex dev               bun dev
(syncs schema + functions)    (http://localhost:3000)
```

> **Important:** Always use `bunx convex dev` for development — never `convex deploy` during daily work.

---

# Part 6 — Configuration

## 6.1 Environment variables (complete reference)

| Variable | Required | Where to set | Description |
|----------|:--------:|--------------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | Local, Vercel | Convex deployment URL (auto-set during Vercel build) |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | — | Local | Convex HTTP actions URL |
| `CONVEX_DEPLOYMENT` | ✅ Local | `.env.local` only | Dev deployment name, e.g. `dev:striped-starfish-858` |
| `CONVEX_DEPLOY_KEY` | ✅ Prod | Vercel only | Production deploy key from Convex dashboard |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Local, Vercel | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Local, Vercel | Server-side upload key |
| `CLOUDINARY_API_SECRET` | ✅ | Local, Vercel | Server-side upload secret |
| `CLOUDINARY_URL` | — | Local | Optional shorthand `cloudinary://key:secret@cloud` |
| `SMTP_HOST` | ✅ | Local, Vercel | Default: `smtp.gmail.com` |
| `SMTP_PORT` | — | Local, Vercel | Default: `587` |
| `SMTP_USER` | ✅ | Local, Vercel | Gmail address |
| `SMTP_PASS` | ✅ | Local, Vercel | Gmail App Password (not regular password) |
| `SMTP_FROM` | — | Local, Vercel | From address (defaults to `SMTP_USER`) |
| `CONTACT_TO` | ✅ | Local, Vercel | Where contact form emails are sent |
| `ADMIN_SETUP_KEY` | ✅ | Local, Vercel, **Convex prod** | Long random string for admin bootstrap |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Local, Vercel | `http://localhost:3000` locally; `https://malitos.dev` in prod |

> **Never commit `.env.local`.** Use `.env.example` as the template.

## 6.2 Build configuration

### `package.json` scripts

| Script | What it does |
|--------|--------------|
| `bun dev` | Next.js development server |
| `bun run build` | **Production:** `convex deploy` → `next build` |
| `bun run build:app` | Next.js build only (called by `build`) |
| `bun run build:local` | Local Next.js build without Convex deploy |
| `bun run start` | Serve production build |
| `bun run lint` | ESLint |
| `bun run seed:images` | Upload default images to Cloudinary |
| `bun run verify:deploy` | Pre-flight env check |

### `vercel.json`

```json
{
  "framework": "nextjs",
  "installCommand": "bun install",
  "buildCommand": "bun run build",
  "regions": ["cdg1"]
}
```

| Setting | Value | Why |
|---------|-------|-----|
| `installCommand` | `bun install` | Project uses Bun, not npm |
| `buildCommand` | `bun run build` | Deploys Convex then builds Next.js |
| `regions` | `cdg1` (Paris) | Close to Convex `eu-west-1` deployment |

---

# Part 7 — Application reference

## 7.1 Public routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home — Hero, Stats, Pillars, Work, Services, FAQ, Finale |
| `/about` | `app/about/page.tsx` | About + experience timeline |
| `/projects` | `app/projects/page.tsx` | All live projects grid |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` | Project detail (SSG) |
| `/contact` | `app/contact/page.tsx` | Contact form |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Terms of service |
| `404` | `app/not-found.tsx` | Branded 404 + dino game |

## 7.2 Admin routes

| Route | File | Auth | Description |
|-------|------|:----:|-------------|
| `/unknown` | `app/unknown/page.tsx` | — | Login + forgot password |
| `/unknown/dashboard` | `app/unknown/dashboard/page.tsx` | ✅ | CMS dashboard (8 panels) |
| `/unknown/reset-password` | `app/unknown/reset-password/page.tsx` | — | Enter 6-digit reset code |

## 7.3 API routes

| Route | Method | Auth | Description |
|-------|--------|:----:|-------------|
| `/api/auth/login` | POST | — | Sign in → httpOnly cookie |
| `/api/auth/logout` | POST | Cookie | Clear session |
| `/api/auth/me` | GET | Cookie | Current admin + `tokenHash` |
| `/api/auth/forgot-password` | POST | — | Email 6-digit reset code |
| `/api/auth/reset-password` | POST | — | Verify code + set password |
| `/api/auth/change-password` | POST | Cookie | Change password (Settings) |
| `/api/auth/sessions` | GET | Cookie | List active sessions |
| `/api/auth/sessions` | DELETE | Cookie | Revoke session by ID |
| `/api/contact` | POST | — | Save message + send emails |
| `/api/upload` | POST | Cookie | Upload image to Cloudinary |
| `/api/setup` | POST | Setup key | One-time admin creation |
| `/api/projects` | GET | — | Public projects JSON |
| `/api/messages` | GET | Cookie | Admin message list |

## 7.4 Public components

| Component | File | Purpose |
|-----------|------|---------|
| `Navbar` | `components/Navbar.tsx` | Fixed nav, mobile drawer, theme toggle |
| `Hero` | `components/Hero.tsx` | Scroll-driven hero with portrait |
| `Stats` | `components/Stats.tsx` | Animated stat counters |
| `Pillars` | `components/Pillars.tsx` | Scroll-pinned value pillars |
| `Work` | `components/Work.tsx` | Featured projects section |
| `ProjectCard` | `components/ProjectCard.tsx` | Project grid card |
| `Services` | `components/Services.tsx` | Services offered |
| `Faq` | `components/Faq.tsx` | FAQ accordion |
| `ContactForm` | `components/ContactForm.tsx` | Contact form with validation |
| `Footer` | `components/Footer.tsx` | Social links + legal links |
| `GlassButton` | `components/GlassButton.tsx` | Branded CTA button |
| `ThemeToggle` | `components/ThemeToggle.tsx` | Dark / light mode switch |
| `Dino404` | `components/Dino404/` | 404 page + canvas game |
| `SmoothScroll` | `components/SmoothScroll.tsx` | Lenis smooth scroll (desktop) |
| `Grain` | `components/Grain.tsx` | Film grain overlay |

## 7.5 Admin components

| Component | File | Purpose |
|-----------|------|---------|
| `OverviewPanel` | `components/admin/OverviewPanel.tsx` | Dashboard stats summary |
| `ProjectsPanel` | `components/admin/ProjectsPanel.tsx` | CRUD projects |
| `ImagesPanel` | `components/admin/ImagesPanel.tsx` | Manage site section images |
| `ExperiencePanel` | `components/admin/ExperiencePanel.tsx` | Work history CRUD |
| `MessagesPanel` | `components/admin/MessagesPanel.tsx` | Contact inbox |
| `FaqPanel` | `components/admin/FaqPanel.tsx` | FAQ CRUD |
| `SocialsPanel` | `components/admin/SocialsPanel.tsx` | Social link CRUD |
| `SettingsPanel` | `components/admin/SettingsPanel.tsx` | Password + sessions |
| `CloudinaryUpload` | `components/admin/CloudinaryUpload.tsx` | Drag-and-drop image upload |

## 7.6 Library modules (`lib/`)

| Module | Purpose |
|--------|---------|
| `auth.ts` | Token generation, hashing, rate limit keys, reset codes |
| `session-server.ts` | Read session cookie on server |
| `convex.ts` | Convex HTTP client singleton |
| `cms-server.ts` | SSR fetch FAQ, experience, socials (+ fallbacks) |
| `projects-server.ts` | SSR fetch projects (+ fallbacks) |
| `images-server.ts` | SSR fetch site images (+ fallbacks) |
| `cloudinary.ts` | Client-side Cloudinary URL builder |
| `cloudinary-server.ts` | Server-side Cloudinary upload |
| `email.ts` | Nodemailer transport |
| `email-templates.ts` | HTML email templates (contact, reset) |
| `admin-hooks.ts` | `useAdminSession`, shared admin UI classes |
| `data.ts` | Static fallback content (projects, FAQ, etc.) |
| `password.ts` | Password strength validation |
| `mask-email.ts` | Email masking for forgot-password UI |
| `idempotency.ts` | Contact form duplicate protection |
| `glass-button-classes.ts` | Glass button Tailwind classes |
| `useSubmitLock.ts` | Prevent double form submissions |

## 7.7 Project file tree

```
devmalitos/
├── app/
│   ├── layout.tsx              # Root: Navbar, SmoothScroll, Grain, fonts
│   ├── globals.css               # Design tokens, glass buttons, theme
│   ├── loading.tsx               # Global loading state
│   ├── page.tsx                  # Home
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── projects/page.tsx
│   ├── projects/[slug]/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── not-found.tsx             # 404 page
│   ├── admin/
│   │   ├── layout.tsx            # ConvexClientProvider wrapper
│   │   ├── page.tsx              # Login
│   │   ├── dashboard/page.tsx    # CMS dashboard
│   │   └── reset-password/page.tsx
│   └── api/                      # Route handlers (see §7.3)
├── components/                   # UI components (see §7.4–7.5)
├── convex/                       # Backend (see §3.3)
│   ├── schema.ts
│   ├── auth.ts · authActions.ts · authMutations.ts
│   ├── projects.ts · siteImages.ts · experiences.ts
│   ├── faqs.ts · socialLinks.ts · messages.ts
│   ├── dashboard.ts · admins.ts
│   └── lib/session.ts · rateLimit.ts
├── lib/                          # Shared utilities (see §7.6)
├── scripts/
│   ├── seed-cloudinary.mjs       # Upload default images
│   └── verify-deploy-env.mjs     # Pre-deploy env checker
├── middleware.ts                 # Admin route guard + security headers
├── next.config.ts                # Cloudinary image domains
├── vercel.json                   # Vercel build config
├── .env.example                  # Env template (safe to commit)
├── bun.lock                      # Bun lockfile (commit this)
└── README.md                     # This file
```

---

# Part 8 — Admin CMS guide

## 8.1 CMS panel overview

```mermaid
flowchart TB
  CMS["Admin CMS"] --> Overview["Overview"]
  CMS --> Projects["Projects"]
  CMS --> Images["Images"]
  CMS --> Experience["Experience"]
  CMS --> Messages["Messages"]
  CMS --> FAQ["FAQ"]
  CMS --> Socials["Socials"]
  CMS --> Settings["Settings"]
```

## 8.2 Panel-by-panel guide

### Overview
- Summary counts: projects, messages, FAQs, etc.
- Quick snapshot when you first log in

### Projects
| Field | Description |
|-------|-------------|
| Title | Display name |
| Slug | URL path (`/projects/your-slug`) — must be unique |
| Pitch | Short description shown on cards |
| Year | Project year |
| Tag | Category label (e.g. "Web App") |
| Status | `live` (visible) or `draft` (hidden) |
| Featured | Show on home page featured section |
| Image | Cloudinary path — upload or paste `devmalitos/projects/slug` |
| Live URL | Optional link to live site |

### Images & sections
Manage site-wide images by **key**:
| Key | Used on |
|-----|---------|
| `hero` | Home hero portrait |
| `portrait` | Work section |
| `working` | Pillars scroll section |
| Custom keys | Extensible for future sections |

### Experience
Work history for the About page. Use **sort order** to control display sequence (lower = first).

### Get in touch (Messages)
- View all contact form submissions
- Mark as read / unread
- Delete spam

### FAQ
Question + answer pairs for the home page accordion. Sort order controls display.

### Social links
Platform name + URL for the footer. Sort order controls display.

### Settings
- **Change password** — requires current password; checked against HIBP breach database
- **Active sessions** — view all devices logged in; revoke any session

## 8.3 Typical content workflow

```mermaid
flowchart LR
  A["Login admin"] --> B["Upload images"]
  B --> C["Create projects"]
  C --> D["Add FAQ and experience"]
  D --> E["Update social links"]
  E --> F["Visit public site"]
```

## 8.4 Forgot password (admin)

1. Go to `/unknown` → **Forgot password?**
2. Enter admin email → 6-digit code sent via email
3. UI shows masked email: `ma••••••@gmail.com`
4. Click **Enter reset code** → `/unknown/reset-password`
5. Enter email + code + new password
6. All existing sessions are invalidated

---

# Part 9 — Deployment

## 9.1 Deploy to Vercel (step-by-step)

### Step 1 — Push to GitHub
Ensure `bun.lock` is committed. Vercel detects Bun automatically.

### Step 2 — Import project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework: **Next.js** (auto-detected)
4. Confirm: Install = `bun install`, Build = `bun run build`

### Step 3 — Set Vercel environment variables

| Variable | Value |
|----------|-------|
| `CONVEX_DEPLOY_KEY` | Convex Dashboard → Settings → Deploy Key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your Gmail |
| `SMTP_PASS` | Gmail App Password |
| `SMTP_FROM` | Your Gmail |
| `CONTACT_TO` | Inbox for contact form |
| `ADMIN_SETUP_KEY` | Strong random string |
| `NEXT_PUBLIC_SITE_URL` | `https://malitos.dev` |

> Do **not** set `CONVEX_DEPLOYMENT` on Vercel.

### Step 4 — Set Convex production env
Convex Dashboard → **Production** → Settings → Environment Variables:
- `ADMIN_SETUP_KEY` — **must match** Vercel value

### Step 5 — Deploy
Push to `main` or click Deploy in Vercel. Build runs:
```
bun install → bunx convex deploy → next build → deploy
```

### Step 6 — Custom domain
Vercel → Domains → add `malitos.dev`. Update `NEXT_PUBLIC_SITE_URL`.

### Step 7 — Create production admin
```bash
curl -X POST https://malitos.dev/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "YourSecurePassword123",
    "name": "Your Name",
    "setupKey": "YOUR_ADMIN_SETUP_KEY"
  }'
```

### Step 8 — Pre-flight check
```bash
bun run verify:deploy
```

## 9.2 Production checklist

- [ ] Strong `ADMIN_SETUP_KEY` on **Vercel AND Convex production**
- [ ] `CONVEX_DEPLOY_KEY` set on Vercel
- [ ] Gmail **App Password** (not regular password) for `SMTP_PASS`
- [ ] `NEXT_PUBLIC_SITE_URL` matches live domain
- [ ] Custom domain configured in Vercel
- [ ] Secrets rotated if ever exposed
- [ ] `bun run verify:deploy` passes
- [ ] Admin account created via `/api/setup`
- [ ] Contact form tested on production
- [ ] CMS content populated (or fallbacks acceptable)

## 9.3 Convex dashboard

| Environment | Command | Dashboard |
|-------------|---------|-----------|
| Development | `bunx convex dev` | [striped-starfish-858](https://dashboard.convex.dev/t/mowlid-mohamoud-haibe/devmalitos/striped-starfish-858) |
| Production | `bun run build` (on Vercel) | Same project → Production tab |

---

# Part 10 — Security

## 10.1 Security architecture

```mermaid
flowchart TD
  L1["Middleware cookie gate"] --> L2["httpOnly session cookies"]
  L2 --> L3["Convex assertSession"]
  L3 --> L4["Rate limiting"]
  L4 --> L5["bcrypt password hashing"]
  L5 --> L6["HIBP breach check"]
  L6 --> L7["Upload folder whitelist"]
  L7 --> L8["Security headers"]
  L8 --> L9["Email enumeration protection"]
  L9 --> L10["OTP reset codes hashed"]
```

## 10.2 Security controls reference

| Threat | Mitigation |
|--------|------------|
| Session hijacking | httpOnly + Secure + SameSite=Lax cookie |
| Brute force login | Convex rate limits per IP |
| Password reuse | HIBP API check on password change |
| XSS in emails | HTML escaped in `email-templates.ts` |
| Unauthorized uploads | Session required; folder whitelist |
| CSRF on mutations | SameSite cookie + server-side session verify |
| Admin route access | Middleware redirect if no cookie |
| Duplicate contact spam | Idempotency keys + rate limiting |
| Weak setup key | `ADMIN_SETUP_KEY` env required; no default in prod |

## 10.3 Session cookie details

| Property | Value |
|----------|-------|
| Name | `malitos_session` |
| Type | httpOnly |
| Secure | `true` in production |
| SameSite | `Lax` |
| Path | `/` |
| Storage | Raw token in cookie; SHA-256 hash in Convex `sessions` table |

---

# Part 11 — Design system

## 11.1 Brand colors (CSS variables)

| Token | Dark mode | Light mode | Usage |
|-------|-----------|------------|-------|
| `--ink` | `#070707` | `#f4eee1` | Page background |
| `--ink-soft` | `#0e0f0e` | `#fdfaf2` | Cards, panels |
| `--cream` | `#f4eee1` | `#070707` | Primary text |
| `--cream-dim` | muted cream | muted dark | Secondary text |
| `--emerald-glow` | `#10b981` | `#0d9f6e` | Accents, borders |
| `--emerald-bright` | `#34d399` | `#047857` | CTAs, highlights |

## 11.2 Typography

| Role | Font | CSS variable | Usage |
|------|------|--------------|-------|
| Display | Anton | `--font-display` | Headlines, logo, 404 number |
| Body | Manrope | `--font-body` | Paragraphs, UI text |

Applied via `font-display` and default body classes in `app/layout.tsx`.

## 11.3 UI patterns

| Pattern | Component / class | Notes |
|---------|-------------------|-------|
| Glass buttons | `GlassButton`, `.glass-btn-*` | Primary, ghost, accent, danger variants |
| Cards | `.rounded-2xl border border-cream/10 bg-ink-soft/70` | Admin panels |
| Emerald rim glow | `.rim-glow` | Portrait frames |
| Film grain | `<Grain />` | Subtle texture overlay |
| Scroll reveal | `Reveal`, `useSectionProgress` | Section animations |
| Safe areas | `.pt-safe`, `.pb-safe` | Notched phone support |

## 11.4 Responsive behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Hamburger nav drawer, bottom admin tab bar, card layouts |
| Tablet | Hybrid layouts, stacked headers |
| Desktop | Full sidebar admin nav, hover effects, Lenis smooth scroll |

---

# Part 12 — Troubleshooting

## 12.1 Common issues

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| `NEXT_PUBLIC_CONVEX_URL is not set` | Missing env var | Add to `.env.local`; restart `bun dev` |
| Convex functions not updating | `convex dev` not running | Start `bunx convex dev` in Terminal 1 |
| Admin login fails | Wrong credentials or no admin | Run `/api/setup` if first time |
| Contact form doesn't email | SMTP misconfigured | Check `SMTP_PASS` is App Password, not regular password |
| Images not loading | Cloudinary name wrong | Verify `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| Upload returns 401 | Not logged in | Sign in to admin first |
| Upload returns 400 folder | Wrong folder path | Use `devmalitos/projects/...` or `devmalitos/hero` |
| Vercel build fails on Convex | Missing deploy key | Add `CONVEX_DEPLOY_KEY` to Vercel env |
| CMS changes not on public site | Empty Convex + fallback active | Add content in admin; verify Convex dev is synced |
| iOS input zoom | Font size under 16px | Already fixed globally in `globals.css` |
| 404 page missing nav | Old cached build | Rebuild; ensure latest `not-found.tsx` |
| README diagrams not visible | Viewing on Vercel or raw MD app | Open README on **GitHub.com** in the repo; Mermaid renders there automatically |
| README shows code not charts | IDE preview or non-GitHub host | Use GitHub web UI, or install a Mermaid preview extension locally |

## 12.2 Useful debug commands

```bash
# Check env vars are loaded
bun run verify:deploy

# Test local production build
bun run build:local

# View Convex logs
# → Convex Dashboard → Logs tab

# View Vercel deployment logs
# → Vercel Dashboard → Deployments → Build logs
```

## 12.3 Reset admin password (manual)

If locked out:
1. Use **Forgot password** flow on `/unknown`
2. Or create a new reset token via Convex dashboard (advanced)

---

# Part 13 — Glossary

| Term | Definition |
|------|------------|
| **CMS** | Content Management System — the `/unknown/dashboard` panels |
| **Convex** | Backend platform — database + server functions in TypeScript |
| **tokenHash** | SHA-256 hash of session token; sent to Convex for auth |
| **public query** | Convex query callable without auth; used on public pages |
| **action** | Convex function that can call external APIs (bcrypt, HIBP) |
| **SSR** | Server-Side Rendering — pages built on server with fresh CMS data |
| **fallback** | Static default content in `lib/data.ts` when CMS is empty |
| **Cloudinary publicId** | Image path like `devmalitos/projects/my-app` |
| **OTP** | One-time password — the 6-digit reset code |
| **idempotencyKey** | Unique key preventing duplicate contact form submissions |
| **httpOnly cookie** | Cookie inaccessible to JavaScript — prevents XSS token theft |

---

## License

Private — © Mowlid Haibe / Malitos

---

<p align="center">
  <strong>Devmalitos</strong> · Portfolio & CMS · <a href="https://malitos.dev">malitos.dev</a>
</p>
