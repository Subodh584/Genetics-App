import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Test() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment"
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        if (videoRef.current?.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop());
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
      </div>

      {/* Camera View */}
      <div className="camera-container">
        <div className="camera-view">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="camera-video"
          />
          
          {/* Camera UI Overlay */}
          <div className="camera-overlay">
            <div className="corner-marker corner-marker-tl"></div>
            <div className="corner-marker corner-marker-tr"></div>
            <div className="corner-marker corner-marker-bl"></div>
            <div className="corner-marker corner-marker-br"></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-container">
        <button 
          onClick={captureImage}
          className="capture-button"
        >
          <div className="capture-button-inner"></div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden-canvas" />
    </div>
  );
}