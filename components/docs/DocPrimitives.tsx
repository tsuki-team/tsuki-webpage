"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  DocPrimitives — tsuki documentation component system
//
//  All components use CSS variables from globals.css — no hardcoded colors.
//  Import from this file only; never recreate these inline.
// ─────────────────────────────────────────────────────────────────────────────

// ── TOC context (collects headings for the sidebar TOC) ──────────────────────

interface TocEntry { id: string; text: string; level: number }
interface TocCtx { register: (e: TocEntry) => void }
export const TocContext = createContext<TocCtx>({ register: () => {} });

// ── DocHeading ────────────────────────────────────────────────────────────────

interface HeadingProps {
  level?: 1 | 2 | 3;
  id?: string;
  children: React.ReactNode;
}

export function DocHeading({ level = 2, id, children }: HeadingProps) {
  const { register } = useContext(TocContext);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (id && ref.current) {
      register({ id, text: ref.current.textContent ?? "", level });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const styles: Record<number, React.CSSProperties> = {
    1: { fontFamily: "var(--font-sans)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1, color: "var(--fg)", marginBottom: 8 },
    2: { fontFamily: "var(--font-sans)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.2, color: "var(--fg)", marginBottom: 6, marginTop: 40 },
    3: { fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, letterSpacing: "-0.015em", color: "var(--fg)", marginBottom: 4, marginTop: 28 },
  };

  const Tag = `h${level}` as "h1" | "h2" | "h3";
  const anchorStyle: React.CSSProperties = {
    color: "var(--fg-faint)", marginLeft: 6, fontSize: "0.8em",
    textDecoration: "none", opacity: 0, transition: "opacity 0.15s",
    fontWeight: 400,
  };

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      id={id}
      style={{ ...styles[level], scrollMarginTop: 80, position: "relative", display: "flex", alignItems: "center", gap: 4 }}
      className="doc-heading-root"
    >
      {children}
      {id && (
        <a href={`#${id}`} className="doc-anchor" style={anchorStyle} aria-hidden="true">#</a>
      )}
      <style>{`.doc-heading-root:hover .doc-anchor { opacity: 1; }`}</style>
    </Tag>
  );
}

// ── DocText ───────────────────────────────────────────────────────────────────

export function DocText({ children, muted = true }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p style={{
      fontFamily: "var(--font-sans)", fontSize: 14.5, lineHeight: 1.72,
      color: muted ? "var(--fg-muted)" : "var(--fg)",
      marginBottom: 16, marginTop: 0,
    }}>
      {children}
    </p>
  );
}

// ── DocInlineCode ─────────────────────────────────────────────────────────────

export function DocInlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: "var(--font-mono)", fontSize: "0.875em",
      background: "var(--surface-3)", color: "var(--fg)",
      padding: "1.5px 5px", borderRadius: 3,
      border: "1px solid var(--border)",
    }}>
      {children}
    </code>
  );
}

// ── DocCode ───────────────────────────────────────────────────────────────────

interface CodeProps {
  children: string;
  lang?: string;
  filename?: string;
  highlight?: number[];   // line numbers to highlight (1-based)
}

