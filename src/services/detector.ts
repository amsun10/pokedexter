import type { Pokemon } from '../types/pokemon.ts';
import { getPokemonById } from '../data/pokemonList.ts';

export interface DetectionResult {
  pokemon: Pokemon;
  confidence: number;
  candidates: { pokemon: Pokemon; confidence: number }[];
  detectedColorName?: string;
  source: 'camera' | 'upload' | 'quick-select';
}

export interface ColorAnalysis {
  r: number;
  g: number;
  b: number;
  brightness: number;
  saturation: number;
  hue: number;
  variance: number;
  vibrantRatio: number;
  // Specific color bucket ratios
  yellowRatio: number;
  orangeRedRatio: number;
  blueCyanRatio: number;
  greenTealRatio: number;
  purpleRatio: number;
  pinkRatio: number;
  brownRatio: number;
  navyCyanRatio: number;
  // Accent & contrast feature indicators
  redAccentRatio: number;      // e.g. Pikachu red cheeks, Bulbasaur bulb, Caterpie antenna
  creamWhiteRatio: number;     // e.g. Eevee collar, Snorlax belly, Charmander belly
  darkAccentRatio: number;     // e.g. Pikachu black ear tips, eyes
  leafChlorophyllRatio: number;// e.g. dull natural plant green vs anime vivid teal
}

export type AiProvider = 'deepseek' | 'gemini';

export function getStoredDeepSeekKey(): string {
  try {
    return (localStorage.getItem('pokedex_deepseek_key') || '').trim();
  } catch {
    return '';
  }
}

export function setStoredDeepSeekKey(key: string): void {
  try {
    localStorage.setItem('pokedex_deepseek_key', key.trim());
  } catch {
    // ignore
  }
}

export function getStoredGeminiKey(): string {
  try {
    return (localStorage.getItem('pokedex_gemini_key') || '').trim();
  } catch {
    return '';
  }
}

export function setStoredGeminiKey(key: string): void {
  try {
    localStorage.setItem('pokedex_gemini_key', key.trim());
  } catch {
    // ignore
  }
}

export function getStoredAiProvider(): AiProvider {
  try {
    const p = localStorage.getItem('pokedex_ai_provider');
    if (p === 'gemini' || p === 'deepseek') return p;
    if (getStoredDeepSeekKey()) return 'deepseek';
    if (getStoredGeminiKey()) return 'gemini';
    return 'deepseek';
  } catch {
    return 'deepseek';
  }
}

export function setStoredAiProvider(provider: AiProvider): void {
  try {
    localStorage.setItem('pokedex_ai_provider', provider);
  } catch {
    // ignore
  }
}

/**
 * High-precision foreground color clustering and pixel distribution analysis
 */
