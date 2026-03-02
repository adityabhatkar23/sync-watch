import { useState, useEffect } from "react";
import { useVideoSync } from "./hooks/useVideoSync";
import { UsernameScreen } from "./components/UsernameScreen";
import { JoinRoomScreen } from "./components/JoinRoomScreen";
import { VideoPlayer } from "./components/VideoPlayer";

function App() {
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
  } = useVideoSync();

  const [usernameSet, setUsernameSet] = useState(!!localStorage.getItem("username"));

  useEffect(() => {
    if (!usernameSet) return;

    const urlParams = new URLSearchParams(window.location.search);
    const roomFromURL = urlParams.get("room");

    if (roomFromURL && !joined) {
      joinRoom(roomFromURL);
    }
  }, [usernameSet, joined, joinRoom]);

  if (!usernameSet) {
    return <UsernameScreen onComplete={() => setUsernameSet(true)} />;
  }

  if (!joined) {
    return (
      <JoinRoomScreen
        roomId={roomId}
        setRoomId={setRoomId}
        onJoin={joinRoom}
        onCreate={createRoom}
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
    />
  );
}

export default App;