"use client";
import { useState, useEffect, useRef } from "react";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done:    diff === 0,
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

/* ── Digit with flip animation ─────────────────────── */
function Digit({ value }: { value: string }) {
  const [cur, setCur]     = useState(value);
  const [flip, setFlip]   = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      prev.current = value;
      setFlip(true);
      setTimeout(() => { setCur(value); setFlip(false); }, 80);
    }
  }, [value]);

  return (
    <span style={{
      display: "inline-block",
      fontFamily: "var(--font-mono)",
      fontWeight: 300,
      fontSize: "clamp(52px, 8.5vw, 104px)",
      lineHeight: 1,
      letterSpacing: "-0.06em",
      color: "var(--fg)",
      minWidth: "0.62em",
      textAlign: "center",
      transition: "opacity 80ms ease, transform 80ms ease",
      opacity: flip ? 0 : 1,
      transform: flip ? "translateY(-6px)" : "translateY(0)",
    }}>
      {cur}
    </span>
  );
}

/* ── Time unit block ────────────────────────────────── */
function Unit({ value, label, colon }: { value: number; label: string; colon?: boolean }) {
  const s = pad(value);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: "0.02em" }}>
          <Digit value={s[0]} />
          <Digit value={s[1]} />
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--fg-faint)", fontWeight: 400,
        }}>
          {label}
        </span>
      </div>
      {colon && (
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(36px, 5.5vw, 68px)",
          fontWeight: 300, lineHeight: 1,
          color: "var(--fg-faint)",
          margin: "0 clamp(6px, 1.2vw, 20px)",
          marginBottom: 22,
          opacity: 0.3,
        }}>:</span>
      )}
    </div>
  );
}

