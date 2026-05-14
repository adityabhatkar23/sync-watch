import { useState, useEffect } from "react";
import { useVideoSync } from "./hooks/useVideoSync";
import { UsernameScreen } from "./components/UsernameScreen";
import { JoinRoomScreen } from "./components/JoinRoomScreen";
import { VideoPlayer } from "./components/VideoPlayer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
  const [user, setUser] = useState(null);   
  const [authLoading, setAuthLoading] = useState(true);

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
    fetch(`${BACKEND_URL}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.user) setUser(data.user); })
      .catch(() => {})
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