const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

if (!JWT_SECRET) throw new Error("JWT_SECRET env variable is not set");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL env variable is not set");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const IS_PROD = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.post("/auth/register", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username`,
      [email.toLowerCase(), username, password_hash]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    console.error("[register]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, username, password_hash FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, cookieOptions);
    return res.json({ user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  return res.json({ message: "Logged out" });
});

app.get("/auth/me", requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime(), timeStamp: Date.now() });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie || "";
  const token = parseCookie(cookieHeader, "token");

  if (!token) return next(new Error("Not authenticated"));

  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return next(new Error("Invalid or expired token"));
  }
});

function parseCookie(cookieStr, name) {
  const match = cookieStr
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

const rooms = {};

io.on("connection", (socket) => {
  const { id: userId, username } = socket.user;
  console.log(`[connect] ${username} (${userId}) — socket ${socket.id}`);

  socket.on("create-room", ({ roomId }) => {
    if (rooms[roomId]) {
      socket.emit("room-error", { message: "Room already exists" });
      return;
    }
    socket.join(roomId);
    rooms[roomId] = {
      hostUserId: userId,
      users: { [socket.id]: userId },
      state: { currentTime: 0, isPlaying: false },
    };

    socket.emit("host-info", { isHost: true });
    socket.emit("sync-video", { type: "pause", currentTime: 0 });
    socket.emit("room-joined", { roomId });
    console.log(`[create-room] ${username} created room ${roomId}`);
  });

  socket.on("join-room", ({ roomId }) => {
    if (!rooms[roomId]) {
      socket.emit("room-error", { message: "Room does not exist" });
      return;
    }

    socket.join(roomId);
    rooms[roomId].users[socket.id] = userId;

    const isHost = rooms[roomId].hostUserId === userId;
    socket.emit("host-info", { isHost });

    const { currentTime, isPlaying } = rooms[roomId].state;
    socket.emit("sync-video", { type: isPlaying ? "play" : "pause", currentTime });
    socket.emit("room-created", { roomId }); 
    console.log(`[join-room] ${username} joined room ${roomId}`);
  });

  socket.on("video-event", ({ roomId, type, currentTime }) => {
    const room = rooms[roomId];
    if (!room) return;
    if (room.users[socket.id] !== room.hostUserId) return;

    room.state.currentTime = currentTime;
    room.state.isPlaying = type === "play";
    socket.to(roomId).emit("sync-video", { type, currentTime });
  });

  socket.on("leave-room", ({ roomId }) => {
    handleLeave(socket, roomId, userId, username);
  });

  socket.on("disconnect", () => {
    console.log(`[disconnect] ${username} — socket ${socket.id}`);
  
    for (const roomId in rooms) {
      if (rooms[roomId]?.users[socket.id] !== undefined) {
        handleLeave(socket, roomId, userId, username);
      }
    }
  });


});

function handleLeave(socket, roomId, userId, username) {
  const room = rooms[roomId];
  if (!room) return;

  delete room.users[socket.id];
  socket.leave(roomId);

  const remaining = Object.entries(room.users);

  if (remaining.length === 0) {
    delete rooms[roomId];
    console.log(`[room-deleted] ${roomId} — empty`);
    return;
  }

  if (room.hostUserId === userId) {
    const [newSocketId, newHostUserId] = remaining[0];
  
    room.hostUserId = newHostUserId;
  
    io.to(roomId).emit("host-changed", {
      hostSocketId: newSocketId,
    });
  
    console.log(
      `[host-changed] room ${roomId} → new host ${newHostUserId}`
    );
  }
}

server.listen(PORT, () => {
  console.log(`SyncWatch server running on port ${PORT}`);
});