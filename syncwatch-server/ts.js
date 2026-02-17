socket.on("disconnect", () => {
  console.log("User disconnected:", socket.id);

  for (const roomId in rooms) {
    const room = rooms[roomId];

    if (room.users[socket.id]) {
      const userId = room.users[socket.id];

      delete room.users[socket.id];

      // If host disconnected, delay reassignment
      if (room.hostUserId === userId) {
        console.log("Host disconnected, waiting for reconnect...");

        setTimeout(() => {
          // Check if host reconnected
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
        }, 2000); // 2 second grace period
      }
    }
  }
});
