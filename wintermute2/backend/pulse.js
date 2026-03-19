// pulse.js
// Jittered transmission heartbeat
// Selects transmission mode — voice dominant, document occasional, literary rare

const BASE_INTERVAL    = 9000;
const JITTER           = 7000;
const CLUSTER_CHANCE   = 0.15;
const CLUSTER_COUNT    = [2, 3];
const CLUSTER_SPACING  = 1400;
const SILENCE_CHANCE   = 0.12;
const SILENCE_MIN      = 20000;
const SILENCE_MAX      = 45000;

// Mode weights — voice dominant, literary rare
const MODE_WEIGHTS = [
  { mode: "voice",    weight: 60 },
  { mode: "document", weight: 28 },
  { mode: "literary", weight: 12 },
];

let timer      = null;
let onTransmit = null;

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickMode() {
  const total = MODE_WEIGHTS.reduce((s, m) => s + m.weight, 0);
  let roll    = Math.random() * total;
  for (const m of MODE_WEIGHTS) {
    roll -= m.weight;
    if (roll <= 0) return m.mode;
  }
  return "voice";
}

async function scheduleNext() {
  if (!onTransmit) return;

  // Extended silence?
  if (Math.random() < SILENCE_CHANCE) {
    const silence = randomBetween(SILENCE_MIN, SILENCE_MAX);
    timer = setTimeout(scheduleNext, silence);
    return;
  }

  // Cluster burst? Keep same mode for the cluster — feels like a phase
  if (Math.random() < CLUSTER_CHANCE) {
    const count = randomBetween(...CLUSTER_COUNT);
    const mode  = pickMode();
    for (let i = 0; i < count; i++) {
      setTimeout(() => onTransmit(mode), i * CLUSTER_SPACING);
    }
    const nextInterval = BASE_INTERVAL + CLUSTER_SPACING * count + randomBetween(0, JITTER);
    timer = setTimeout(scheduleNext, nextInterval);
    return;
  }

  // Normal single transmission
  await onTransmit(pickMode());
  const interval = BASE_INTERVAL + randomBetween(-JITTER / 2, JITTER);
  timer = setTimeout(scheduleNext, Math.max(3000, interval));
}

export function start(transmitFn) {
  onTransmit = transmitFn;
  timer = setTimeout(scheduleNext, 2500);
}

export function stop() {
  if (timer) clearTimeout(timer);
  timer = null;
}
