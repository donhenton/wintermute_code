// sculptor.js
// Parses raw Claude text into cluster descriptors for the DOM renderer
// Stateless: no session frequency tracking, properties derived from word alone

// Typeface buckets — assigned by consonant density of the full phrase
const TYPEFACES = ["serif", "mono", "sans"];

function consonantRatio(str) {
  const lower = str.toLowerCase();
  const consonants = (lower.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  const letters    = (lower.match(/[a-z]/g) || []).length;
  return letters > 0 ? consonants / letters : 0.5;
}

function wordMass(word) {
  // Mass from word length and consonant density — no session state
  const len    = word.length;
  const ratio  = consonantRatio(word);
  return Math.min(1.0, 0.2 + (len / 14) * 0.5 + ratio * 0.3);
}

export function sculpt(rawText, mode = "voice") {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  // Mass: average word mass across all words in cluster
  const allWords = lines.join(" ").split(/\s+/).filter(Boolean);
  const avgMass  = allWords.reduce((sum, w) => sum + wordMass(w), 0) / Math.max(allWords.length, 1);
  const mass     = Math.min(1.0, avgMass + (Math.random() - 0.5) * 0.1);

  // Font size: scaled by line count
  const baseFontSize = lines.length > 2 ? 15 : lines.length > 1 ? 17 : 20;
  const fontSize     = Math.round(baseFontSize + mass * 8 + (Math.random() - 0.5) * 4);

  // Decay duration
  const decayDuration = Math.round(8000 + mass * 12000 + Math.random() * 5000);

  // Linger only for high-mass clusters
  const lingerOpacity = mass > 0.6 ? 0.06 + Math.random() * 0.08 : 0;

  // Typeface from consonant density
  const ratio    = consonantRatio(lines.join(" "));
  const typeface = ratio > 0.62 ? TYPEFACES[1] : ratio > 0.44 ? TYPEFACES[0] : TYPEFACES[2];

  // Rotation varies by mode
  const maxRotation = mode === "voice" ? 4 : mode === "literary" ? 1.5 : 0.8;
  const rotation    = (Math.random() - 0.5) * maxRotation;

  return { lines, mass, fontSize, decayDuration, lingerOpacity, typeface, rotation, mode };
}
