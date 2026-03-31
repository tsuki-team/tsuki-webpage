"use client";
import { useState, useEffect, useRef } from "react";

const WORDS = ["Go", "Rust", "C++", "C", "Python", "Java", "Javascript"];
/* ─── Scramble word effect ──────────────────────────────────────────────── */
const SCRAMBLE_CHARS = "<>{}[]/|*&#$~?!@%^_=+";

function ScrambleWord({ word }: { word: string }) {
  const [chars, setChars] = useState<{ char: string; locked: boolean }[]>(
    () => word.split("").map(c => ({ char: c, locked: true }))
  );
  const rafRef = useRef<number>(0);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const target = word.split("");
    const TOTAL_MS  = 520;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed    = now - startTime;
      const lockedCount = Math.min(
        target.length,
        Math.floor((elapsed / TOTAL_MS) * target.length)
      );

      setChars(target.map((ch, i) => ({
        char: i < lockedCount
          ? ch
          : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
        locked: i < lockedCount,
      })));

      if (lockedCount < target.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // ensure final state is perfectly clean
        setChars(target.map(ch => ({ char: ch, locked: true })));
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [word]);

  return (
    <span style={{ display: "inline-block" }}>
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            color: c.locked ? "var(--fg)" : "var(--fg-faint)",
            fontFamily: c.locked ? "inherit" : "var(--font-mono)",
            // slight scale down on scramble chars so they feel like "noise"
            fontSize: c.locked ? "1em" : "0.88em",
            verticalAlign: "baseline",
            transition: c.locked ? "color 0.06s ease, font-size 0.06s ease" : "none",
          }}
        >
          {c.char}
        </span>
      ))}
    </span>
  );
}



type OS = "unix" | "windows";

const CMDS: Record<OS, { prompt: string; cmd: string }> = {
  unix:    { prompt: "$",   cmd: "curl -fsSL https://tsuki.s7lver.xyz/install.sh | sh"  },
  windows: { prompt: "PS>", cmd: "irm https://tsuki.s7lver.xyz/install.bat | iex"        },
};

function detectOS(): OS {
  if (typeof navigator === "undefined") return "unix";
  const ua       = navigator.userAgent.toLowerCase();
  const platform = ((navigator as any).userAgentData?.platform ?? navigator.platform ?? "").toLowerCase();
  return (ua.includes("win") || platform.includes("win")) ? "windows" : "unix";
}