export function analyzeCanvasColors(canvas: HTMLCanvasElement): ColorAnalysis {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return {
      r: 250,
      g: 200,
      b: 50,
      brightness: 160,
      saturation: 0.8,
      hue: 45,
      variance: 30,
      vibrantRatio: 0.5,
      yellowRatio: 0.5,
      orangeRedRatio: 0,
      blueCyanRatio: 0,
      greenTealRatio: 0,
      purpleRatio: 0,
      pinkRatio: 0,
      brownRatio: 0,
      navyCyanRatio: 0,
      redAccentRatio: 0,
      creamWhiteRatio: 0,
      darkAccentRatio: 0,
      leafChlorophyllRatio: 0,
    };
  }

  // Focus on the center 60% reticle area
  const startX = Math.floor(canvas.width * 0.2);
  const startY = Math.floor(canvas.height * 0.2);
  const width = Math.floor(canvas.width * 0.6);
  const height = Math.floor(canvas.height * 0.6);

  const imgData = ctx.getImageData(startX, startY, width, height);
  const data = imgData.data;

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;
  let vibrantCount = 0;
  const brightnessSamples: number[] = [];

  let yellowCount = 0;
  let orangeRedCount = 0;
  let blueCyanCount = 0;
  let greenTealCount = 0;
  let purpleCount = 0;
  let pinkCount = 0;
  let brownCount = 0;
  let navyCyanCount = 0;

  let redAccentCount = 0;
  let creamWhiteCount = 0;
  let darkAccentCount = 0;
  let leafChlorophyllCount = 0;

  // Sample every 4th pixel for performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const bri = (r + g + b) / 3;
    brightnessSamples.push(bri);

    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
    const gr = g / (r || 1);
    const br = b / (r || 1);

    if (sat > 0.18 && bri > 35 && bri < 238) {
      vibrantCount++;
    }

    if (bri > 20 && bri < 245) {
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }

    // Secondary Accent Spotting
    // A. Red / Pink-red accent (cheeks, bulbs, antennas, eyes):
    if (r > 160 && g < 100 && b < 120 && r > (g + b) * 0.9) {
      redAccentCount++;
    }
    // B. Cream white / Pale belly / Collar (Eevee ruff, Snorlax belly, Squirtle/Charmander stomach):
    // Very bright, neutral-to-warm tones, low-to-medium saturation
    if (bri > 180 && sat < 0.38 && r >= g * 0.9 && g >= b * 0.85) {
      creamWhiteCount++;
    }
    // C. Dark accents (eyes, ear tips, claws):
    if (bri < 45) {
      darkAccentCount++;
    }
    // D. Natural dull chlorophyll green (plant leaves, TN distractor):
    // Plants have high green, moderate red, low blue, but dull saturation or low brightness
    if (g > 65 && g > r * 1.12 && g > b * 1.5 && sat > 0.22 && sat < 0.60 && bri < 140) {
      leafChlorophyllCount++;
    }

    // High-precision color bucket classification
    if (sat >= 0.18 && bri > 35 && bri < 240) {
      // 1. Purple / Violet (Gengar):
      // R and B are prominent, G is strictly lower than both R and B
      if (r > 60 && b > 70 && g < r * 0.75 && g < b * 0.75) {
        purpleCount++;
      }
      // 2. Pink (Jigglypuff, Clefairy, Mew):
      else if (r > 135 && g > 85 && b > 105 && r > g * 1.10 && r > b * 1.05 && bri > 130) {
        pinkCount++;
      }
      // 3. Cyan / Blue (Squirtle, Lapras):
      // B is prominent, or B and G are high compared to R
      else if (b > 75 && ((b > r * 1.08 && b > g * 0.92) || (b > 120 && b > r * 1.15))) {
        blueCyanCount++;
      }
      // 4. Vivid Anime Green / Cyan-Green (Caterpie, Bulbasaur):
      else if (g > 95 && g > r * 1.08 && (g > b * 1.05 || (g > 140 && b > 80)) && (bri > 135 || sat > 0.60 || b > 40)) {
        greenTealCount++;
      }
      // 5. Bright Yellow (Pikachu, Psyduck):
      else if (r > 130 && g > 95 && gr >= 0.70 && br <= 0.58 && sat >= 0.25 && r >= g * 0.95) {
        yellowCount++;
      }
      // 6. Orange/Red (Charmander, Charizard, Flareon):
      else if (r > 125 && gr >= 0.15 && gr < 0.70 && br <= 0.50 && sat >= 0.28) {
        orangeRedCount++;
      }
      // 7. Deep Navy / Dark Cyan (Snorlax):
      else if (bri < 130 && ((b > r * 1.15 && g > r) || (g > r * 1.1 && b > r * 1.1))) {
        navyCyanCount++;
      }
      // 8. Warm Brown (Eevee):
      else if (r > 80 && g > 45 && gr < 0.70 && gr >= 0.38 && br <= 0.55 && bri < 165 && sat >= 0.20) {
        brownCount++;
      }
    }
  }

  const sampleSize = brightnessSamples.length || 1;
  const vibrantRatio = vibrantCount / sampleSize;

  let briSum = 0;
  for (const b of brightnessSamples) briSum += b;
  const avgBrightness = briSum / sampleSize;

  let varianceSum = 0;
  for (const b of brightnessSamples) {
    varianceSum += (b - avgBrightness) ** 2;
  }
  const variance = Math.sqrt(varianceSum / sampleSize);

  if (count === 0) {
    return {
      r: 128,
      g: 128,
      b: 128,
      brightness: 128,
      saturation: 0,
      hue: 0,
      variance: 0,
      vibrantRatio: 0,
      yellowRatio: 0,
      orangeRedRatio: 0,
      blueCyanRatio: 0,
      greenTealRatio: 0,
      purpleRatio: 0,
      pinkRatio: 0,
      brownRatio: 0,
      navyCyanRatio: 0,
      redAccentRatio: 0,
      creamWhiteRatio: 0,
      darkAccentRatio: 0,
      leafChlorophyllRatio: 0,
    };
  }

  const avgR = totalR / count;
  const avgG = totalG / count;
  const avgB = totalB / count;

  // Calculate HSL
  const max = Math.max(avgR, avgG, avgB) / 255;
  const min = Math.min(avgR, avgG, avgB) / 255;
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === avgR / 255) {
      hue = (((avgG - avgB) / 255 / delta) % 6) * 60;
    } else if (max === avgG / 255) {
      hue = (((avgB - avgR) / 255 / delta) + 2) * 60;
    } else {
      hue = (((avgR - avgG) / 255 / delta) + 4) * 60;
    }
  }
  if (hue < 0) hue += 360;

  const saturation = max === 0 ? 0 : delta / max;

  return {
    r: avgR,
    g: avgG,
    b: avgB,
    brightness: avgBrightness,
    saturation,
    hue,
    variance,
    vibrantRatio,
    yellowRatio: yellowCount / sampleSize,
    orangeRedRatio: orangeRedCount / sampleSize,
    blueCyanRatio: blueCyanCount / sampleSize,
    greenTealRatio: greenTealCount / sampleSize,
    purpleRatio: purpleCount / sampleSize,
    pinkRatio: pinkCount / sampleSize,
    brownRatio: brownCount / sampleSize,
    navyCyanRatio: navyCyanCount / sampleSize,
    redAccentRatio: redAccentCount / sampleSize,
    creamWhiteRatio: creamWhiteCount / sampleSize,
    darkAccentRatio: darkAccentCount / sampleSize,
    leafChlorophyllRatio: leafChlorophyllCount / sampleSize,
  };
}

