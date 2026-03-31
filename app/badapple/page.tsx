"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ── Grid dimensions ───────────────────────────────────────────────────────────
const COLS     = 72;
const ROWS     = 40;
const CHAR     = "月";
const CHAR_W   = 11;   // px per cell (monospace width of 月 at 11px font)
const CHAR_H   = 16;   // px per cell
const CANVAS_W = COLS * CHAR_W;
const CANVAS_H = ROWS * CHAR_H;

// ── Noise helper (simple value noise) ────────────────────────────────────────
function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}
function noise2(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix,        fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix     + iy     * 57);
  const b = hash(ix + 1 + iy     * 57);
  const c = hash(ix     + (iy+1) * 57);
  const d = hash(ix + 1 + (iy+1) * 57);
  return a + (b-a)*ux + (c-a)*uy + (d-a+a-b-c+b+c-a)*ux*uy; // bilinear
}

// ── Scene math ────────────────────────────────────────────────────────────────

type Grid = Uint8Array; // ROWS * COLS, 0=off 1=on

function mkGrid(): Grid { return new Uint8Array(ROWS * COLS); }

function set(g: Grid, r: number, c: number, v: number) {
  if (r >= 0 && r < ROWS && c >= 0 && c < COLS) g[r * COLS + c] = v;
}

// Scene timing (seconds)
const SCENE_TIMES = [
  0,    // 0: fade-in / all-off
  3,    // 1: ring expansion
  9,    // 2: rotating yin-yang (iconic Bad Apple)
  20,   // 3: silhouette walk
  31,   // 4: danmaku burst
  39,   // 5: wave interference
  48,   // 6: spiral collapse
  56,   // 7: outro / scatter
  62,   // end → loop to 0
];

function getScene(t: number): number {
  const looped = t % SCENE_TIMES[SCENE_TIMES.length - 1];
  for (let i = SCENE_TIMES.length - 2; i >= 0; i--) {
    if (looped >= SCENE_TIMES[i]) return i;
  }
  return 0;
}

function sceneT(t: number): number {
  const looped = t % SCENE_TIMES[SCENE_TIMES.length - 1];
  const s = getScene(t);
  return looped - SCENE_TIMES[s];
}

// ── Scene 0: all dark → dots appear ──────────────────────────────────────────
function scene0(st: number): Grid {
  const g = mkGrid();
  const dur = SCENE_TIMES[1] - SCENE_TIMES[0]; // 3s
  const p   = Math.min(st / dur, 1);
  const cx  = COLS / 2, cy = ROWS / 2;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dx = (c - cx) / COLS, dy = (r - cy) / ROWS;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const n = noise2(c * 0.3, r * 0.3 + st * 0.4);
      g[r * COLS + c] = (dist < p * 0.85 && n < p * 0.5) ? 1 : 0;
    }
  }
  return g;
}

// ── Scene 1: expanding concentric rings ───────────────────────────────────────
function scene1(st: number): Grid {
  const g = mkGrid();
  const cx = COLS / 2, cy = ROWS / 2;
  const speed = 2.5;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dx = (c - cx) / COLS * 2;
      const dy = (r - cy) / ROWS * 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const wave = Math.sin(dist * 14 - st * speed * 2) * 0.5 + 0.5;
      const mask = Math.sin(dist * 5  - st * speed * 0.5) * 0.5 + 0.5;
      g[r * COLS + c] = (wave > 0.55 && mask > 0.3) ? 1 : 0;
    }
  }
  return g;
}

// ── Scene 2: rotating yin-yang (classic Bad Apple core) ───────────────────────
function scene2(st: number): Grid {
  const g = mkGrid();
  const cx = COLS / 2, cy = ROWS / 2;
  // slow + fast rotation layers
  const ang1 = st * 0.9;
  const ang2 = st * 1.7;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dx = (c - cx) / (COLS * 0.5);
      const dy = (r - cy) / (ROWS * 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.95) { g[r * COLS + c] = 0; continue; }

      const theta  = Math.atan2(dy, dx);
      // outer ring: alternating sectors
      const outer  = ((theta + ang1) / Math.PI + 10) % 2 > 1 ? 1 : 0;
      // inner disc: counter-rotating
      const inner  = dist < 0.35
        ? (((theta + ang2) / Math.PI + 10) % 2 > 1 ? 1 : 0)
        : outer;
      // tiny center dot
      const center = dist < 0.08 ? (inner ^ 1) : inner;

      // add a subtle noise texture
      const n = noise2(c * 0.15 + st * 0.1, r * 0.15);
      g[r * COLS + c] = n > 0.15 ? center : (center ^ 1);
    }
  }
  return g;
}