export function DocCode({ children, lang, filename, highlight = [] }: CodeProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(children.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }

  const lines = children.trim().split("\n");

  return (
    <div style={{
      background: "var(--surface-1)", border: "1px solid var(--border)",
      borderRadius: 7, overflow: "hidden", marginBottom: 20, marginTop: 8,
    }}>
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 12px", borderBottom: "1px solid var(--border)",
        background: "var(--surface-2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* traffic lights */}
          {["#ff5f57","#febc2e","#28c840"].map((c, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
          {filename && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)", marginLeft: 4 }}>
              {filename}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lang && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {lang}
            </span>
          )}
          <button onClick={copy} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 8px", borderRadius: 4,
            fontFamily: "var(--font-mono)", fontSize: 10,
            background: "var(--surface-3)", border: "1px solid var(--border)",
            color: copied ? "var(--ok)" : "var(--fg-faint)",
            cursor: "pointer", transition: "color 0.15s",
          }}>
            {copied ? (
              <>
                <svg width={10} height={10} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8l4 4 6-6"/>
                </svg>
                copied
              </>
            ) : (
              <>
                <svg width={10} height={10} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="5" width="8" height="8" rx="1.5"/><path d="M11 5V4a1 1 0 00-1-1H4a1 1 0 00-1 1v6a1 1 0 001 1h1"/>
                </svg>
                copy
              </>
            )}
          </button>
        </div>
      </div>
      {/* body */}
      <div style={{ overflowX: "auto", padding: "14px 0" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlight.includes(lineNum);
              return (
                <tr key={i} style={{ background: isHighlighted ? "rgba(255,255,255,0.04)" : "transparent" }}>
                  <td style={{
                    fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: "20px",
                    color: "var(--fg-faint)", textAlign: "right",
                    padding: "0 16px 0 16px", userSelect: "none",
                    borderRight: "1px solid var(--border-subtle)", minWidth: 36,
                  }}>
                    {lineNum}
                  </td>
                  <td style={{
                    fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: "20px",
                    color: "var(--fg)", padding: "0 20px",
                    whiteSpace: "pre",
                  }}>
                    {isHighlighted && (
                      <span style={{
                        position: "absolute", left: 0, top: 0, bottom: 0,
                        width: 2, background: "var(--fg-muted)",
                      }} />
                    )}
                    {line || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── DocCallout ────────────────────────────────────────────────────────────────

type CalloutVariant = "info" | "ok" | "warn" | "err";

const CALLOUT_CONFIG: Record<CalloutVariant, { color: string; bg: string; border: string; icon: string; label: string }> = {
  info: { color: "var(--info)", bg: "rgba(147,197,253,0.05)", border: "rgba(147,197,253,0.15)", icon: "ℹ", label: "Note" },
  ok:   { color: "var(--ok)",   bg: "rgba(34,197,94,0.05)",   border: "rgba(34,197,94,0.15)",   icon: "✓", label: "Tip" },
  warn: { color: "var(--warn)", bg: "rgba(245,158,11,0.05)",  border: "rgba(245,158,11,0.15)",  icon: "⚠", label: "Warning" },
  err:  { color: "var(--err)",  bg: "rgba(239,68,68,0.05)",   border: "rgba(239,68,68,0.15)",   icon: "✕", label: "Danger" },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
}

export function DocCallout({ variant = "info", title, children }: CalloutProps) {
  const cfg = CALLOUT_CONFIG[variant];
  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderLeft: `3px solid ${cfg.color}`,
      borderRadius: "0 6px 6px 0", padding: "12px 16px",
      marginBottom: 20, marginTop: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: children ? 4 : 0 }}>
        <span style={{ color: cfg.color, fontSize: 12, lineHeight: 1 }}>{cfg.icon}</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 600,
          letterSpacing: "0.07em", textTransform: "uppercase", color: cfg.color,
        }}>
          {title ?? cfg.label}
        </span>
      </div>
      {children && (
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.65, color: "var(--fg-muted)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── DocSteps / DocStep ────────────────────────────────────────────────────────

export function DocSteps({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", marginBottom: 20, marginTop: 8 }}>
      {/* vertical line */}
      <div style={{
        position: "absolute", left: 15, top: 24, bottom: 8,
        width: 1, background: "var(--border)",
      }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {children}
      </div>
    </div>
  );
}

interface StepProps {
  n: number;
  title: string;
  children?: React.ReactNode;
}

export function DocStep({ n, title, children }: StepProps) {
  return (
    <div style={{ display: "flex", gap: 16, paddingBottom: 24 }}>
      <div style={{
        flexShrink: 0, width: 30, height: 30,
        background: "var(--surface-2)", border: "1px solid var(--border)",
        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--fg-muted)",
        zIndex: 1,
      }}>
        {n}
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600,
          color: "var(--fg)", marginBottom: 8,
        }}>
          {title}
        </div>
        {children && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.65, color: "var(--fg-muted)" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DocTable ──────────────────────────────────────────────────────────────────

interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}

export function DocTable({ headers, rows }: TableProps) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 20, marginTop: 8 }}>
      <table style={{
        width: "100%", borderCollapse: "collapse",
        fontFamily: "var(--font-sans)", fontSize: 13.5,
        border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden",
      }}>
        <thead>
          <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: "left", padding: "8px 14px",
                fontFamily: "var(--font-mono)", fontSize: 10.5,
                fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                color: "var(--fg-faint)", whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{
              borderBottom: ri < rows.length - 1 ? "1px solid var(--border-subtle)" : "none",
              background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
            }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: "8px 14px", color: "var(--fg-muted)",
                  verticalAlign: "top",
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── DocDivider ────────────────────────────────────────────────────────────────

export function DocDivider() {
  return <div style={{ height: 1, background: "var(--border)", margin: "36px 0" }} />;
}

// ── DocBadge ──────────────────────────────────────────────────────────────────

type BadgeVariant = "ok" | "warn" | "err" | "info" | "default";

const BADGE_CFG: Record<BadgeVariant, { color: string; bg: string; border: string }> = {
  ok:      { color: "var(--ok)",      bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)" },
  warn:    { color: "var(--warn)",    bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)" },
  err:     { color: "var(--err)",     bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)" },
  info:    { color: "var(--info)",    bg: "rgba(147,197,253,0.08)", border: "rgba(147,197,253,0.2)" },
  default: { color: "var(--fg-muted)",bg: "var(--surface-3)",       border: "var(--border)" },
};

export function DocBadge({ children, variant = "default" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const cfg = BADGE_CFG[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 20,
      fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
      letterSpacing: "0.05em", textTransform: "uppercase",
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      {children}
    </span>
  );
}

// ── DocCard / DocCards ────────────────────────────────────────────────────────

interface CardProps {
  title: string;
  description: string;
  href?: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
  icon?: React.ReactNode;
}

export function DocCard({ title, description, href, badge, badgeVariant = "default", icon }: CardProps) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      href={href}
      style={{
        display: "block", padding: "16px 18px",
        background: "var(--surface-1)", border: "1px solid var(--border)",
        borderRadius: 8, textDecoration: "none",
        transition: "border-color 0.15s, background 0.15s",
        cursor: href ? "pointer" : "default",
      }}
      onMouseEnter={href ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.13)";
        (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
      } : undefined}
      onMouseLeave={href ? (e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.background = "var(--surface-1)";
      } : undefined}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && (
            <span style={{ color: "var(--fg-faint)", flexShrink: 0 }}>{icon}</span>
          )}
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600,
            color: "var(--fg)", letterSpacing: "-0.01em",
          }}>
            {title}
          </span>
        </div>
        {badge && <DocBadge variant={badgeVariant}>{badge}</DocBadge>}
      </div>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6,
        color: "var(--fg-muted)", margin: 0,
      }}>
        {description}
      </p>
      {href && (
        <div style={{
          display: "flex", alignItems: "center", gap: 4, marginTop: 10,
          fontFamily: "var(--font-mono)", fontSize: 10.5,
          color: "var(--fg-faint)", letterSpacing: "0.03em",
        }}>
          Read more
          <svg width={10} height={10} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </div>
      )}
    </Tag>
  );
}