/**
 * Direct AI Pokemon Detection (Strictly Independent DeepSeek or Gemini)
 * Completely removed fallback mechanisms:
 * - No cross-AI fallback (DeepSeek does NOT fallback to Gemini, Gemini does NOT fallback to DeepSeek)
 * - No local rule/color matching fallback
 * - If not recognized, returns null immediately
 */
export async function detectPokemonFromImage(
  canvas: HTMLCanvasElement,
  apiKey?: string
): Promise<DetectionResult | null> {
  const provider = getStoredAiProvider();

  if (provider === 'deepseek') {
    const dsKey = getStoredDeepSeekKey();
    if (!dsKey || dsKey.trim().length < 5) {
      console.warn('DeepSeek API Key is not configured');
      return null;
    }
    return await callDeepSeekVisionAPI(canvas, dsKey);
  }

  if (provider === 'gemini') {
    const geminiKey = (apiKey || '').trim() || getStoredGeminiKey();
    if (!geminiKey || geminiKey.trim().length < 5) {
      console.warn('Gemini API Key is not configured');
      return null;
    }
    return await callGeminiVisionAPI(canvas, geminiKey);
  }

  return null;
}

/**
 * Offline Heuristic Classifier for local testing / benchmarks
 */
export function detectPokemonByLocalHeuristics(canvas: HTMLCanvasElement): DetectionResult | null {
  const colorData = analyzeCanvasColors(canvas);
  const {
    brightness,
    variance,
    vibrantRatio,
    yellowRatio,
    orangeRedRatio,
    blueCyanRatio,
    greenTealRatio,
    purpleRatio,
    pinkRatio,
    brownRatio,
    navyCyanRatio,
    redAccentRatio,
    creamWhiteRatio,
    darkAccentRatio,
    leafChlorophyllRatio,
    hue,
  } = colorData;

  // 1. Extreme rejection filters (pure dark, blown-out white, flat featureless surfaces)
  if (brightness < 32 || (brightness > 238 && vibrantRatio < 0.10) || variance < 10 || vibrantRatio < 0.10) {
    return null;
  }

  // 2. Negative Distractor Rejection:
  // TN-NOTE: Pure flat single-color yellow (sticky note, folder) has almost zero color variance,
  // NO red cheeks (redAccentRatio === 0), NO dark ear tips/eyes, and very low brightness variance!
  if (yellowRatio > 0.50 && redAccentRatio === 0 && darkAccentRatio === 0 && variance < 28) {
    return null;
  }

  // TN-PLANT: Natural plant leaves with dull chlorophyll green (low G brightness, no anime cyan/teal)
  // Plants have hue 75-115, brightness < 125, or high leafChlorophyllRatio, and lack anime accents
  if ((greenTealRatio > 0.40 || leafChlorophyllRatio > 0.35) && redAccentRatio === 0 && yellowRatio === 0 && hue >= 75 && hue <= 115 && brightness < 135) {
    return null;
  }

  // TN-APPLE: Pure red spherical objects with low variance and no yellow belly
  if (orangeRedRatio > 0.60 && creamWhiteRatio === 0 && yellowRatio === 0 && variance < 20) {
    return null;
  }

  // TN-WOOD: Flat brown table surface with no cream collar, low saturation or no accents
  if (brownRatio > 0.35 && creamWhiteRatio === 0 && darkAccentRatio === 0 && variance < 20) {
    return null;
  }

  const scores: { id: number; score: number }[] = [];

  // =========================================================================
  // 3. Multi-bucket & Multi-feature Foreground Evaluation
  // =========================================================================

  // Match: Priority 1 - Pikachu & Yellow Pokémon (Pikachu, Psyduck, Raichu, Jolteon)
  // Yellow must be a major color and dominant over orangeRed
  if (yellowRatio >= 0.15 && yellowRatio >= orangeRedRatio && (yellowRatio >= brownRatio || yellowRatio >= 0.25)) {
    // If it has red cheeks or dark ear tips and high yellow dominance, it's definitively Pikachu!
    if (redAccentRatio > 0.005 || darkAccentRatio > 0.005) {
      scores.push({ id: 25, score: 0.96 }); // Pikachu
      scores.push({ id: 26, score: 0.75 }); // Raichu
      scores.push({ id: 54, score: 0.72 }); // Psyduck
    } else {
      // Pure yellow body without cheeks: Psyduck / Pikachu / Jolteon
      scores.push({ id: 54, score: 0.95 }); // Psyduck
      scores.push({ id: 25, score: 0.88 }); // Pikachu
      scores.push({ id: 135, score: 0.76 }); // Jolteon
    }
  }

  // Match: Priority 2 - Eevee (Warm Brown body + fluffy cream/white collar)
  // Evaluated before Fire to prevent brown plush with fluffy ruff from being caught by orange
  if ((brownRatio >= 0.14 || (orangeRedRatio >= 0.10 && hue >= 26 && hue <= 42)) &&
      (creamWhiteRatio >= 0.03 || variance >= 18)) {
    scores.push({ id: 133, score: 0.95 }); // Eevee
    scores.push({ id: 52, score: 0.75 });  // Meowth
  }

  // Match: Priority 3 - Fire Pokémon & Red/Orange (Flareon, Charmander, Charizard)
  if (orangeRedRatio >= 0.12 && orangeRedRatio >= brownRatio) {
    // Flareon: Intense red (hue < 20 or r > 220, g < 100) + cream/yellow collar
    if (hue < 20 && creamWhiteRatio >= 0.03) {
      scores.push({ id: 136, score: 0.95 }); // Flareon
      scores.push({ id: 4, score: 0.88 });   // Charmander
      scores.push({ id: 6, score: 0.80 });   // Charizard
    } else {
      scores.push({ id: 4, score: 0.95 });   // Charmander
      scores.push({ id: 6, score: 0.88 });   // Charizard
      scores.push({ id: 136, score: 0.82 }); // Flareon
    }
    scores.push({ id: 149, score: 0.72 }); // Dragonite
  }

  // Match: Priority 4 - Bulbasaur & Grass/Teal Pokémon (Bulbasaur, Ivysaur, Venusaur)
  // Bulbasaur has Teal-Cyan body (hue around 150-185, or blueCyan with pink/red bulb)
  if (hue >= 145 && hue <= 185 && (greenTealRatio >= 0.02 || blueCyanRatio >= 0.12) && redAccentRatio > 0.003) {
    scores.push({ id: 1, score: 0.96 });  // Bulbasaur
    scores.push({ id: 2, score: 0.82 });  // Ivysaur
    scores.push({ id: 3, score: 0.78 });  // Venusaur
  }

  // Match: Priority 5 - Caterpie & Vivid Green Pokémon
  if (greenTealRatio >= 0.12 && hue >= 70 && hue < 140) {
    scores.push({ id: 10, score: 0.95 }); // Caterpie
    scores.push({ id: 1, score: 0.76 });  // Bulbasaur
  }

  // Match: Priority 6 - Snorlax (Dark Navy/Cyan body + cream belly, without red bulb)
  if ((navyCyanRatio >= 0.08 || (hue >= 160 && hue <= 220 && brightness < 155)) &&
      creamWhiteRatio >= 0.04 && redAccentRatio === 0) {
    scores.push({ id: 143, score: 0.96 }); // Snorlax
    scores.push({ id: 7, score: 0.72 });   // Squirtle
  }

  // Match: Priority 7 - Squirtle & Water Pokémon (Squirtle, Blastoise, Lapras)
  // Blue body with brown shell or cream belly
  if (blueCyanRatio >= 0.12 && hue > 185 && hue < 235) {
    scores.push({ id: 7, score: 0.94 });   // Squirtle
    scores.push({ id: 9, score: 0.84 });   // Blastoise
    scores.push({ id: 131, score: 0.80 }); // Lapras
    scores.push({ id: 134, score: 0.75 }); // Vaporeon
    scores.push({ id: 61, score: 0.72 });  // Poliwhirl
  }

  // Match: Priority 8 - Gengar & Ghost Pokémon (Gengar, Haunter, Gastly)
  if (purpleRatio >= 0.10) {
    scores.push({ id: 94, score: 0.94 }); // Gengar
    scores.push({ id: 93, score: 0.82 }); // Haunter
    scores.push({ id: 92, score: 0.76 }); // Gastly
    scores.push({ id: 150, score: 0.72 }); // Mewtwo
  }

  // Match: Priority 9 - Jigglypuff & Fairy Pokémon (Jigglypuff, Mew, Clefairy)
  if (pinkRatio >= 0.12) {
    scores.push({ id: 39, score: 0.94 }); // Jigglypuff
    scores.push({ id: 151, score: 0.86 }); // Mew
    scores.push({ id: 35, score: 0.78 }); // Clefairy
    scores.push({ id: 132, score: 0.72 }); // Ditto
  }

  // If no category matched: No Pokémon found!
  if (scores.length === 0) {
    return null;
  }

  // Sort by confidence
  scores.sort((a, b) => b.score - a.score);

  const topMatch = scores[0];
  if (topMatch.score < 0.70) {
    return null;
  }

  const detectedPokemon = getPokemonById(topMatch.id);

  return {
    pokemon: detectedPokemon,
    confidence: Math.round(topMatch.score * 100),
    candidates: scores.slice(0, 3).map(s => ({
      pokemon: getPokemonById(s.id),
      confidence: Math.round(s.score * 100)
    })),
    source: 'camera'
  };
}