// ── Scene 3: silhouette walk ───────────────────────────────────────────────────
// Simplified human silhouette as bitmap (30 wide × 36 tall, centered)
const SILO_HEAD = (() => {
  const rows: number[][] = [];
  // head (oval)
  for (let r = 0; r < 7; r++) {
    const row: number[] = [];
    for (let c = 0; c < 12; c++) {
      const dx = (c - 5.5) / 5, dy = (r - 3) / 3.5;
      row.push(dx*dx + dy*dy < 1 ? 1 : 0);
    }
    rows.push(row);
  }
  return rows;
})();

function drawSilo(g: Grid, cx: number, cy: number, phase: number) {
  const top = cy - 18;
  // Head
  for (let r = 0; r < SILO_HEAD.length; r++) {
    for (let c = 0; c < SILO_HEAD[r].length; c++) {
      set(g, top + r, Math.round(cx - 5 + c), SILO_HEAD[r][c]);
    }
  }
  // Neck
  for (let r = 0; r < 2; r++) set(g, top + 7 + r, cx, 1), set(g, top + 7 + r, cx + 1, 1);
  // Torso
  for (let r = 0; r < 10; r++) {
    const w = 4 + (r < 5 ? r : 10 - r);
    for (let c = -w; c <= w; c++) set(g, top + 9 + r, cx + c, 1);
  }
  // Arms (swing with phase)
  const armSwing = Math.sin(phase) * 4;
  for (let r = 0; r < 8; r++) {
    set(g, top + 10 + r, Math.round(cx - 5 - armSwing * (r / 8)), 1);
    set(g, top + 10 + r, Math.round(cx + 5 + armSwing * (r / 8)), 1);
  }
  // Legs (alternate stride)
  const legSwing = Math.sin(phase) * 6;
  for (let r = 0; r < 10; r++) {
    set(g, top + 20 + r, Math.round(cx - 2 - legSwing * (r / 10)), 1);
    set(g, top + 20 + r, Math.round(cx + 2 + legSwing * (r / 10)), 1);
  }
}

function scene3(st: number): Grid {
  const g = mkGrid();
  // Figure walks across screen
  const dur  = SCENE_TIMES[4] - SCENE_TIMES[3]; // 8s
  const xPos = -8 + (COLS + 16) * (st / dur);
  const phase = st * 3.5;

  // Invert background: fill all, then cut silhouette
  for (let i = 0; i < g.length; i++) g[i] = 1;
  // Ground line
  for (let c = 0; c < COLS; c++) { set(g, ROWS - 3, c, 1); set(g, ROWS - 2, c, 0); set(g, ROWS - 1, c, 0); }

  // Silhouette (dark cutout)
  const shadow = mkGrid();
  drawSilo(shadow, Math.round(xPos), ROWS - 4, phase);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (shadow[r * COLS + c]) g[r * COLS + c] = 0;
    }
  }
  return g;
}

// ── Scene 4: danmaku burst ─────────────────────────────────────────────────────
function scene4(st: number): Grid {
  const g = mkGrid();
  const cx = COLS / 2, cy = ROWS / 2;
  const BULLET_RINGS = 8;
  const BULLETS_PER  = 24;

  for (let ring = 0; ring < BULLET_RINGS; ring++) {
    const ringT = st - ring * 0.35;
    if (ringT < 0) continue;
    const speed  = 0.28 + ring * 0.06;
    const radius = ringT * speed;
    const angleOffset = ring * (Math.PI / BULLET_RINGS) + st * 0.4;

    for (let b = 0; b < BULLETS_PER; b++) {
      const angle = (b / BULLETS_PER) * Math.PI * 2 + angleOffset;
      const bx    = cx + Math.cos(angle) * radius * COLS * 0.5;
      const by    = cy + Math.sin(angle) * radius * ROWS * 0.5;
      // draw small cross
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (Math.abs(dr) + Math.abs(dc) <= 1) set(g, Math.round(by + dr), Math.round(bx + dc), 1);
        }
      }
    }
  }

  // Center glow
  for (let r = -3; r <= 3; r++) {
    for (let c = -3; c <= 3; c++) {
      if (r*r + c*c < 12) set(g, Math.round(cy + r), Math.round(cx + c), 1);
    }
  }
  return g;
}

