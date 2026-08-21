# SettleMate

SettleMate is a housing and settlement platform with a TypeScript backend and an Expo mobile app. The backend provides authentication, listings, bookings, services, chat, agreements, payments, and user/admin workflows. The mobile app consumes those APIs and provides the responsive client experience.

## Repository Layout

```text
settlemate-backend/
├── prisma/
│   └── schema.prisma
├── prisma.config.ts
├── src/
│   ├── app.ts
│   ├── config/
│   ├── modules/
│   │   ├── agreement/
│   │   ├── auth/
│   │   ├── booking/
│   │   ├── chat/
│   │   ├── flatmate/
│   │   ├── housing/
│   │   ├── payment/
│   │   ├── service/
│   │   └── user/
│   └── shared/
│       ├── database/
│       ├── errors/
│       ├── middleware/
│       ├── types/
│       └── utils/
├── settlemate-mobile/
│   ├── App.tsx
│   ├── app.json
│   └── src/
│       ├── api/
│       ├── components/
│       ├── navigation/
│       ├── screens/
│       ├── store/
│       ├── theme/
│       ├── types/
│       └── utils/
├── api-tests.http
└── package.json
```

## Tech Stack

- Backend: Node.js, Express, TypeScript, Prisma, MySQL
- Mobile: Expo, React Native, TypeScript, React Navigation, Zustand
- Validation: Zod
- Auth/storage: JWT, AsyncStorage
- Realtime: Socket.IO

## Quick Start

### Backend

1. Install dependencies.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` for MySQL.
4. Run Prisma generate and migrate.
5. Start the API.

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Prisma Studio

Prisma Studio now resolves `DATABASE_URL` through [prisma.config.ts](prisma.config.ts).

```bash
npm run prisma:studio
```

### Mobile App

```bash
cd settlemate-mobile
npm install
npm start
```

## Environment Variables

### Backend

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | App environment | `development` |
| `PORT` | API server port | `3000` |
| `DATABASE_URL` | MySQL connection string used by Prisma | `mysql://root:password@localhost:3306/settlemate` |
| `JWT_ACCESS_SECRET` | Access token secret | required |
| `JWT_REFRESH_SECRET` | Refresh token secret | required |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime | `7d` |
| `OTP_EXPIRY_MINUTES` | OTP lifetime in minutes | `5` |
| `OTP_LENGTH` | OTP digit count | `6` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## API Overview

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/register/phone`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/otp/send`
- `POST /api/v1/auth/otp/verify`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/oauth/:provider`

### Users

- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `POST /api/v1/users/me/password`
- `POST /api/v1/users/kyc`
- `GET /api/v1/users/kyc/status`
- `GET /api/v1/users/:id/public`

### Housing

- `GET /api/v1/houses`
- `POST /api/v1/houses`
- `GET /api/v1/houses/:id`
- `PUT /api/v1/houses/:id`
- `DELETE /api/v1/houses/:id`

### Services

- `GET /api/v1/services`
- `POST /api/v1/services/book`

### Chat

- `GET /api/v1/chat/rooms`
- `GET /api/v1/chat/:roomId/messages`

### Admin

- `GET /api/v1/admin/users`
- `PUT /api/v1/admin/users/:id/status`
- `POST /api/v1/admin/users/:id/verify`

## Current Backend Modules

- `auth` for registration, login, OTP, refresh tokens, and logout
- `user` for profile, KYC, and admin user management
- `housing` for property listing and browsing
- `booking` for house booking workflows
- `service` for service browsing and booking
- `chat` for room and message history
- `agreement` for contract workflow
- `payment` for transaction handling
- `flatmate` for roommate matching

## Mobile App Highlights

- Responsive home, services, chat, and profile screens
- Bottom tab navigation with role-aware tabs
- Shared theme tokens and responsive sizing helpers
- API client with environment-based backend URL
- Local state via Zustand

## Notes

- The Prisma datasource uses MySQL in `prisma/schema.prisma`.
- Keep `.env` aligned with `.env.example` before running Prisma commands.
- If you change the database URL, rerun Prisma generate and any needed migrations.
