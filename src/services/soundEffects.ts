import type { Pokemon } from '../types/pokemon';

// Web Audio Context singleton
let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global TTS Audio Element & Utterance
let ttsAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

function getTtsAudio(): HTMLAudioElement {
  if (!ttsAudio) {
    ttsAudio = new Audio();
    ttsAudio.preload = 'auto';
    ttsAudio.setAttribute('referrerpolicy', 'no-referrer');
  }
  return ttsAudio;
}

/**
 * Mobile Audio & Speech Unlocker (Crucial for iOS Safari & Android Chrome)
 */
export function unlockAudioAndSpeech() {
  if (isAudioUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Play a tiny silent buffer to warm up iOS Web Audio
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    // Warm up HTMLAudioElement for mobile timer playback
    const audio = getTtsAudio();
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    audio.play().catch(() => {});

    // Warm up Web Speech API on user gesture for iOS Safari
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const warmUp = new SpeechSynthesisUtterance(' ');
      warmUp.volume = 0.01;
      warmUp.rate = 2.0;
      window.speechSynthesis.speak(warmUp);
    }

    isAudioUnlocked = true;
  } catch (e) {
    console.warn('Audio unlock warning:', e);
  }
}

// Auto-attach unlock listeners on any touch or click
if (typeof window !== 'undefined') {
  const globalUnlock = () => {
    unlockAudioAndSpeech();
    window.removeEventListener('touchstart', globalUnlock);
    window.removeEventListener('touchend', globalUnlock);
    window.removeEventListener('click', globalUnlock);
  };
  window.addEventListener('touchstart', globalUnlock, { passive: true, capture: true });
  window.addEventListener('touchend', globalUnlock, { passive: true, capture: true });
  window.addEventListener('click', globalUnlock, { passive: true, capture: true });
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
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
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
  if (nowMs - lastBlipTime < 65) return; // throttle
  lastBlipTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1050, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
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
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Play 3 loud, high-tech radar chirp sweeps
    [0, 0.12, 0.24].forEach((timeOffset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 950 + idx * 300;
      osc.frequency.setValueAtTime(baseFreq, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 700, now + timeOffset + 0.09);

      gain.gain.setValueAtTime(0.4, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.09);
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
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.12); // E6
    osc2.frequency.setValueAtTime(1318.51, now);
    osc2.frequency.setValueAtTime(1760.00, now + 0.12); // A6

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  } catch (e) {
    console.warn('Lock-on audio error:', e);
  }
}

/**
 * Whimsical playful sound when a Pokémon slips away into the grass
 */
export function playScanFailedSound() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Playful cartoon mystery notes (cute bounce: G4 -> E4 -> C4)
    [
      { f: 392.00, t: 0, d: 0.12 },
      { f: 329.63, t: 0.12, d: 0.12 },
      { f: 261.63, t: 0.24, d: 0.22 },
    ].forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.25, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  } catch (e) {
    console.warn('Audio scan failed error:', e);
  }
}

/**
 * Iconic 'Who's that Pokemon?' suspense motif
 */