// ── Scene 5: wave interference ─────────────────────────────────────────────────
function scene5(st: number): Grid {
  const g = mkGrid();
  const cx = COLS * 0.35, cy = ROWS * 0.5;
  const cx2 = COLS * 0.65, cy2 = ROWS * 0.5;
  const freq = 6.5, speed = 2.2;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const d1 = Math.sqrt((c-cx)**2*0.3 + (r-cy)**2);
      const d2 = Math.sqrt((c-cx2)**2*0.3 + (r-cy2)**2);
      const w1 = Math.sin(d1 * freq * 0.3 - st * speed);
      const w2 = Math.sin(d2 * freq * 0.3 - st * speed + Math.PI * 0.6);
      const combined = (w1 + w2) * 0.5;
      g[r * COLS + c] = combined > 0.1 ? 1 : 0;
    }
  }
  return g;
}

// ── Scene 6: spiral collapse ───────────────────────────────────────────────────
function scene6(st: number): Grid {
  const g = mkGrid();
  const cx = COLS / 2, cy = ROWS / 2;
  const dur  = SCENE_TIMES[7] - SCENE_TIMES[6];
  const prog = st / dur; // 0→1

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const dx    = (c - cx) / (COLS * 0.5);
      const dy    = (r - cy) / (ROWS * 0.5);
      const dist  = Math.sqrt(dx*dx + dy*dy);
      const theta = Math.atan2(dy, dx);
      // Spiral: as time progresses, the boundary sweeps inward
      const spiral = ((theta / (Math.PI * 2) + dist * 3 + 10) % 1);
      const boundary = 1 - prog * dist;
      g[r * COLS + c] = (spiral < 0.5 && dist < boundary + 0.1) ? 1 : 0;
    }
  }
  return g;
}

// ── Scene 7: scatter / outro ───────────────────────────────────────────────────
function scene7(st: number): Grid {
  const g = mkGrid();
  const dur  = SCENE_TIMES[8] - SCENE_TIMES[7];
  const prog = Math.min(st / dur, 1);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const n  = noise2(c * 0.4 + st * 0.2, r * 0.4);
      const n2 = noise2(c * 0.2 - st * 0.3, r * 0.2 + 100);
      g[r * COLS + c] = (n * (1 - prog) + n2 * 0.3 > 0.45 * (1 - prog * 0.5)) ? 1 : 0;
    }
  }
  return g;
}

const SCENE_FNS = [scene0, scene1, scene2, scene3, scene4, scene5, scene6, scene7];

function computeFrame(t: number): Grid {
  const scene = getScene(t);
  const st    = sceneT(t);
  return SCENE_FNS[scene]?.(st) ?? mkGrid();
}

// ── Canvas renderer ───────────────────────────────────────────────────────────

