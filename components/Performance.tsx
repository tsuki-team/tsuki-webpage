"use client";
import { useState, useEffect, useRef } from "react";

/* ── Animated counter ─────────────────────────────────────────────────────── */
function Counter({
  target,
  duration = 1400,
  decimals = 0,
  suffix = "",
}: {
  target: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(parseFloat((ease * target).toFixed(decimals)));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? val.toFixed(decimals) : Math.floor(val)}
      {suffix}
    </span>
  );
}

/* ── Terminal line animation ──────────────────────────────────────────────── */
const BUILD_STEPS = [
  { delay: 0,    color: "var(--fg-faint)",  text: "$ tsuki build --board uno --lang go" },
  { delay: 320,  color: "var(--fg-muted)",  text: "  → Parsing source files..." },
  { delay: 640,  color: "var(--fg-muted)",  text: "  → Resolving imports (ws2812, servo)" },
  { delay: 960,  color: "var(--fg-muted)",  text: "  → Transpiling Go → C++" },
  { delay: 1200, color: "var(--ok)",        text: "  ✓ Transpile complete          11ms" },
  { delay: 1520, color: "var(--fg-muted)",  text: "  → Compiling with avr-gcc..." },
  { delay: 2600, color: "var(--ok)",        text: "  ✓ Compilation complete        ~1.0s" },
  { delay: 2900, color: "var(--fg-muted)",  text: "  → Binary size: 7.2 KB / 32 KB" },
  { delay: 3200, color: "var(--ok)",        text: "  ✓ Ready to flash" },
];

function Terminal() {
  const [visible, setVisible] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const restart = () => {
    setVisible([]);
    setTimeout(() => {
      BUILD_STEPS.forEach((s, i) => {
        setTimeout(() => setVisible(v => [...v, i]), s.delay);
      });
    }, 80);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          restart();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  return (
    <div ref={ref} style={{
      background: "var(--surface-1)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
      fontFamily: "var(--font-mono)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["#ff5f57","#ffbd2e","#28c840"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>
        <span style={{ fontSize: 10, color: "var(--fg-faint)", letterSpacing: "0.05em" }}>
          tsuki — build
        </span>
        <button
          onClick={restart}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: "var(--fg-faint)", fontSize: 10, letterSpacing: "0.05em",
            fontFamily: "var(--font-mono)", padding: "2px 6px",
            borderRadius: 4, transition: "color 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--fg-faint)"}
        >
          ↺ replay
        </button>
      </div>

      <div style={{ padding: "16px 18px", minHeight: 200, display: "flex", flexDirection: "column", gap: 5 }}>
        {BUILD_STEPS.map((s, i) => (
          <div
            key={i}
            style={{
              fontSize: 12, lineHeight: 1.6,
              color: s.color,
              opacity: visible.includes(i) ? 1 : 0,
              transform: visible.includes(i) ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 0.2s ease, transform 0.2s ease",
              display: "flex", justifyContent: "space-between",
              letterSpacing: i === 0 ? "0.01em" : undefined,
              fontWeight: s.color === "var(--ok)" ? 500 : undefined,
            }}
          >
            <span>{s.text}</span>
          </div>
        ))}
        <span style={{
          display: "inline-block", width: 7, height: 13, marginTop: 4,
          background: "var(--fg-faint)",
          opacity: visible.length === BUILD_STEPS.length ? 0 : 0.6,
          animation: "blink-cursor 1s step-end infinite",
        }} />
      </div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  unit,
  sub,
  accent = false,
  animated,
  animTarget,
  animSuffix,
  animDecimals,
}: {
  label: string;
  value?: string;
  unit?: string;
  sub: string;
  accent?: boolean;
  animated?: boolean;
  animTarget?: number;
  animSuffix?: string;
  animDecimals?: number;
}) {
  return (
    <div style={{
      background: "var(--surface-1)",
      border: `1px solid ${accent ? "rgba(255,255,255,0.12)" : "var(--border)"}`,
      borderRadius: 8,
      padding: "22px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      flex: 1,
      minWidth: 140,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--fg-faint)",
      }}>
        {label}
      </span>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: 36,
        fontWeight: 600,
        letterSpacing: "-0.04em",
        color: "var(--fg)",
        lineHeight: 1,
      }}>
        {animated && animTarget !== undefined ? (
          <Counter target={animTarget} suffix={animSuffix ?? ""} decimals={animDecimals} duration={1200} />
        ) : (
          <>{value}<span style={{ fontSize: 18, fontWeight: 400, color: "var(--fg-muted)", marginLeft: 3 }}>{unit}</span></>
        )}
      </div>
      <span style={{
        fontFamily: "var(--font-sans)", fontSize: 12,
        color: "var(--fg-muted)", lineHeight: 1.5,
      }}>
        {sub}
      </span>
    </div>
  );
}

