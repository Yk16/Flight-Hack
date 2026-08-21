# SettleMate — Complete Setup Guide

Step-by-step instructions to set up and run the full project (Backend API + Mobile App) on a fresh machine.

---

## Prerequisites

Make sure the following are installed before starting:

| Tool | Version | Check with | Download |
|---|---|---|---|
| Node.js | v18+ recommended | `node -v` | https://nodejs.org |
| npm | v9+ (comes with Node) | `npm -v` | — |
| MySQL Server | 8.x recommended | `mysql --version` | https://dev.mysql.com/downloads/ |
| Git | any recent | `git --version` | https://git-scm.com |
| Expo Go app | latest | install on your phone | Play Store / App Store |

> For running the mobile app on a physical device, your phone and computer must be on the **same Wi-Fi network**.

---

## Part 1 — Backend Setup

Open a terminal in the project root folder (`settlemate-backend/`).

### Step 1: Install backend packages

```bash
npm install
```

This installs Express, Prisma, Zod, Socket.IO, Razorpay, PDFKit and all other dependencies from `package.json`.

### Step 2: Configure environment variables

Copy the example env file:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
NODE_ENV=development
PORT=3000

# Your MySQL connection string
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/settlemate"

JWT_ACCESS_SECRET=any-long-random-string-here
JWT_REFRESH_SECRET=another-long-random-string-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:**
- Replace `USER` and `PASSWORD` in `DATABASE_URL` with your MySQL credentials.
- Change both JWT secrets to long random strings (required in production).
- Optional extras used by some features:
  - `CORS_ORIGIN` — allowed frontend origin (defaults to `*`)
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — for payments

### Step 3: Create the database

Using MySQL CLI (or any GUI like MySQL Workbench):

```sql
CREATE DATABASE settlemate;
```

### Step 4: Generate the Prisma Client

```bash
npm run prisma:generate
```

Generates the type-safe Prisma client from `prisma/schema.prisma`.

### Step 5: Run migrations (creates all tables)

```bash
npm run prisma:migrate
```

If prompted for a migration name, enter something like `init`.

This creates all tables (`users`, `houses`, `bookings`, etc.) inside the `settlemate` database.

### Step 6: Seed sample data (optional but recommended)

```bash
npm run seed:all
```

Seeds demo owners, service providers, regular users, house listings and services.
All seeded accounts use the password: `Password123`

Example login after seeding:

```text
Email:    rajesh.owner@example.com     (owner)
Email:    quickclean@example.com       (service provider)
Password: Password123
```

To seed only service listings instead:

```bash
npm run seed:db
```

### Step 7: Start the backend server

```bash
npm run dev
```

You should see the startup banner:

```text
🏠 SettleMate Backend API
Server running on port 3000
Environment: development
Health check: http://localhost:3000/health
API Base URL: http://localhost:3000/api/v1
```

### Step 8: Verify it is running

Open in browser or curl:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{ "success": true, "message": "SettleMate API is running", ... }
```

### Useful backend commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with auto-reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm run prisma:studio` | Open Prisma Studio (visual DB editor) |
| `npm run prisma:migrate` | Create/apply a new migration |

---

## Part 2 — Mobile App Setup (Expo / React Native)

Open a **new terminal** in the `settlemate-backend/settlemate-mobile/` folder.

### Step 1: Install mobile packages

```bash
npm install
```

### Step 2: Point the app to your backend

The app reads the API base URL from `EXPO_PUBLIC_API_URL`.
If not set, it defaults to `http://192.168.161.24:3000/api/v1`.

Find your computer's local IP address and update it:

```bash
# Windows
ipconfig    # look for IPv4 Address, e.g. 192.168.1.5

# macOS / Linux
ifconfig    # or: ip addr
```

Then either edit `settlemate-mobile/src/constants/config.ts`:

```ts
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://YOUR_LOCAL_IP:3000/api/v1`;
```

…or start Expo with an explicit URL:

```bash
# PowerShell
$env:EXPO_PUBLIC_API_URL="http://YOUR_LOCAL_IP:3000/api/v1"; npx expo start

# macOS / Linux
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api/v1 npx expo start
```

> Do **not** use `localhost` when testing on a real phone — the phone can't reach your machine's localhost. Use your LAN IP. For an Android emulator, `http://10.0.2.2:3000/api/v1` maps to host localhost.

### Step 3: Start the mobile app

```bash
npm start
```

This launches the Metro bundler / Expo DevTools.

### Step 4: Open the app

- **Physical phone:** scan the QR code from the terminal using the **Expo Go** app (same Wi-Fi required).
- **Android emulator:** press `a` in the terminal.
- **iOS simulator (macOS only):** press `i`.
- **Web browser:** press `w`.

---

## Part 3 — Quick End-to-End Test

1. Backend running? → `http://localhost:3000/health` returns success.
2. Register a new account in the mobile app (or use a seeded account).
3. Log in → you land on the home screen with listings.
4. As a verified owner (e.g. `rajesh.owner@example.com`) you can add houses.
5. As a normal user you can browse houses, send booking requests, chat, book services, and request Owner/Provider upgrade via KYC.

### Manual API testing

Use `api-tests.http` (VS Code REST Client / JetBrains HTTP client) to hit endpoints directly, e.g.:

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "rajesh.owner@example.com",
  "password": "Password123"
}
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `P1001: Can't reach database server` | MySQL not running, or wrong user/password/port in `DATABASE_URL` |
| `P2002: Unique constraint failed` during migrate/seed | Data already exists — drop and recreate the DB, or use `prisma migrate reset` |
| `Prisma Client did not initialize` | Run `npm run prisma:generate` again after changing `.env` or schema |
| Mobile app: `Unable to reach the server` | Phone and PC on different networks, or wrong IP in `API_URL`; firewall may block port 3000 |
| Port 3000 already in use | Change `PORT` in `.env` and update the mobile `API_URL` port accordingly |
| OTP never arrives | OTPs are printed to the backend console (`[OTP Service] Sending OTP ...`) — no SMS provider is integrated yet |
| Payments fail | Set valid Razorpay test keys in `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) |

---

## Notes

- The backend serves uploaded files statically from `/uploads` (house images, agreement PDFs).
- Real-time chat uses Socket.IO on the same port as the API.
- Keep `.env` out of git (already ignored). Never commit real secrets.
