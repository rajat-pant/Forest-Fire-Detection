import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

const FireDetector = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState([]);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setStream(mediaStream);
      setCameraOn(true);
    } catch (err) {
      alert("Error accessing camera: " + err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setStream(null);
    setCameraOn(false);
  };

  const toggleCamera = () => {
    if (cameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPrediction([]);
    setResultImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/predict", formData);
      setPrediction(response.data.prediction || []);
      setResultImage(response.data.result_image);
    } catch (error) {
      setPrediction([{ class: "❌ Error during prediction.", confidence: 0 }]);
    }
    setLoading(false);
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg"));
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/predict", formData);
      setPrediction(response.data.prediction || []);
      setResultImage(response.data.result_image);
    } catch (error) {
      setPrediction([{ class: "❌ Error during prediction.", confidence: 0 }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black bg-opacity-90 flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8"
      >
        <h1 className="text-4xl font-extrabold text-white text-center mb-6 tracking-wide">
          🔥 Forest Fire Detection
        </h1>

        {/* <button
          onClick={toggleCamera}
          className="mb-6 w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transition"
        >
          {cameraOn ? "Turn Camera Off" : "Open Camera"}
        </button> */}

        {cameraOn && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover rounded-xl border-2 border-white/20 mb-4"
            />
            <button
              onClick={captureFromCamera}
              disabled={loading}
              className="mb-6 w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3 rounded-xl shadow-lg transition"
            >
              {loading ? "Analyzing..." : "Capture & Detect"}
            </button>
          </>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl border-2 border-white/20"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 rounded-xl shadow-lg transition"
          >
            {loading ? "Analyzing..." : "Detect Fire"}
          </button>
        </form>

        {resultImage && (
          <div className="mt-6">
            <img
              src={resultImage}
              alt="Detected result"
              className="w-full rounded-xl border-2 border-yellow-400 shadow-md"
            />
          </div>
        )}

        {prediction.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-white bg-black/40 p-4 rounded-xl"
          >
            🔎 <span className="text-yellow-300">Detections:</span>
            <ul className="mt-2 space-y-1 text-sm text-left">
              {prediction.map((p, idx) => (
                <li key={idx}>
                  <span className="text-green-300 font-bold">{p.class}</span> —{" "}
                  <span className="text-orange-300">{p.confidence}%</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default FireDetector;
