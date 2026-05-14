import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export const useVideoSync = () => {
  const socketRef = useRef(null);
  const videoRef = useRef(null);

  const syncingRef = useRef(false);

  const [roomId, setRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    return (
      params.get("room") ||
      localStorage.getItem("roomId") ||
      ""
    );
  });

  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socket;

    function onHostInfo({ isHost }) {
      setIsHost(isHost);
    }

    function onHostChanged({ hostSocketId }) {
      setIsHost(socket.id === hostSocketId);
    }

    function onSyncVideo({ type, currentTime }) {
      const video = videoRef.current;

      if (!video) return;

      syncingRef.current = true;

      if (Math.abs(video.currentTime - currentTime) > 0.5) {
        video.currentTime = currentTime;
      }

      if (type === "play") {
        video.play().catch(() => {});
      }

      if (type === "pause") {
        video.pause();
      }

      setTimeout(() => {
        syncingRef.current = false;
      }, 300);
    }

    function onRoomJoined({ roomId }) {
      setRoomId(roomId);
      setJoined(true);

      localStorage.setItem("roomId", roomId);

      window.history.replaceState(
        null,
        "",
        `?room=${roomId}`
      );
    }

    function onRoomCreated({ roomId }) {
      setRoomId(roomId);
      setJoined(true);

      localStorage.setItem("roomId", roomId);

      window.history.replaceState(
        null,
        "",
        `?room=${roomId}`
      );
    }

    function onRoomError({ message }) {
      alert(message);
    }

    socket.on("host-info", onHostInfo);
    socket.on("host-changed", onHostChanged);
    socket.on("sync-video", onSyncVideo);
    socket.on("room-joined", onRoomJoined);
    socket.on("room-created", onRoomCreated);
    socket.on("room-error", onRoomError);

    return () => {
      socket.off("host-info", onHostInfo);
      socket.off("host-changed", onHostChanged);
      socket.off("sync-video", onSyncVideo);
      socket.off("room-joined", onRoomJoined);
      socket.off("room-created", onRoomCreated);
      socket.off("room-error", onRoomError);

      socket.disconnect();
    };
  }, []);

  const emitVideoEvent = (type) => {
    const socket = socketRef.current;
    const video = videoRef.current;

    if (
      !socket ||
      !video ||
      !isHost ||
      syncingRef.current ||
      !roomId
    ) {
      return;
    }

    socket.emit("video-event", {
      roomId,
      type,
      currentTime: video.currentTime,
    });
  };

  const createRoom = (id) => {
    const socket = socketRef.current;

    if (!id?.trim()) {
      alert("Room name is required");
      return;
    }

    socket.emit("create-room", {
      roomId: id.trim(),
    });
  };

  const joinRoom = (id) => {
    const socket = socketRef.current;

    if (!id?.trim()) {
      alert("Room name is required");
      return;
    }

    socket.emit("join-room", {
      roomId: id.trim(),
    });
  };

  const leaveRoom = () => {
    const socket = socketRef.current;

    socket.emit("leave-room", { roomId });

    localStorage.removeItem("roomId");

    setJoined(false);
    setIsHost(false);
    setRoomId("");

    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );
  };

  const connectSocket = () => {
    socketRef.current?.connect();
  };

  const disconnectSocket = () => {
    socketRef.current?.disconnect();
  };

  return {
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
  };
};