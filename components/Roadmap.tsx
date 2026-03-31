"use client";
import { useState, useEffect } from "react";

const STAGES = [
  {
    version: "1.0",
    title: "Initial Release",
    date: "Launch day",
    status: "upcoming" as const,
    summary: "The first public release of tsuki.",
    details: {
      description: "v1.0 marks the first stable, public release of tsuki. Everything needed to write, transpile, compile and flash Arduino firmware from a language other than C++ — shipped as a single binary.",
      sections: [
        {
          heading: "Transpiler",
          items: [
            "Go → C++ transpiler core, handling structs, interfaces, goroutine-free concurrency patterns",
            "Type inference and automatic mapping to Arduino-compatible C++ types",
            "Import resolution with local and registry packages",
            "Source maps for readable compiler errors pointing back to your original code",
          ],
        },
        {
          heading: "Toolchain",
          items: [
            "tsuki build — transpile + compile in a single command",
            "tsuki upload — auto-detect connected board and flash via avrdude or esptool",
            "tsuki init — scaffold a new project with tsuki_package.json and src/main.go",
            "tsuki pkg install / remove — Ed25519-verified package registry",
          ],
        },
        {
          heading: "Board support",
          items: [
            "Arduino Uno, Nano, Mega, Leonardo, Micro",
            "ESP32 and ESP8266 families",
            "STM32 (Blue Pill, Black Pill)",
            "Raspberry Pi Pico (RP2040)",
          ],
        },
        {
          heading: "Distribution",
          items: [
            "Single static binary — no runtime, no dependencies",
            "One-command installer for macOS, Linux and Windows",
            "~20 MB on disk, <12 MB peak RAM during build",
          ],
        },
      ],
    },
  },
  {
    version: "1.1",
    title: "Stability & Performance",
    date: "After launch",
    status: "planned" as const,
    summary: "Bug fixes and significant performance improvements driven by community feedback.",
    details: {
      description: "v1.1 focuses entirely on stability and speed. No new features — just a faster, more reliable toolchain based on real-world usage patterns from the 1.0 launch.",
      sections: [
        {
          heading: "Bug fixes",
          items: [
            "Transpiler edge-cases reported by the community after 1.0 launch",
            "Correct handling of recursive type definitions and self-referential structs",
            "Fix occasional incorrect line number in source-mapped error messages",
            "Resolve package lock conflicts when multiple packages share a dependency",
          ],
        },
        {
          heading: "Performance",
          items: [
            "Incremental builds — only re-transpile files that changed since the last build",
            "Parallel transpilation for multi-file projects, scaling with available CPU cores",
            "Reduced peak RAM usage during large project compilation (~30% improvement)",
            "Faster cold-start on Windows via reduced PE loader overhead",
          ],
        },
        {
          heading: "Developer experience",
          items: [
            "Improved error messages with suggested fixes for common transpiler mistakes",
            "tsuki check command — type-check without building",
            "Extended board compatibility list based on community-submitted hardware configs",
          ],
        },
      ],
    },
  },
];

type Stage = typeof STAGES[number];

const STATUS = {
  upcoming: { color: "#f59e0b", label: "Upcoming" },
  planned:  { color: "var(--fg-faint)", label: "Planned" },
};

