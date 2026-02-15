import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL);

function App() {
  const videoRef = useRef(null);

  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const joinRoom = () => {
    if (!roomId) return;
    socket.emit("join-room", roomId);
    setJoined(true);
  };

  useEffect(() => {
    socket.on("host-info", ({ isHost }) => {
      setIsHost(isHost);
    });

    socket.on("sync-video", ({ type, currentTime }) => {
      const video = videoRef.current;
      if (!video) return;

      setIsSyncing(true);

      video.currentTime = currentTime;

      if (type === "play") video.play();
      if (type === "pause") video.pause();

      setTimeout(() => {
        setIsSyncing(false);
      }, 200);
    });

    return () => {
      socket.off("host-info");
      socket.off("sync-video");
    };
  }, []);

  const handlePlay = () => {
    if (!isHost || isSyncing) return;

    socket.emit("video-event", {
      roomId,
      type: "play",
      currentTime: videoRef.current.currentTime,
    });
  };

  const handlePause = () => {
    if (!isHost || isSyncing) return;

    socket.emit("video-event", {
      roomId,
      type: "pause",
      currentTime: videoRef.current.currentTime,
    });
  };

  const handleSeek = () => {
    if (!isHost || isSyncing) return;

    socket.emit("video-event", {
      roomId,
      type: "seek",
      currentTime: videoRef.current.currentTime,
    });
  };

  if (!joined) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Join or Create Room</h2>

        <input
          type="text"
          placeholder="Enter Room ID"
          onChange={(e) => setRoomId(e.target.value)}
        />

        <button onClick={joinRoom}>Enter Room</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h3>Room: {roomId}</h3>
      <p>{isHost ? "You are Host" : "You are Viewer"}</p>

      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            videoRef.current.src = URL.createObjectURL(file);
          }
        }}
      />

      <video
        ref={videoRef}
        controls
        width="700"
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeked={handleSeek}
      />
    </div>
  );
}

export default App;
