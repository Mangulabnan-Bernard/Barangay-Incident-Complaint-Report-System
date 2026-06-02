# Barangay Incident & Complaint Report System

A complaint / blotter management system for **Barangay San Juan, Sta. Ana, Pampanga**, implementing the *Katarungang Pambarangay* dispute-resolution workflow — from a resident filing a complaint, through hearing scheduling and summons issuance, to final case resolution (Solved / Unsolved), with archiving, reporting, and full activity logging.

It is a from-scratch rebuild of an older PHP system on a modern stack.

---

## How it works

1. A **resident** registers and files a complaint, or an **admin** files one on their behalf.
2. The complaint becomes an **incident** with a unique case number (status: *Pending*).
3. An admin/staff schedules a **hearing** (date + time) and escalates the action level (*1st → 2nd → 3rd*).
4. The case is resolved as **Solved** or **Unsolved** — a **decision/resolution is required** to close it.
5. Official **summons** (KP Form 7) can be generated and printed.
6. Resolved/obsolete records can be **archived** (and recovered), and everything is captured in **activity logs** and **reports**.

**Roles:** `Admin` (full access), `Staff` (limited), `Resident` (files & tracks their own complaints).

---

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** (+ `lucide-react` icons, `next-themes` dark mode, `sonner` toasts)
- **Prisma 7** ORM with the **MariaDB driver adapter** → **MySQL**
- **Auth:** bcrypt passwords + JWT in an httpOnly cookie (`jose`), route protection via `src/proxy.ts`

---

## Features

| Area | Modules |
|------|---------|
| **Auth** | Login (admin by email / resident by username), resident self-registration, role-based access |
| **Case workflow** | Incidents (file/list/edit/view), Hearings (schedule + escalate), Cases (record decision), Summons (KP Form 7, printable) |
| **Directory** | Officials (+ public gallery), Residents, Zone Leaders, User accounts |
| **Insights & system** | Reports (stats + charts), Archived records (recover), Activity Logs |

---

## Running it

There are **two ways** to run the app. It auto-detects which based on environment variables.

### Option A — Mock data (no database) ⚡

Quickest way to try it. Uses built-in in-memory sample data, so **no MySQL needed**. Great for demos / Vercel.

```bash
npm install
# Windows PowerShell:
$env:USE_MOCK_DB="true"; npm run dev
# macOS/Linux/Git Bash:
USE_MOCK_DB=true npm run dev
```

Open **http://localhost:3100**. Data is seeded in memory and **resets when the server restarts** (writes don't persist) — it's for browsing/demoing, not real storage.

### Option B — Real database (MySQL via Prisma) 🗄️

For persistent data. Needs a MySQL server (e.g. **XAMPP** on Windows — start *MySQL*; Apache is not needed).

```bash
npm install

# 1. Create a database named "barangay" in MySQL, then:
npx prisma db push      # creates all tables from prisma/schema.prisma
npx prisma generate     # generates the typed client (also runs on install/build)

# 2. (first time) create an admin account
#    Git Bash example:
HASH=$(node -e "console.log(require('bcryptjs').hashSync('admin123',10))")
mysql -u root barangay -e "INSERT INTO admin (admin_name, admin_email, admin_password, role) VALUES ('Administrator','admin@barangay.gov.ph','$HASH','ADMIN');"

# 3. run
npm run dev             # http://localhost:3100
```

### Environment variables

Create a `.env` file in the project root:

```env
# Real database mode (Option B). Leave this OUT (or set USE_MOCK_DB=true) for mock mode.
DATABASE_URL="mysql://root@localhost:3306/barangay"

# Force the in-memory mock data even if DATABASE_URL is set:
# USE_MOCK_DB="true"

# Session signing key (has a dev default; set a real one for production)
# generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="replace-with-a-long-random-secret"
```

> The app uses mock data when `USE_MOCK_DB=true` **or** when `DATABASE_URL` is not set. Otherwise it connects to MySQL.
> `.env` is git-ignored — never commit it.

---

## Sample / mock accounts

Available in mock mode (and recommended for a fresh real DB):

| Role | Login | Password |
|------|-------|----------|
| **Admin** | `admin@barangay.gov.ph` | `admin123` |
| **Staff** | `staff@barangay.gov.ph` | `staff123` |
| **Resident** (complainant) | `resident` | `resident123` |

> Mock credentials for development only — change them before any real use.
> New residents can also self-register at `/register`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server on port **3100** |
| `npm run build` | Production build (`prisma generate && next build`) |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |

---

## Project structure

```
src/
  app/
    (app)/            # authenticated area (sidebar + header shell)
      dashboard/  incidents/  hearings/  cases/  summons/
      officials/  residents/  zone/  users/
      reports/  archived/  logs/
    api/              # route handlers (auth + per-module CRUD)
    login/  register/ # public auth pages
  components/         # sidebar, header, forms, tables, buttons
  lib/                # prisma, mock-db, session/auth, validation, helpers
  generated/prisma/   # generated Prisma client (git-ignored)
prisma/schema.prisma  # data model
```

---

## Deployment (Vercel)

1. Push this repo to GitHub and **Import** it in Vercel (Next.js is auto-detected).
2. **Mock demo (no DB):** add env var `USE_MOCK_DB=true` and **leave `DATABASE_URL` unset**.
   **Real data:** set `DATABASE_URL` to a cloud MySQL (Railway / Aiven / TiDB Cloud) and `AUTH_SECRET`.
3. Deploy. `prisma generate` runs automatically during the build.

> Using **Supabase**? Supabase is PostgreSQL, so it requires porting the Prisma datasource to `postgresql`, swapping to `@prisma/adapter-pg`, and adjusting a few column types — not a drop-in for this MySQL build.

---

## Notes

- PDFs (summons, case reports) use the browser **print** dialog rather than server-generated files.
- Reports use lightweight CSS bar charts (no charting library).
- Zone-leader login isn't wired into the login page yet (the table + CRUD exist).