/* ── Modal ─────────────────────────────────────────────────────────────────── */
function Modal({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const st = STATUS[stage.status];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 220);
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.22s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          width: "100%",
          maxWidth: 620,
          maxHeight: "80vh",
          overflowY: "auto",
          transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
          transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "28px 32px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          position: "sticky", top: 0,
          background: "var(--surface-1)",
          zIndex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                  letterSpacing: "0.04em", color: "var(--fg)",
                  background: "var(--surface-3)", border: "1px solid var(--border)",
                  borderRadius: 4, padding: "3px 9px",
                }}>
                  v{stage.version}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9.5,
                  letterSpacing: "0.07em", textTransform: "uppercase",
                  color: st.color,
                  background: `color-mix(in srgb, ${st.color} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${st.color} 25%, transparent)`,
                  borderRadius: 4, padding: "3px 8px",
                }}>
                  {st.label}
                </span>
              </div>
              <h2 style={{
                fontFamily: "var(--font-sans)", fontSize: 20, fontWeight: 600,
                letterSpacing: "-0.03em", color: "var(--fg)", margin: 0,
              }}>
                {stage.title}
              </h2>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: 13,
                color: "var(--fg-muted)", margin: "8px 0 0", lineHeight: 1.6,
              }}>
                {stage.details.description}
              </p>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: "var(--surface-3)", border: "1px solid var(--border)",
                borderRadius: 5, cursor: "pointer", color: "var(--fg-faint)",
                padding: "5px 8px", lineHeight: 1, fontSize: 13, flexShrink: 0,
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--fg)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface-4)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = "var(--fg-faint)";
                (e.currentTarget as HTMLElement).style.background = "var(--surface-3)";
              }}
            >✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: 28 }}>
          {stage.details.sections.map(section => (
            <div key={section.heading}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 9.5,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "var(--fg-faint)", marginBottom: 14,
              }}>
                {section.heading}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      color: st.color, flexShrink: 0, marginTop: "0.22em",
                      opacity: stage.status === "planned" ? 0.6 : 1,
                    }}>
                      {stage.status === "upcoming" ? "◆" : "◇"}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: 13,
                      color: "var(--fg-muted)", lineHeight: 1.6,
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────────────────── */
export default function Roadmap() {
  const [selected, setSelected] = useState<Stage | null>(null);

  return (
    <section id="roadmap" style={{ padding: "100px 0", background: "var(--surface)" }}>
      <div className="container">

        {/* Header */}
        <div style={{ marginBottom: 80 }}>
          <div className="t-label" style={{ marginBottom: 16 }}>Roadmap</div>
          <div style={{
            display: "flex", alignItems: "flex-end",
            justifyContent: "space-between", flexWrap: "wrap", gap: 24,
          }}>
            <h2 className="t-h2" style={{ maxWidth: 400 }}>What&apos;s coming</h2>
            <p className="t-body" style={{ maxWidth: 360 }}>
              tsuki ships in focused stages. Click any milestone to see what&apos;s inside.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>

          {/* Horizontal line */}
          <div style={{
            position: "absolute",
            top: 14,
            left: 0, right: 0,
            height: 1,
            background: `linear-gradient(to right, transparent, var(--border) 8%, var(--border) 92%, transparent)`,
          }} />

          {/* Stages row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`,
            gap: 24,
            position: "relative",
          }}>
            {STAGES.map((stage) => {
              const st = STATUS[stage.status];
              return (
                <button
                  key={stage.version}
                  onClick={() => setSelected(stage)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    textAlign: "left", padding: 0,
                    display: "flex", flexDirection: "column", alignItems: "flex-start",
                  }}
                >
                  {/* Dot on the line */}
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: st.color,
                    boxShadow: stage.status === "upcoming" ? `0 0 10px ${st.color}` : "none",
                    marginBottom: 24,
                    border: `2px solid var(--surface)`,
                    outline: `1px solid ${st.color}`,
                    transition: "transform 0.15s, box-shadow 0.15s",
                    flexShrink: 0,
                  }} />

                  {/* Card */}
                  <div
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "20px 22px",
                      width: "100%",
                      transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "rgba(255,255,255,0.15)";
                      el.style.background = "var(--surface-2)";
                      el.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border)";
                      el.style.background = "var(--surface-1)";
                      el.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600,
                        letterSpacing: "0.04em", color: "var(--fg)",
                        background: "var(--surface-3)", border: "1px solid var(--border)",
                        borderRadius: 4, padding: "2px 8px",
                      }}>
                        v{stage.version}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 9,
                        letterSpacing: "0.07em", textTransform: "uppercase",
                        color: st.color, opacity: 0.8,
                      }}>
                        {stage.date}
                      </span>
                    </div>

                    <div style={{
                      fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
                      letterSpacing: "-0.02em", color: "var(--fg)", marginBottom: 8,
                    }}>
                      {stage.title}
                    </div>

                    <div style={{
                      fontFamily: "var(--font-sans)", fontSize: 12,
                      color: "var(--fg-muted)", lineHeight: 1.55, marginBottom: 16,
                    }}>
                      {stage.summary}
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontFamily: "var(--font-mono)", fontSize: 10,
                      letterSpacing: "0.04em", color: "var(--fg-faint)",
                    }}>
                      See details
                      <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 8h10M9 4l4 4-4 4"/>
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {selected && <Modal stage={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}