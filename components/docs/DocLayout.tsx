"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TocContext, type TocContext as TocCtxType } from "./DocPrimitives";
import Nav from "@/components/Nav";

// ─────────────────────────────────────────────────────────────────────────────
//  DocLayout — tsuki documentation shell
//
//  Structure:
//    Nav (52px, sticky) — same as the rest of the site
//    ├─ Sidebar (240px, sticky below nav)
//    │   Groups of links with active state
//    └─ Content area (max-w 760px)
//        └─ TOC column (200px, sticky) — auto-generated from DocHeadings
// ─────────────────────────────────────────────────────────────────────────────

// ── Navigation tree ───────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  href: string;
  badge?: string;
  badgeVariant?: "ok" | "warn" | "err" | "info" | "new";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Getting started",
    items: [
      { id: "introduction",  label: "Introduction",        href: "/docs" },
      { id: "installation",  label: "Installation",        href: "/docs/installation" },
      { id: "first-project", label: "Your first project",  href: "/docs/first-project" },
    ],
  },
  {
    label: "Languages",
    items: [
      { id: "go",     label: "Go",     href: "/docs/go",     badge: "stable", badgeVariant: "ok" },
      { id: "python", label: "Python", href: "/docs/python", badge: "stable", badgeVariant: "ok" },
      { id: "cpp",    label: "C++",    href: "/docs/cpp" },
      { id: "ino",    label: "Arduino (.ino)", href: "/docs/ino" },
    ],
  },
  {
    label: "CLI reference",
    items: [
      { id: "cli-build",   label: "tsuki build",   href: "/docs/cli/build" },
      { id: "cli-upload",  label: "tsuki upload",  href: "/docs/cli/upload" },
      { id: "cli-check",   label: "tsuki check",   href: "/docs/cli/check" },
      { id: "cli-config",  label: "tsuki config",  href: "/docs/cli/config" },
      { id: "cli-pkg",     label: "tsuki pkg",     href: "/docs/cli/pkg" },
      { id: "cli-boards",  label: "tsuki boards",  href: "/docs/cli/boards" },
    ],
  },
  {
    label: "Packages",
    items: [
      { id: "pkg-overview", label: "Overview",         href: "/docs/packages" },
      { id: "pkg-create",   label: "Creating packages", href: "/docs/packages/create", badge: "new", badgeVariant: "info" },
      { id: "pkg-manifest", label: "godotinolib.toml", href: "/docs/packages/manifest" },
    ],
  },
  {
    label: "Boards",
    items: [
      { id: "boards-avr",   label: "AVR (Uno, Nano…)",  href: "/docs/boards/avr" },
      { id: "boards-esp32", label: "ESP32 / ESP8266",   href: "/docs/boards/esp" },
      { id: "boards-rp2040",label: "Raspberry Pi Pico", href: "/docs/boards/rp2040" },
    ],
  },
  {
    label: "IDE",
    items: [
      { id: "ide-overview", label: "Overview",   href: "/docs/ide" },
      { id: "ide-sandbox",  label: "Sandbox",    href: "/docs/ide/sandbox" },
      { id: "ide-lsp",      label: "LSP",        href: "/docs/ide/lsp", badge: "experimental", badgeVariant: "warn" },
    ],
  },
];

// ── Badge colors ──────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<string, { color: string; bg: string }> = {
  ok:   { color: "var(--ok)",   bg: "rgba(34,197,94,0.1)" },
  warn: { color: "var(--warn)", bg: "rgba(245,158,11,0.1)" },
  err:  { color: "var(--err)",  bg: "rgba(239,68,68,0.1)" },
  info: { color: "var(--info)", bg: "rgba(147,197,253,0.1)" },
  new:  { color: "var(--info)", bg: "rgba(147,197,253,0.1)" },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      position: "sticky", top: 52, alignSelf: "flex-start",
      height: "calc(100vh - 52px)", overflowY: "auto",
      padding: "24px 0 40px",
      borderRight: "1px solid var(--border)",
    }}>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: 28 }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600,
            letterSpacing: "0.10em", textTransform: "uppercase",
            color: "var(--fg-faint)", padding: "0 20px", marginBottom: 4,
          }}>
            {group.label}
          </div>
          {group.items.map((item) => {
            const isActive = activePath === item.href;
            return (
              <a
                key={item.id}
                href={item.href}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 6, padding: "5px 20px",
                  fontFamily: "var(--font-sans)", fontSize: 13,
                  color: isActive ? "var(--fg)" : "var(--fg-muted)",
                  textDecoration: "none",
                  background: isActive ? "var(--active)" : "transparent",
                  borderLeft: `2px solid ${isActive ? "var(--active-border)" : "transparent"}`,
                  transition: "color 0.12s, background 0.12s",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--fg)";
                    (e.currentTarget as HTMLElement).style.background = "var(--hover)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (() => {
                  const bc = BADGE_COLORS[item.badgeVariant ?? "info"] ?? BADGE_COLORS.info;
                  return (
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 8.5, fontWeight: 600,
                      letterSpacing: "0.06em", textTransform: "uppercase",
                      color: bc.color, background: bc.bg,
                      padding: "1.5px 5px", borderRadius: 10,
                    }}>
                      {item.badge}
                    </span>
                  );
                })()}
              </a>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

