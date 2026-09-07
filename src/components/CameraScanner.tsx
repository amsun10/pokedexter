import React, { useEffect, useRef, useState } from 'react';
import { Camera, SwitchCamera, Upload } from 'lucide-react';
import { unlockAudioAndSpeech } from '../services/soundEffects';

interface CameraScannerProps {
  onCaptureFrame: (canvas: HTMLCanvasElement, dataUrl?: string) => void;
  isScanning: boolean;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onCaptureFrame,
  isScanning,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setHasCamera(false);
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
      } catch (err: unknown) {
        console.warn('Camera access failed:', err);
        setHasCamera(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Flip camera between front and rear
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video
  const captureCurrentFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCaptureFrame(canvas, dataUrl);
  };

  // Expose capture method: if live stream active, capture frame; otherwise invoke native camera
  useEffect(() => {
    if (isScanning) {
      if (hasCamera) {
        captureCurrentFrame();
      } else {
        nativeCameraInputRef.current?.click();
      }
    }
  }, [isScanning, hasCamera]);

  // Handle local file photo upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    unlockAudioAndSpeech();
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onCaptureFrame(canvas, dataUrl);
      };
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="relative w-full h-full bg-zinc-950 overflow-hidden rounded-xl flex items-center justify-center border-4 border-zinc-800 shadow-inner">
      {/* Hidden offscreen canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video View or Standby Camera Launcher */}
      {hasCamera ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-400/60 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse">
            <Camera className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-tech font-bold text-white tracking-wider">手机相机探测器准备就绪</p>
            <p className="text-[11px] font-mono-tech text-zinc-400 mt-0.5">
              点击下方【扫描】直接开启手机镜头对准玩偶
            </p>
          </div>
          <button
            onClick={() => nativeCameraInputRef.current?.click()}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-tech font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg active:scale-95 border border-emerald-300/40"
          >
            <Camera className="w-4 h-4" />
            <span>开启手机镜头拍摄玩偶</span>
          </button>
        </div>
      )}

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-40" />

      {/* Targeting HUD & Reticle */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
        {/* Radar Corner Brackets */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Top-Left Bracket */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          {/* Top-Right Bracket */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          {/* Bottom-Left Bracket */}
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          {/* Bottom-Right Bracket */}
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

          {/* Crosshair Center */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="w-full h-0.5 bg-emerald-400/60" />
            <div className="h-full w-0.5 bg-emerald-400/60 absolute" />
            <div className="w-3 h-3 rounded-full border border-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)] absolute" />
          </div>

          {/* Scanning Radar Laser Line */}
          {isScanning && (
            <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
          )}

          {/* Scan Target Text */}
          <div className="absolute -bottom-8 bg-black/70 px-3 py-0.5 rounded text-[11px] font-mono-tech text-emerald-300 tracking-wider flex items-center space-x-1.5 border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>{isScanning ? '正在分析毛绒玩具特征...' : '对准毛绒玩具 / 卡片'}</span>
          </div>
        </div>
      </div>

      {/* Floating Toolbar Controls */}
      <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
        {/* Flip Camera */}
        {hasCamera && (
          <button
            onClick={toggleFacingMode}
            title="切换前后摄像头"
            className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white/90 border border-zinc-700/60 backdrop-blur transition active:scale-95 shadow-md"
          >
            <SwitchCamera className="w-4 h-4" />
          </button>
        )}

        {/* Upload Photo button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="上传玩偶照片"
          className="p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white/90 border border-zinc-700/60 backdrop-blur transition active:scale-95 shadow-md"
        >
          <Upload className="w-4 h-4" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Mobile Native Camera Capture Direct Shutter */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {/* Live HUD Status badge */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur border border-zinc-700/50 rounded-lg px-2.5 py-1 text-[11px] font-mono-tech text-zinc-300 flex items-center space-x-1.5">
        <Camera className="w-3.5 h-3.5 text-emerald-400" />
        <span className="uppercase">{facingMode === 'environment' ? '后置镜头' : '前置镜头'}</span>
      </div>
    </div>
  );
};
