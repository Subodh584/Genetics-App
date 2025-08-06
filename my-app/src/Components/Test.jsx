import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, SwitchCamera } from "lucide-react";

export default function Test() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  // State for camera management
  const [currentFacingMode, setCurrentFacingMode] = useState("environment"); // "user" for front, "environment" for back
  const [availableCameras, setAvailableCameras] = useState([]);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get available camera devices
  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      return videoDevices;
    } catch (error) {
      console.error("Error getting camera devices:", error);
      setError("Failed to get camera devices");
      return [];
    }
  };

  // Start camera with specified facing mode
  const startCamera = async (facingMode = currentFacingMode) => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Camera constraints
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      // Request camera access
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      setStream(newStream);
      setCurrentFacingMode(facingMode);
      
    } catch (error) {
      console.error("Error accessing camera:", error);
      
      // Handle specific error cases
      if (error.name === 'NotAllowedError') {
        setError("Camera access denied. Please allow camera permissions.");
      } else if (error.name === 'NotFoundError') {
        setError("No camera found on this device.");
      } else if (error.name === 'OverconstrainedError') {
        setError("Camera constraints not supported. Trying with basic settings...");
        
        // Fallback to basic constraints
        try {
          const basicConstraints = { video: true };
          const fallbackStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
          }
          setStream(fallbackStream);
        } catch (fallbackError) {
          setError("Failed to access camera with basic settings.");
        }
      } else {
        setError("Failed to access camera. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between front and back cameras
  const toggleCamera = async () => {
    if (isLoading) return; // Prevent multiple toggles
    
    const newFacingMode = currentFacingMode === "environment" ? "user" : "environment";
    
    // Check if the desired camera is available
    const cameras = availableCameras.length > 0 ? availableCameras : await getCameraDevices();
    
    if (cameras.length < 2) {
      setError("Only one camera available on this device.");
      return;
    }
    
    await startCamera(newFacingMode);
  };

  useEffect(() => {
    // Initialize camera and get available devices
    const initializeCamera = async () => {
      await getCameraDevices();
      await startCamera();
    };

    initializeCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array to run only on mount

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        // Stop camera stream after capture
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        navigate("/", { state: { capturedImage: URL.createObjectURL(blob) } });
      }, "image/jpeg", 0.95);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="header">
        <button 
          onClick={() => navigate("/")}
          className="back-button"
        >
          <ArrowLeft size={24} />
        </button>
        
        {/* Camera Toggle Button */}
        {availableCameras.length > 1 && (
          <button 
            onClick={toggleCamera}
            disabled={isLoading}
            className="camera-toggle-button"
            title={`Switch to ${currentFacingMode === "environment" ? "front" : "back"} camera`}
          >
            <SwitchCamera size={24} />
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => startCamera()} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-indicator">
          <p>Switching camera...</p>
        </div>
      )}

      {/* Camera View */}
      <div className="camera-container">
        <div className="camera-view">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted
            className="camera-video"
          />
          
          {/* Camera UI Overlay */}
          <div className="camera-overlay">
            <div className="corner-marker corner-marker-tl"></div>
            <div className="corner-marker corner-marker-tr"></div>
            <div className="corner-marker corner-marker-bl"></div>
            <div className="corner-marker corner-marker-br"></div>
          </div>
          
          {/* Camera Info */}
          <div className="camera-info">
            <span className="camera-mode">
              {currentFacingMode === "environment" ? "📷 Back Camera" : "🤳 Front Camera"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-container">
        <button 
          onClick={captureImage}
          disabled={isLoading || !!error}
          className="capture-button"
        >
          <div className="capture-button-inner"></div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden-canvas" />
    </div>
  );
}