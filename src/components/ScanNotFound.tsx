import React from 'react';
import { RotateCcw, BookOpen, AlertCircle, Volume2, Sparkles } from 'lucide-react';
import { playButtonClick, speakNotFoundMessage } from '../services/soundEffects';

interface ScanNotFoundProps {
  onRetry: () => void;
  onOpenBook: () => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export const ScanNotFound: React.FC<ScanNotFoundProps> = ({
  onRetry,
  onOpenBook,
  onSpeakingChange,
}) => {
  const handleReplayVoice = () => {
    playButtonClick();
    speakNotFoundMessage(onSpeakingChange);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-zinc-950 via-red-950/40 to-zinc-950 rounded-xl overflow-hidden p-3.5 sm:p-4 flex flex-col items-center justify-between border-4 border-red-900/80 shadow-2xl select-none">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-40" />

      {/* Top Status Banner */}
      <div className="w-full flex items-center justify-between z-10 border-b border-red-800/60 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="font-pixel text-[11px] sm:text-xs text-red-400 tracking-wider">
            STATUS: NO DATA
          </span>
        </div>
        <button
          onClick={handleReplayVoice}
          title="重新播报提示语音"
          className="p-1 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/80 transition active:scale-95 flex items-center space-x-1"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="font-tech text-[10px]">语音播报</span>
        </button>
      </div>

      {/* Center Radar Scanner with Question Mark */}
      <div className="my-auto flex flex-col items-center justify-center text-center z-10 px-2 space-y-3">
        {/* Radar Silhouette Graphic */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-red-500/60 flex items-center justify-center bg-red-950/30 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
          {/* Rotating radar line */}
          <div className="absolute inset-0 rounded-full border border-red-500/20" />
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-red-900/40 border border-red-500/80 flex items-center justify-center">
            <span className="font-pixel text-3xl sm:text-4xl text-red-400 animate-pulse font-bold">
              ?
            </span>
          </div>
          {/* Corner brackets */}
          <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-red-400" />
          <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-red-400" />
          <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-red-400" />
          <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-red-400" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="font-pixel text-base sm:text-lg text-red-400 tracking-wider flex items-center justify-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-red-500 animate-bounce" />
            <span>未发现宝可梦</span>
          </h3>
          <p className="font-tech text-xs sm:text-[13px] text-zinc-300">
            数据库中未能匹配到关东宝可梦特征
          </p>
        </div>

        {/* Actionable Tips Card */}
        <div className="bg-zinc-900/90 border border-red-800/60 rounded-xl p-2.5 max-w-xs w-full text-left space-y-1 text-[11px] sm:text-xs font-tech text-zinc-300 shadow-inner">
          <p className="flex items-center text-amber-300 font-bold mb-0.5">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" />
            扫描小贴士：
          </p>
          <p className="text-zinc-300">1. 将玩偶正面置于黄色方框正中</p>
          <p className="text-zinc-300">2. 稍微靠近一点（距离约 20~30 厘米）</p>
          <p className="text-zinc-400 text-[10px]">3. 保持环境光线明亮，避免逆光或反光</p>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full flex items-center space-x-2 z-10 pt-2 border-t border-red-900/40">
        <button
          onClick={() => {
            playButtonClick();
            onRetry();
          }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-teal-950 font-tech font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-[0_3px_0_#065f46] active:translate-y-0.5 transition"
        >
          <RotateCcw className="w-4 h-4 text-teal-950" />
          <span>重新扫描</span>
        </button>

        <button
          onClick={() => {
            playButtonClick();
            onOpenBook();
          }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-tech font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-[0_3px_0_#92400e] active:translate-y-0.5 transition"
        >
          <BookOpen className="w-4 h-4 text-amber-950" />
          <span>翻阅 151 图鉴</span>
        </button>
      </div>
    </div>
  );
};
