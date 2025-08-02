import React, { useState } from "react";

const LiveCameraDetector = () => {
  const [isCameraOn, setIsCameraOn] = useState(false);

  return (
    <div className="relative w-fit mx-auto mt-10">
      {isCameraOn && (
        <img
          src="http://localhost:5000/live_feed"
          alt="Live Camera Stream"
          className="rounded-xl border-4 border-white"
          style={{ width: 640, height: 480 }}
        />
      )}
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className="bg-red-500 text-white font-bold px-6 py-2 rounded-xl shadow hover:bg-red-600"
        >
          {isCameraOn ? "Stop Live Detection" : "Start Live Detection"}
        </button>
      </div>
    </div>
  );
};

export default LiveCameraDetector;
