import React from 'react';
import { Search, BookOpen, Volume2, Sparkles, Compass } from 'lucide-react';
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
    <div className="relative w-full h-full bg-gradient-to-b from-slate-950 via-indigo-950/60 to-slate-950 rounded-xl overflow-hidden p-3 sm:p-4 flex flex-col items-center justify-between border-4 border-indigo-900/60 shadow-2xl select-none">
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 crt-scanlines pointer-events-none opacity-30" />

      {/* Top Friendly Status Banner */}
      <div className="w-full flex items-center justify-between z-10 border-b border-indigo-800/40 pb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="font-pixel text-[11px] sm:text-xs text-amber-300 tracking-wider flex items-center">
            <Compass className="w-3.5 h-3.5 mr-1 text-amber-400 animate-spin" />
            探索中...
          </span>
        </div>
        <button
          onClick={handleReplayVoice}
          title="听听图鉴怎么说"
          className="px-2 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-amber-200 border border-indigo-700/80 transition active:scale-95 flex items-center space-x-1"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-tech text-[10px]">听提示</span>
        </button>
      </div>

      {/* Center Whimsical Search Graphic */}
      <div className="my-auto flex flex-col items-center justify-center text-center z-10 px-2 space-y-2.5">
        {/* Playful Grass & Magnifying Glass Scene */}
        <div className="relative w-24 h-24 sm:w-26 sm:h-26 flex items-center justify-center">
          {/* Glowing Aura */}
          <div className="absolute inset-0 rounded-full bg-amber-400/10 filter blur-md animate-pulse" />

          {/* Cute Soft Silhouette Circle */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-dashed border-amber-300/60 bg-gradient-to-br from-indigo-900/60 to-purple-950/60 flex items-center justify-center shadow-inner">
            <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none transform hover:scale-110 transition">
              🌿
            </span>
            {/* Cute bouncing magnifying glass */}
            <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-amber-400 text-amber-950 shadow-md animate-bounce">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Child-friendly Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="font-tech font-extrabold text-base sm:text-lg text-amber-300 tracking-wide flex items-center justify-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>哎呀，宝可梦躲起来啦！</span>
          </h3>
          <p className="font-tech text-xs text-zinc-300">
            草丛里静悄悄的，还没发现宝可梦的踪迹哦~
          </p>
        </div>

        {/* Cute Summoning Tips Card */}
        <div className="bg-slate-900/80 border border-indigo-700/50 rounded-xl p-2.5 max-w-xs w-full text-left space-y-1 text-[11px] sm:text-xs font-tech text-zinc-300 shadow-inner">
          <p className="flex items-center text-amber-300 font-bold mb-0.5">
            <span className="mr-1">💡</span> 召唤小妙招：
          </p>
          <p className="text-zinc-300 flex items-center">
            <span className="text-amber-400 mr-1.5">🧸</span> 把可爱的玩偶放在方框正中
          </p>
          <p className="text-zinc-300 flex items-center">
            <span className="text-amber-400 mr-1.5">🔍</span> 靠得近一点（让镜头看清楚）
          </p>
          <p className="text-zinc-400 text-[10px] flex items-center">
            <span className="text-amber-400 mr-1.5">☀️</span> 找一个光线明亮的好地方~
          </p>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full flex items-center space-x-2 z-10 pt-2 border-t border-indigo-800/40">
        <button
          onClick={() => {
            playButtonClick();
            onRetry();
          }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-teal-950 font-tech font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-[0_3px_0_#065f46] active:translate-y-0.5 transition active:scale-95"
        >
          <Search className="w-4 h-4 text-teal-950" />
          <span>再找一次！</span>
        </button>

        <button
          onClick={() => {
            playButtonClick();
            onOpenBook();
          }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-tech font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-[0_3px_0_#92400e] active:translate-y-0.5 transition active:scale-95"
        >
          <BookOpen className="w-4 h-4 text-amber-950" />
          <span>翻翻看图鉴</span>
        </button>
      </div>
    </div>
  );
};
