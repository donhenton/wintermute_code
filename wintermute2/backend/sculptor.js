// sculptor.js
// Parses raw Claude text into cluster descriptors for the DOM renderer
// Stateless: properties derived from word characteristics alone
// Four modes: voice / document / literary / code

const TYPEFACES = ["serif", "mono", "sans"];

function consonantRatio(str) {
  const lower = str.toLowerCase();
  const consonants = (lower.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  const letters    = (lower.match(/[a-z]/g) || []).length;
  return letters > 0 ? consonants / letters : 0.5;
}

function wordMass(word) {
  const len   = word.length;
  const ratio = consonantRatio(word);
  return Math.min(1.0, 0.2 + (len / 14) * 0.5 + ratio * 0.3);
}

export function sculpt(rawText, mode = "voice") {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  const allWords = lines.join(" ").split(/\s+/).filter(Boolean);
  const avgMass  = allWords.reduce((sum, w) => sum + wordMass(w), 0) / Math.max(allWords.length, 1);
  const mass     = Math.min(1.0, avgMass + (Math.random() - 0.5) * 0.1);

  // Font size
  const baseFontSize = lines.length > 2 ? 15 : lines.length > 1 ? 17 : 20;
  // Code fragments render slightly smaller
  const modeScale    = mode === "code" ? 0.85 : 1;
  const fontSize     = Math.round((baseFontSize + mass * 8 + (Math.random() - 0.5) * 4) * modeScale);

  // Decay: code fades faster, literary lingers longest
  const baseDecay = mode === "code"     ? 6000  :
                    mode === "literary" ? 14000 : 9000;
  const decayDuration = Math.round(baseDecay + mass * 8000 + Math.random() * 4000);

  // Linger: literary and heavy voice clusters only
  const lingerOpacity = (mode === "literary" || (mode === "voice" && mass > 0.6))
    ? 0.06 + Math.random() * 0.08
    : 0;

  // Typeface: code always mono, others from consonant density
  let typeface;
  if (mode === "code") {
    typeface = "mono";
  } else {
    const ratio = consonantRatio(lines.join(" "));
    typeface = ratio > 0.62 ? TYPEFACES[1] : ratio > 0.44 ? TYPEFACES[0] : TYPEFACES[2];
  }

  // Rotation: code near-level, literary subtle, voice most expressive
  const maxRotation = mode === "code"     ? 0.5 :
                      mode === "literary" ? 1.5 :
                      mode === "document" ? 0.8 : 4;
  const rotation = (Math.random() - 0.5) * maxRotation;

  return { lines, mass, fontSize, decayDuration, lingerOpacity, typeface, rotation, mode };
}
