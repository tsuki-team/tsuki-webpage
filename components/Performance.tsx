"use client";
import { useState, useEffect, useRef } from "react";

const RACERS = [
  { label: "tsuki",       ms: 11,   pct: 0.26,  highlight: true  },
  { label: "tinygo",      ms: 340,  pct: 8.1,   highlight: false },
  { label: "PlatformIO",  ms: 1800, pct: 42.8,  highlight: false },
  { label: "Arduino IDE", ms: 4200, pct: 100,   highlight: false },
];

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ── Race bars — CSS transitions only, no rAF ──────────────────────────── */
function RaceSection() {
  const { ref, inView } = useInView(0.2);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--fg-faint)", marginBottom: 8, display: "block",
      }}>
        Transpile time — comparative
      </span>

      {RACERS.map((r, i) => {
        const displayMs = r.ms >= 1000 ? `${(r.ms / 1000).toFixed(1)}s` : `${r.ms}ms`;
        // Delay each bar slightly for stagger
        const delay = inView ? `${i * 0.12}s` : "0s";
        return (
          <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.03em",
              color: r.highlight ? "var(--fg)" : "var(--fg-faint)",
              fontWeight: r.highlight ? 500 : 400,
              width: 90, flexShrink: 0,
            }}>
              {r.label}
            </span>

            <div style={{
              flex: 1, height: 5,
              background: "var(--surface-3)", borderRadius: 100,
              overflow: "hidden",
              // contain prevents the bar from affecting surrounding layout
              contain: "layout style",
            }}>
              <div style={{
                height: "100%",
                borderRadius: 100,
                background: r.highlight
                  ? "var(--fg)"
                  : "var(--surface-4)",
                width: inView ? `${r.pct}%` : "0%",
                transition: inView
                  ? `width ${0.3 + (r.pct / 100) * 1.8}s cubic-bezier(0.25,1,0.5,1) ${delay}`
                  : "none",
                // tsuki bar gets a faint right-edge glow
                boxShadow: r.highlight ? "2px 0 8px rgba(237,237,237,0.3)" : "none",
              }} />
            </div>

            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10,
              color: r.highlight ? "var(--fg-muted)" : "var(--fg-faint)",
              width: 44, textAlign: "right", flexShrink: 0,
              opacity: inView ? 1 : 0,
              transition: `opacity 0.3s ${delay}`,
            }}>
              {displayMs}
            </span>
          </div>
        );
      })}

      {/* Axis */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        paddingLeft: 104, marginTop: -4,
      }}>
        {["0", "1s", "2s", "3s", "4.2s"].map(t => (
          <span key={t} style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: "var(--fg-faint)", letterSpacing: "0.05em",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Big "11ms" — CSS animation only, zero JS after mount ──────────────── */
function HeroMetric() {
  const { ref, inView } = useInView(0.2);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* The number — CSS opacity/transform animation, no rAF */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: "0.06em",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(100px, 16vw, 200px)",
          fontWeight: 600,
          letterSpacing: "-0.06em",
          lineHeight: 1,
          color: "var(--fg)",
        }}>
          11
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(24px, 3.5vw, 48px)",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          color: "var(--fg-muted)",
          marginTop: "0.2em",
        }}>
          ms
        </span>
      </div>

      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        letterSpacing: "0.08em", textTransform: "uppercase",
        color: "var(--fg-faint)", marginTop: 12,
        opacity: inView ? 1 : 0,
        transition: "opacity 0.5s 0.2s ease",
      }}>
        Go → C++ transpile · 400-line project
      </div>

      {/* Thin ruled line — decorative anchor for the number */}
      <div style={{
        position: "absolute",
        bottom: -20, left: 0,
        height: 1,
        background: "linear-gradient(to right, var(--border), transparent)",
        width: inView ? "100%" : "0%",
        transition: "width 0.7s 0.1s ease",
      }} />
    </div>
  );
}

/* ── Resource chips ─────────────────────────────────────────────────────── */
function Chips() {
  const chips = [
    { value: "~20 MB", label: "disk footprint" },
    { value: "<12 MB", label: "peak RAM"       },
    { value: "~1 s",   label: "full compile"   },
    { value: "0",      label: "daemons"        },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 32 }}>
      {chips.map(c => (
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
  );
}

/* ── Qualitative list ───────────────────────────────────────────────────── */
const POINTS = [
  { n: "01", title: "Single static binary",    body: "No runtime, no interpreter, no package manager bootstrapping. One file, fully self-contained." },
  { n: "02", title: "No background processes", body: "tsuki exits when it finishes. It never lingers in memory between builds." },
  { n: "03", title: "Cold-start is full-speed", body: "No JVM spin-up, no daemon to wait for. First build = every build." },
  { n: "04", title: "Zero network at build time", body: "Packages are cached locally. tsuki never phones home during compilation." },
];

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function Performance() {
  return (
    <section id="performance" style={{ background: "var(--surface)" }}>

      {/* ── Top: giant number ──────────────────────────────────────── */}
      <div style={{
        borderBottom: "1px solid var(--border-subtle)",
        padding: "80px 0 72px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* CSS-only grid backdrop — zero JS */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: [
            "linear-gradient(var(--border-subtle) 1px, transparent 1px)",
            "linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          ].join(","),
          backgroundSize: "64px 64px",
          opacity: 0.5,
          WebkitMaskImage: "radial-gradient(ellipse 70% 100% at 50% 50%, black 20%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 70% 100% at 50% 50%, black 20%, transparent 100%)",
        }} />

        <div className="container" style={{ position: "relative" }}>
          <div className="t-label" style={{ marginBottom: 48 }}>Performance</div>

          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 48, flexWrap: "wrap",
          }}>
            <HeroMetric />
            <div style={{ maxWidth: 340, paddingBottom: "0.4em" }}>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 16,
                color: "var(--fg-muted)", lineHeight: 1.7, marginBottom: 0,
              }}>
                Transpilation is never your bottleneck.
                By the time your editor blinks, tsuki is already done.
              </p>
              <Chips />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: race + qualitative ─────────────────────────────── */}
      <div style={{ padding: "64px 0 100px" }}>
        <div className="container">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 72, alignItems: "start",
          }}>
            <RaceSection />

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {POINTS.map(item => (
                <div key={item.n} style={{
                  display: "grid", gridTemplateColumns: "28px 1fr",
                  gap: "0 16px", padding: "18px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--fg-faint)", paddingTop: 2,
                  }}>{item.n}</span>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500,
                      color: "var(--fg)", letterSpacing: "-0.01em", marginBottom: 5,
                    }}>{item.title}</div>
                    <div style={{
                      fontFamily: "var(--font-sans)", fontSize: 13,
                      color: "var(--fg-muted)", lineHeight: 1.6,
                    }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}