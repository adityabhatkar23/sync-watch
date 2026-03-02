import React, { useState } from "react";
import Logo from "./Logo";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";

export const JoinRoomScreen = ({ roomId, setRoomId, onJoin, onCreate }) => (
  <div className="h-screen w-screen flex items-center justify-center lg:flex-row flex-col bg-near-black  gap-8 font-jetbrains p-8">
    <Logo />
    <div className="w-full max-w-lg">
      <Card title="Portal SYNC_WATCH">
        <div className="space-y-8">
          <Input
            label="Room Code"
            placeholder="Enter room code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button variant="primary" onClick={() => onJoin(roomId)}>
              Join Room
            </Button>
            <Button variant="secondary" onClick={() => onCreate(roomId)}>
              Create Room
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </div>
);