function drawFrame(ctx: CanvasRenderingContext2D, grid: Grid, alpha: number) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.font      = `${CHAR_H * 0.72}px 'IBM Plex Mono', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha  = alpha;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r * COLS + c]) {
        const x = c * CHAR_W + CHAR_W / 2;
        const y = r * CHAR_H + CHAR_H / 2;
        // Slight luminance variation for depth
        const lum = 0.72 + noise2(c * 0.25, r * 0.25) * 0.28;
        ctx.fillStyle = `rgb(${Math.round(237 * lum)},${Math.round(237 * lum)},${Math.round(237 * lum)})`;
        ctx.fillText(CHAR, x, y);
      }
    }
  }
  ctx.globalAlpha = 1;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BadApplePage() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const startRef   = useRef<number>(0);
  const [started,  setStarted]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [elapsed,  setElapsed]  = useState(0);

  const SCENE_NAMES = [
    "initializing",
    "ring expansion",
    "yin-yang rotation",
    "silhouette traversal",
    "danmaku burst",
    "wave interference",
    "spiral collapse",
    "scatter",
  ];

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const t   = (performance.now() - startRef.current) / 1000;
    const g   = computeFrame(t);
    const s   = getScene(t);

    // Fade in for first 0.5s
    const alpha = Math.min(t / 0.5, 1);
    drawFrame(ctx, g, alpha);

    setSceneIdx(s);
    setElapsed(Math.floor(t % SCENE_TIMES[SCENE_TIMES.length - 1]));

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const start = () => {
    setStarted(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Preload font
    const f = new FontFace("IBM Plex Mono", "url(https://fonts.gstatic.com/s/ibmplexmono/v19/-F6qfjptAgt5VM-kVkqdyU8n1ioa1Xdm.woff2)");
    f.load().then(() => {
      document.fonts.add(f);
      setLoaded(true);
    }).catch(() => setLoaded(true)); // fallback: try anyway
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Format mm:ss
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{
      minHeight: "100vh", background: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'IBM Plex Mono', monospace",
      padding: "24px 16px",
    }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 6 }}>
          <a href="/" style={{
            display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
          }}>
            <div style={{ width: 20, height: 20, background: "#ededed", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: "#0a0a0a", fontWeight: 600 }}>月</span>
            </div>
            <span style={{ fontSize: 12, color: "#484848", letterSpacing: "0.06em" }}>tsuki</span>
          </a>
          <span style={{ color: "#242424", fontSize: 12 }}>·</span>
          <span style={{ fontSize: 11, color: "#484848", letterSpacing: "0.06em", textTransform: "uppercase" }}>bad apple</span>
        </div>
        <p style={{ fontSize: 9.5, color: "#333", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>
          Bad Apple!! feat. nomico — rendered in 月
        </p>
      </div>

      {/* ── Canvas wrapper ── */}
      <div style={{
        position: "relative",
        border: "1px solid #1c1c1c",
        borderRadius: 6,
        overflow: "hidden",
        background: "#0a0a0a",
        boxShadow: started ? "0 0 60px rgba(237,237,237,0.04), 0 0 120px rgba(237,237,237,0.02)" : "none",
        transition: "box-shadow 0.8s ease",
      }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ display: "block", maxWidth: "min(100vw - 32px, 792px)", height: "auto" }}
        />

        {/* Overlay before start */}
        {!started && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.88)",
            gap: 16,
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>月</div>
              <p style={{ fontSize: 11, color: "#8c8c8c", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
                Bad Apple!!
              </p>
              <p style={{ fontSize: 9, color: "#484848", letterSpacing: "0.06em", margin: 0 }}>
                feat. nomico · tsuki character renderer
              </p>
            </div>

            <button
              onClick={start}
              disabled={!loaded}
              style={{
                padding: "9px 28px", borderRadius: 5,
                background: loaded ? "#ededed" : "#1f1f1f",
                color: loaded ? "#0a0a0a" : "#484848",
                border: "none", cursor: loaded ? "pointer" : "default",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12, fontWeight: 500, letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              {loaded ? "▶  Play" : "Loading…"}
            </button>

            <p style={{ fontSize: 9, color: "#333", letterSpacing: "0.06em", margin: 0, textTransform: "uppercase" }}>
              Visual only · No audio
            </p>
          </div>
        )}

        {/* Scanline overlay */}
        {started && (
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px)",
          }} />
        )}
      </div>

      {/* ── Status bar ── */}
      {started && (
        <div style={{
          marginTop: 10,
          display: "flex", alignItems: "center", gap: 16,
          fontSize: 9.5, color: "#484848", letterSpacing: "0.06em",
        }}>
          <span style={{ textTransform: "uppercase" }}>{fmt(elapsed)}</span>
          <span style={{ color: "#242424" }}>·</span>
          <span style={{ color: "#333", textTransform: "uppercase" }}>scene</span>
          <span style={{ color: "#8c8c8c" }}>{SCENE_NAMES[sceneIdx] ?? "—"}</span>
          <span style={{ color: "#242424" }}>·</span>
          <span style={{ color: "#333", textTransform: "uppercase" }}>{COLS}×{ROWS}</span>
          <span style={{ color: "#333" }}>月</span>
        </div>
      )}

      {/* ── Footer easter egg hint ── */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <a href="/" style={{
          fontSize: 9.5, color: "#333", letterSpacing: "0.06em", textTransform: "uppercase",
          textDecoration: "none", transition: "color 0.15s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#8c8c8c")}
          onMouseLeave={e => (e.currentTarget.style.color = "#333")}
        >
          ← back to tsuki
        </a>
        <p style={{ fontSize: 8.5, color: "#1f1f1f", marginTop: 10, letterSpacing: "0.08em" }}>
          you found the easter egg · bad apple (2008) · alstroemeria records
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
      `}</style>
    </div>
  );
}