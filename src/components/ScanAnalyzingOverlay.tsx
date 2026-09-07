import React from 'react';
import { Sparkles, RotateCcw, Cpu } from 'lucide-react';

interface ScanAnalyzingOverlayProps {
  imageSrc: string;
  onCancel: () => void;
  isAiActive: boolean;
}

export const ScanAnalyzingOverlay: React.FC<ScanAnalyzingOverlayProps> = ({
  imageSrc,
  onCancel,
  isAiActive,
}) => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-xl flex items-center justify-center border-4 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
      {/* 1. Frozen Snapshot Photo */}
      <img
        src={imageSrc}
        alt="Frozen capture"
        className="w-full h-full object-cover filter brightness-90 contrast-110 select-none pointer-events-none"
      />

      {/* 2. CRT Scanlines */}
      <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-50" />

      {/* 3. Hologram Cyber Grid Layer */}
      <div className="absolute inset-0 pointer-events-none hologram-grid opacity-75" />

      {/* 4. Subtle Vignette & Blue Tint */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-cyan-950/60 via-transparent to-cyan-950/40" />

      {/* 5. Sweeping Laser Beam with Light Glow */}
      <div className="absolute inset-x-0 h-8 pointer-events-none animate-laser-scan z-20 flex flex-col items-center justify-center">
        {/* Core Laser Bar */}
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_15px_#22d3ee,0_0_30px_#06b6d4]" />
        {/* Trailing Beam Glow */}
        <div className="w-full h-6 bg-gradient-to-b from-cyan-400/25 to-transparent pointer-events-none" />
      </div>

      {/* 6. Targeting Reticle / Corner Brackets */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4 z-20">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center animate-target-bracket">
          {/* Top-Left Corner */}
          <div className="absolute top-0 left-0 w-9 h-9 border-t-4 border-l-4 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          {/* Top-Right Corner */}
          <div className="absolute top-0 right-0 w-9 h-9 border-t-4 border-r-4 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          {/* Bottom-Left Corner */}
          <div className="absolute bottom-0 left-0 w-9 h-9 border-b-4 border-l-4 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          {/* Bottom-Right Corner */}
          <div className="absolute bottom-0 right-0 w-9 h-9 border-b-4 border-r-4 border-cyan-400 shadow-[0_0_10px_#22d3ee]" />

          {/* Central Target Cross */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="w-full h-0.5 bg-cyan-400/80 shadow-[0_0_6px_#22d3ee]" />
            <div className="h-full w-0.5 bg-cyan-400/80 absolute shadow-[0_0_6px_#22d3ee]" />
            <div className="w-5 h-5 rounded-full border border-cyan-300 shadow-[0_0_10px_#22d3ee] absolute animate-ping opacity-60" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] absolute" />
          </div>

          {/* HUD Tech Readout Badge */}
          <div className="absolute -bottom-10 flex flex-col items-center space-y-1">
            <div className="bg-black/85 border border-cyan-500/70 px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)] flex items-center space-x-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              <Cpu className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs font-tech font-bold text-cyan-200 tracking-wider">
                {isAiActive ? 'AI 多模态神经识别中...' : '图鉴光学特征比对中...'}
              </span>
            </div>
            <span className="text-[10px] font-mono-tech text-cyan-400/80 tracking-widest uppercase">
              SCANNING TARGET MATRIX
            </span>
          </div>
        </div>
      </div>

      {/* 7. Top Bar Controls: Status Badge + Cancel Button */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-auto">
        {/* Left Status */}
        <div className="bg-black/75 backdrop-blur-md border border-cyan-500/50 rounded-lg px-2.5 py-1 text-[11px] font-mono-tech text-cyan-300 flex items-center space-x-1.5 shadow-md">
          {isAiActive ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="font-bold text-purple-200">GEMINI VISION</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>LOCAL MATRIX</span>
            </>
          )}
        </div>

        {/* Right Cancel / Retarget Button */}
        <button
          onClick={onCancel}
          title="取消并重新对准"
          className="flex items-center space-x-1 bg-red-950/80 hover:bg-red-900 border border-red-500/70 text-red-200 px-2.5 py-1 rounded-lg text-xs font-tech font-bold backdrop-blur-md transition shadow-lg active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重新瞄准</span>
        </button>
      </div>
    </div>
  );
};
