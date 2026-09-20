import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Smartphone,
  BookOpen,
  Camera,
  Scan,
  RotateCcw,
} from 'lucide-react';
import type { Pokemon, ScanState } from '../types/pokemon';
import { CameraScanner } from './CameraScanner';
import { WhosThatPokemon } from './WhosThatPokemon';
import { PokedexBook } from './PokedexBook';
import { ScanNotFound } from './ScanNotFound';
import { LANModal } from './LANModal';
import { ScanAnalyzingOverlay } from './ScanAnalyzingOverlay';
import {
  detectPokemonFromImage,
  getStoredGeminiKey,
  getStoredDeepSeekKey,
  getStoredAiProvider,
  type DetectionResult
} from '../services/detector';
import {
  isSoundMuted,
  toggleSoundMuted,
  unlockAudioAndSpeech,
  playButtonClick,
  playScanSound,
  playLockOnSound,
  playScanFailedSound,
  playWhoIsThatPokemonJingle,
  speakPokemonIntro,
  speakNotFoundMessage,
  triggerHaptic,
  stopSpeaking
} from '../services/soundEffects';

export const PokedexChassis: React.FC = () => {
  // Application modes
  const [activeTab, setActiveTab] = useState<'detector' | 'book'>('detector');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [targetPokemon, setTargetPokemon] = useState<Pokemon | null>(null);

  // States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [frozenImage, setFrozenImage] = useState<string | null>(null);
  const [showLANModal, setShowLANModal] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(isSoundMuted());


  // Trigger camera scan
  const handleStartScan = () => {
    if (scanState === 'scanning') return;

    const provider = getStoredAiProvider();
    const hasKey = provider === 'deepseek' ? !!getStoredDeepSeekKey() : !!getStoredGeminiKey();
    if (!hasKey) {
      playButtonClick();
      setShowLANModal(true);
      return;
    }

    stopSpeaking();
    setIsSpeaking(false);
    unlockAudioAndSpeech();
    playButtonClick();
    playScanSound();
    triggerHaptic('scan');
    setScanState('scanning');
    setIsCapturing(true);
  };

  // Frame captured from CameraScanner
  const handleFrameCaptured = async (canvas: HTMLCanvasElement, dataUrl?: string) => {
    setIsCapturing(false);
    const snapshot = dataUrl || canvas.toDataURL('image/jpeg', 0.85);
    setFrozenImage(snapshot);
    setScanState('scanning');

    try {
      const result: DetectionResult | null = await detectPokemonFromImage(canvas);

      if (!result || !result.pokemon) {
        // No match found in current frame
        playScanFailedSound();
        triggerHaptic('click');
        speakNotFoundMessage(setIsSpeaking);
        setScanState('error');
        setTargetPokemon(null);
        return;
      }

      setTargetPokemon(result.pokemon);

      // Play lock-on sound and trigger 'Who's That Pokemon'
      playLockOnSound();
      triggerHaptic('lock');

      setTimeout(() => {
        playWhoIsThatPokemonJingle();
        setScanState('silhouette');
      }, 400);
    } catch (e) {
      console.warn('Detection failed:', e);
      playScanFailedSound();
      speakNotFoundMessage(setIsSpeaking);
      setScanState('error');
      setTargetPokemon(null);
    }
  };

  // From Book mode to details
  const handleBookSelectPokemon = (pokemon: Pokemon) => {
    stopSpeaking();
    setIsSpeaking(false);
    setTargetPokemon(pokemon);
    setActiveTab('detector');
    setScanState('revealed');
  };

  // Reset back to live camera
  const handleResetScanner = () => {
    stopSpeaking();
    setIsSpeaking(false);
    playButtonClick();
    setFrozenImage(null);
    setScanState('idle');
    setTargetPokemon(null);
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center h-[100dvh] sm:h-auto sm:my-auto">
      {/* Outer Kanto Pokedex Shell */}
      <div className="w-full h-full sm:h-auto bg-gradient-to-b from-red-600 via-red-600 to-red-700 rounded-none sm:rounded-3xl p-3 sm:p-4 pt-[max(env(safe-area-inset-top),12px)] sm:pt-4 pb-[max(env(safe-area-inset-bottom),12px)] sm:pb-4 border-0 sm:border-4 border-red-800 shadow-none sm:shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_4px_6px_rgba(255,255,255,0.4)] flex flex-col justify-between relative overflow-hidden">
        {/* Subtle bevel line highlighting top lid */}
        <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* ===================== TOP HEADER ===================== */}
        <div className="flex items-center justify-between pb-2 sm:pb-3 border-b-2 border-red-900/60 relative flex-shrink-0">
          {/* Big Blue Optical Lens (Iconic) */}
          <div className="flex items-center space-x-3">
            <div className="relative p-1.5 rounded-full bg-gradient-to-b from-zinc-200 to-zinc-400 shadow-md">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full lens-blue transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
                  isSpeaking
                    ? 'lens-speaking-pulse'
                    : scanState === 'scanning'
                    ? 'lens-blue-pulse'
                    : ''
                }`}
              >
                {/* Internal Lens Reflections */}
                <div className="absolute top-1.5 left-2 w-4 h-2.5 rounded-full bg-white/70 -rotate-45 filter blur-[0.5px]" />
                <div className="absolute bottom-2 right-2 w-2 h-1 rounded-full bg-cyan-200/50" />
                {scanState === 'scanning' && (
                  <div className="w-3 h-3 rounded-full bg-white animate-ping" />
                )}
                {isSpeaking && (
                  <div className="w-5 h-5 rounded-full bg-cyan-200/70 animate-ping" />
                )}
              </div>
            </div>

            {/* Three Status LED Lights (Red, Yellow, Green) with Anime Speech Chase Effect */}
            <div className="flex items-center space-x-2">
              {/* Red LED */}
              <div
                title="红色状态指示灯"
                className={`w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm transition-all ${
                  isSpeaking
                    ? 'led-speech-red'
                    : scanState === 'scanning' || scanState === 'error'
                    ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse'
                    : 'bg-red-900/80'
                }`}
              />
              {/* Yellow LED */}
              <div
                title="黄色状态指示灯"
                className={`w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm transition-all ${
                  isSpeaking
                    ? 'led-speech-yellow'
                    : scanState === 'silhouette'
                    ? 'bg-yellow-400 shadow-[0_0_8px_#facc15] animate-bounce'
                    : 'bg-yellow-900/80'
                }`}
              />
              {/* Green LED */}
              <div
                title="绿色状态指示灯"
                className={`w-3.5 h-3.5 rounded-full border border-black/40 shadow-sm transition-all ${
                  isSpeaking
                    ? 'led-speech-green'
                    : scanState === 'revealed'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                    : 'bg-emerald-950'
                }`}
              />
            </div>
          </div>

          {/* Right Header Action Icons - Cute Cartoon Toy Candy Style */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* 1. Cute Sound Toggle Jelly Button */}
            <button
              onClick={() => {
                const next = toggleSoundMuted();
                setMuted(next);
                if (!next) playButtonClick();
              }}
              title={muted ? '开启声音' : '静音模式'}
              className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white/90 flex items-center justify-center transition-all duration-150 active:translate-y-0.5 ${
                muted
                  ? 'bg-gradient-to-b from-zinc-300 to-zinc-400 text-zinc-600 shadow-[0_3px_0_#52525b] active:shadow-[0_1px_0_#52525b]'
                  : 'bg-gradient-to-b from-emerald-300 to-teal-400 text-teal-950 shadow-[0_3px_0_#0f766e] active:shadow-[0_1px_0_#0f766e]'
              }`}
            >
              {/* Glossy shine */}
              <div className="absolute top-0.5 inset-x-1.5 h-2 bg-white/40 rounded-full pointer-events-none" />
              {muted ? (
                <VolumeX className="w-4 h-4 text-zinc-600 drop-shadow-sm" />
              ) : (
                <Volume2 className="w-4 h-4 text-teal-950 drop-shadow-sm" />
              )}
            </button>

            {/* 2. Cute Mobile Share Candy Pill */}
            <button
              onClick={() => {
                playButtonClick();
                setShowLANModal(true);
              }}
              title="手机连接"
              className="relative px-2.5 py-1.5 rounded-full border-2 border-white/90 bg-gradient-to-b from-sky-300 to-blue-400 text-sky-950 font-tech font-bold text-[11px] sm:text-xs flex items-center space-x-1 shadow-[0_3px_0_#1d4ed8] active:shadow-[0_1px_0_#1d4ed8] transition-all duration-150 active:translate-y-0.5 hover:brightness-105"
            >
              <div className="absolute top-0.5 inset-x-2 h-1.5 bg-white/45 rounded-full pointer-events-none" />
              <Smartphone className="w-3.5 h-3.5 text-sky-950 drop-shadow-sm" />
              <span className="drop-shadow-sm font-pixel text-[10px] sm:text-[11px]">手机</span>
            </button>

            {/* 3. Cute Mode Switcher: Pikachu Yellow / Pokédex Red */}
            <button
              onClick={() => {
                playButtonClick();
                stopSpeaking();
                setIsSpeaking(false);
                setActiveTab(activeTab === 'detector' ? 'book' : 'detector');
              }}
              title={activeTab === 'detector' ? '查看151图鉴' : '返回探测器'}
              className={`relative px-3 py-1.5 rounded-full border-2 border-white/90 font-tech font-bold text-[11px] sm:text-xs flex items-center space-x-1.5 transition-all duration-150 active:translate-y-0.5 hover:brightness-105 ${
                activeTab === 'book'
                  ? 'bg-gradient-to-b from-rose-400 to-red-500 text-white shadow-[0_3px_0_#991b1b] active:shadow-[0_1px_0_#991b1b]'
                  : 'bg-gradient-to-b from-amber-300 via-yellow-300 to-amber-400 text-amber-950 shadow-[0_3px_0_#b45309] active:shadow-[0_1px_0_#b45309]'
              }`}
            >
              <div className="absolute top-0.5 inset-x-2 h-1.5 bg-white/45 rounded-full pointer-events-none" />
              {activeTab === 'detector' ? (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-amber-950 drop-shadow-sm" />
                  <span className="drop-shadow-sm font-pixel text-[10px] sm:text-[11px]">图鉴库</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                  <span className="drop-shadow-sm font-pixel text-[10px] sm:text-[11px]">去探测</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ===================== SCREEN HOUSING ===================== */}
        <div className="my-2 sm:my-3 bg-zinc-300 rounded-2xl p-2.5 sm:p-4 border-4 border-zinc-500 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5),0_6px_12px_rgba(0,0,0,0.3)] flex-1 min-h-0 flex flex-col justify-between">
          {/* Top Two Speaker / Mic Dots */}
          <div className="flex justify-center space-x-4 mb-1.5 sm:mb-2 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-zinc-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-zinc-600" />
          </div>

          {/* Screen Content Container (CRT display) */}
          <div className="w-full flex-1 min-h-0 sm:h-[410px] rounded-xl overflow-hidden shadow-2xl relative">
            {activeTab === 'book' ? (
              <PokedexBook
                onSelectPokemon={handleBookSelectPokemon}
              />
            ) : scanState === 'scanning' && frozenImage ? (
              <ScanAnalyzingOverlay
                imageSrc={frozenImage}
                onCancel={handleResetScanner}
                isAiActive={
                  getStoredAiProvider() === 'deepseek'
                    ? !!getStoredDeepSeekKey()
                    : !!getStoredGeminiKey()
                }
                provider={getStoredAiProvider()}
              />
            ) : scanState === 'silhouette' || scanState === 'revealed' ? (
              targetPokemon && (
                <WhosThatPokemon
                  pokemon={targetPokemon}
                  isRevealed={scanState === 'revealed'}
                  onReveal={() => setScanState('revealed')}
                  onReset={handleResetScanner}
                  onSpeakingChange={setIsSpeaking}
                />
              )
            ) : scanState === 'error' ? (
              <ScanNotFound
                onRetry={handleResetScanner}
                onOpenBook={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                  setActiveTab('book');
                }}
                onSpeakingChange={setIsSpeaking}
              />
            ) : (
              <CameraScanner
                onCaptureFrame={handleFrameCaptured}
                isScanning={isCapturing}
              />
            )}
          </div>

          {/* Bottom Screen Vent Lines & Speaker Indicator */}
          <div className="flex items-center justify-between mt-1.5 sm:mt-2.5 px-2 flex-shrink-0">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-zinc-600" />
            <div className="flex space-x-1.5">
              <div className="w-8 h-1 bg-zinc-600 rounded" />
              <div className="w-8 h-1 bg-zinc-600 rounded" />
              <div className="w-8 h-1 bg-zinc-600 rounded" />
            </div>
          </div>
        </div>

        {/* ===================== CONTROL DECK ===================== */}
        <div className="mt-1 sm:mt-3 bg-red-700/80 rounded-2xl p-2 sm:p-3 border border-red-800 shadow-inner flex-shrink-0">
          <div className="flex items-center justify-between gap-2.5 sm:gap-3">
            {/* Left Action: Reset to Camera */}
            <button
              onClick={handleResetScanner}
              title="重置回扫描镜头"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-zinc-200 flex flex-col items-center justify-center border-2 border-zinc-600 shadow-[0_3px_0_#27272a] active:shadow-none active:translate-y-0.5 transition active:scale-95 flex-shrink-0"
            >
              <RotateCcw className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="font-tech text-[9px] sm:text-[10px] mt-0.5">重置</span>
            </button>

            {/* Center: Giant Hero "扫描" Shutter Button */}
            {activeTab === 'detector' ? (
              <button
                onClick={
                  scanState === 'revealed' || scanState === 'error'
                    ? handleResetScanner
                    : handleStartScan
                }
                disabled={scanState === 'scanning'}
                className={`flex-1 flex items-center justify-center py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl font-bold font-tech text-white btn-pokedex tracking-widest uppercase transition border-2 shadow-[0_4px_0_#1d4ed8,0_6px_12px_rgba(0,0,0,0.4)] active:scale-95 disabled:opacity-75 ${
                  scanState === 'error'
                    ? 'bg-gradient-to-b from-amber-500 via-orange-600 to-red-600 border-amber-300 shadow-[0_4px_0_#991b1b]'
                    : 'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:to-blue-600 border-blue-300'
                }`}
              >
                {scanState === 'error' ? (
                  <>
                    <RotateCcw className="w-6 h-6 mr-2" />
                    <span className="text-xl sm:text-2xl font-bold tracking-widest">
                      再找一次！
                    </span>
                  </>
                ) : (
                  <>
                    <Scan className={`w-6 h-6 mr-2 ${scanState === 'scanning' ? 'animate-spin' : ''}`} />
                    <span className="text-xl sm:text-2xl font-bold tracking-widest">
                      {scanState === 'scanning' ? '扫描中...' : '开始扫描'}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex-1 text-center font-tech text-xs sm:text-sm text-red-200/80">
                点击上方卡片查看宝可梦详情
              </div>
            )}

            {/* Right Action: Voice Readout */}
            <button
              onClick={() => {
                if (targetPokemon) {
                  playButtonClick();
                  speakPokemonIntro(targetPokemon, setIsSpeaking);
                }
              }}
              disabled={!targetPokemon}
              title="重新播报图鉴介绍"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white flex flex-col items-center justify-center border-2 border-blue-400 shadow-[0_3px_0_#1e1b4b] active:shadow-none active:translate-y-0.5 transition active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Volume2 className="w-5 h-5 sm:w-5 sm:h-5" />
              <span className="font-tech text-[9px] sm:text-[10px] mt-0.5">播报</span>
            </button>
          </div>
        </div>

        {/* LAN / Mobile share modal */}
        <LANModal
          isOpen={showLANModal}
          onClose={() => setShowLANModal(false)}
        />
      </div>
    </div>
  );
};
