# SyncWatch

Minimal real-time watch party app. Multiple users load their own local video files and stay in sync on **play**, **pause**, and **seek** — the server relays playback events only; video files are never uploaded or streamed.

## Project Overview

SyncWatch is a two-package web application:

- **`syncwatch-client/`** — React SPA for authentication, room management, and video playback
- **`syncwatch-server/`** — Express + Socket.IO backend for user accounts and real-time room sync

Users register or log in, create or join a room with a short code, pick a local video file, and watch together. One user is the **host** and controls playback; other clients follow via WebSocket events.

For system design, data flow, and API contracts, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Features

- **User authentication** — Register and login with email/password (JWT session cookie)
- **Room creation** — Server generates a 6-character room code
- **Room joining** — Join by code or via shareable URL (`?room=CODE`)
- **Host-controlled playback** — Host drives play, pause, and seek; viewers sync automatically
- **Local video loading** — Each client selects their own file from disk
- **Host failover** — If the host leaves, another participant is promoted
- **Invite link** — Copy room URL from the navbar
- **Server health polling** — Client waits for backend availability before starting

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Socket.IO client, Lucide React |
| **Backend** | Node.js, Express 5, Socket.IO 4 |
| **Auth** | JWT (`jsonwebtoken`), bcrypt, HTTP-only cookies |
| **Database** | PostgreSQL (`pg`) |
| **Language** | JavaScript (no TypeScript in application code) |

## Installation

### Prerequisites

- Node.js 
- npm
- PostgreSQL database

### 1. Clone the repository

```bash
git clone <repository-url>
cd sync-watch
```

### 2. Install dependencies

```bash
cd syncwatch-server && npm install
cd ../syncwatch-client && npm install
```

### 3. Set up the database

The server expects a PostgreSQL `users` table. No migration files are included in this repository.

**TODO:** Add and document database schema setup. Required columns inferred from `server.js`:

- `id`
- `email`
- `username`
- `password_hash`

### 4. Configure environment variables

See [Environment Variables](#environment-variables) below.

## Running Locally

Start the **server first**, then the **client**.

### Server

```bash
cd syncwatch-server
npm run dev    # nodemon server.js
# or
npm start      # node server.js
```

Default port: **5000** (override with `PORT`).

### Client

```bash
cd syncwatch-client
npm run dev    # vite --host
```

Vite prints the local URL (commonly `http://localhost:5173`).

### Verify

- Server health: `GET http://localhost:5000/health`
- Open the client URL in your browser, register or log in, then create or join a room

## Environment Variables

### Client (`syncwatch-client/.env`)

Copy from the example:

```bash
cp syncwatch-client/.env.example syncwatch-client/.env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | Yes | Backend origin for REST and Socket.IO (e.g. `http://localhost:5000`) |

### Server (`syncwatch-server/.env`)

Add `syncwatch-server/.env.example`. Required variables from `server.js`:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret for signing JWT session tokens |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLIENT_URL` | Yes | Client origin for CORS and Socket.IO (e.g. `http://localhost:5173`) |
| `PORT` | No | HTTP listen port; defaults to `5000` |

Example (local development):

```env
JWT_SECRET=your-secret-here
DATABASE_URL=postgresql://user:password@localhost:5432/syncwatch
CLIENT_URL=http://localhost:5173
PORT=5000
```

## Folder Structure

```
sync-watch/
├── README.md
├── ARCHITECTURE.md          # Architecture and API reference
├── context.md
│
├── syncwatch-client/        # React frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── src/
│       ├── main.jsx         # App entry point
│       ├── App.jsx          # Auth, routing, health polling
│       ├── hooks/
│       │   └── useVideoSync.js
│       └── components/      # Screens, player, UI primitives
│
└── syncwatch-server/        # Node backend
    ├── server.js            # Runtime entry point
    ├── lib/db.js            # Unused (not imported)
    ├── middleware/auth.js   # Unused (not imported)
    └── routes/auth.js       # Unused (not imported)
```

There is no root `package.json`; client and server are independent npm packages.

## API Documentation

HTTP routes and Socket.IO event contracts are documented in **[ARCHITECTURE.md](./ARCHITECTURE.md)**:

- [Request Lifecycle](./ARCHITECTURE.md#request-lifecycle) — auth, rooms, and sync flows
- [Database Layer](./ARCHITECTURE.md#database-layer) — PostgreSQL usage
- Environment and dependency reference


## Build Instructions

### Client (production static build)

```bash
cd syncwatch-client
npm run build
```

Output directory: `syncwatch-client/dist/`

Preview the production build locally:

```bash
npm run preview
```

### Server

No build step. Run directly with Node:

```bash
cd syncwatch-server
npm start
```

### Lint (client only)

```bash
cd syncwatch-client
npm run lint
```


---
🚧 Work in progress. More features coming soon.

Made with ❤️ by [Aditya](https://adityabhatkar.vercel.app/)