/* ── Bar chart comparing memory usage ──────────────────────────────────────── */
function MemBar({ label, pct, value, highlight }: { label: string; pct: number; value: string; highlight?: boolean }) {
  const [filled, setFilled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTimeout(() => setFilled(true), 100); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: highlight ? "var(--fg)" : "var(--fg-faint)",
        width: 88, flexShrink: 0, letterSpacing: "0.03em",
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: 5, background: "var(--surface-3)", borderRadius: 100,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: filled ? `${pct}%` : "0%",
          background: highlight ? "var(--fg)" : "var(--surface-4)",
          borderRadius: 100,
          transition: "width 0.8s cubic-bezier(0.25, 1, 0.5, 1)",
        }} />
      </div>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        color: highlight ? "var(--fg-muted)" : "var(--fg-faint)",
        width: 52, textAlign: "right", flexShrink: 0,
      }}>
        {value}
      </span>
    </div>
  );
}

/* ── Big timer with rAF scramble ──────────────────────────────────────────── */
function BigTimer({ triggered }: { triggered: boolean }) {
  const [display, setDisplay] = useState(999);

  useEffect(() => {
    if (!triggered) return;
    const total = 900;
    const start = performance.now();
    const raf = (now: number) => {
      const p = Math.min((now - start) / total, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const val = Math.round(999 - ease * (999 - 11));
      setDisplay(val);
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [triggered]);

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: "clamp(120px, 18vw, 220px)",
        fontWeight: 600,
        letterSpacing: "-0.06em",
        lineHeight: 1,
        color: "var(--fg)",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.04em",
      }}>
        <span style={{
          textShadow: triggered ? "0 0 80px rgba(237,237,237,0.08)" : "none",
          transition: "text-shadow 1s ease",
        }}>
          {display}
        </span>
        <span style={{
          fontSize: "clamp(28px, 4vw, 52px)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--fg-muted)",
          marginTop: "0.18em",
        }}>
          ms
        </span>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--fg-faint)",
        marginTop: 8,
      }}>
        Go → C++ transpile · 400 line project
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function Performance() {
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="performance" style={{ background: "var(--surface)", overflow: "hidden" }}>

      {/* ── Hero metric: the giant number ─────────────────────────── */}
      <div
        ref={ref}
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          padding: "80px 0 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          opacity: 0.4,
          maskImage: "radial-gradient(ellipse 80% 100% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 100% at 50% 50%, black 30%, transparent 100%)",
        }} />

        <div className="container" style={{ position: "relative" }}>
          <div className="t-label" style={{ marginBottom: 40 }}>Performance</div>

          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
            flexWrap: "wrap",
          }}>
            <BigTimer triggered={triggered} />

            <div style={{ maxWidth: 320, paddingBottom: "0.6em" }}>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 16,
                color: "var(--fg-muted)", lineHeight: 1.7,
                marginBottom: 24,
              }}>
                Transpilation is never your bottleneck.
                By the time your editor blinks, tsuki is already done.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { value: "~20 MB", label: "disk footprint" },
                  { value: "<12 MB", label: "peak RAM"       },
                  { value: "~1 s",   label: "full compile"   },
                  { value: "0",      label: "daemons"        },
                ].map(c => (
                  <div key={c.label} style={{
                    padding: "8px 14px",
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    display: "flex", flexDirection: "column", gap: 3,
                  }}>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600,
                      letterSpacing: "-0.03em", color: "var(--fg)", lineHeight: 1,
                    }}>{c.value}</span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.07em",
                      textTransform: "uppercase", color: "var(--fg-faint)",
                    }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <div style={{ padding: "48px 0 0" }}>
        <div className="container">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <StatCard
              label="Transpile time"
              animated
              animTarget={11}
              animSuffix="ms"
              animDecimals={0}
              sub="Go → C++ for a 400-line project"
              accent
            />
            <StatCard label="Compile time"  value="~1"  unit="s"  sub="avr-gcc full build, Arduino Uno" />
            <StatCard label="Disk footprint" value="~20" unit="MB" sub="Entire tsuki installation on disk" />
            <StatCard label="RAM at build"   value="<12" unit="MB" sub="Peak process memory during transpile" />
          </div>
        </div>
      </div>

      {/* ── Bottom row: terminal + memory comparison ───────────────── */}
      <div style={{ padding: "12px 0 100px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}>

            <Terminal />

            <div style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "var(--fg-faint)", marginBottom: 20,
                display: "block",
              }}>
                RAM during build — comparison
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                <MemBar label="tsuki"        pct={8}   value="<12 MB" highlight />
                <MemBar label="PlatformIO"   pct={38}  value="~180 MB" />
                <MemBar label="Arduino IDE"  pct={55}  value="~260 MB" />
                <MemBar label="VS Code ext." pct={100} value="~470 MB" />
              </div>

              <div style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {[
                  { icon: "↓", label: "No background daemon — tsuki exits when done" },
                  { icon: "↓", label: "Zero telemetry, zero network calls at build time" },
                  { icon: "↓", label: "Single static binary, no runtime dependencies" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11,
                      color: "var(--ok)", flexShrink: 0, marginTop: 1,
                    }}>
                      {item.icon}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: 12,
                      color: "var(--fg-muted)", lineHeight: 1.5,
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}