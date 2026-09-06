import type { Pokemon } from '../types/pokemon';

// Web Audio Context singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global Mute State
let isMutedState: boolean = (() => {
  try {
    return localStorage.getItem('pokedex_sound_muted') === 'true';
  } catch {
    return false;
  }
})();

export function isSoundMuted(): boolean {
  return isMutedState;
}

export function setSoundMuted(muted: boolean): void {
  isMutedState = muted;
  try {
    localStorage.setItem('pokedex_sound_muted', muted ? 'true' : 'false');
  } catch {
    // ignore
  }
  if (muted) {
    stopSpeaking();
  }
}

export function toggleSoundMuted(): boolean {
  setSoundMuted(!isMutedState);
  return isMutedState;
}

/**
 * Tactical button click sound
 */
export function playButtonClick() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn('Audio click error:', e);
  }
}

/**
 * Subtle typewriter character text blip
 */
let lastBlipTime = 0;
export function playTypewriterBlip() {
  if (isMutedState) return;

  const nowMs = Date.now();
  if (nowMs - lastBlipTime < 70) return; // throttle
  lastBlipTime = nowMs;

  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch {
    // Ignore audio blip errors
  }
}

/**
 * Radar / Scanning beep beep beep sound
 */
export function playScanSound() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play 3 rapid chirps
    [0, 0.12, 0.24].forEach((timeOffset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const freq = 1200 + idx * 250;
      osc.frequency.setValueAtTime(freq, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(freq + 400, now + timeOffset + 0.08);

      gain.gain.setValueAtTime(0.25, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.08);
    });
  } catch (e) {
    console.warn('Audio scan error:', e);
  }
}

/**
 * Lock-on chime when Pokémon is detected
 */
export function playLockOnSound() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.1); // E6
    osc2.frequency.setValueAtTime(1318.51, now);
    osc2.frequency.setValueAtTime(1760.00, now + 0.1); // A6

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.warn('Lock-on audio error:', e);
  }
}

/**
 * Iconic 'Who's that Pokemon?' suspense motif
 */
export function playWhoIsThatPokemonJingle() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Classic 4-note suspense motif
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },    // C5
      { f: 659.25, t: 0.16, d: 0.15 }, // E5
      { f: 783.99, t: 0.32, d: 0.2 },  // G5
      { f: 1046.50, t: 0.54, d: 0.4 }, // C6
    ];

    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.3, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  } catch (e) {
    console.warn('Jingle error:', e);
  }
}

/**
 * Dramatic fanfare when the Pokémon is revealed
 */
export function playRevealFanfare() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const chords = [
      { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.18 },       // C major
      { freqs: [587.33, 739.99, 880.00], time: 0.2, dur: 0.18 },     // D major
      { freqs: [783.99, 987.77, 1174.66], time: 0.4, dur: 0.5 },     // G major
    ];

    chords.forEach(chord => {
      chord.freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + chord.time);

        gain.gain.setValueAtTime(0.18, now + chord.time);
        gain.gain.exponentialRampToValueAtTime(0.01, now + chord.time + chord.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + chord.time);
        osc.stop(now + chord.time + chord.dur);
      });
    });
  } catch (e) {
    console.warn('Fanfare error:', e);
  }
}

/**
 * Pokédex Chinese robotic speech narration
 */
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function speakPokemonIntro(
  pokemon: Pokemon,
  onSpeakingChange?: (isSpeaking: boolean) => void
) {
  if (isMutedState) {
    onSpeakingChange?.(false);
    return;
  }

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this device');
    return;
  }

  stopSpeaking();

  const formattedId = String(pokemon.id).padStart(3, '0');
  const typeText = pokemon.types.join('和');
  const speechText = `发现宝可梦！${formattedId}号，${pokemon.name}。${pokemon.genus}，${typeText}属性。${pokemon.description}`;

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.02; // slightly snappy anime pace
  utterance.pitch = 1.05; // slightly cheerful & mechanical

  // Choose Chinese voice if available
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.startsWith('zh') || v.lang.includes('CN') || v.lang.includes('cmn'));
  if (zhVoice) {
    utterance.voice = zhVoice;
  }

  utterance.onstart = () => {
    onSpeakingChange?.(true);
  };

  utterance.onend = () => {
    onSpeakingChange?.(false);
  };

  utterance.onerror = () => {
    onSpeakingChange?.(false);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Mobile Haptic Vibration Feedback
 */
export function triggerHaptic(type: 'click' | 'scan' | 'lock' | 'reveal') {
  if (!('navigator' in window) || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (type) {
      case 'click':
        navigator.vibrate(35);
        break;
      case 'scan':
        navigator.vibrate([40, 60, 40, 60, 50]);
        break;
      case 'lock':
        navigator.vibrate([80, 50, 120]);
        break;
      case 'reveal':
        navigator.vibrate([150, 80, 250]);
        break;
    }
  } catch (e) {
    console.warn('Haptics failed:', e);
  }
}
