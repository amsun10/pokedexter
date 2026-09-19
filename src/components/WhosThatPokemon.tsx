import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Volume2, RotateCcw } from 'lucide-react';
import type { Pokemon } from '../types/pokemon';
import {
  unlockAudioAndSpeech,
  playRevealFanfare,
  speakPokemonIntro,
  playTypewriterBlip,
  triggerHaptic,
  stopSpeaking
} from '../services/soundEffects';

interface WhosThatPokemonProps {
  pokemon: Pokemon;
  isRevealed: boolean;
  onReveal: () => void;
  onReset: () => void;
  onSpeakingChange: (speaking: boolean) => void;
}

export const WhosThatPokemon: React.FC<WhosThatPokemonProps> = ({
  pokemon,
  isRevealed,
  onReveal,
  onReset,
  onSpeakingChange,
}) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [displayedCharCount, setDisplayedCharCount] = useState<number>(0);

  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSpokenRef = useRef<boolean>(false);

  const fullIntroText = `【No.${String(pokemon.id).padStart(3, '0')} ${pokemon.name}】${pokemon.genus}，${pokemon.types.join('和')}属性。${pokemon.description}`;

  // Start character-by-character typewriter text crawl
  const startTypewriter = () => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    setDisplayedCharCount(0);
    onSpeakingChange(true);

    let current = 0;
    typeIntervalRef.current = setInterval(() => {
      current++;
      setDisplayedCharCount(current);
      playTypewriterBlip();

      if (current >= fullIntroText.length) {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      }
    }, 45);
  };

  // Fast forward text
  const handleFastForwardText = () => {
    if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    setDisplayedCharCount(fullIntroText.length);
  };

  // Trigger reveal sequence
  useEffect(() => {
    if (!isRevealed) {
      hasSpokenRef.current = false;
    } else if (isRevealed && !hasSpokenRef.current) {
      hasSpokenRef.current = true;

      // Golden confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F8D030', '#F08030', '#6890F0', '#78C850', '#ffffff'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }

      playRevealFanfare();
      triggerHaptic('reveal');

      // Seamlessly start typewriter subtitles and Chinese Pokédex voice intro
      startTypewriter();
      speakPokemonIntro(pokemon, onSpeakingChange);
    }

    return () => {
      stopSpeaking();
      onSpeakingChange(false);
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
  }, [isRevealed, pokemon, onSpeakingChange]);

  // Auto reveal countdown
  useEffect(() => {
    if (!isRevealed && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isRevealed && countdown === 0) {
      onReveal();
    }
  }, [isRevealed, countdown, onReveal]);

  // Handle replay of voice intro + typewriter reset
  const handleReplayVoice = () => {
    unlockAudioAndSpeech();
    triggerHaptic('click');
    startTypewriter();
    speakPokemonIntro(pokemon, onSpeakingChange);
  };

  const handleManualReveal = () => {
    unlockAudioAndSpeech();
    onReveal();
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 overflow-hidden rounded-xl flex flex-col items-center justify-between p-4 border-4 border-zinc-800 shadow-2xl">
      {/* Anime Radiating Ray Sunburst Background */}
      <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center">
        <div
          className="w-[180%] h-[180%] spin-rays"
          style={{
            background:
              'repeating-conic-gradient(from 0deg, #60a5fa 0deg 15deg, transparent 15deg 30deg)',
          }}
        />
      </div>

      {/* Top Banner Header */}
      <div className="relative z-10 w-full flex items-center justify-between px-2 pt-1">
        <div className="flex items-center space-x-2 bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-blue-400/40">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span className="text-xs font-tech text-yellow-200 tracking-wider">
            {isRevealed ? '检测成功 · 已收录' : '雷达锁定 · 悬念揭晓'}
          </span>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 bg-black/50 hover:bg-black/70 backdrop-blur text-xs font-tech text-zinc-300 px-3 py-1 rounded-full border border-zinc-700 transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重新扫描</span>
        </button>
      </div>

      {/* ================= Silhouette Suspense Stage ================= */}
      {!isRevealed ? (
        <div
          onClick={handleManualReveal}
          className="relative z-10 my-auto flex flex-col items-center justify-center cursor-pointer select-none"
        >
          {/* Glowing Aura Ring */}
          <div
            className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full opacity-20 bg-blue-400"
          />

          {/* Pokemon Silhouette */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
            <img
              src={pokemon.artworkUrl}
              alt={pokemon.name}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-contain transition-all duration-500 ${
                !imageLoaded ? 'opacity-0' : 'opacity-100'
              } brightness-0 contrast-200 drop-shadow-[0_0_12px_rgba(30,58,138,0.9)] animate-pulse`}
            />
          </div>

          {/* Suspense Button */}
          <div className="mt-2 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 px-5 py-2.5 rounded-2xl shadow-xl border-2 border-yellow-300 transform -rotate-1 hover:scale-105 transition active:scale-95 text-center animate-bounce">
            <h2 className="text-lg sm:text-xl font-pixel text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider">
              ✨ 猜猜我是谁？！ ✨
            </h2>
            <p className="text-[11px] font-mono-tech text-white font-bold mt-1 bg-black/30 px-3 py-0.5 rounded-full border border-yellow-300/40">
              👉 轻触屏幕立即揭晓 (倒计时 {countdown}s)
            </p>
          </div>
        </div>
      ) : (
        /* ================= Revealed State Stage ================= */
        <div className="relative z-10 w-full flex-1 flex flex-col justify-between py-1 space-y-2 overflow-hidden">
          {/* Top Row: Artwork + Identity Badges */}
          <div className="flex items-center space-x-3 bg-black/60 backdrop-blur p-2 rounded-xl border border-zinc-700/60 shadow">
            {/* Artwork */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full opacity-40 filter blur-sm"
                style={{ backgroundColor: pokemon.color || '#F8D030' }}
              />
              <img
                src={pokemon.artworkUrl}
                alt={pokemon.name}
                className="w-full h-full object-contain filter drop-shadow relative z-10 scale-105"
              />
            </div>

            {/* Title & Stats */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center space-x-1.5">
                <span className="bg-yellow-400 text-zinc-950 px-2 py-0.5 rounded font-pixel text-xs sm:text-sm font-bold truncate shadow">
                  是——【{pokemon.name}】！
                </span>
              </div>

              <div className="flex items-center space-x-2 text-[11px] font-mono-tech text-zinc-300 mt-1">
                <span className="text-amber-300 font-mono">No.{String(pokemon.id).padStart(3, '0')}</span>
                <span>·</span>
                <span className="text-zinc-400">{pokemon.genus}</span>
              </div>

              <div className="flex items-center space-x-2 text-[10px] font-tech text-zinc-400 mt-1">
                <div className="flex space-x-1">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className="px-1.5 py-0.2 rounded-full text-white font-medium"
                      style={{ backgroundColor: pokemon.color || '#3b82f6' }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <span>高{pokemon.height}m</span>
                <span>重{pokemon.weight}kg</span>
              </div>
            </div>
          </div>

          {/* Middle: Typewriter Pokédex Data Log Box */}
          <div
            onClick={handleFastForwardText}
            className="flex-1 min-h-[64px] max-h-[100px] overflow-y-auto cursor-pointer bg-zinc-950/90 hover:bg-zinc-900/90 p-2 rounded-xl border border-emerald-500/50 font-mono-tech text-[11px] sm:text-xs leading-relaxed text-emerald-300 shadow-inner select-none transition group relative"
            title="点击可直接显示全部文字"
          >
            <div className="flex items-center justify-between text-[9px] text-emerald-400/90 mb-1 border-b border-zinc-800 pb-0.5 font-tech">
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>图鉴解说 DATA LOG</span>
              </span>
              <span className="text-zinc-500 group-hover:text-emerald-400 transition">
                {displayedCharCount < fullIntroText.length ? '点击快进 »' : '已全部解析'}
              </span>
            </div>

            <p className="tracking-wide text-zinc-200">
              <span className="text-emerald-300 font-semibold">{fullIntroText.slice(0, displayedCharCount)}</span>
              {displayedCharCount < fullIntroText.length && (
                <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5 align-middle shadow-[0_0_8px_#34d399]" />
              )}
            </p>
          </div>

          {/* Bottom: Action Buttons */}
          <div className="flex items-center justify-between gap-2.5 pt-0.5">
            <button
              onClick={handleReplayVoice}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-zinc-950 font-tech font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition active:scale-95 shadow-md"
            >
              <Volume2 className="w-4 h-4" />
              <span>重播</span>
            </button>

            <button
              onClick={onReset}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-tech font-bold py-2.5 px-3 rounded-xl text-xs sm:text-sm transition active:scale-95 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再次扫描</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
