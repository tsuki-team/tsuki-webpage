"use client";

import { useState, useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

// ── Data ───────────────────────────────────────────────────────────────────────
// • username   → GitHub username (avatar automático)
// • bio        → descripción corta opcional
// • socials    → array de URLs; el logo se detecta automáticamente por dominio
// • linesOfCode → fallback manual; se sobreescribe con la API /api/github-lines

interface Maintainer {
  username: string;
  displayName: string;
  role: string;
  bio?: string;
  linesOfCode: number;
  socials: string[];
}

// github opcional → avatar + enlace automático
interface EarlySupporter {
  name: string;
  github?: string;
}

const MAINTAINERS: Maintainer[] = [
  {
    username: "s7lver2",
    displayName: "s7lver",
    role: "Lead Developer",
    bio: "Developer with hopes and monster",
    linesOfCode: 1,
    socials: [
      "https://github.com/s7lver2",
      "https://x.com/not_s7lver",
    ],
  },
  {
    username: "aguitauwu",
    displayName: "Awa",
    role: "AI specialized person",
    bio: "Ola mi ser agua, yo hacer IA, IA no hacer a mi ",
    linesOfCode: 0,
    socials: [
      "https://github.com/aguitauwu",
      "https://huggingface.co/OpceanAI"
    ],
  },
  // ↓ Añade más mantenedores aquí — pon cualquier URL en socials, el icono aparece solo
  // {
  //   username: "otro",
  //   displayName: "Otro",
  //   role: "Core Contributor",
  //   bio: "Especialista en el compilador Go→C++.",
  //   linesOfCode: 18340,
  //   socials: [
  //     "https://github.com/otro",
  //     "https://twitter.com/otro",
  //     "https://www.youtube.com/@otro",
  //     "https://otro.dev",
  //   ],
  // },
];

const EARLY_SUPPORTERS: EarlySupporter[] = [
  // ↓ Añade early supporters aquí
  { name: "eltercerlugar",   github: "https://github.com/eltercerlugar"   },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatLines(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

/** Extrae el username de GitHub de una URL como https://github.com/s7lver */
function ghUsernameFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "github.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[0] ?? null;
    }
  } catch { /* noop */ }
  return null;
}

// ── Social auto-detection ──────────────────────────────────────────────────────

type SocialMeta = { label: string; icon: React.ReactNode };

function detectSocial(url: string): SocialMeta {
  let host = "";
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* noop */ }

  if (host === "github.com")                           return { label: "GitHub",    icon: <IconGitHub size={13} /> };
  if (host === "twitter.com" || host === "x.com")      return { label: "X / Twitter", icon: <IconTwitter size={13} /> };
  if (host === "discord.com" || host === "discord.gg") return { label: "Discord",   icon: <IconDiscord size={13} /> };
  if (host === "youtube.com" || host === "youtu.be")   return { label: "YouTube",   icon: <IconYouTube size={13} /> };
  if (host === "instagram.com")                        return { label: "Instagram", icon: <IconInstagram size={13} /> };
  if (host === "linkedin.com")                         return { label: "LinkedIn",  icon: <IconLinkedIn size={13} /> };
  if (host === "twitch.tv")                            return { label: "Twitch",    icon: <IconTwitch size={13} /> };
  if (host === "bsky.app" || host.includes("bluesky")) return { label: "Bluesky",   icon: <IconBluesky size={13} /> };
  if (host === "reddit.com")                           return { label: "Reddit",    icon: <IconReddit size={13} /> };
  if (host === "npmjs.com")                            return { label: "npm",       icon: <IconNpm size={13} /> };
  if (host === "mastodon.social" || host.startsWith("mastodon.")) return { label: "Mastodon", icon: <IconMastodon size={13} /> };
  return { label: host || url, icon: <IconGlobe size={13} /> };
}

/** Formatea una URL para mostrarla limpia en la UI */
function prettyUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
  } catch { return url; }
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function IconGitHub({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  );
}

