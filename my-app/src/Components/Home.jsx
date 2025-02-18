import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Camera,
  Upload,
  Loader,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [mode, setMode] = useState("initial");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Simplified camera start function
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play(); // Explicitly play the video
      }
      setMode("camera");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setError("Failed to access camera");
    }
  };

  // Simplified stop camera function
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Simplified capture function
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        setImage(blob);
        stopCamera();
        setMode("preview");
      }, "image/jpeg", 0.95);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setMode("preview");
    } else {
      setError("Please select a valid image file");
    }
  };

  const processImage = async () => {
    if (!image) return;

    setMode("processing");
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
      setMode("result");
    } catch (err) {
      setError("Failed to process image. Please try again.");
      setMode("preview");
      console.error(err);
    }
  };

  const resetApp = () => {
    stopCamera();
    setImage(null);
    setResult(null);
    setError(null);
    setMode("initial");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="app-container">
      <header>
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          AI Photo Analyzer
        </motion.h1>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {mode === "initial" && (
            <motion.div
              key="initial"
              className="option-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="option-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCamera}
              >
                <Camera size={48} />
                <h2>Take Photo</h2>
                <p>Use your camera to capture an image for analysis</p>
              </motion.div>

              <motion.div
                className="option-card"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerFileInput}
              >
                <Upload size={48} />
                <h2>Upload Photo</h2>
                <p>Select an existing image from your device</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </motion.div>
            </motion.div>
          )}

          {mode === "camera" && (
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md border border-gray-300"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              <div className="camera-controls">
                <button className="capture-btn" onClick={capturePhoto}>
                  <div className="capture-btn-inner"></div>
                </button>

                <button
                  className="back-btn"
                  onClick={resetApp}
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Rest of your UI components remain the same */}
          {/* Preview, Processing, and Result sections... */}
          {mode === "preview" && (
            <motion.div
              key="preview"
              className="preview-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="preview-image-container">
                <img
                  src={image ? URL.createObjectURL(image) : ""}
                  alt="Preview"
                  className="preview-image"
                />
              </div>

              <div className="preview-controls">
                <motion.button
                  className="process-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={processImage}
                >
                  Analyze Image
                </motion.button>

                <motion.button
                  className="back-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetApp}
                >
                  Start Over
                </motion.button>
              </div>
            </motion.div>
          )}

          {mode === "processing" && (
            <motion.div
              key="processing"
              className="processing-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="loader-container"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Loader size={64} className="loader-icon" />
                <h2>Analyzing your image...</h2>
                <p>Our AI is processing your photo</p>
              </motion.div>
            </motion.div>
          )}

          {mode === "result" && result && (
            <motion.div
              key="result"
              className="result-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="result-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <div className="result-header">
                  <CheckCircle className="success-icon" size={32} />
                  <h2>Analysis Complete</h2>
                </div>

                <div className="result-image-container">
                  <img
                    src={image ? URL.createObjectURL(image) : ""}
                    alt="Analyzed"
                    className="result-image"
                  />
                </div>

                <div className="result-details">
                  <h3>Results:</h3>
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>

                <motion.button
                  className="back-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetApp}
                >
                  Start Over
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            className="error-toast"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            <AlertTriangle className="error-icon" size={24} />
            <p>{error}</p>
            <button onClick={() => setError(null)}>×</button>
          </motion.div>
        )}
      </main>

      <footer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Info size={16} />
          <p>AI Photo Analyzer © 2025</p>
        </motion.div>
      </footer>
    </div>
  );
}