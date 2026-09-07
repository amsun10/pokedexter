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

export function getStoredGeminiKey(): string {
  try {
    return localStorage.getItem('pokedex_gemini_key') || '';
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
 * Smart heuristic classifier with distinct foreground color discrimination
 * Returns null if no known Pokémon features are detected
 */
export async function detectPokemonFromImage(
  canvas: HTMLCanvasElement,
  apiKey?: string
): Promise<DetectionResult | null> {
  // If user provided or stored a Gemini Vision API key, call vision API
  const effectiveKey = (apiKey || '').trim() || getStoredGeminiKey();
  if (effectiveKey.length > 15) {
    try {
      const apiResult = await callGeminiVisionAPI(canvas, effectiveKey);
      if (apiResult !== undefined) {
        return apiResult;
      }
    } catch (e) {
      console.warn('Vision API fallback to local classifier:', e);
    }
  }

  // Local color & shape heuristic classifier
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
 * Optional: Direct Gemini Multimodal Vision API call
 */
async function callGeminiVisionAPI(
  canvas: HTMLCanvasElement,
  apiKey: string
): Promise<DetectionResult | null | undefined> {
  const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  
  const prompt = `You are a Pokemon Pokedex scanner. Look at this image and identify which Gen 1 Pokemon (#1 to #151) is present (such as plush toy, card, drawing, figure).
Return ONLY valid JSON with no markdown formatting:
If a Pokemon is detected: {"found": true, "pokemonId": number between 1 and 151, "confidence": number between 70 and 99}
If NO Pokemon is in the image (e.g. random furniture, person, keyboard, wall, coffee mug): {"found": false}`;

  const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
  
  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
              ]
            }]
          })
        }
      );

      if (!response.ok) continue;

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.found === false) {
        return null; // Explicitly no Pokemon found
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
    } catch {
      continue;
    }
  }

  return undefined;
}
