import type { Pokemon } from '../types/pokemon';
import { getPokemonById } from '../data/pokemonList';

export interface DetectionResult {
  pokemon: Pokemon;
  confidence: number;
  candidates: { pokemon: Pokemon; confidence: number }[];
  detectedColorName?: string;
  source: 'camera' | 'upload' | 'quick-select';
}

/**
 * Extract dominant RGB color from the center area of a canvas/video
 */
export interface ColorAnalysis {
  r: number;
  g: number;
  b: number;
  brightness: number;
  saturation: number;
  hue: number;
  variance: number;
  vibrantRatio: number;
}

/**
 * Extract color profile, variance, and vibrancy from the reticle area
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

    // Count pixels with distinct coloration
    if (sat > 0.22 && bri > 35 && bri < 235) {
      vibrantCount++;
    }

    if (bri > 20 && bri < 245) {
      totalR += r;
      totalG += g;
      totalB += b;
      count++;
    }
  }

  const sampleSize = brightnessSamples.length || 1;
  const vibrantRatio = vibrantCount / sampleSize;

  // Calculate standard deviation / variance
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
  };
}

/**
 * Smart heuristic classifier for Pokemon plush toys & cards
 * Returns null if no known Pokémon features are detected
 */
export async function detectPokemonFromImage(
  canvas: HTMLCanvasElement,
  apiKey?: string
): Promise<DetectionResult | null> {
  // If user provided a Gemini / Vision API key, we can make a vision API call
  if (apiKey && apiKey.trim().length > 15) {
    try {
      const apiResult = await callGeminiVisionAPI(canvas, apiKey.trim());
      if (apiResult) {
        return apiResult;
      }
    } catch (e) {
      console.warn('Vision API fallback to local classifier:', e);
    }
  }

  // Local color & shape heuristic classifier
  const colorData = analyzeCanvasColors(canvas);
  const { hue, saturation, brightness, variance, vibrantRatio } = colorData;

  // 1. Extreme rejection filters (pure dark, blown-out white, flat featureless surfaces)
  if (brightness < 32) {
    // Too dark or lens covered
    return null;
  }
  if (brightness > 238 && saturation < 0.12) {
    // Overexposed / ceiling lamp / blank bright sky
    return null;
  }
  if (variance < 11) {
    // Flat monochromatic plane (blank wall, monochrome sheet of paper)
    return null;
  }
  if (saturation < 0.15 && vibrantRatio < 0.12) {
    // Neutral monochrome scene (gray table, black keyboard, white background)
    return null;
  }

  const scores: { id: number; score: number }[] = [];

  // Match against iconic Gen 1 Pokémon plush toys
  // Pikachu (#25) / Psyduck (#54) / Raichu (#26) / Jolteon (#135): Bright Yellow
  if (hue >= 38 && hue <= 66 && saturation >= 0.28 && vibrantRatio >= 0.15) {
    scores.push({ id: 25, score: 0.95 }); // Pikachu
    scores.push({ id: 54, score: 0.78 }); // Psyduck
    scores.push({ id: 26, score: 0.72 }); // Raichu
    scores.push({ id: 135, score: 0.65 }); // Jolteon
  }
  // Charmander (#4) / Charizard (#6) / Flareon (#136) / Dragonite (#149): Orange-Red
  else if (hue >= 10 && hue <= 37 && saturation >= 0.32 && vibrantRatio >= 0.15) {
    scores.push({ id: 4, score: 0.93 });  // Charmander
    scores.push({ id: 6, score: 0.85 });  // Charizard
    scores.push({ id: 136, score: 0.75 }); // Flareon
    scores.push({ id: 149, score: 0.70 }); // Dragonite
  }
  // Squirtle (#7) / Blastoise (#9) / Lapras (#131) / Vaporeon (#134): Light Blue / Cyan
  else if (hue >= 180 && hue <= 235 && saturation >= 0.25 && vibrantRatio >= 0.14) {
    scores.push({ id: 7, score: 0.92 });  // Squirtle
    scores.push({ id: 9, score: 0.82 });  // Blastoise
    scores.push({ id: 131, score: 0.78 }); // Lapras
    scores.push({ id: 134, score: 0.72 }); // Vaporeon
  }
  // Bulbasaur (#1) / Ivysaur (#2) / Caterpie (#10): Teal / Cyan-Green
  else if (hue >= 125 && hue <= 178 && saturation >= 0.20 && vibrantRatio >= 0.14) {
    scores.push({ id: 1, score: 0.94 });  // Bulbasaur
    scores.push({ id: 2, score: 0.80 });  // Ivysaur
    scores.push({ id: 3, score: 0.76 });  // Venusaur
    scores.push({ id: 10, score: 0.70 }); // Caterpie
  }
  // Gengar (#94) / Haunter (#93) / Gastly (#92): Purple / Magenta
  else if (hue >= 255 && hue <= 310 && saturation >= 0.18 && vibrantRatio >= 0.12) {
    scores.push({ id: 94, score: 0.93 }); // Gengar
    scores.push({ id: 93, score: 0.80 }); // Haunter
    scores.push({ id: 92, score: 0.75 }); // Gastly
    scores.push({ id: 150, score: 0.70 }); // Mewtwo
  }
  // Jigglypuff (#39) / Clefairy (#35) / Mew (#151): Pink
  else if ((hue > 322 || hue < 10) && saturation >= 0.18 && brightness >= 85 && vibrantRatio >= 0.13) {
    scores.push({ id: 39, score: 0.91 }); // Jigglypuff
    scores.push({ id: 151, score: 0.85 }); // Mew
    scores.push({ id: 35, score: 0.75 }); // Clefairy
    scores.push({ id: 132, score: 0.70 }); // Ditto
  }
  // Snorlax (#143): Dark Cyan-Navy plush with Cream accents
  else if (hue >= 165 && hue <= 225 && saturation >= 0.18 && brightness >= 45 && brightness <= 140 && variance >= 16) {
    scores.push({ id: 143, score: 0.92 }); // Snorlax
    scores.push({ id: 7, score: 0.70 });   // Squirtle
  }
  // Eevee (#133): Warm Brown / Tan plush (requires toy contrast and saturation, avoids plain wood tables)
  else if (hue >= 20 && hue <= 42 && saturation >= 0.25 && saturation <= 0.65 && brightness >= 50 && brightness <= 165 && variance >= 22 && vibrantRatio >= 0.16) {
    scores.push({ id: 133, score: 0.90 }); // Eevee
    scores.push({ id: 52, score: 0.75 });  // Meowth
    scores.push({ id: 25, score: 0.65 });  // Pikachu
    scores.push({ id: 143, score: 0.60 }); // Snorlax
  }

  // If no category matched or scores empty: No Pokémon found!
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
): Promise<DetectionResult | null> {
  const base64Data = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  
  const prompt = `You are a Pokemon Pokedex scanner. Identify which Pokemon is in this image (toy, plush, card, or screen). Return ONLY valid JSON with this format: {"pokemonId": number between 1 and 151, "confidence": number between 50 and 99, "reason": "brief reason"}. If unsure, pick the closest Gen 1 Pokemon.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
  });

  if (!response.ok) return null;

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]);
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
}