/* ── Planet canvas ──────────────────────────────────── */
function Planet({ size = 520 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R  = size * 0.42;

    // Build mesh points on sphere surface
    const latLines  = 18;
    const lonLines  = 24;
    const points: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i <= latLines; i++) {
      const phi = (Math.PI * i) / latLines;
      for (let j = 0; j <= lonLines; j++) {
        const theta = (2 * Math.PI * j) / lonLines;
        points.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.cos(phi),
          z: Math.sin(phi) * Math.sin(theta),
        });
      }
    }

    let angle = 0;
    let raf: number;

    function project(px: number, py: number, pz: number, rot: number) {
      const cosA = Math.cos(rot), sinA = Math.sin(rot);
      const rx = px * cosA - pz * sinA;
      const rz = px * sinA + pz * cosA;
      // slight tilt
      const tilt = 0.22;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const ry2 = py * cosT - rz * sinT;
      const rz2 = py * sinT + rz * cosT;
      return { x: cx + rx * R, y: cy - ry2 * R, z: rz2 };
    }

    function draw() {
      ctx.clearRect(0, 0, size, size);

      // Atmosphere glow (very subtle)
      const glow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.18);
      glow.addColorStop(0,   "rgba(255,255,255,0.0)");
      glow.addColorStop(0.6, "rgba(255,255,255,0.015)");
      glow.addColorStop(1,   "rgba(255,255,255,0.0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // Clip to sphere
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Draw latitude lines
      for (let i = 0; i <= latLines; i++) {
        const phi = (Math.PI * i) / latLines;
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= lonLines; j++) {
          const theta = (2 * Math.PI * j) / lonLines;
          const px = Math.sin(phi) * Math.cos(theta);
          const py = Math.cos(phi);
          const pz = Math.sin(phi) * Math.sin(theta);
          const p  = project(px, py, pz, angle);
          const alpha = Math.max(0, (p.z + 0.6) / 1.6) * 0.55;
          ctx.strokeStyle = `rgba(237,237,237,${alpha.toFixed(3)})`;
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Draw longitude lines
      for (let j = 0; j <= lonLines; j++) {
        const theta = (2 * Math.PI * j) / lonLines;
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= latLines; i++) {
          const phi = (Math.PI * i) / latLines;
          const px = Math.sin(phi) * Math.cos(theta);
          const py = Math.cos(phi);
          const pz = Math.sin(phi) * Math.sin(theta);
          const p  = project(px, py, pz, angle);
          const alpha = Math.max(0, (p.z + 0.6) / 1.6) * 0.55;
          ctx.strokeStyle = `rgba(237,237,237,${alpha.toFixed(3)})`;
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }

      // Nodes at intersections
      for (let i = 0; i <= latLines; i += 3) {
        for (let j = 0; j <= lonLines; j += 3) {
          const phi   = (Math.PI * i) / latLines;
          const theta = (2 * Math.PI * j) / lonLines;
          const px = Math.sin(phi) * Math.cos(theta);
          const py = Math.cos(phi);
          const pz = Math.sin(phi) * Math.sin(theta);
          const p  = project(px, py, pz, angle);
          if (p.z < -0.1) continue;
          const alpha = Math.max(0, (p.z + 0.4) / 1.4) * 0.9;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(237,237,237,${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      ctx.restore();

      // Limb — subtle edge highlight
      const limb = ctx.createRadialGradient(cx, cy, R * 0.78, cx, cy, R);
      limb.addColorStop(0, "rgba(255,255,255,0.0)");
      limb.addColorStop(1, "rgba(255,255,255,0.06)");
      ctx.fillStyle = limb;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Dark side overlay
      const dark = ctx.createRadialGradient(cx - R * 0.25, cy + R * 0.1, 0, cx, cy, R);
      dark.addColorStop(0,   "rgba(10,10,10,0.0)");
      dark.addColorStop(0.55,"rgba(10,10,10,0.0)");
      dark.addColorStop(1,   "rgba(10,10,10,0.62)");
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      angle += 0.0015;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size, height: size,
        opacity: 0.82,
        filter: "blur(0.3px)",
      }}
    />
  );
}

/* ── Main Countdown ─────────────────────────────────── */
interface CountdownProps {
  launchDate: Date;
  onUnlock:   () => void;
}

export default function Countdown({ launchDate, onUnlock }: CountdownProps) {
  const [time, setTime]   = useState(() => getTimeLeft(launchDate));
  const [dots, setDots]   = useState(0);
  const [planetSize, setPlanetSize] = useState(520);

  useEffect(() => {
    const iv = setInterval(() => {
      const t = getTimeLeft(launchDate);
      setTime(t);
      if (t.done) onUnlock();
    }, 1000);
    return () => clearInterval(iv);
  }, [launchDate, onUnlock]);

  useEffect(() => {
    const iv = setInterval(() => setDots(d => (d + 1) % 4), 550);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPlanetSize(Math.min(Math.max(w * 0.52, 300), 600));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "var(--surface)",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      fontFamily: "var(--font-sans)",
    }}>

      {/* ── Planet — right side ───────────────────── */}
      <div style={{
        position: "absolute",
        right: "-8%",
        top: "50%",
        transform: "translateY(-50%)",
        pointerEvents: "none",
        animation: "fadeIn 1.2s ease forwards",
        opacity: 0,
      }}>
        <Planet size={planetSize} />
      </div>

      {/* ── Subtle horizontal grid lines ─────────── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            top: `${(i + 1) * (100 / 7)}%`,
            height: 1, background: "var(--border-subtle)",
            opacity: 0.5,
          }} />
        ))}
      </div>

      {/* ── Logo ─────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 28, left: 36,
        display: "flex", alignItems: "center", gap: 10,
        animation: "fadeIn 400ms ease forwards",
      }}>
        <div style={{
          width: 26, height: 26, background: "var(--fg)", borderRadius: 5,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 14, color: "var(--accent-inv)", fontWeight: 600 }}>月</span>
        </div>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--fg)" }}>
          tsuki
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-faint)", letterSpacing: "0.06em" }}>
          v0.1.0
        </span>
      </div>

      {/* ── Status top-right ─────────────────────── */}
      <div style={{
        position: "absolute", top: 32, right: 36,
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: "var(--fg-faint)", letterSpacing: "0.14em", textTransform: "uppercase",
        animation: "fadeIn 400ms 100ms ease both",
      }}>
        <span style={{ color: "var(--ok)", marginRight: 7 }}>●</span>
        STANDBY{".".repeat(dots)}
      </div>

      {/* ── Main content ─────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: "max(36px, 8vw)",
        maxWidth: "55vw",
        gap: 0,
        animation: "fadeUp 500ms ease forwards",
      }}>

        {/* Eyebrow */}
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--fg-faint)", marginBottom: 36,
          display: "block",
        }}>
          LAUNCHING IN
        </span>

        {/* Timer */}
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 56 }}>
          <Unit value={time.days}    label="days"    colon />
          <Unit value={time.hours}   label="hours"   colon />
          <Unit value={time.minutes} label="min"     colon />
          <Unit value={time.seconds} label="sec" />
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "clamp(14px, 1.8vw, 20px)",
          fontWeight: 300, color: "var(--fg-muted)",
          lineHeight: 1.55, letterSpacing: "-0.01em",
          maxWidth: 440, marginBottom: 44,
        }}>
          Write Arduino firmware in Go.<br />
          The complete embedded development toolkit.
        </p>

        {/* Separator */}
        <div style={{
          width: 48, height: 1, background: "var(--border)",
          marginBottom: 36,
        }} />

        {/* Terminal command */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 8 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: "var(--fg-faint)", letterSpacing: "0.14em", textTransform: "uppercase",
          }}>
            EARLY ACCESS — RUN IN YOUR TERMINAL
          </span>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 6, padding: "10px 16px",
          }}>
            <span style={{ color: "var(--ok)", fontFamily: "var(--font-mono)", fontSize: 12, opacity: 0.8 }}>$</span>
            <code style={{
              fontFamily: "var(--font-mono)", fontSize: 12,
              color: "var(--fg-muted)", letterSpacing: "0.01em",
            }}>
              curl -X POST https://tsuki.s7lver.xyz/api/unlock
            </code>
          </div>
        </div>

      </div>

      {/* ── Footer ───────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 28, left: 36, right: 36,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: "var(--fg-faint)", letterSpacing: "0.1em",
        animation: "fadeIn 600ms 300ms ease both",
        opacity: 0,
      }}>
        <span>TSUKI SYSTEMS · BUILD 2025.09</span>
        <span>tsuki.s7lver.xyz</span>
      </div>

    </div>
  );
}