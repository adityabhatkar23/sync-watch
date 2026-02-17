const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { uptime } = require("process");
const { timeStamp } = require("console");

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userId }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        hostUserId: userId,
        users: {},
        state: {
          currentTime: 0,
          isPlaying: false,
        },
      };
    }

    rooms[roomId].users[socket.id] = userId;
    const isHost = rooms[roomId].hostUserId === userId;
    socket.emit("host-info", { isHost });
    const { currentTime, isPlaying } = rooms[roomId].state;
    socket.emit("sync-video", {
      type: isPlaying ? "play" : "pause",
      currentTime,
    });
  });

  socket.on("video-event", ({ roomId, type, currentTime }) => {
    const room = rooms[roomId];
    if (!room) return;

    const userId = room.users[socket.id];

    if (room.hostUserId !== userId) return;

    room.state.currentTime = currentTime;
    room.state.isPlaying = type === "play";

    socket.to(roomId).emit("sync-video", {
      type,
      currentTime,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      if (room.users[socket.id]) {
        const userId = room.users[socket.id];

        delete room.users[socket.id];

        if (room.hostUserId === userId) {
          console.log("Host disconnected, waiting for reconnect...");

          setTimeout(() => {
            const stillConnected = Object.values(room.users).includes(userId);

            if (!stillConnected) {
              const remainingUsers = Object.values(room.users);

              if (remainingUsers.length > 0) {
                room.hostUserId = remainingUsers[0];
                console.log("New host assigned:", room.hostUserId);
              } else {
                delete rooms[roomId];
                console.log("Room deleted:", roomId);
              }
            } else {
              console.log("Host reconnected, no reassignment needed");
            }
          }, 2000);
        }
      }
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timeStamp: Date.now(),
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