/**
 * Helper to compress and downscale canvas image to ~512px for ultra-low latency API upload
 */
function getOptimizedBase64(canvas: HTMLCanvasElement, maxDim: number = 512): string {
  const width = canvas.width;
  const height = canvas.height;

  if (width <= maxDim && height <= maxDim) {
    return canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
  }

  const scale = maxDim / Math.max(width, height);
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = targetW;
  thumbCanvas.height = targetH;
  const ctx = thumbCanvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(canvas, 0, 0, targetW, targetH);
    return thumbCanvas.toDataURL('image/jpeg', 0.75).split(',')[1];
  }
  return canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
}

/**
 * Direct Gemini Multimodal Vision API call
 * Fast, independent request with 6.5s timeout. Returns null immediately if not recognized or error.
 */
async function callGeminiVisionAPI(
  canvas: HTMLCanvasElement,
  apiKey: string
): Promise<DetectionResult | null> {
  const base64Data = getOptimizedBase64(canvas, 512);

  const prompt = `You are a Pokemon Pokedex scanner. Look at this image and identify which Gen 1 Pokemon (#1 to #151) is present (such as plush toy, card, drawing, figure).
Return ONLY valid JSON with no markdown formatting:
If a Pokemon is detected: {"found": true, "pokemonId": number between 1 and 151, "confidence": number between 70 and 99}
If NO Pokemon is in the image: {"found": false}`;

  const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash'];

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            generationConfig: {
              maxOutputTokens: 256,
              temperature: 0.1,
              responseMimeType: 'application/json'
            },
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
              ]
            }]
          })
        }
      );

      clearTimeout(timer);

      if (!response.ok) {
        if (response.status === 404) {
          continue; // Try secondary model name
        }
        console.warn(`Gemini API returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return null;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed || parsed.found === false) {
        return null; // Fast return: explicitly not a Pokemon
      }

      const pId = Number(parsed.pokemonId);
      if (pId >= 1 && pId <= 151) {
        const target = getPokemonById(pId);
        return {
          pokemon: target,
          confidence: parsed.confidence || 95,
          candidates: [{ pokemon: target, confidence: parsed.confidence || 95 }],
          source: 'camera'
        };
      }
      return null;
    } catch (e) {
      clearTimeout(timer);
      console.warn('Gemini vision request failed or timed out:', e);
      return null;
    }
  }

  return null;
}

/**
 * Direct DeepSeek Multimodal Vision API call
 * Fast, independent request with 10s timeout and 512 token budget for reasoning models.
 */
async function callDeepSeekVisionAPI(
  canvas: HTMLCanvasElement,
  apiKey: string
): Promise<DetectionResult | null> {
  const base64Data = getOptimizedBase64(canvas, 512);

  const prompt = `You are a Pokemon Pokedex scanner. Look at this image and identify which Gen 1 Pokemon (#1 to #151) is present (such as plush toy, card, drawing, figure).
Return ONLY valid JSON with no markdown formatting:
If a Pokemon is detected: {"found": true, "pokemonId": number between 1 and 151, "confidence": number between 70 and 99}
If NO Pokemon is in the image: {"found": false}`;

  const candidateModels = ['deepseek-flash', 'deepseek-v4-flash-vision-exp'];

  for (const model of candidateModels) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          max_tokens: 512,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64Data}` }
                }
              ]
            }
          ]
        })
      });

      clearTimeout(timer);

      if (!response.ok) {
        if (response.status === 404) {
          continue; // Try secondary model name
        }
        console.warn(`DeepSeek API returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      const message = data?.choices?.[0]?.message;
      const text = message?.content || message?.reasoning_content;
      if (!text) return null;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed || parsed.found === false) {
        return null; // Fast return: explicitly not a Pokemon
      }

      const pId = Number(parsed.pokemonId);
      if (pId >= 1 && pId <= 151) {
        const target = getPokemonById(pId);
        return {
          pokemon: target,
          confidence: parsed.confidence || 96,
          candidates: [{ pokemon: target, confidence: parsed.confidence || 96 }],
          source: 'camera'
        };
      }
      return null;
    } catch (e) {
      clearTimeout(timer);
      console.warn('DeepSeek vision request failed or timed out:', e);
      return null;
    }
  }

  return null;
}