/* ─── Wireframe planet ──────────────────────────────────────────────────── */
function Planet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    let raf: number;
    let angle = 0;

    const setup = () => {
      const w = canvas.parentElement?.offsetWidth  ?? 600;
      const h = canvas.parentElement?.offsetHeight ?? 700;
      const s = Math.min(w, h) * 0.86;
      sizeRef.current = s;
      canvas.style.width  = `${s}px`;
      canvas.style.height = `${s}px`;
      canvas.width  = s * dpr;
      canvas.height = s * dpr;
      ctx.scale(dpr, dpr);
    };

    setup();
    window.addEventListener("resize", setup);

    const LAT = 20;
    const LON = 28;
    const TILT = 0.28; // radians

    function project(px: number, py: number, pz: number, rot: number) {
      // rotate around Y
      const cosA = Math.cos(rot), sinA = Math.sin(rot);
      const rx = px * cosA - pz * sinA;
      const rz = px * sinA + pz * cosA;
      // tilt around X
      const cosT = Math.cos(TILT), sinT = Math.sin(TILT);
      const ry2 = py * cosT - rz * sinT;
      const rz2 = py * sinT + rz * cosT;
      return { x: rx, y: ry2, z: rz2 };
    }

    function draw() {
      const s  = sizeRef.current;
      const cx = s / 2, cy = s / 2;
      const R  = s * 0.43;

      ctx.clearRect(0, 0, s, s);

      // ── outer glow ─────────────────────────────────────────────
      for (let i = 4; i >= 1; i--) {
        const gr = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * (1 + i * 0.07));
        gr.addColorStop(0,   "rgba(237,237,237,0.0)");
        gr.addColorStop(0.5, `rgba(237,237,237,${0.012 * i})`);
        gr.addColorStop(1,   "rgba(237,237,237,0.0)");
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(cx, cy, R * (1 + i * 0.07), 0, Math.PI * 2);
        ctx.fill();
      }

      // ── clip sphere ────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // latitude lines
      for (let i = 0; i <= LAT; i++) {
        const phi = (Math.PI * i) / LAT;
        ctx.beginPath();
        let moved = false;
        for (let j = 0; j <= LON * 2; j++) {
          const theta = (2 * Math.PI * j) / (LON * 2);
          const p = project(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta),
            angle
          );
          const alpha = Math.max(0, (p.z + 0.55) / 1.55) * 0.65;
          if (!moved) {
            ctx.moveTo(cx + p.x * R, cy - p.y * R);
            moved = true;
          } else {
            ctx.lineTo(cx + p.x * R, cy - p.y * R);
          }
          ctx.strokeStyle = `rgba(237,237,237,${alpha.toFixed(3)})`;
        }
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }

      // longitude lines
      for (let j = 0; j < LON; j++) {
        const theta = (2 * Math.PI * j) / LON;
        ctx.beginPath();
        let moved = false;
        for (let i = 0; i <= LAT * 2; i++) {
          const phi = (Math.PI * i) / (LAT * 2);
          const p = project(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta),
            angle
          );
          const alpha = Math.max(0, (p.z + 0.55) / 1.55) * 0.65;
          if (!moved) {
            ctx.moveTo(cx + p.x * R, cy - p.y * R);
            moved = true;
          } else {
            ctx.lineTo(cx + p.x * R, cy - p.y * R);
          }
          ctx.strokeStyle = `rgba(237,237,237,${alpha.toFixed(3)})`;
        }
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }

      // intersection nodes
      for (let i = 0; i <= LAT; i += 2) {
        for (let j = 0; j < LON; j += 2) {
          const phi   = (Math.PI * i) / LAT;
          const theta = (2 * Math.PI * j) / LON;
          const p = project(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi),
            Math.sin(phi) * Math.sin(theta),
            angle
          );
          if (p.z < 0) continue;
          const alpha = Math.min(1, (p.z + 0.3) / 1.3) * 0.95;
          ctx.beginPath();
          ctx.arc(cx + p.x * R, cy - p.y * R, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(237,237,237,${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      ctx.restore();

      // ── limb highlight ──────────────────────────────────────────
      const limb = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R);
      limb.addColorStop(0,   "rgba(255,255,255,0.0)");
      limb.addColorStop(0.8, "rgba(255,255,255,0.0)");
      limb.addColorStop(1,   "rgba(255,255,255,0.07)");
      ctx.fillStyle = limb;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // ── dark side terminator ───────────────────────────────────
      const dark = ctx.createRadialGradient(cx + R * 0.18, cy - R * 0.05, 0, cx - R * 0.1, cy + R * 0.1, R * 1.1);
      dark.addColorStop(0,    "rgba(10,10,10,0.0)");
      dark.addColorStop(0.48, "rgba(10,10,10,0.0)");
      dark.addColorStop(1,    "rgba(10,10,10,0.72)");
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      angle += 0.0014;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setup);
    };
  }, []);

  return (
    <div style={{
      position: "absolute",
      right: "-22%",
      bottom: "-34%",
      width: "88%",
      aspectRatio: "1",
      pointerEvents: "none",
      zIndex: 0,
    }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {/* fade edges — heavier fade at bottom and right so it bleeds naturally */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: [
          "radial-gradient(ellipse 100% 100% at 65% 65%, transparent 34%, var(--surface) 62%)",
        ].join(", "),
      }} />
    </div>
  );
}

