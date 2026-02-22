import { useState } from "react";
import { useVideoSync } from "./hooks/useVideoSync";
import { UsernameScreen } from "./components/UsernameScreen";
import { JoinRoomScreen } from "./components/JoinRoomScreen";
import { VideoPlayer } from "./components/VideoPlayer";

function App() {
  const [usernameSet, setUsernameSet] = useState(!!localStorage.getItem("username"));
  const { 
    videoRef, roomId, setRoomId, joined, isHost, 
    joinRoom, leaveRoom, emitVideoEvent 
  } = useVideoSync();

  if (!usernameSet) {
    return <UsernameScreen onComplete={() => setUsernameSet(true)} />;
  }

  if (!joined) {
    return <JoinRoomScreen roomId={roomId} setRoomId={setRoomId} onJoin={joinRoom} />;
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