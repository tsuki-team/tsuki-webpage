"use client";

import { useState, useEffect, useMemo } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { PkgWithChannel, PkgType } from "@/lib/pkg-fetcher";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconSearch({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function IconPackage({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" />
      <path d="M8 2v14M2 5l6 3 6-3" strokeDasharray="0" />
    </svg>
  );
}

function IconBoard({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <rect x="2" y="4" width="12" height="8" rx="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="11" cy="8" r="1" />
      <line x1="5" y1="4" x2="5" y2="2" />
      <line x1="8" y1="4" x2="8" y2="2" />
      <line x1="11" y1="4" x2="11" y2="2" />
    </svg>
  );
}

function IconChevron({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5l2 2 2-2" />
    </svg>
  );
}

// ── Channel badge ─────────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: "stable" | "testing" }) {
  const isStable = channel === "stable";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 7px",
      borderRadius: 20,
      fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
      textTransform: "uppercase",
      background: isStable ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
      color: isStable ? "var(--ok)" : "var(--warn)",
      border: `1px solid ${isStable ? "rgba(34,197,94,0.18)" : "rgba(245,158,11,0.18)"}`,
    }}>
      {isStable ? "stable" : "testing"}
    </span>
  );
}

// ── Package card ──────────────────────────────────────────────────────────────

function PkgCard({ pkg }: { pkg: PkgWithChannel }) {
  const [hovered, setHovered] = useState(false);
  const versionCount = Object.keys(pkg.versions).length;

  return (
    <a
      href={`/pkg/${pkg.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 12,
        padding: "16px 18px",
        background: "var(--surface-1)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.10)" : "var(--border)"}`,
        borderRadius: 8,
        textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--fg-faint)" }}>
            {pkg.type === "board" ? <IconBoard size={14} /> : <IconPackage size={14} />}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500,
            color: "var(--fg)", letterSpacing: "-0.01em",
          }}>
            {pkg.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          {pkg.channels.map(ch => <ChannelBadge key={ch} channel={ch} />)}
        </div>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: 12.5, lineHeight: 1.55,
        color: "var(--fg-muted)", margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {pkg.description}
      </p>

      {/* Bottom row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-faint)",
          letterSpacing: "0.04em",
        }}>
          {pkg.author}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-faint)",
          }}>
            {versionCount} version{versionCount !== 1 ? "s" : ""}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--fg-faint)", background: "var(--surface-3)",
            border: "1px solid var(--border)", borderRadius: 4,
            padding: "1px 6px",
          }}>
            v{pkg.latest}
          </span>
        </div>
      </div>

      {/* Hover arrow */}
      <span style={{
        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%) rotate(-90deg)",
        color: "var(--fg-faint)", opacity: hovered ? 1 : 0,
        transition: "opacity 0.15s",
      }}>
        <IconChevron />
      </span>
    </a>
  );
}

// ── Board placeholder card ────────────────────────────────────────────────────

function BoardComingSoon() {
  return (
    <div style={{
      gridColumn: "1 / -1",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 12, padding: "56px 24px",
      background: "var(--surface-1)",
      border: "1px dashed var(--border)",
      borderRadius: 8,
    }}>
      <span style={{ color: "var(--fg-faint)" }}><IconBoard size={22} /></span>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>
        Board packages — coming soon
      </p>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--fg-faint)", margin: 0, maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
        Support for board-specific packages (pinout definitions, HALs, BSPs) is planned for a future release.
      </p>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, padding: "56px 24px",
    }}>
      <span style={{ color: "var(--fg-faint)" }}><IconSearch size={20} /></span>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        No packages found
      </p>
      {query && (
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--fg-faint)", margin: 0 }}>
          No results for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}

// ── Tab ───────────────────────────────────────────────────────────────────────

