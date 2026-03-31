"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PkgMarkdown from "@/components/PkgMarkdown";
import type { PkgWithChannel } from "@/lib/pkg-fetcher";
import type { Channel } from "@/lib/pkg-config";

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconPackage({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z" /><path d="M8 2v14M2 5l6 3 6-3" />
    </svg>
  );
}
function IconCopy({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="8" height="8" rx="1.5" /><path d="M11 5V4a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1h1" />
    </svg>
  );
}
function IconCheck({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l4 4 6-6" />
    </svg>
  );
}
function IconGitBranch({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="5" cy="4" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="4" r="1.5" />
      <path d="M5 5.5v5M5 5.5C5 8 11 8 11 5.5" />
    </svg>
  );
}
function IconTag({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2h5l7 7-5 5-7-7V2z" /><circle cx="5.5" cy="5.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── Channel badge ─────────────────────────────────────────────────────────────

function ChannelBadge({ ch }: { ch: Channel }) {
  const stable = ch === "stable";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 7px", borderRadius: 20,
      fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase",
      background: stable ? "rgba(34,197,94,0.08)" : "rgba(245,158,11,0.08)",
      color: stable ? "var(--ok)" : "var(--warn)",
      border: `1px solid ${stable ? "rgba(34,197,94,0.18)" : "rgba(245,158,11,0.18)"}`,
    }}>{ch}</span>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); });
  };
  return (
    <button onClick={copy} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 5,
      fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--surface-3)",
      border: "1px solid var(--border)", color: copied ? "var(--ok)" : "var(--fg-faint)",
      cursor: "pointer", transition: "color 0.15s",
    }}>
      {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ── Version item ──────────────────────────────────────────────────────────────

function VersionItem({ version, channel, active, onClick }: { version: string; channel: Channel; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", padding: "7px 10px", borderRadius: 6,
      background: active ? "var(--surface-3)" : "transparent",
      border: active ? "1px solid var(--border)" : "1px solid transparent",
      cursor: "pointer", transition: "all 0.12s", textAlign: "left",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ color: "var(--fg-faint)" }}><IconTag size={11} /></span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: active ? "var(--fg)" : "var(--fg-muted)", fontWeight: active ? 500 : 400 }}>
          v{version}
        </span>
      </div>
      <ChannelBadge ch={channel} />
    </button>
  );
}

// ── Install box ───────────────────────────────────────────────────────────────

function InstallBox({ pkgName, version, channel }: { pkgName: string; version: string; channel: Channel }) {
  const cmd = channel === "stable"
    ? `tsuki pkg install ${pkgName}@${version}`
    : `tsuki pkg install ${pkgName}@${version} --channel testing`;
  return (
    <div style={{
      background: "var(--surface-2)", border: "1px solid var(--border)",
      borderRadius: 7, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8,
    }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-faint)" }}>
        Install
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {cmd}
        </code>
        <CopyBtn text={cmd} />
      </div>
    </div>
  );
}

// ── Sidebar primitives ────────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-faint)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>{value}</span>
    </div>
  );
}
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
      color: "var(--fg-faint)", padding: "12px 0 6px", borderBottom: "1px solid var(--border-subtle)", marginBottom: 6,
    }}>{title}</div>
  );
}

// ── README channel picker (shown when pkg is in both channels) ────────────────

function ReadmeChannelPicker({ channels, active, onChange }: { channels: Channel[]; active: Channel; onChange: (ch: Channel) => void }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      background: "var(--surface-3)", border: "1px solid var(--border)",
      borderRadius: 6, padding: 2, gap: 2,
    }}>
      {channels.map(ch => {
        const on     = ch === active;
        const stable = ch === "stable";
        return (
          <button
            key={ch}
            onClick={() => onChange(ch)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 11px", borderRadius: 4, border: "none",
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.13s",
              background: on ? "var(--surface-1)" : "transparent",
              color: on ? (stable ? "var(--ok)" : "var(--warn)") : "var(--fg-faint)",
              boxShadow: on ? "0 1px 4px rgba(0,0,0,0.35)" : "none",
            }}
          >
            <span style={{
              width: 5, height: 5, borderRadius: "50%",
              background: stable ? "var(--ok)" : "var(--warn)",
              opacity: on ? 1 : 0.3, flexShrink: 0,
              transition: "opacity 0.13s",
            }} />
            {ch}
          </button>
        );
      })}
    </div>
  );
}

