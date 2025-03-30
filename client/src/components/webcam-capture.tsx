import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, CameraOff, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

interface WebcamCaptureProps {
  onPhotoCaptured: () => void;
}

export function WebcamCapture({ onPhotoCaptured }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Start camera
  const startCamera = useCallback(async () => {
    try {
      // First check if permissions are already granted
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permissions.state === 'denied') {
        throw new Error('Camera permission was denied');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'user', // Front camera for group photos
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: err.message === 'Camera permission was denied' 
          ? "Please enable camera access in your browser settings."
          : "Unable to access camera. Please check your device.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  }, [stream]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  // Start countdown to take photo
  const startCountdown = () => {
    setCountdown(3);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          takePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Take photo
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoTaken(true);
    }
  };
  
  // Reset and retake photo
  const resetPhoto = () => {
    setPhotoTaken(false);
  };
  
  // Save photo to server
  const savePhoto = async () => {
    if (!canvasRef.current || !user) return;
    
    try {
      setIsSaving(true);
      
      // Get base64 image data from canvas
      const photoData = canvasRef.current.toDataURL('image/jpeg');
      
      // Send to server
      const response = await apiRequest('POST', '/api/group-photo', { photoData });
      
      if (!response.ok) {
        throw new Error('Failed to save photo');
      }
      
      toast({
        title: "Success!",
        description: "Your group photo has been saved.",
      });
      
      // Notify parent component
      onPhotoCaptured();
      
      // Stop camera after saving
      stopCamera();
      
    } catch (error) {
      console.error('Error saving photo:', error);
      toast({
        title: "Error",
        description: "Failed to save your photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-2xl mx-auto">
      <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden border border-gray-800">
        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${photoTaken ? 'hidden' : 'block'}`}
        />
        
        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <span className="text-7xl font-orbitron text-white">{countdown}</span>
          </div>
        )}
        
        {/* Canvas for captured photo */}
        <canvas
          ref={canvasRef}
          className={`w-full h-full object-cover ${photoTaken ? 'block' : 'hidden'}`}
        />
        
        {/* Camera not active state */}
        {!isCameraActive && !photoTaken && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CameraOff className="h-16 w-16 mb-4 text-gray-500" />
            <p className="text-gray-400 mb-4 font-mono text-center">
              Camera is off. Click below to activate.
            </p>
            <Button onClick={startCamera} className="bg-green-600 hover:bg-green-700">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera
            </Button>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center space-x-4 w-full">
        {isCameraActive && !photoTaken && (
          <Button 
            onClick={startCountdown}
            disabled={countdown > 0}
            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
          >
            {countdown > 0 ? `Taking in ${countdown}...` : "Take Photo"}
          </Button>
        )}
        
        {photoTaken && (
          <>
            <Button 
              onClick={resetPhoto}
              variant="outline"
              className="min-w-[120px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            
            <Button 
              onClick={savePhoto}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 min-w-[120px]"
            >
              {isSaving ? "Saving..." : "Save Photo"}
            </Button>
          </>
        )}
      </div>
      
      <p className="text-gray-400 text-sm font-mono text-center max-w-md">
        Take a photo with your entire group to commemorate your completion of all challenges!
      </p>
    </div>
  );
}