export const VideoPlayer = ({ videoRef, roomId, isHost, onLeave, onEvent }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) videoRef.current.src = URL.createObjectURL(file);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>Room: {roomId}</h3>
      <p>{isHost ? "⭐ Host" : "Viewer"}</p>
      <button onClick={onLeave}>Leave Room</button>
      <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}?room=${roomId}`)}>
        Share Link
      </button>

      <div style={{ margin: "20px 0" }}>
        <input type="file" accept="video/*" onChange={handleFileChange} />
      </div>

      <video
        ref={videoRef}
        controls
        width="700"
        onPlay={() => onEvent("play")}
        onPause={() => onEvent("pause")}
        onSeeked={() => onEvent("seek")}
      />
    </div>
  );
};