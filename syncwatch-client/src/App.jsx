import { useState, useEffect } from "react";
import { useVideoSync } from "./hooks/useVideoSync";
import { UsernameScreen } from "./components/UsernameScreen";
import { JoinRoomScreen } from "./components/JoinRoomScreen";
import { VideoPlayer } from "./components/VideoPlayer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [serverReady, setServerReady] = useState(false);
  const loadingMessages = [
    "Waking up the Render server...",
    "Render free tier puts inactive servers to sleep...",
    "Starting backend services...",
    "Reconnecting real-time sockets...",
    "Restoring your session securely...",
    "Cold starts can take around 20–60 seconds...",
    "Almost ready...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        (prev + 1) % loadingMessages.length
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const {
    videoRef,
    roomId,
    setRoomId,
    joined,
    isHost,
    joinRoom,
    leaveRoom,
    emitVideoEvent,
    createRoom,
    connectSocket,
    disconnectSocket,
  } = useVideoSync();
  useEffect(() => {
    let interval;

    async function checkHealth() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/health`
        );

        if (res.ok) {
          setServerReady(true);
          clearInterval(interval);
        }
      } catch (err) {
        console.log("Server sleeping...");
      }
    }

    checkHealth();

    interval = setInterval(checkHealth, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => { })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (user) connectSocket();
  }, [user]);

  useEffect(() => {
    if (!user || joined) return;
    const roomFromURL = new URLSearchParams(window.location.search).get("room");
    if (roomFromURL) joinRoom(roomFromURL);
  }, [user, joined]);

  async function handleLogin(email, password) {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    setUser(data.user);
  }

  async function handleRegister(email, username, password) {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    setUser(data.user);
  }

  async function handleLogout() {
    if (joined) leaveRoom();
    disconnectSocket();
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }

  if (!serverReady) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white px-6">

        <svg
          style={{
            position: "absolute",
            width: 0,
            height: 0,
          }}
        >
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="12"
            />

            <feColorMatrix
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 48 -7
              "
            />
          </filter>
        </svg>

        <div className="loader"></div>

        <div className="mt-10 h-10 flex items-center justify-center">
          <p
            key={messageIndex}
            className="text-zinc-300 text-lg animate-fade"
          >
            {loadingMessages[messageIndex]}
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-near-black">
        <p className="text-ice-blue font-mono animate-pulse text-sm">
          Authenticating...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <UsernameScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  if (!joined) {
    return (
      <JoinRoomScreen
        roomId={roomId}
        setRoomId={setRoomId}
        onJoin={joinRoom}
        onCreate={createRoom}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <VideoPlayer
      videoRef={videoRef}
      roomId={roomId}
      isHost={isHost}
      onLeave={leaveRoom}
      onEvent={emitVideoEvent}
      user={user}
      onLogout={handleLogout}
    />
  );
}

export default App;