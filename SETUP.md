# SinaLink — Complete Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ (LTS) | https://nodejs.org |
| npm | 10+ | comes with Node |
| Git | any | https://git-scm.com |

---

## Step 1 — Clone / Initialize

```bash
# If starting fresh from this scaffold:
git init
git add .
git commit -m "feat: initial SinaLink scaffold"
```

---

## Step 2 — Install Dependencies

All dependencies are pinned. Run once:

```bash
npm install
```

**What's installed and why:**

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.3.1 | App Router, Server Components, Turbopack |
| `react` / `react-dom` | 19.0 | Latest React with concurrent features |
| `next-auth` | 5.0.0-beta.25 | Auth.js v5 — JWT sessions, credentials |
| `@auth/prisma-adapter` | 2.7.4 | Links NextAuth to your Prisma DB |
| `@prisma/client` | 6.6.0 | Type-safe DB client |
| `prisma` | 6.6.0 | Schema + migration CLI |
| `@supabase/supabase-js` | 2.49.4 | Realtime subscriptions (StatusTracker) |
| `bcryptjs` | 3.0.2 | Password hashing |
| `zod` | 3.24.3 | Runtime schema validation |
| `lucide-react` | 0.511.0 | Icon set |
| `clsx` + `tailwind-merge` | latest | Conditional className utility |
| `tailwindcss` | 4.x | Styling |
| `typescript` | 5.x | Type checking |

---

## Step 3 — Set Up Supabase (Free tier is enough)

1. Go to https://supabase.com → **New project**
2. Choose a region close to your users (e.g. `eu-west-3` for Morocco)
3. After creation, go to **Settings → Database**:
   - Copy **Transaction pooler** URL → `DATABASE_URL` (port 6543)
   - Copy **Session pooler** URL → `DIRECT_URL` (port 5432)
4. Go to **Settings → API**:
   - Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 4 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# Supabase Postgres (from Step 3)
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

# Supabase client (from Step 3)
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# NextAuth — generate a secret:
# Run: openssl rand -base64 32
AUTH_SECRET="paste-your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## Step 5 — Run Prisma Migrations

```bash
# Generate the Prisma Client types
npx prisma generate

# Push schema to your Supabase database (creates all tables)
npx prisma db push
```

To view your database visually:
```bash
npx prisma studio
```

---

## Step 6 — Run the Dev Server

```bash
npm run dev
```

Open http://localhost:3000

---

## Step 7 — Seed Test Data (Optional but recommended)

Create `prisma/seed.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 12);

  // Doctor
  const doctorUser = await prisma.user.create({
    data: {
      name: "Dr. Amine Karim",
      email: "doctor@sinalink.com",
      password: await hash("password123"),
      role: "DOCTOR",
      doctor: {
        create: {
          specialty: "General Practice",
          licenseNumber: "MA-2024-00123",
        },
      },
    },
  });

  // Patient
  const patientUser = await prisma.user.create({
    data: {
      name: "Layla Bensaid",
      email: "patient@sinalink.com",
      password: await hash("password123"),
      role: "PATIENT",
      patient: {
        create: {
          bloodType: "A+",
          allergies: ["Penicillin"],
        },
      },
    },
  });

  console.log("Seeded:", doctorUser.email, patientUser.email);
}

main().finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Install tsx: `npm install -D tsx`

Run: `npx prisma db seed`

**Login with:**
- Doctor: `doctor@sinalink.com` / `password123`
- Patient: `patient@sinalink.com` / `password123`

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        ← Landing page
│   ├── layout.tsx                      ← Root layout + fonts
│   ├── auth/
│   │   ├── login/page.tsx              ← Sign in
│   │   └── signup/page.tsx             ← Register (Doctor/Patient)
│   ├── doctor/
│   │   ├── dashboard/page.tsx          ← Today's schedule + stats
│   │   ├── schedule/page.tsx           ← Weekly calendar
│   │   ├── patient-list/page.tsx       ← Searchable patient table
│   │   └── consultation/[id]/page.tsx  ← Split-screen video + notes
│   ├── patient/
│   │   ├── dashboard/page.tsx          ← Live tracker + find doctor
│   │   ├── appointments/page.tsx       ← Upcoming + past visits
│   │   └── records/page.tsx            ← Medical documents vault
│   └── api/
│       ├── auth/[...nextauth]/route.ts ← NextAuth handler
│       ├── auth/register/route.ts      ← POST /api/auth/register
│       ├── appointments/route.ts       ← GET + POST appointments
│       ├── appointments/[id]/route.ts  ← PATCH status
│       └── appointments/notes/route.ts ← POST save consultation notes
├── components/
│   ├── shared/
│   │   ├── Navbar.tsx                  ← Role-adaptive navigation
│   │   ├── UserAvatar.tsx              ← Initials + dropdown
│   │   ├── Badge.tsx                   ← Status indicators
│   │   └── Providers.tsx               ← SessionProvider wrapper
│   └── features/
│       ├── AppointmentModal.tsx        ← Booking form (patient)
│       ├── ConsultationNotes.tsx       ← Notes/prescription editor
│       └── StatusTracker.tsx           ← Supabase Realtime live tracker
├── lib/
│   ├── auth.ts                         ← NextAuth v5 config
│   ├── prisma.ts                       ← Prisma singleton
│   ├── supabase.ts                     ← Supabase client + admin
│   └── utils.ts                        ← cn() helper
├── types/
│   ├── index.ts                        ← App-wide types
│   └── next-auth.d.ts                  ← Session type augmentation
├── hooks/
│   └── useAuth.ts                      ← useSession re-export
├── middleware.ts                        ← RBAC route guards
prisma/
└── schema.prisma                       ← Full DB schema
```

---

## Key Architecture Decisions

### RBAC (Role-Based Access Control)
Middleware at `src/middleware.ts` intercepts every request:
- `/doctor/*` routes → redirects to patient dashboard if not `DOCTOR`
- `/patient/*` routes → redirects to doctor dashboard if not `PATIENT`
- All protected routes → redirect to `/auth/login` if unauthenticated

### Live Status Tracker
Uses **Supabase Realtime** broadcast channels. The doctor's app sends a `status_update` event to channel `waiting-room:{appointmentId}`. The patient's `StatusTracker` component subscribes on mount and re-renders on each update — no polling needed.

### Clean Architecture pattern
- **Server Components** handle all data fetching (no API calls from pages)
- **API Routes** handle mutations from client components
- **Prisma** owns all DB types; Zod validates all API input

---

## Production Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or:
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
# ... (all vars from .env.local)

# After deploy, run migration:
npx prisma db push
```

---

## Next Features to Add

- [ ] `CalendarView.tsx` — full drag-to-create availability slots
- [ ] Doctor search with filters (specialty, location, rating)
- [ ] Push notifications when appointment is confirmed
- [ ] PDF export for prescriptions
- [ ] Stripe payment integration for consultations
- [ ] Arabic / French i18n (next-intl)
