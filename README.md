# Calendar App

A full-stack task calendar built with the MERN stack, JWT authentication, Material UI, and Feature-Sliced Design architecture.

## Features

- Monthly calendar view with per-day task management
- Checklist-based tasks with real-time completion tracking
- Daily progress visualization via mood-based smiley icons (5 states: sad → celebratory)
- Create, view, edit, delete, and copy task lists between days
- JWT authentication with silent token refresh (access token + HttpOnly refresh cookie)
- Persistent login via localStorage

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
| cookie-parser | HttpOnly refresh token cookie |

## Project Structure

```
calendar/
├── client/                  # React SPA (Vite + TypeScript)
│   └── src/
│       ├── app/             # Providers: theme, router
│       ├── pages/           # calendar, login, register
│       ├── widgets/         # CalendarGrid, CalendarHeader
│       ├── features/        # AddTaskModal, InlineDatePicker
│       ├── entities/        # task store, user/auth store
│       └── shared/          # api, types, config, ui components
└── server/                  # Express REST API (TypeScript)
    └── src/
        ├── controllers/     # auth, task
        ├── models/          # User, Task
        ├── routes/          # /api/auth, /api/tasks
        ├── middleware/       # JWT auth guard
        └── config/          # JWT config
```

The frontend follows **Feature-Sliced Design (FSD)**: `app → pages → widgets → features → entities → shared`.

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account, returns access token + sets refresh cookie |
| POST | `/login` | Sign in |
| POST | `/refresh` | Rotate token pair using HttpOnly cookie |
| POST | `/logout` | Clear refresh token |

### Tasks — `/api/tasks` (requires `Authorization: Bearer <token>`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Fetch tasks, optionally filtered by `?year=&month=` |
| POST | `/` | Create a task with checklist |
| PUT | `/:id` | Update task's due date or checklist |
| DELETE | `/:id` | Delete a task |
| GET | `/progress` | Daily completion percentages for a month |

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
PORT=5000
MONGO_URI=mongodb://localhost:27017/calendar
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
```

### 3. Start development servers
```bash
# From the project root — starts both client and server concurrently
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:5000

> **Note:** The Vite dev proxy is configured to forward `/api` requests to `localhost:3001`. Make sure the `PORT` in your `.env` matches the proxy target in `client/vite.config.ts`, or update one of them.

## Scripts

From the project root:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server in parallel |
| `npm run install:all` | Install dependencies for both packages |
| `npm run build` | Build both packages for production |
