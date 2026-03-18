# Calendar App

A full-stack task and expense calendar built with the MERN stack, JWT authentication, Google OAuth, Material UI, and Feature-Sliced Design architecture.

## Features

- Monthly calendar view with infinite scroll (past and future months)
- Checklist-based tasks with real-time completion tracking
- Expense tracking per day with configurable categories and currency
- Daily progress visualization via mood-based smiley icons (5 states: sad → celebratory)
- Create, view, edit, delete, and copy task lists between days
- Customizable task and expense option groups via an Options panel
- JWT authentication with silent token refresh (access token + HttpOnly refresh cookie)
- Google OAuth sign-in
- Rate limiting on auth endpoints

## Tech Stack

### Frontend

| | |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Material UI 5 | Component library + theming |
| Zustand | Global state management |
| React Router 6 | Client-side routing with auth guards |
| Axios | HTTP client with auto token refresh interceptor |
| date-fns | Date utilities |

### Backend

| | |
|---|---|
| Node.js + Express | REST API |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens | Access (15m) + Refresh (7d) token pair |
| bcryptjs | Password hashing |
| Passport + Google OAuth 2.0 | Social authentication |
| Zod | Request body validation |
| express-rate-limit | Auth endpoint rate limiting (10 req / 15 min) |
| cookie-parser | HttpOnly refresh token cookie |

## Project Structure

```
calendar/
├── client/                  # React SPA (Vite + TypeScript)
│   └── src/
│       ├── app/             # Providers: theme, router; ErrorBoundary
│       ├── pages/           # calendar, login, register, Google callback
│       ├── widgets/         # CalendarGrid, CalendarHeader, MonthSection, CalendarDayCell
│       ├── features/        # AddTaskModal, OptionsModal, InlineDatePicker
│       ├── entities/        # task store, user/auth store, options store
│       └── shared/          # axios instance, API modules, types, SmileyIcon
└── server/                  # Express REST API (TypeScript)
    └── src/
        ├── controllers/     # auth, task, options
        ├── models/          # User, Task, Options
        ├── routes/          # /api/auth, /api/tasks, /api/options
        ├── middleware/       # JWT auth guard, rate limiter, Zod validation
        ├── validation/      # auth, task, options Zod schemas
        └── config/          # JWT config, Passport config
```

The frontend follows **Feature-Sliced Design (FSD)**: `app → pages → widgets → features → entities → shared`.

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account, returns access token + sets refresh cookie |
| POST | `/login` | Sign in |
| POST | `/refresh` | Rotate token pair using HttpOnly cookie |
| POST | `/logout` | Invalidate refresh token |
| GET | `/google` | Initiate Google OAuth flow |
| GET | `/google/callback` | Google OAuth callback, redirects to client |

### Tasks — `/api/tasks` _(requires `Authorization: Bearer <token>`)_

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Fetch tasks filtered by `?year=&month=` |
| POST | `/` | Create a task with checklist |
| PUT | `/:id` | Update task's due date or checklist |
| PATCH | `/:id` | Partial update (e.g. toggle a single checklist item) |
| DELETE | `/:id` | Delete a task |

### Options — `/api/options` _(requires `Authorization: Bearer <token>`)_

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Fetch user's task groups, expense groups, and currency |
| PUT | `/` | Save updated options |

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm

## Quick Start

### 1. Install dependencies

```bash
# From the project root (installs both client and server)
npm run install:all
```

### 2. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/calendar
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> The Vite dev proxy forwards `/api` requests to `localhost:3001`. Make sure `PORT` in `.env` matches the proxy target in `client/vite.config.ts`.

### 3. Start development servers

```bash
# From the project root — starts both client and server concurrently
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

## Scripts

From the project root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server in parallel |
| `npm run install:all` | Install dependencies for both packages |
| `npm run build` | Build both packages for production |
| `npm start` | Start the production server |
