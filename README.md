# Barangay Information System (v2)

A complaint / blotter management system for **Barangay San Juan, Sta. Ana, Pampanga**, implementing the *Katarungang Pambarangay* dispute-resolution workflow — from a resident filing a complaint, through hearing scheduling and summons issuance, to final case resolution (Solved / Unsolved), with archiving, reporting, and full activity logging.

This is a from-scratch rebuild of the original PHP system (archived under `../barangayFinalDbackup/dumpv1files/`) on a modern stack.

> ⚠️ **Status: works locally with sample ("mock") data.** It is **not yet deployed** — going live needs a cloud database (see [Deployment](#deployment)). For now it runs against a local MySQL with the seeded sample accounts below.

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
| **Auth** | Login (admin by email / resident by username), resident self-registration, role-based access (Admin / Staff / Resident) |
| **Case workflow** | Incidents (file/list/edit/view), Hearings (schedule + escalate action), Cases (record decision), Summons (KP Form 7, printable) |
| **Directory** | Officials (+ public gallery), Residents, Zone Leaders, User accounts |
| **Insights & system** | Reports (stats + charts), Archived records (recover), Activity Logs |

---

## Prerequisites

- **Node.js 18+** (built on Node 24)
- A **MySQL** server. Easiest on Windows is **XAMPP** (start *MySQL* from the control panel — Apache is not needed).

---

## Getting started (local)

```bash
# 1. Install dependencies
npm install

# 2. Create the database (named "barangay") in MySQL, then push the schema
npx prisma db push        # creates all tables from prisma/schema.prisma
npx prisma generate       # generates the typed client (also runs on install/build)

# 3. Start the dev server
npm run dev               # http://localhost:3100
```

### Environment variables

Create a `.env` file in the project root:

```env
# Local XAMPP MySQL (default: user "root", no password)
DATABASE_URL="mysql://root@localhost:3306/barangay"

# Any long random string
# generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="replace-with-a-long-random-secret"
```

`.env` is git-ignored — never commit it. On a host (Vercel), set these in the project settings instead.

---

## Sample / mock accounts

The local database is pre-seeded with these accounts for testing:

| Role | Login | Password | Notes |
|------|-------|----------|-------|
| **Admin** | `admin@barangay.gov.ph` | `admin123` | Logs in by **email**. Full access. |
| **Resident** (complainant) | `resident` | `resident123` | Logs in by **username**. Files & tracks own complaints. |

> These are **mock credentials for development only** — change them before any real use.
> New residents can also self-register at `/register`.

### Re-creating the admin (fresh database)

If you start from an empty DB, create an admin after `prisma db push`:

```bash
# from the project root (Git Bash example)
HASH=$(node -e "console.log(require('bcryptjs').hashSync('admin123',10))")
mysql -u root barangay -e "INSERT INTO admin (admin_name, admin_email, admin_password, role) VALUES ('Administrator','admin@barangay.gov.ph','$HASH','ADMIN');"
```

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
  lib/                # prisma, session/auth, validation, helpers
  generated/prisma/   # generated Prisma client (git-ignored)
prisma/schema.prisma  # data model
```

---

## Deployment

Not yet deployed. To put it online (e.g. **Vercel**) you need a **cloud database**, because a host can't reach a local XAMPP MySQL:

1. Provision a cloud DB and set `DATABASE_URL` + `AUTH_SECRET` in the host's environment settings.
2. `prisma generate` runs automatically on install/build (the generated client is git-ignored).
3. Push this folder to GitHub and import it in Vercel.

**Using Supabase?** Supabase is **PostgreSQL**, so it requires converting this app from MySQL to Postgres: change the Prisma datasource to `postgresql`, swap to `@prisma/adapter-pg`, adjust a few column types (`LongText`→`Text`, `Blob`→`Bytea`, time/datetime types), then `prisma db push` and re-seed.

For a drop-in MySQL host (no porting), use Railway / Aiven / TiDB Cloud.

---

## Notes / known simplifications

- PDFs (summons, case reports) use the **browser print** dialog rather than server-generated files.
- Reports use lightweight CSS bar charts (no charting library).
- Zone-leader login isn't wired into the login page yet (the table + CRUD exist).
- The `../barangayFinalDbackup/dumpv1files/` archive contains the original PHP app and a SQL dump — **keep it private** (it holds legacy plaintext passwords).