function Tab({
  active, label, count, onClick,
}: {
  active: boolean; label: string; count?: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "6px 12px", borderRadius: 6,
        fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: active ? 500 : 400,
        color: active ? "var(--fg)" : "var(--fg-faint)",
        background: active ? "var(--surface-3)" : "transparent",
        border: active ? "1px solid var(--border)" : "1px solid transparent",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9.5,
          background: "var(--surface-4)", color: "var(--fg-faint)",
          padding: "1px 5px", borderRadius: 10, letterSpacing: "0.04em",
        }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PkgPage() {
  const [pkgs,    setPkgs]    = useState<PkgWithChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");
  const [tab,     setTab]     = useState<PkgType>("tsuki");

  useEffect(() => {
    fetch("/api/pkg/list")
      .then(r => r.json())
      .then((data: PkgWithChannel[]) => { setPkgs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const tsukiPkgs = useMemo(() => pkgs.filter(p => p.type !== "board"), [pkgs]);
  const boardPkgs = useMemo(() => pkgs.filter(p => p.type === "board"), [pkgs]);

  const visible = useMemo(() => {
    const base = tab === "tsuki" ? tsukiPkgs : boardPkgs;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q)
    );
  }, [tab, tsukiPkgs, boardPkgs, query]);

  return (
    <>
      <Nav activePath="/pkg" />
      <main style={{ paddingTop: 52, minHeight: "100vh", background: "var(--surface)" }}>

        {/* ── Header ── */}
        <div style={{
          borderBottom: "1px solid var(--border)",
          padding: "48px 0 32px",
          background: "var(--surface-1)",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--fg-faint)",
              }}>
                tsuki
              </span>
              <span style={{ color: "var(--border)", fontFamily: "var(--font-mono)", fontSize: 9.5 }}>/</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--fg-faint)",
              }}>
                packages
              </span>
            </div>
            <h1 style={{
              fontFamily: "var(--font-sans)", fontSize: "clamp(24px, 3.5vw, 36px)",
              fontWeight: 600, letterSpacing: "-0.03em", color: "var(--fg)",
              margin: "0 0 10px",
            }}>
              Package Registry
            </h1>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg-muted)",
              lineHeight: 1.6, margin: "0 0 28px", maxWidth: 540,
            }}>
              Official packages for the tsuki ecosystem. Browse sensor drivers, display libraries,
              motor controllers, and more — installable directly from the IDE.
            </p>

            {/* Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Tab
                active={tab === "tsuki"}
                label="tsuki packages"
                count={tsukiPkgs.length}
                onClick={() => setTab("tsuki")}
              />
              <Tab
                active={tab === "board"}
                label="Board packages"
                count={boardPkgs.length || undefined}
                onClick={() => setTab("board")}
              />
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 28px 80px" }}>

          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: 7, padding: "8px 12px",
            marginBottom: 24,
            transition: "border-color 0.15s",
          }}>
            <span style={{ color: "var(--fg-faint)", flexShrink: 0 }}><IconSearch size={13} /></span>
            <input
              type="text"
              placeholder={tab === "tsuki" ? "Search packages…" : "Search board packages…"}
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg)",
                caretColor: "var(--fg)",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "var(--fg-faint)", padding: 0, lineHeight: 1,
                  fontFamily: "var(--font-mono)", fontSize: 10,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Stats row */}
          {!loading && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10.5,
                color: "var(--fg-faint)", letterSpacing: "0.04em",
              }}>
                {visible.length} package{visible.length !== 1 ? "s" : ""}
                {query ? ` matching "${query}"` : ""}
              </span>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 12,
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  height: 120, background: "var(--surface-1)",
                  border: "1px solid var(--border)", borderRadius: 8,
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              ))}
            </div>
          ) : tab === "board" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 12,
            }}>
              <BoardComingSoon />
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 12,
            }}>
              {visible.length === 0 ? (
                <EmptyState query={query} />
              ) : (
                visible.map(pkg => <PkgCard key={pkg.name} pkg={pkg} />)
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 0.8; }
        }
        input::placeholder { color: var(--fg-faint); }
      `}</style>
    </>
  );
}