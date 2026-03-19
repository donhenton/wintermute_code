// sculptor.js
// Parses raw Claude text into cluster descriptors for the DOM renderer
// Assigns mass, decay, typeface based on session word frequency

const sessionFrequency = new Map();

// Typeface buckets — assigned by consonant density of the full phrase
const TYPEFACES = ["serif", "mono", "sans"];

function consonantRatio(str) {
  const lower = str.toLowerCase();
  const consonants = (lower.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
  const letters    = (lower.match(/[a-z]/g) || []).length;
  return letters > 0 ? consonants / letters : 0.5;
}

export function sculpt(rawText, mode = "voice") {
  // Lines are the natural break points Claude inserts
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return null;

  // Track all words for frequency
  const allWords = lines.join(" ").toLowerCase().split(/\s+/);
  allWords.forEach((w) => {
    const clean = w.replace(/[^a-z']/g, "");
    if (clean) sessionFrequency.set(clean, (sessionFrequency.get(clean) || 0) + 1);
  });

  // Mass: average frequency of words in this cluster
  const avgFreq =
    allWords.reduce((sum, w) => {
      const clean = w.replace(/[^a-z']/g, "");
      return sum + (sessionFrequency.get(clean) || 1);
    }, 0) / Math.max(allWords.length, 1);

  const mass = Math.min(1.0, 0.2 + avgFreq * 0.12);

  // Font size: inversely scaled by line count so clusters don't dominate
  const baseFontSize = lines.length > 2 ? 15 : lines.length > 1 ? 17 : 20;
  const fontSize = baseFontSize + mass * 8 + (Math.random() - 0.5) * 4;

  // Decay: heavier clusters linger longer
  const decayDuration = 8000 + mass * 14000 + Math.random() * 6000; // ms to full fade

  // Linger: high-mass clusters stabilize briefly at low opacity
  const lingerOpacity = mass > 0.5 ? 0.06 + Math.random() * 0.08 : 0;

  // Typeface from consonant density of full phrase
  const ratio = consonantRatio(lines.join(" "));
  const typeface = ratio > 0.62 ? TYPEFACES[1] : ratio > 0.44 ? TYPEFACES[0] : TYPEFACES[2];

  // Slight rotation — more for voice, less for document/literary
  const maxRotation = mode === "voice" ? 4 : mode === "literary" ? 1.5 : 0.8;
  const rotation = (Math.random() - 0.5) * maxRotation;

  return {
    lines,
    mass,
    fontSize: Math.round(fontSize),
    decayDuration: Math.round(decayDuration),
    lingerOpacity,
    typeface,
    rotation,
    mode,
  };
}

export function resetFrequency() {
  sessionFrequency.clear();
}
