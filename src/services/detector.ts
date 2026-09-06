import type { Pokemon } from '../types/pokemon';
import { getPokemonById } from '../data/pokemonList';

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

    if (sat > 0.20 && bri > 35 && bri < 238) {
      vibrantCount++;
    }

    if (bri > 20 && bri < 245) {
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }

    // High-precision color bucket classification
    if (sat >= 0.20 && bri > 35 && bri < 240) {
      // 1. Bright Yellow (Pikachu, Psyduck):
      // Crucial: Under warm/indoor lighting, yellow shifts towards amber/orange,
      // but G/R is ALWAYS >= 0.72 and (R+G)/2 is high!
      if (r > 130 && g > 95 && gr >= 0.72 && br <= 0.55 && sat >= 0.26) {
        yellowCount++;
      }
      // 2. Orange/Red (Charmander, Charizard):
      else if (r > 125 && gr >= 0.20 && gr < 0.72 && br <= 0.50 && sat >= 0.28) {
        orangeRedCount++;
      }
      // 3. Cyan / Blue (Squirtle):
      else if (b > 85 && b > r * 1.15 && g > r * 0.75) {
        blueCyanCount++;
      }
      // 4. Teal / Green (Bulbasaur):
      else if (g > 85 && g > r * 1.05 && g > b * 1.02) {
        greenTealCount++;
      }
      // 5. Purple / Violet (Gengar):
      else if (r > 70 && b > 75 && g < Math.min(r, b) * 0.75) {
        purpleCount++;
      }
      // 6. Pink (Jigglypuff, Clefairy, Mew):
      else if (r > 130 && g > 85 && b > 100 && r > g * 1.12 && r > b * 1.05 && bri > 90) {
        pinkCount++;
      }
      // 7. Warm Brown (Eevee):
      // Darker, warm, G/R is strictly between 0.42 and 0.71, brightness < 155.
      else if (r > 90 && g > 50 && gr < 0.72 && gr >= 0.42 && br <= 0.55 && bri < 155 && sat >= 0.24) {
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
    hue,
  } = colorData;

  // 1. Extreme rejection filters (pure dark, blown-out white, flat featureless surfaces)
  if (brightness < 32 || (brightness > 238 && vibrantRatio < 0.10) || variance < 10 || vibrantRatio < 0.10) {
    return null;
  }

  const scores: { id: number; score: number }[] = [];

  // 2. Multi-bucket foreground color evaluation (avoids mixing Pikachu with brown furniture)

  // Match: Priority 1 - Pikachu & Yellow Pokémon (Pikachu, Psyduck, Raichu, Jolteon)
  // Even if sitting on a brown desk, yellowRatio > 0.10 and yellowRatio >= brownRatio
  if (yellowRatio >= 0.10 && (yellowRatio >= brownRatio || yellowRatio >= 0.15)) {
    scores.push({ id: 25, score: 0.96 }); // Pikachu
    scores.push({ id: 54, score: 0.80 }); // Psyduck
    scores.push({ id: 26, score: 0.72 }); // Raichu
    scores.push({ id: 135, score: 0.68 }); // Jolteon
  }
  // Match: Priority 2 - Charmander & Orange-Red Pokémon (Charmander, Charizard, Flareon)
  else if (orangeRedRatio >= 0.12 && orangeRedRatio >= brownRatio) {
    scores.push({ id: 4, score: 0.94 });  // Charmander
    scores.push({ id: 6, score: 0.85 });  // Charizard
    scores.push({ id: 136, score: 0.75 }); // Flareon
    scores.push({ id: 149, score: 0.70 }); // Dragonite
  }
  // Match: Priority 3 - Squirtle & Water Pokémon (Squirtle, Blastoise, Lapras)
  else if (blueCyanRatio >= 0.12) {
    scores.push({ id: 7, score: 0.93 });  // Squirtle
    scores.push({ id: 9, score: 0.82 });  // Blastoise
    scores.push({ id: 131, score: 0.78 }); // Lapras
    scores.push({ id: 134, score: 0.72 }); // Vaporeon
  }
  // Match: Priority 4 - Bulbasaur & Grass Pokémon (Bulbasaur, Ivysaur, Caterpie)
  else if (greenTealRatio >= 0.12) {
    scores.push({ id: 1, score: 0.94 });  // Bulbasaur
    scores.push({ id: 2, score: 0.80 });  // Ivysaur
    scores.push({ id: 3, score: 0.76 });  // Venusaur
    scores.push({ id: 10, score: 0.70 }); // Caterpie
  }
  // Match: Priority 5 - Gengar & Ghost Pokémon (Gengar, Haunter, Gastly)
  else if (purpleRatio >= 0.10) {
    scores.push({ id: 94, score: 0.93 }); // Gengar
    scores.push({ id: 93, score: 0.80 }); // Haunter
    scores.push({ id: 92, score: 0.75 }); // Gastly
    scores.push({ id: 150, score: 0.70 }); // Mewtwo
  }
  // Match: Priority 6 - Jigglypuff & Fairy Pokémon (Jigglypuff, Mew, Clefairy)
  else if (pinkRatio >= 0.12) {
    scores.push({ id: 39, score: 0.92 }); // Jigglypuff
    scores.push({ id: 151, score: 0.85 }); // Mew
    scores.push({ id: 35, score: 0.75 }); // Clefairy
    scores.push({ id: 132, score: 0.70 }); // Ditto
  }
  // Match: Priority 7 - Eevee (Warm Brown plush with contrasting collar, variance >= 20, brown dominates)
  else if (brownRatio >= 0.16 && brownRatio > yellowRatio * 1.5 && variance >= 20) {
    scores.push({ id: 133, score: 0.90 }); // Eevee
    scores.push({ id: 52, score: 0.75 });  // Meowth
  }
  // Match: Snorlax (Dark Navy/Cyan body + cream belly)
  else if (hue >= 165 && hue <= 225 && brightness >= 45 && brightness <= 140 && variance >= 16) {
    scores.push({ id: 143, score: 0.92 }); // Snorlax
    scores.push({ id: 7, score: 0.70 });   // Squirtle
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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

  if (!response.ok) return undefined;

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return undefined;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return undefined;

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

  return undefined;
}