// ── README section — handles dual-channel display ─────────────────────────────

function ReadmeSection({ pkgName, channels }: { pkgName: string; channels: Channel[] }) {
  const defaultCh = channels.includes("stable") ? "stable" : "testing";
  const [ch, setCh]           = useState<Channel>(defaultCh);
  const [readme, setReadme]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // cache: avoid re-fetching when toggling
  const cacheRef = useState<Partial<Record<Channel, string | null>>>(() => ({}))[0];

  useEffect(() => {
    if (cacheRef[ch] !== undefined) {
      setReadme(cacheRef[ch] ?? null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/pkg/${pkgName}?channel=${ch}&version=latest`)
      .then(r => r.json())
      .then((d: { readme: string | null }) => {
        cacheRef[ch] = d.readme;
        setReadme(d.readme);
        setLoading(false);
      })
      .catch(() => { cacheRef[ch] = null; setLoading(false); });
  }, [pkgName, ch, cacheRef]);

  const dualChannel = channels.length >= 2;

  return (
    <div>
      {/* ── Dual-channel header ── */}
      {dualChannel && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, flexWrap: "wrap", gap: 10,
        }}>
          <ReadmeChannelPicker channels={channels} active={ch} onChange={setCh} />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--fg-faint)",
            letterSpacing: "0.04em",
          }}>
            READMEs may differ between channels
          </span>
        </div>
      )}

      {/* ── Divider ── */}
      {dualChannel && <div style={{ height: 1, background: "var(--border-subtle)", marginBottom: 20 }} />}

      {/* ── Content ── */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[80, 60, 40, 70, 50].map((w, i) => (
            <div key={i} style={{
              height: 14, width: `${w}%`, background: "var(--surface-2)", borderRadius: 4,
              animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      ) : readme ? (
        <div key={ch} style={{ animation: "fadeIn 150ms ease forwards" }}>
          {/* Per-channel watermark pill */}
          {dualChannel && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 16,
              padding: "3px 10px", borderRadius: 4,
              background: ch === "stable" ? "rgba(34,197,94,0.06)" : "rgba(245,158,11,0.06)",
              border: `1px solid ${ch === "stable" ? "rgba(34,197,94,0.14)" : "rgba(245,158,11,0.14)"}`,
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: "50%",
                background: ch === "stable" ? "var(--ok)" : "var(--warn)",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase",
                color: ch === "stable" ? "var(--ok)" : "var(--warn)",
              }}>
                {ch === "stable" ? "stable · main branch" : "testing · dev branch"}
              </span>
            </div>
          )}
          <PkgMarkdown src={readme} />
        </div>
      ) : (
        <div style={{ padding: "32px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-faint)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            No README available for {ch}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function PkgDetailPage() {
  const params   = useParams();
  const name     = params?.name as string;

  const [pkg,      setPkg]      = useState<PkgWithChannel | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [selVer,   setSelVer]   = useState<string>("");
  const [selCh,    setSelCh]    = useState<Channel>("stable");
  const [readTab,  setReadTab]  = useState<"readme" | "api">("readme");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!name) return;
    fetch("/api/pkg/list")
      .then(r => r.json())
      .then((data: PkgWithChannel[]) => {
        const found = data.find(p => p.name === name);
        if (!found) { setNotFound(true); setLoading(false); return; }
        setPkg(found);
        const ch = found.channels.includes("stable") ? "stable" : "testing";
        setSelCh(ch);
        setSelVer(found.latest);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [name]);

  const versionList: { version: string; channel: Channel }[] = pkg
    ? Object.keys(pkg.versions)
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
        .map(v => ({ version: v, channel: pkg.channels.includes("stable") ? "stable" : "testing" }))
    : [];

  if (notFound) {
    return (
      <>
        <Nav activePath="/pkg" />
        <main style={{ paddingTop: 52, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Package not found</p>
            <a href="/pkg" style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", textDecoration: "underline", textUnderlineOffset: 2 }}>← Back to registry</a>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav activePath="/pkg" />
      <main style={{ paddingTop: 52, minHeight: "100vh", background: "var(--surface)" }}>

        {/* ── Header ── */}
        <div style={{ borderBottom: "1px solid var(--border)", padding: "36px 0 24px", background: "var(--surface-1)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <a href="/pkg" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-faint)", textDecoration: "none", letterSpacing: "0.06em", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--fg-muted)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--fg-faint)")}
              >packages</a>
              <span style={{ color: "var(--fg-faint)", fontFamily: "var(--font-mono)", fontSize: 10 }}>/</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>{name}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--fg-faint)" }}><IconPackage size={18} /></span>
                <h1 style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--fg)", margin: 0 }}>
                  {pkg?.name ?? name}
                </h1>
              </div>
              {pkg && pkg.channels.map(ch => <ChannelBadge key={ch} ch={ch} />)}
              {selVer && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px" }}>
                  v{selVer}
                </span>
              )}
            </div>

            {pkg && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--fg-muted)", lineHeight: 1.6, margin: "10px 0 0", maxWidth: 600 }}>
                {pkg.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "28px 28px 80px",
          display: "grid", gridTemplateColumns: "240px 1fr", gap: 28, alignItems: "start",
        }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "sticky", top: 72 }}>
            {pkg && selVer && <InstallBox pkgName={pkg.name} version={selVer} channel={selCh} />}

            <div style={{ marginTop: 8 }}>
              <SectionHeader title="Versions" />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {loading
                  ? [1, 2].map(i => <div key={i} style={{ height: 32, background: "var(--surface-2)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />)
                  : versionList.map(({ version, channel }) => (
                    <VersionItem
                      key={`${channel}-${version}`}
                      version={version} channel={channel}
                      active={selVer === version && selCh === channel}
                      onClick={() => { setSelVer(version); setSelCh(channel); }}
                    />
                  ))
                }
              </div>
            </div>

            {pkg && (
              <div style={{ marginTop: 8 }}>
                <SectionHeader title="Info" />
                <MetaRow label="Author"   value={pkg.author} />
                <MetaRow label="Latest"   value={`v${pkg.latest}`} />
                <MetaRow label="Type"     value={pkg.type} />
                <MetaRow label="Channels" value={pkg.channels.join(" · ")} />
              </div>
            )}

            <div style={{ marginTop: 8, padding: "8px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--fg-faint)" }}><IconGitBranch size={11} /></span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-faint)", letterSpacing: "0.04em" }}>
                {selCh === "stable" ? "main" : "dev"} branch
              </span>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", gap: 2, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 2 }}>
              {(["readme", "api"] as const).map(t => (
                <button key={t} onClick={() => setReadTab(t)} style={{
                  padding: "6px 12px", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.04em",
                  color: readTab === t ? "var(--fg)" : "var(--fg-faint)",
                  background: "transparent", border: "none",
                  borderBottom: readTab === t ? "1px solid var(--fg)" : "1px solid transparent",
                  cursor: "pointer", transition: "color 0.15s", marginBottom: -1,
                }}>
                  {t === "readme" ? "README" : "API Reference"}
                </button>
              ))}
            </div>

            {readTab === "readme"
              ? (pkg
                  ? <ReadmeSection pkgName={pkg.name} channels={pkg.channels} />
                  : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[80,60,40,70,50].map((w,i)=><div key={i} style={{ height:14, width:`${w}%`, background:"var(--surface-2)", borderRadius:4, animation:"pulse 1.5s ease-in-out infinite" }} />)}</div>
                )
              : <ApiReference pkgName={name} channel={selCh} version={selVer} />
            }
          </div>
        </div>
      </main>
      <Footer />
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </>
  );
}

// ── API Reference ─────────────────────────────────────────────────────────────

function ApiReference({ pkgName, channel, version }: { pkgName: string; channel: Channel; version: string }) {
  const [toml, setToml]       = useState<import("@/lib/pkg-fetcher").ParsedToml | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!version) return;
    setLoading(true);
    fetch(`/api/pkg/${pkgName}?channel=${channel}&version=${version}`)
      .then(r => r.json())
      .then((d: { toml: import("@/lib/pkg-fetcher").ParsedToml | null }) => { setToml(d.toml); setLoading(false); })
      .catch(() => setLoading(false));
  }, [pkgName, channel, version]);

  if (loading) return <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{[60,80,50].map((w,i)=><div key={i} style={{ height:13, width:`${w}%`, background:"var(--surface-2)", borderRadius:3, animation:"pulse 1.5s ease-in-out infinite" }} />)}</div>;
  if (!toml)   return <p style={{ fontFamily:"var(--font-mono)", fontSize:10.5, color:"var(--fg-faint)", textTransform:"uppercase", letterSpacing:"0.06em" }}>API data unavailable</p>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      {(toml.cpp_header || toml.arduino_lib) && (
        <div style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:6, padding:"12px 14px", display:"flex", flexDirection:"column", gap:6 }}>
          {toml.cpp_header  && <MRI label="C++ Header"  value={toml.cpp_header} />}
          {toml.arduino_lib && <MRI label="Arduino Lib" value={toml.arduino_lib} />}
          {toml.cpp_class   && <MRI label="C++ Class"   value={toml.cpp_class} />}
          {toml.aliases     && <MRI label="Aliases"     value={toml.aliases.join(", ")} />}
        </div>
      )}
      {toml.functions.length > 0 && (
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--fg-faint)", marginBottom:10 }}>Functions ({toml.functions.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>{toml.functions.map((fn,i)=><FnRow key={i} fn={fn}/>)}</div>
        </div>
      )}
      {toml.constants.length > 0 && (
        <div>
          <div style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--fg-faint)", marginBottom:10 }}>Constants ({toml.constants.length})</div>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>{toml.constants.map((c,i)=><FnRow key={i} fn={c}/>)}</div>
        </div>
      )}
    </div>
  );
}

function MRI({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <span style={{ fontFamily:"var(--font-mono)", fontSize:9.5, color:"var(--fg-faint)", letterSpacing:"0.06em", textTransform:"uppercase", flexShrink:0, minWidth:80 }}>{label}</span>
      <span style={{ fontFamily:"var(--font-mono)", fontSize:11.5, color:"var(--fg-muted)" }}>{value}</span>
    </div>
  );
}

function FnRow({ fn }: { fn: { go?: string; python?: string; cpp?: string } }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.5fr", background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:5, overflow:"hidden" }}>
      {[{lang:"go",val:fn.go,color:"#6ba4e0"},{lang:"python",val:fn.python,color:"#3572a5"},{lang:"cpp",val:fn.cpp,color:"#e07898"}].map(({lang,val,color})=>(
        <div key={lang} style={{ padding:"6px 10px", borderRight:"1px solid var(--border-subtle)", display:"flex", flexDirection:"column", gap:2 }}>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:8.5, letterSpacing:"0.06em", textTransform:"uppercase", color }}>{lang}</span>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:val?"var(--fg-muted)":"var(--fg-faint)", fontStyle:val?"normal":"italic" }}>{val??"—"}</span>
        </div>
      ))}
    </div>
  );
}