# SyncWatch Architecture

Documentation derived from the repository source. Describes what exists today.

---

## High-Level Architecture

SyncWatch is a two-package application: a React SPA (`syncwatch-client/`) and a Node.js backend (`syncwatch-server/`). There is no root workspace or shared package.

The app lets authenticated users create or join a room and synchronize **playback events** (play, pause, seek timestamps) across clients. Video files are loaded locally in each browser; the server does not stream or store media.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                      │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │  App.jsx     │  │ useVideoSync.js │  │  Components      │  │
│  │  auth + UI   │  │  Socket.IO      │  │  Login, Player…  │  │
│  │  routing     │  │  room state     │  │                  │  │
│  └──────┬───────┘  └────────┬────────┘  └──────────────────┘  │
│         │ fetch + cookies    │ WebSocket + cookies              │
└─────────┼────────────────────┼──────────────────────────────────┘
          │                    │
          ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   syncwatch-server/server.js                    │
│  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ Express REST │  │  Socket.IO      │  │  In-memory       │  │
│  │ /auth/*      │  │  room + sync    │  │  rooms{}         │  │
│  │ /health      │  │  handlers       │  │                  │  │
│  └──────┬───────┘  └─────────────────┘  └──────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ PostgreSQL   │  users table only                             │
│  │ (pg Pool)    │                                               │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Runtime split**


| Concern                          | Where it lives                          |
| -------------------------------- | --------------------------------------- |
| User accounts                    | PostgreSQL (`users` table)              |
| Session                          | JWT in HTTP-only cookie (`token`)       |
| Room membership & playback state | In-memory `rooms` object in `server.js` |
| Video files                      | Browser local file picker + blob URLs   |
| Client persistence               | `localStorage` (`roomId` only)          |


---

## Folder Responsibilities

```
sync-watch/
├── README.md                 Project overview
├── ARCHITECTURE.md           This document
├── .gitignore
├── .cursorignore
│
├── syncwatch-client/         Frontend (Vite + React)
│   ├── index.html            HTML shell; mounts #root
│   ├── vite.config.js        Vite + React + Tailwind plugins
│   ├── eslint.config.js      ESLint flat config
│   ├── package.json
│   ├── .env.example          Documents VITE_BACKEND_URL
│   ├── hooks/useAuth.js      Auth hook (not imported by src/)
│   ├── public/               Static assets (favicon.svg)
│   └── src/
│       ├── main.jsx          React bootstrap
│       ├── App.jsx           Auth, health polling, screen routing
│       ├── index.css         Tailwind theme + custom utilities
│       ├── hooks/
│       │   └── useVideoSync.js   Socket.IO client, room/sync state
│       └── components/
│           ├── Login.jsx         Login/register form
│           ├── UsernameScreen.jsx  Auth gate wrapper
│           ├── JoinRoomScreen.jsx  Room join/create UI
│           ├── VideoPlayer.jsx     Video element + sync wiring
│           ├── NavBar.jsx          Room toolbar (share, leave, file load)
│           ├── Logo.jsx
│           └── ui/               Button, Card, Input primitives
│
└── syncwatch-server/         Backend (Express + Socket.IO)
    ├── server.js             Sole runtime entry point
    ├── package.json          Scripts: start, dev; 
    ├── README.md
    ├── lib/db.js             pg Pool module (ESM; not imported by server.js)
    ├── middleware/auth.js    JWT helpers (ESM; not imported by server.js)
    └── routes/auth.js        Auth routes (ESM; not imported by server.js)
```

**Coupling between packages:** The client reaches the server only via `VITE_BACKEND_URL`. The server does not serve the client build.

---

## Request Lifecycle

### 1. Application bootstrap (client)

```
index.html
  → main.jsx (StrictMode + createRoot)
    → App.jsx mounts
      → useVideoSync() initializes (socket created with autoConnect: true)
      → Poll GET /health every 2s until server responds
      → GET /auth/me (credentials: include) to restore session
```

**Screen routing** (conditional render in `App.jsx`, no React Router):


| Condition         | Screen                              |
| ----------------- | ----------------------------------- |
| `!serverReady`    | Loading spinner + rotating messages |
| `authLoading`     | "Authenticating..."                 |
| `!user`           | `UsernameScreen` → `Login`          |
| `user && !joined` | `JoinRoomScreen`                    |
| `joined`          | `VideoPlayer`                       |


After login, `App.jsx` calls `connectSocket()`. If `?room=` is in the URL and the user is not yet joined, `joinRoom(roomFromURL)` is called automatically.

### 2. HTTP auth lifecycle

**Register** — `POST /auth/register`

```
Client (Login → App.handleRegister)
  → POST /auth/register { email, username, password }
    → Validate fields (400 if missing; password min 6 chars)
    → SELECT users by email (409 if exists)
    → bcrypt.hash(password, 12)
    → INSERT INTO users
    → jwt.sign({ id, email, username }, expiresIn: 7d)
    → Set httpOnly cookie "token"
    → 201 { user: { id, email, username } }
```

**Login** — `POST /auth/login`

```
Client → POST /auth/login { email, password }
  → SELECT user by email
  → bcrypt.compare (401 if invalid)
  → jwt.sign + Set cookie
  → 200 { user }
```

**Session check** — `GET /auth/me`

```
Client → GET /auth/me (credentials: include)
  → requireAuth: read cookie, jwt.verify
  → 200 { user: req.user }  or  401
```

**Logout** — `POST /auth/logout`

```
Client → leave room + disconnectSocket if joined
  → POST /auth/logout
  → clearCookie("token")
  → setUser(null)
```

### 3. Socket.IO lifecycle

**Connection** (requires valid JWT cookie):

```
Client: io(VITE_BACKEND_URL, { withCredentials: true, autoConnect: true })
  → Server io.use(): parse cookie, jwt.verify
  → socket.user = { id, email, username }
  → connection handler runs
```

**Create room** — client emits `create-room` (no payload):

```
Server → generateRoomCode() (6 chars, collision-checked against rooms{})
       → socket.join(roomId)
       → rooms[roomId] = { hostUserId, users, state: { currentTime: 0, isPlaying: false } }
       → emit room-created { roomId }
```

**Join room** — client emits `join-room { roomId }`:

```
Server → if room missing: emit room-error
       → socket.join(roomId), map users[socket.id] = userId
       → emit host-info { isHost }
       → emit sync-video from room.state
       → emit room-created { roomId }
```

**Playback sync** — host only:

```
Host <video> onPlay/onPause/onSeeked
  → emitVideoEvent(type)  [blocked if !isHost or syncingRef]
  → emit video-event { roomId, type, currentTime }
Server → verify room.users[socket.id] === room.hostUserId
       → update room.state
       → socket.to(roomId).emit sync-video { type, currentTime }
Viewers → onSyncVideo: set currentTime, play/pause; syncingRef true for 300ms
```

**Leave / disconnect**:

```
Client emit leave-room { roomId }  OR  socket disconnect
  → handleLeave(): remove user, socket.leave
  → if room empty: delete rooms[roomId]
  → if leaver was host: promote first remaining user, emit host-changed { hostSocketId }
```

### 4. Health check

```
GET /health → { status: "ok", uptime, timeStamp }
```

No authentication required.

---

## Package Responsibilities

### syncwatch-client


| Package                            | Role in this project                             |
| ---------------------------------- | ------------------------------------------------ |
| `react`, `react-dom`               | UI rendering                                     |
| `vite`, `@vitejs/plugin-react`     | Dev server, bundling                             |
| `tailwindcss`, `@tailwindcss/vite` | Styling                                          |
| `socket.io-client`                 | Real-time room and sync events                   |
| `lucide-react`                     | Icons in NavBar                                  |
| `uuid`                             | Declared in package.json; not imported in `src/` |
| `framer-motion`                    | Declared in package.json; not imported in `src/` |
| `idb`                              | Declared in package.json; not imported in `src/` |
| `eslint`, `@eslint/js`, plugins    | Linting                                          |


**Scripts:** `dev`, `build`, `lint`, `preview`

### syncwatch-server


| Package         | Role in this project                        |
| --------------- | ------------------------------------------- |
| `express`       | HTTP server, REST routes                    |
| `socket.io`     | WebSocket room and sync protocol            |
| `pg`            | PostgreSQL connection pool                  |
| `jsonwebtoken`  | JWT sign/verify for cookies and sockets     |
| `bcryptjs`      | Password hashing                            |
| `cookie-parser` | Read cookies on HTTP requests               |
| `cors`          | CORS with `CLIENT_URL`, credentials enabled |
| `dotenv`        | Load environment variables                  |
| `nodemon`       | Dev auto-restart (devDependency)            |


**Scripts:** `start` (`node server.js`), `dev` (`nodemon server.js`), `test` (placeholder, exits 1)

---

## Database Layer

**Engine:** PostgreSQL, accessed via `pg.Pool` defined inline in `server.js`.

**Configuration:**

- `DATABASE_URL` — required; throws at startup if unset
- `ssl: { rejectUnauthorized: false }` on the pool

**Schema:** No migration or schema files exist in the repository. The `users` table is inferred from SQL in `server.js`:


| Column          | Usage in code                                      |
| --------------- | -------------------------------------------------- |
| `id`            | Returned on register; stored in JWT                |
| `email`         | Stored lowercase; unique lookup via `LOWER(email)` |
| `username`      | Returned to client; stored in JWT                  |
| `password_hash` | bcrypt hash; never returned to client              |


**Queries in `server.js`:**

- `SELECT id FROM users WHERE LOWER(email) = LOWER($1)` — duplicate check on register
- `INSERT INTO users (email, username, password_hash) VALUES … RETURNING id, email, username`
- `SELECT id, email, username, password_hash FROM users WHERE LOWER(email) = LOWER($1)` — login

**Not persisted in the database:** rooms, socket mappings, playback state.

**Unused module:** `syncwatch-server/lib/db.js` exports a separate `pg.Pool` with the same configuration. It is not imported by the running server.

---

## Service Layer

There is **no separate service layer** in the current runtime. All backend logic lives in `server.js`:


| Responsibility  | Location in `server.js`                                                         |
| --------------- | ------------------------------------------------------------------------------- |
| HTTP middleware | `cors`, `express.json`, `cookieParser`, `requireAuth`                           |
| Auth routes     | Inline handlers for `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me` |
| Database access | Direct `pool.query()` calls in auth handlers                                    |
| Room management | `rooms` object, `generateRoomCode`, `handleLeave`                               |
| Socket protocol | `io.use` auth middleware, `io.on("connection")` event handlers                  |
| Health          | `GET /health`                                                                   |


**Unused modular code** (present on disk, not wired to the entry point):

- `routes/auth.js` — Express Router with register/login/logout/me (ESM)
- `middleware/auth.js` — `requireAuth`, `socketAuthMiddleware` (ESM)
- `lib/db.js` — shared Pool export (ESM)

`server.js` uses CommonJS (`require`). The unused modules use ESM (`import`/`export`).

**Client-side logic split:**


| Layer        | File              | Responsibility                                                                                 |
| ------------ | ----------------- | ---------------------------------------------------------------------------------------------- |
| App shell    | `App.jsx`         | Auth API calls, health polling, screen routing, logout                                         |
| Real-time    | `useVideoSync.js` | Socket connection, room join/create/leave, sync listeners, `localStorage`/`?room=` for room id |
| Presentation | `components/`*    | Forms, video element, navbar                                                                   |


`hooks/useAuth.js` duplicates auth fetch logic from `App.jsx` but is not imported by any file under `src/`.

---

## Dependency Flow

### Client module graph (runtime)

```
index.html
  └── main.jsx
        └── App.jsx
              ├── useVideoSync.js ──→ socket.io-client
              ├── UsernameScreen.jsx ──→ Login.jsx
              ├── JoinRoomScreen.jsx ──→ ui/*, Logo
              └── VideoPlayer.jsx ──→ NavBar.jsx ──→ lucide-react
```

`App.jsx` calls the backend via `fetch` to `VITE_BACKEND_URL`. `useVideoSync.js` connects to the same URL via Socket.IO.

### Server module graph (runtime)

```
server.js
  ├── express          → HTTP app, routes
  ├── http             → createServer(app)
  ├── socket.io        → Server attached to HTTP server
  ├── cors             → HTTP + Socket.IO CORS (CLIENT_URL)
  ├── cookie-parser    → req.cookies
  ├── jsonwebtoken     → sign/verify JWT
  ├── bcryptjs         → hash/compare passwords
  ├── pg               → Pool → PostgreSQL
  └── dotenv           → process.env
```

No internal imports between server files at runtime.

### Environment variable dependencies


| Variable           | Required by | Used for                               |
| ------------------ | ----------- | -------------------------------------- |
| `VITE_BACKEND_URL` | Client      | REST and Socket.IO base URL            |
| `JWT_SECRET`       | Server      | JWT sign/verify; throws if unset       |
| `DATABASE_URL`     | Server      | PostgreSQL connection; throws if unset |
| `CLIENT_URL`       | Server      | CORS origin for Express and Socket.IO  |
| `PORT`             | Server      | Listen port; defaults to `5000`        |


Only `VITE_BACKEND_URL` is documented in `syncwatch-client/.env.example`. No server `.env.example` exists in the repository.

### External runtime dependencies


| Dependency   | Where referenced                              |
| ------------ | --------------------------------------------- |
| PostgreSQL   | `DATABASE_URL`, `pg` queries                  |
| Google Fonts | `@import` in `syncwatch-client/src/index.css` |


Deployment platform configuration (e.g. Render, hosting URLs) is not defined in repository config files. `App.jsx` loading messages reference Render cold starts in UI copy only.

---

## Architectural Boundaries


| Boundary               | Mechanism                                                                  |
| ---------------------- | -------------------------------------------------------------------------- |
| Client ↔ Server (auth) | HTTP + JSON; JWT in cookie; `credentials: "include"`                       |
| Client ↔ Server (sync) | Socket.IO; cookie sent on handshake; `withCredentials: true`               |
| Server ↔ Database      | Raw SQL via `pg`; auth handlers only                                       |
| User ↔ Video file      | Browser `<input type="file">`; `URL.createObjectURL`; never sent to server |
| Room state scope       | Process memory; lost on server restart                                     |


---

## Entry Points Summary


| Package | Entry                         | Command                         |
| ------- | ----------------------------- | ------------------------------- |
| Client  | `index.html` → `src/main.jsx` | `npm run dev` / `npm run build` |
| Server  | `server.js`                   | `npm start` / `npm run dev`     |


