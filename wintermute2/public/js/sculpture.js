// sculpture.js
// Manages all active cluster elements in the DOM
// Handles spawn, drift, decay, removal
// Composer logic: watches density, culls if overcrowded

const stage       = document.getElementById("stage");
const MAX_CLUSTERS = 12;
const CULL_TARGET  =  7;

// Active clusters: { el, x, y, vx, vy, decayDuration, lingerOpacity, mass,
//                    state: 'arriving'|'present'|'lingering'|'dying',
//                    arriveTime, decayStart, decayEnd }
const active = [];
let   frameId = null;

export function spawnCluster(descriptor) {
  // Composer: cull oldest if overcrowded
  if (active.length >= MAX_CLUSTERS) {
    cullOldest(active.length - CULL_TARGET);
  }

  const { lines, mass, fontSize, decayDuration, lingerOpacity,
          typeface, rotation, mode } = descriptor;

  // Build DOM element
  const el = document.createElement("div");
  el.className = [
    "cluster",
    "arriving",
    typeface,
    mode,
    mass > 0.6 ? "heavy" : mass < 0.3 ? "light" : "",
  ].filter(Boolean).join(" ");

  el.style.fontSize = `${fontSize}px`;
  el.style.transform = `rotate(${rotation}deg)`;

  lines.forEach((line) => {
    const span = document.createElement("span");
    span.className = "cluster-line";
    span.textContent = line;
    el.appendChild(span);
  });

  // Safe spawn bounds — account for approximate cluster height
  const approxHeight = lines.length * fontSize * 1.4 + 20;
  const approxWidth  = 280;
  const margin       = 60;

  const W = window.innerWidth;
  const H = window.innerHeight;

  const x = margin + Math.random() * (W - approxWidth - margin * 2);
  const y = margin + Math.random() * (H - approxHeight - margin * 2);

  el.style.left = `${x}px`;
  el.style.top  = `${y}px`;

  stage.appendChild(el);

  // Gentle initial velocity
  const vx = (Math.random() - 0.5) * 0.25;
  const vy = (Math.random() - 0.5) * 0.18;

  const now = performance.now();

  const entry = {
    el, x, y, vx, vy,
    mass,
    decayDuration,
    lingerOpacity,
    rotation,
    state: "arriving",
    arriveTime:  now,
    decayStart:  null,
    decayEnd:    null,
  };

  active.push(entry);

  // Trigger arrive transition after next paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.remove("arriving");
      el.classList.add("present");
      el.style.transition = "opacity 2s ease-in";
      el.style.opacity = "1";

      // Schedule decay start
      const holdDuration = 4000 + mass * 8000 + Math.random() * 4000;
      entry.decayStart = now + holdDuration;
      entry.decayEnd   = entry.decayStart + decayDuration;
      entry.state      = "present";
    });
  });

  if (!frameId) frameId = requestAnimationFrame(tick);
}

function tick(now) {
  frameId = null;
  let anyAlive = false;

  const W = window.innerWidth;
  const H = window.innerHeight;

  for (let i = active.length - 1; i >= 0; i--) {
    const c = active[i];

    if (c.state === "removed") {
      active.splice(i, 1);
      continue;
    }

    anyAlive = true;

    // Drift
    // Gentle pull toward centre
    const cx = W * 0.5;
    const cy = H * 0.5;
    c.vx += (cx - c.x - 140) * 0.00003 * (1 - c.mass * 0.4);
    c.vy += (cy - c.y - 40)  * 0.00003 * (1 - c.mass * 0.4);

    // Micro turbulence
    c.vx += (Math.random() - 0.5) * 0.015;
    c.vy += (Math.random() - 0.5) * 0.012;

    // Damping
    const damp = 0.988 - c.mass * 0.01;
    c.vx *= damp;
    c.vy *= damp;

    c.x += c.vx;
    c.y += c.vy;

    c.el.style.left = `${c.x}px`;
    c.el.style.top  = `${c.y}px`;

    // Decay
    if (c.state === "present" && c.decayStart && now >= c.decayStart) {
      c.state = "decaying";
    }

    if (c.state === "decaying") {
      const progress = Math.min(1, (now - c.decayStart) / (c.decayEnd - c.decayStart));
      let opacity;

      if (c.lingerOpacity > 0 && progress > 0.7) {
        // Stabilise into linger
        const lingerProgress = (progress - 0.7) / 0.3;
        opacity = c.lingerOpacity + (1 - c.lingerOpacity) * (1 - progress * 0.7);
        if (lingerProgress >= 1) {
          c.state = "lingering";
          c.lingerStart = now;
          c.lingerEnd   = now + 4000 + Math.random() * 8000;
        }
      } else {
        opacity = Math.max(0, 1 - progress);
      }

      c.el.style.transition = "none";
      c.el.style.opacity = String(Math.max(0, opacity));

      if (progress >= 1 && c.state !== "lingering") {
        removeCluster(c, i);
      }
    }

    if (c.state === "lingering") {
      const progress = Math.min(1, (now - c.lingerStart) / (c.lingerEnd - c.lingerStart));
      const opacity  = c.lingerOpacity * (1 - progress);
      c.el.style.opacity = String(Math.max(0, opacity));
      if (progress >= 1) removeCluster(c, i);
    }
  }

  if (anyAlive || active.length > 0) {
    frameId = requestAnimationFrame(tick);
  }
}

function removeCluster(c, index) {
  c.state = "removed";
  c.el.style.opacity = "0";
  setTimeout(() => {
    if (c.el.parentNode) c.el.parentNode.removeChild(c.el);
  }, 500);
  active.splice(index, 1);
}

function cullOldest(count) {
  // Sort by opacity — fade the most-gone first
  const sorted = [...active]
    .filter(c => c.state !== "removed")
    .sort((a, b) => parseFloat(a.el.style.opacity || 1) - parseFloat(b.el.style.opacity || 1));

  for (let i = 0; i < Math.min(count, sorted.length); i++) {
    const c = sorted[i];
    c.decayDuration  = Math.max(c.decayDuration * 0.25, 800);
    c.lingerOpacity  = 0;
    if (c.state === "present") {
      c.state      = "decaying";
      c.decayStart = performance.now();
      c.decayEnd   = c.decayStart + c.decayDuration;
    }
  }
}

export function clusterCount() {
  return active.length;
}
