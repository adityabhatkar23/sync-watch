const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

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

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        host: socket.id,
      };
      console.log("Host assigned:", socket.id);
    }

    const isHost = rooms[roomId].host === socket.id;
    socket.emit("host-info", { isHost });
  });

  socket.on("video-event", ({ roomId, type, currentTime }) => {
    if (rooms[roomId]?.host === socket.id) {
      socket.to(roomId).emit("sync-video", {
        type,
        currentTime,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
