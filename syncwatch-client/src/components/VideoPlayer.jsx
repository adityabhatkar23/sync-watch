import Navbar from "./NavBar";


export const VideoPlayer = ({ videoRef, roomId, isHost, onLeave, onEvent }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && videoRef.current) {
      videoRef.current.src = URL.createObjectURL(file);
    }
  };
  return (
    <div className="flex- flex flex-col items-center p-4 min-h-screen w-screen bg-near-black">
      <Navbar
        roomId={roomId}
        isHost={isHost}
        onLeave={onLeave}
        onFileChange={handleFileChange}
      />
      <video
        className="md:h-[500px] w-full max-w-4xl rounded-2xl"
        ref={videoRef}
        controls
        onPlay={() => onEvent("play")}
        onPause={() => onEvent("pause")}
        onSeeked={() => onEvent("seek")}
      />
    </div>
  );
};