function IconTwitter({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconGlobe({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M1 8h14M8 2s-2.5 2.5-2.5 6S8 14 8 14s2.5-2.5 2.5-6S8 2 8 2z"/>
    </svg>
  );
}

function IconDiscord({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.111 18.1.127 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.201 13.201 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
    </svg>
  );
}

function IconYouTube({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function IconInstagram({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconLinkedIn({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function IconTwitch({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
    </svg>
  );
}

function IconBluesky({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
    </svg>
  );
}

function IconReddit({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  );
}

function IconNpm({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456l-.01 10.382H5.13z"/>
    </svg>
  );
}

function IconMastodon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
    </svg>
  );
}

function IconClose({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="2" x2="11" y2="11"/>
      <line x1="11" y1="2" x2="2" y2="11"/>
    </svg>
  );
}

function IconCode({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="5 3 1 8 5 13"/>
      <polyline points="11 3 15 8 11 13"/>
    </svg>
  );
}

// ── Maintainer Card ────────────────────────────────────────────────────────────

function MaintainerCard({
  maintainer,
  maxLines,
  rank,
  onClick,
}: {
  maintainer: Maintainer;
  maxLines: number;
  rank: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.max(8, (maintainer.linesOfCode / maxLines) * 100);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        all: "unset",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "20px 20px 18px",
        background: hovered ? "var(--surface-2)" : "var(--surface-1)",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.13)" : "var(--border)"}`,
        borderRadius: 10,
        cursor: "pointer",
        transition: "background 0.18s ease, border-color 0.18s ease, transform 0.18s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        width: "100%",
        textAlign: "left",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: "absolute", top: 14, right: 14,
        fontFamily: "var(--font-mono)", fontSize: 9,
        color: rank === 1 ? "var(--warn)" : "var(--fg-faint)",
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        #{rank}
      </div>

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          overflow: "hidden", flexShrink: 0,
          border: "1px solid var(--border)",
          background: "var(--surface-3)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://github.com/${maintainer.username}.png?size=96`}
            alt={maintainer.username}
            width={48}
            height={48}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
            color: "var(--fg)", letterSpacing: "-0.02em",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {maintainer.displayName}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10.5,
            color: "var(--fg-faint)", letterSpacing: "0.03em",
          }}>
            {maintainer.role}
          </span>
        </div>
      </div>

      {/* Bio (si existe) */}
      {maintainer.bio && (
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: 12,
          color: "var(--fg-muted)", lineHeight: 1.55, margin: 0,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {maintainer.bio}
        </p>
      )}

      {/* Lines of code */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--fg-faint)" }}>
            <IconCode size={11} />
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}>
              lines written
            </span>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500,
            color: "var(--fg-muted)", letterSpacing: "-0.01em",
          }}>
            {formatLines(maintainer.linesOfCode)}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 2, background: "var(--surface-3)", borderRadius: 2, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: rank === 1 ? "var(--fg)" : "var(--fg-faint)",
            borderRadius: 2,
          }} />
        </div>
      </div>
    </button>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