export function DocCards({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: 10, marginBottom: 20, marginTop: 8,
    }}>
      {children}
    </div>
  );
}

// ── DocSection ────────────────────────────────────────────────────────────────

interface SectionProps {
  id?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function DocSection({ id, title, description, children }: SectionProps) {
  return (
    <section id={id} style={{ marginBottom: 56, scrollMarginTop: 80 }}>
      {title && <DocHeading level={2} id={id}>{title}</DocHeading>}
      {description && <DocText>{description}</DocText>}
      {children}
    </section>
  );
}

// ── DocKeyboard ───────────────────────────────────────────────────────────────

export function DocKeyboard({ keys }: { keys: string[] }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {keys.map((k, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {i > 0 && <span style={{ color: "var(--fg-faint)", fontSize: 10 }}>+</span>}
          <kbd style={{
            display: "inline-flex", alignItems: "center",
            padding: "2px 6px", borderRadius: 4,
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            background: "var(--surface-3)", color: "var(--fg-muted)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 0 var(--border)",
          }}>
            {k}
          </kbd>
        </span>
      ))}
    </span>
  );
}

// ── DocProperties / DocProperty ───────────────────────────────────────────────

export function DocProperties({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      border: "1px solid var(--border)", borderRadius: 7,
      overflow: "hidden", marginBottom: 20, marginTop: 8,
    }}>
      {children}
    </div>
  );
}

interface PropertyProps {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  children?: React.ReactNode;
}

export function DocProperty({ name, type, default: def, required, children }: PropertyProps) {
  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: "1px solid var(--border-subtle)",
      display: "flex", flexDirection: "column", gap: 4,
    }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <code style={{
          fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--fg)",
        }}>
          {name}
        </code>
        <code style={{
          fontFamily: "var(--font-mono)", fontSize: 11,
          color: "var(--info)", background: "rgba(147,197,253,0.06)",
          padding: "1px 6px", borderRadius: 3, border: "1px solid rgba(147,197,253,0.12)",
        }}>
          {type}
        </code>
        {required && <DocBadge variant="err">required</DocBadge>}
        {def !== undefined && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-faint)" }}>
            default: <code style={{ color: "var(--fg-muted)" }}>{def}</code>
          </span>
        )}
      </div>
      {children && (
        <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--fg-muted)" }}>{children}</div>
      )}
    </div>
  );
}

// ── DocLink ───────────────────────────────────────────────────────────────────

export function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        color: "var(--fg)", textDecoration: "underline",
        textDecorationColor: "var(--border)", textUnderlineOffset: 2,
        transition: "text-decoration-color 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecorationColor = "var(--fg-muted)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecorationColor = "var(--border)"; }}
    >
      {children}
    </a>
  );
}