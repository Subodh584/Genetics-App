import { useRef, useState } from "react";

export default function Test() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment" // This specifies the back camera
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      setImage(canvasRef.current.toDataURL("image/png"));
    }
  };

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <button onClick={startCamera} className="bg-blue-500 text-white px-4 py-2 rounded">
        Start Camera
      </button>
      <video ref={videoRef} autoPlay className="w-full max-w-md border border-gray-300" />
      <button onClick={captureImage} className="bg-green-500 text-white px-4 py-2 rounded">
        Capture
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {image && <img src={image} alt="Captured" className="w-full max-w-md border border-gray-300" />}
    </div>
  );
}