/* ─── Beta Modal ─────────────────────────────────────────────────────────── */
function BetaModal({ onClose }: { onClose: () => void }) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [lang,    setLang]    = useState("");
  const [done,    setDone]    = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    setDone(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface-3)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "9px 12px",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--fg)",
    outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          width: "100%",
          maxWidth: 420,
          padding: 32,
          transform: visible ? "translateY(0)" : "translateY(12px)",
          transition: "transform 0.2s ease",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--fg-faint)", padding: 4, borderRadius: 4,
            lineHeight: 1, fontSize: 16, transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--fg-faint)"}
        >✕</button>

        {!done ? (
          <>
            <div className="t-label" style={{ marginBottom: 10 }}>Private Beta</div>
            <h3 style={{
              fontFamily: "var(--font-sans)", fontSize: 20, fontWeight: 600,
              letterSpacing: "-0.03em", color: "var(--fg)", marginBottom: 8,
            }}>Request early access</h3>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)",
              lineHeight: 1.6, marginBottom: 28,
            }}>
              We&apos;re onboarding a small group of developers. Drop your info and we&apos;ll reach out.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.07em", color: "var(--fg-faint)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Name
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = "var(--fg-faint)"}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = "var(--border)"}
                />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.07em", color: "var(--fg-faint)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = "var(--fg-faint)"}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = "var(--border)"}
                />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.07em", color: "var(--fg-faint)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Primary language <span style={{ opacity: 0.5 }}>(optional)</span>
                </label>
                <input
                  value={lang}
                  onChange={e => setLang(e.target.value)}
                  placeholder="Go, Rust, Python…"
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = "var(--fg-faint)"}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = "var(--border)"}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !email.trim()}
                style={{
                  marginTop: 8,
                  padding: "10px 20px",
                  background: "var(--fg)",
                  color: "var(--accent-inv)",
                  border: "none",
                  borderRadius: 6,
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                  opacity: (!name.trim() || !email.trim()) ? 0.4 : 1,
                  letterSpacing: "-0.01em",
                }}
              >
                Request access →
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(34,197,94,0.08)",
              border: "1px solid rgba(34,197,94,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 18,
            }}>✓</div>
            <h3 style={{
              fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 600,
              letterSpacing: "-0.03em", color: "var(--fg)", marginBottom: 10,
            }}>You&apos;re on the list</h3>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: 24 }}>
              We&apos;ll reach out to <span style={{ color: "var(--fg)" }}>{email}</span> when your spot opens up.
            </p>
            <button
              onClick={handleClose}
              style={{
                padding: "8px 20px",
                background: "transparent",
                color: "var(--fg-muted)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const [copied,  setCopied]  = useState(false);
  const [wordIdx, setWordIdx] = useState(0);
  const [os,      setOs]      = useState<OS>("unix");
  const [showBeta, setShowBeta] = useState(false);

  useEffect(() => { setOs(detectOS()); }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setWordIdx(i => (i + 1) % WORDS.length);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  const copy = () => {
    navigator.clipboard.writeText(CMDS[os].cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
    <section style={{
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      background: "var(--surface)",
    }}>

      {/* ── Planet ──────────────────────────────────────────────── */}
      <Planet />

      {/* ── Subtle bottom fade ──────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "28%",
        background: "linear-gradient(to bottom, transparent, var(--surface))",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{
        position: "relative", zIndex: 2,
        maxWidth: 1100, width: "100%", margin: "0 auto",
        padding: "120px 28px 80px",
      }}>
        <div style={{ maxWidth: 560 }}>

          {/* Badge */}
          <div className="badge animate-up" style={{ marginBottom: 32, animationDelay: "0.05s" }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: "50%",
              background: "var(--ok)", marginRight: 2,
              boxShadow: "0 0 6px var(--ok)",
            }} />
            DEMO SOON · v0.1.0
          </div>

          {/* Headline */}
          <h1 className="t-display animate-up" style={{
            animationDelay: "0.1s",
            fontSize: "clamp(42px, 6.5vw, 88px)",
          }}>
            Building Arduino in
            <br />
            <span style={{
              display: "inline-block",
              borderBottom: "1px solid var(--fg-faint)",
              paddingBottom: "0.04em",
            }}>
              <ScrambleWord word={WORDS[wordIdx]} />
            </span>
          </h1>

          {/* Sub */}
          <p className="t-body animate-up" style={{
            marginTop: 24, maxWidth: 460,
            fontSize: 16, lineHeight: 1.7,
            animationDelay: "0.2s",
          }}>
            Write code in the language you want, we take care of the rest.
            Transpilation toolchain with native library support.
          </p>

          {/* CTAs */}
          <div className="animate-up" style={{
            display: "flex", gap: 10, marginTop: 36,
            flexWrap: "wrap", animationDelay: "0.3s",
          }}>
            <a href="#install" className="btn btn-primary" style={{ fontSize: 14 }}>
              Start Developing
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </a>
            <button
              onClick={() => setShowBeta(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "9px 18px", borderRadius: 6,
                fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500,
                color: "var(--fg-muted)",
                background: "transparent",
                border: "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--fg)";
                el.style.background = "var(--hover)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = "var(--fg-muted)";
                el.style.background = "transparent";
              }}
            >
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: "var(--ok)", flexShrink: 0,
                boxShadow: "0 0 6px var(--ok)",
              }} />
              Join Private Beta
            </button>
          </div>

          {/* Install command */}
          <div className="animate-up" style={{ marginTop: 44, animationDelay: "0.4s" }}>
            <button
              onClick={copy}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                width: "100%", maxWidth: 500,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 7, padding: "11px 14px",
                cursor: "pointer", transition: "border-color 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--fg-faint)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            >
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 12,
                color: "var(--ok)", flexShrink: 0, opacity: 0.85,
              }}>
                {CMDS[os].prompt}
              </span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 12.5,
                color: "var(--fg-muted)", flex: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {CMDS[os].cmd}
              </span>
              <span style={{
                padding: "3px 10px",
                background: copied ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                border: "1px solid",
                borderColor: copied ? "rgba(34,197,94,0.25)" : "var(--border)",
                borderRadius: 4,
                fontFamily: "var(--font-mono)", fontSize: 10,
                letterSpacing: "0.06em",
                color: copied ? "var(--ok)" : "var(--fg-faint)",
                transition: "all 0.2s", flexShrink: 0,
              }}>
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: "var(--fg-faint)", marginTop: 8, lineHeight: 1.6,
            }}>
              {os === "unix"
                ? <>macOS & Linux · Windows: <code>irm tsuki.s7lver.xyz/install.bat | iex</code></>
                : <>Windows 10/11 · macOS/Linux: <code>curl -fsSL tsuki.s7lver.xyz/install.sh | sh</code></>}
            </p>
          </div>

          {/* Stats */}
          <div className="animate-up" style={{
            display: "flex", gap: 44, marginTop: 64,
            animationDelay: "0.5s", flexWrap: "wrap",
          }}>
            {[
              { val: "~11ms", label: "Transpile"   },
              { val: "~1s",   label: "Compilation" },
              { val: "~20MB", label: "Disk Space"  },
              { val: "14+",   label: "Boards"      },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 600,
                  letterSpacing: "-0.04em", color: "var(--fg)",
                }}>{s.val}</div>
                <div className="t-label" style={{ marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Scroll hint ─────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: 28, left: "50%",
        transform: "translateX(-50%)",
        opacity: 0.18, display: "flex", flexDirection: "column",
        alignItems: "center", gap: 8, zIndex: 2,
      }}>
        <div style={{ width: 1, height: 36, background: "linear-gradient(to bottom, transparent, var(--fg))" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.14em", color: "var(--fg)" }}>SCROLL</span>
      </div>

    </section>

    {/* ── Beta Modal ──────────────────────────────────────────── */}
    {showBeta && <BetaModal onClose={() => setShowBeta(false)} />}
    </>
  );
}