function MaintainerModal({
  maintainer,
  onClose,
}: {
  maintainer: Maintainer | null;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!maintainer) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [maintainer, onClose]);

  useEffect(() => {
    document.body.style.overflow = maintainer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [maintainer]);

  if (!maintainer) return null;

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        animation: "fadeIn 150ms ease forwards",
      }}
    >
      <div style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        width: "100%", maxWidth: 380,
        overflow: "hidden",
        animation: "fadeUp 200ms ease forwards",
        position: "relative",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            all: "unset", cursor: "pointer",
            position: "absolute", top: 14, right: 14,
            width: 26, height: 26,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 5,
            color: "var(--fg-faint)",
            transition: "background 0.15s, color 0.15s",
            zIndex: 1,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "var(--hover)";
            (e.currentTarget as HTMLElement).style.color = "var(--fg)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--fg-faint)";
          }}
        >
          <IconClose />
        </button>

        {/* Avatar + nombre + rol + bio */}
        <div style={{
          padding: "36px 32px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--surface-2)",
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            overflow: "hidden", border: "1px solid var(--border)",
            background: "var(--surface-3)",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.04)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://github.com/${maintainer.username}.png?size=176`}
              alt={maintainer.username}
              width={88}
              height={88}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 600,
              letterSpacing: "-0.03em", color: "var(--fg)",
            }}>
              {maintainer.displayName}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: "var(--fg-faint)", marginTop: 4, letterSpacing: "0.04em",
            }}>
              {maintainer.role}
            </div>
          </div>

          {maintainer.bio && (
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: 13,
              color: "var(--fg-muted)", lineHeight: 1.6,
              textAlign: "center", margin: 0,
            }}>
              {maintainer.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{
          padding: "14px 28px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 7, color: "var(--fg-faint)",
        }}>
          <IconCode size={11} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg-muted)" }}>
            {formatLines(maintainer.linesOfCode)}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
            líneas de código
          </span>
        </div>

        {/* Social links — detección automática por URL */}
        {maintainer.socials.length > 0 && (
          <div style={{ padding: "14px 20px 20px" }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--fg-faint)", marginBottom: 6, paddingLeft: 8,
            }}>
              Redes sociales
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {maintainer.socials.map(url => {
                const { label, icon } = detectSocial(url);
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 10px", borderRadius: 6,
                      color: "var(--fg-muted)",
                      textDecoration: "none",
                      transition: "background 0.15s, color 0.15s",
                      fontFamily: "var(--font-sans)", fontSize: 13,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = "var(--hover)";
                      (e.currentTarget as HTMLElement).style.color = "var(--fg)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)";
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>{icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {prettyUrl(url)}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.04em",
                      color: "var(--fg-faint)", flexShrink: 0,
                    }}>
                      {label}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Early Supporter Chip ───────────────────────────────────────────────────────

function SupporterChip({ supporter }: { supporter: EarlySupporter }) {
  const [hovered, setHovered] = useState(false);
  const [avatarOk, setAvatarOk] = useState(true);

  const ghUsername = supporter.github ? ghUsernameFromUrl(supporter.github) : null;

  const inner = (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: ghUsername ? "4px 12px 4px 4px" : "5px 12px",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.12)" : "var(--border)"}`,
        borderRadius: 20,
        fontFamily: "var(--font-mono)", fontSize: 12,
        color: hovered ? "var(--fg)" : "var(--fg-muted)",
        background: hovered ? "var(--hover)" : "transparent",
        transition: "color 0.15s, background 0.15s, border-color 0.15s",
        cursor: supporter.github ? "pointer" : "default",
        textDecoration: "none",
      }}
    >
      {ghUsername && avatarOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://github.com/${ghUsername}.png?size=32`}
          alt={ghUsername}
          width={22}
          height={22}
          onError={() => setAvatarOk(false)}
          style={{
            width: 22, height: 22, borderRadius: "50%",
            objectFit: "cover", display: "block",
            border: "1px solid var(--border)",
            flexShrink: 0,
          }}
        />
      ) : ghUsername ? (
        <span style={{ color: hovered ? "var(--fg-muted)" : "var(--fg-faint)", display: "flex" }}>
          <IconGitHub size={11} />
        </span>
      ) : null}
      {supporter.name}
    </span>
  );

  if (supporter.github) {
    return (
      <a href={supporter.github} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {inner}
      </a>
    );
  }
  return inner;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SupportersPage() {
  const [selected, setSelected] = useState<Maintainer | null>(null);
  const [linesMap, setLinesMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/github-lines")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLinesMap(data); })
      .catch(() => {});
  }, []);

  const maintainers = MAINTAINERS.map(m => ({
    ...m,
    linesOfCode: linesMap[m.username.toLowerCase()] ?? m.linesOfCode,
  }));

  const maxLines = Math.max(...maintainers.map(m => m.linesOfCode));
  const sorted   = [...maintainers].sort((a, b) => b.linesOfCode - a.linesOfCode);

  return (
    <>
      <Nav activePath="/supporters" />
      <ScrollReveal />

      <main style={{ paddingTop: 52 }}>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section style={{ padding: "96px 0 80px" }}>
          <div className="container">
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              textAlign: "center", gap: 16,
            }}>
              <div className="badge animate-up" style={{ animationDelay: "0ms" }}>
                <span style={{ color: "var(--ok)", display: "flex", alignItems: "center" }}>
                  <svg width={6} height={6} viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" fill="currentColor"/></svg>
                </span>
                &nbsp;tsuki-team
              </div>

              <h1 className="t-h2 animate-up" style={{ animationDelay: "60ms", maxWidth: 560 }}>
                Las personas detrás<br/>del proyecto
              </h1>

              <p className="t-body animate-up" style={{ animationDelay: "120ms", maxWidth: 480, fontSize: 15 }}>
                tsuki es open-source y gratuito. Estas son las personas que
                lo construyen y que hacen posible que exista.
              </p>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── Maintainers ──────────────────────────────────────────────────── */}
        <section className="section" style={{ paddingBottom: 80 }}>
          <div className="container">
            <div className="reveal">
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 16, height: 1, background: "var(--fg-faint)" }} />
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--fg-faint)",
                  }}>
                    Nivel 1 · Mantenedores
                  </span>
                </div>
                <h2 className="t-h3" style={{ marginBottom: 6 }}>Core Team</h2>
                <p className="t-body" style={{ fontSize: 14, maxWidth: 500 }}>
                  Los que construyen tsuki día a día. Haz click en cualquier
                  perfil para ver más información.
                </p>
              </div>
            </div>

            <div className="reveal">
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 12,
              }}>
                {sorted.map((m, i) => (
                  <MaintainerCard
                    key={m.username}
                    maintainer={m}
                    maxLines={maxLines}
                    rank={i + 1}
                    onClick={() => setSelected(m)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* ── Early Supporters ─────────────────────────────────────────────── */}
        <section className="section" style={{ paddingTop: 80 }}>
          <div className="container">
            <div className="reveal">
              <div style={{ marginBottom: 36 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 16, height: 1, background: "var(--fg-faint)" }} />
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--fg-faint)",
                  }}>
                    Nivel 2 · Early Supporters
                  </span>
                </div>
                <h2 className="t-h3" style={{ marginBottom: 6 }}>Los primeros creyentes</h2>
                <p className="t-body" style={{ fontSize: 14, maxWidth: 500 }}>
                  Estuvieron desde el principio. Gracias por creer en el proyecto.
                </p>
              </div>
            </div>

            <div className="reveal">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {EARLY_SUPPORTERS.map((s, i) => (
                  <div
                    key={s.name + i}
                    style={{
                      animation: "fadeUp 0.4s ease both",
                      animationDelay: `${i * 28}ms`,
                    }}
                  >
                    <SupporterChip supporter={s} />
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="reveal">
              <div style={{
                marginTop: 64,
                padding: "28px 32px",
                background: "var(--surface-1)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 20,
              }}>
                <div>
                  <div className="t-h3" style={{ marginBottom: 4, fontSize: 15 }}>
                    ¿Quieres aparecer aquí?
                  </div>
                  <p className="t-body" style={{ fontSize: 13 }}>
                    Contribuye al proyecto en GitHub o apoya el desarrollo.
                  </p>
                </div>
                <a
                  href="https://github.com/tsuki-team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ fontSize: 13, padding: "8px 18px" }}
                >
                  <IconGitHub size={13} />
                  Ver en GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Modal */}
      <MaintainerModal maintainer={selected} onClose={() => setSelected(null)} />
    </>
  );
}