// ── TOC ───────────────────────────────────────────────────────────────────────

interface TocEntry { id: string; text: string; level: number }

function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const headings = entries.map(e => document.getElementById(e.id)).filter(Boolean) as HTMLElement[];
    if (!headings.length) return;

    const obs = new IntersectionObserver(
      (all) => {
        const visible = all.filter(e => e.isIntersecting);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-60px 0px -70% 0px" }
    );
    headings.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [entries]);

  if (!entries.length) return null;

  return (
    <div style={{
      width: 188, flexShrink: 0,
      position: "sticky", top: 52, alignSelf: "flex-start",
      height: "calc(100vh - 52px)", overflowY: "auto",
      padding: "24px 0 40px 24px",
    }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600,
        letterSpacing: "0.10em", textTransform: "uppercase",
        color: "var(--fg-faint)", marginBottom: 10,
      }}>
        On this page
      </div>
      {entries.map((e) => {
        const isActive = active === e.id;
        return (
          <a
            key={e.id}
            href={`#${e.id}`}
            style={{
              display: "block",
              paddingLeft: e.level === 3 ? 12 : 0,
              padding: `3px 0 3px ${e.level === 3 ? 12 : 0}px`,
              fontFamily: "var(--font-sans)", fontSize: 12,
              color: isActive ? "var(--fg)" : "var(--fg-faint)",
              textDecoration: "none",
              borderLeft: `1px solid ${isActive ? "var(--fg-muted)" : "transparent"}`,
              marginLeft: e.level === 3 ? 0 : 0,
              transition: "color 0.15s, border-color 0.15s",
              lineHeight: 1.5,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--fg-muted)"; }}
            onMouseLeave={e => {
              const id = (e.currentTarget as HTMLElement).getAttribute("href")?.slice(1);
              (e.currentTarget as HTMLElement).style.color = id === active ? "var(--fg)" : "var(--fg-faint)";
            }}
          >
            {e.text}
          </a>
        );
      })}
    </div>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

function Breadcrumb({ path }: { path: string }) {
  const allItems = NAV_GROUPS.flatMap(g => g.items.map(i => ({ ...i, group: g.label })));
  const current = allItems.find(i => i.href === path);
  if (!current) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
      <a href="/docs" style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        color: "var(--fg-faint)", textDecoration: "none",
      }}>
        docs
      </a>
      <span style={{ color: "var(--fg-faint)", fontSize: 11 }}>/</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>
        {current.label}
      </span>
    </div>
  );
}

// ── DocLayout ─────────────────────────────────────────────────────────────────

interface DocLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  showToc?: boolean;
}

export default function DocLayout({ children, activePath = "/docs", showToc = true }: DocLayoutProps) {
  const [tocEntries, setTocEntries] = useState<TocEntry[]>([]);

  const register = useCallback((entry: TocEntry) => {
    setTocEntries(prev => {
      if (prev.some(e => e.id === entry.id)) return prev;
      return [...prev, entry];
    });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface)", color: "var(--fg)" }}>
      <Nav activePath={activePath} />

      <div style={{
        display: "flex", maxWidth: 1280, margin: "0 auto",
        paddingTop: 52,
      }}>
        <Sidebar activePath={activePath} />

        {/* main content */}
        <main style={{
          flex: 1, minWidth: 0,
          padding: "48px 48px 80px",
        }}>
          <Breadcrumb path={activePath} />

          <TocContext.Provider value={{ register }}>
            <div style={{ maxWidth: 760 }}>
              {children}
            </div>
          </TocContext.Provider>
        </main>

        {showToc && <TableOfContents entries={tocEntries} />}
      </div>
    </div>
  );
}