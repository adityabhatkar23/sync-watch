import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';

const socket = io(import.meta.env.VITE_BACKEND_URL);
const userId = localStorage.getItem("userId") || uuidv4();
localStorage.setItem("userId", userId);

export const useVideoSync = () => {
  const videoRef = useRef(null);
  const [roomId, setRoomId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("room") || localStorage.getItem("roomId") || "";
  });
  const [joined, setJoined] = useState(!!localStorage.getItem("roomId"));
  const [isHost, setIsHost] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (roomId) {
      const username = localStorage.getItem("username");
      socket.emit("join-room", { roomId, userId, username });
      
      localStorage.setItem("roomId", roomId);
      window.history.replaceState(null, "", `?room=${roomId}`);
      setJoined(true);
    }

    socket.on("host-info", ({ isHost }) => setIsHost(isHost));
    socket.on("host-changed", ({ hostUserId }) => setIsHost(hostUserId === userId));

    socket.on("sync-video", ({ type, currentTime }) => {
      const video = videoRef.current;
      if (!video) return;

      setIsSyncing(true);
      video.currentTime = currentTime;
      if (type === "play") video.play();
      if (type === "pause") video.pause();

      setTimeout(() => setIsSyncing(false), 200);
    });

    return () => {
      socket.off("host-info");
      socket.off("sync-video");
      socket.off("host-changed");
    };
  }, []);

  const emitVideoEvent = (type) => {
    if (!isHost || isSyncing || !videoRef.current) return;
    socket.emit("video-event", {
      roomId,
      type,
      currentTime: videoRef.current.currentTime,
    });
  };

  const joinRoom = (id) => {
    const username = localStorage.getItem("username");
    socket.emit("join-room", { roomId: id, userId, username });
    localStorage.setItem("roomId", id);
    setRoomId(id);
    setJoined(true);
    window.history.replaceState(null, "", `?room=${id}`);
  };

  const leaveRoom = () => {
    socket.emit("leave-room", { roomId });
    localStorage.removeItem("roomId");
    setJoined(false);
    setIsHost(false);
    setRoomId("");
    window.history.replaceState(null, "", window.location.pathname);
  };

  return {
    videoRef, roomId, setRoomId, joined, isHost, 
    joinRoom, leaveRoom, emitVideoEvent
  };
};