export function playWhoIsThatPokemonJingle() {
  if (isMutedState) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, t: 0, d: 0.16 },    // C5
      { f: 659.25, t: 0.16, d: 0.16 }, // E5
      { f: 783.99, t: 0.32, d: 0.22 }, // G5
      { f: 1046.50, t: 0.54, d: 0.45 }, // C6
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.35, now + n.t);
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
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    const chords = [
      { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.2 },       // C major
      { freqs: [587.33, 739.99, 880.00], time: 0.22, dur: 0.2 },     // D major
      { freqs: [783.99, 987.77, 1174.66], time: 0.44, dur: 0.55 },     // G major
    ];

    chords.forEach((chord) => {
      chord.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + chord.time);

        gain.gain.setValueAtTime(0.25, now + chord.time);
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
 * Pokédex Chinese robotic speech narration (Dual Engine: Audio Stream + Web Speech Fallback)
 */
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

let currentSpeechId = 0;

export function stopSpeaking() {
  currentSpeechId++;

  if (ttsAudio) {
    try {
      ttsAudio.onplay = null;
      ttsAudio.onended = null;
      ttsAudio.onerror = null;
      ttsAudio.pause();
      ttsAudio.currentTime = 0;
      ttsAudio.removeAttribute('src');
      ttsAudio.load();
    } catch {
      // ignore
    }
  }

  if ('speechSynthesis' in window) {
    try {
      if (activeUtterance) {
        activeUtterance.onstart = null;
        activeUtterance.onend = null;
        activeUtterance.onerror = null;
      }
      window.speechSynthesis.cancel();
      activeUtterance = null;
    } catch {
      // ignore
    }
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

  stopSpeaking();
  const speechId = currentSpeechId;

  const formattedId = String(pokemon.id).padStart(3, '0');
  const typeText = pokemon.types.join('和');
  const speechText = `发现宝可梦！${formattedId}号，${pokemon.name}。${pokemon.genus}，${typeText}属性。${pokemon.description}`;

  // Primary: Native Web Speech API (High quality Siri/Google Chinese voice, zero latency, offline)
  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (hasSpeechSynthesis) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
      const zhVoice = voices.find(
        (v) => v.lang.startsWith('zh') || v.lang.includes('CN') || v.lang.includes('cmn')
      );
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      activeUtterance = utterance;

      utterance.onstart = () => {
        if (speechId === currentSpeechId) {
          onSpeakingChange?.(true);
        }
      };

      utterance.onend = () => {
        if (speechId === currentSpeechId) {
          activeUtterance = null;
          onSpeakingChange?.(false);
        }
      };

      utterance.onerror = () => {
        if (speechId === currentSpeechId) {
          activeUtterance = null;
          onSpeakingChange?.(false);
        }
      };

      window.speechSynthesis.speak(utterance);
      return; // Handled exclusively by Web Speech. Never run audio stream simultaneously.
    } catch (e) {
      console.warn('Web Speech error, falling back to audio stream:', e);
    }
  }

  // Fallback: Online Audio TTS Stream (used only if Web Speech is completely unsupported)
  try {
    const audio = getTtsAudio();
    audio.setAttribute('referrerpolicy', 'no-referrer');
    const ttsUrl = `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(speechText)}&spd=5&source=web`;

    audio.src = ttsUrl;
    audio.volume = 1.0;

    audio.onplay = () => {
      if (speechId === currentSpeechId) {
        onSpeakingChange?.(true);
      }
    };

    audio.onended = () => {
      if (speechId === currentSpeechId) {
        onSpeakingChange?.(false);
      }
    };

    audio.onerror = () => {
      if (speechId === currentSpeechId) {
        onSpeakingChange?.(false);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (speechId === currentSpeechId) {
          onSpeakingChange?.(false);
        }
      });
    }
  } catch {
    onSpeakingChange?.(false);
  }
}

/**
 * Pokédex voice narration when no Pokémon is matched
 */
export function speakNotFoundMessage(onSpeakingChange?: (isSpeaking: boolean) => void) {
  if (isMutedState) {
    onSpeakingChange?.(false);
    return;
  }

  stopSpeaking();
  const speechId = currentSpeechId;
  const speechText = '哎呀，宝可梦悄悄躲起来啦！快把玩偶靠近一点，我们再找找看吧！';

  const hasSpeechSynthesis = typeof window !== 'undefined' && 'speechSynthesis' in window;

  if (hasSpeechSynthesis) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
      const zhVoice = voices.find(
        (v) => v.lang.startsWith('zh') || v.lang.includes('CN') || v.lang.includes('cmn')
      );
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      activeUtterance = utterance;

      utterance.onstart = () => {
        if (speechId === currentSpeechId) {
          onSpeakingChange?.(true);
        }
      };

      utterance.onend = () => {
        if (speechId === currentSpeechId) {
          activeUtterance = null;
          onSpeakingChange?.(false);
        }
      };

      utterance.onerror = () => {
        if (speechId === currentSpeechId) {
          activeUtterance = null;
          onSpeakingChange?.(false);
        }
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('Web Speech error in speakNotFoundMessage:', e);
    }
  }

  // Fallback to online audio
  try {
    const audio = getTtsAudio();
    audio.setAttribute('referrerpolicy', 'no-referrer');
    const ttsUrl = `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(speechText)}&spd=5&source=web`;

    audio.src = ttsUrl;
    audio.volume = 1.0;

    audio.onplay = () => {
      if (speechId === currentSpeechId) {
        onSpeakingChange?.(true);
      }
    };

    audio.onended = () => {
      if (speechId === currentSpeechId) {
        onSpeakingChange?.(false);
      }
    };

    audio.onerror = () => {
      if (speechId === currentSpeechId) {
        onSpeakingChange?.(false);
      }
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (speechId === currentSpeechId) {
          onSpeakingChange?.(false);
        }
      });
    }
  } catch {
    onSpeakingChange?.(false);
  }
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
        navigator.vibrate([50, 60, 50, 60, 50]);
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
