"use client";
import { useState, useEffect } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setScrolled(window.scrollY > 10);
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      height: 52, display: "flex", alignItems: "center",
      padding: "0 32px",
      transition: "background 0.25s ease, border-color 0.25s ease",
      background: scrolled
        ? "rgba(10,10,10,0.92)"
        : "rgba(10,10,10,0.6)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: `1px solid ${scrolled ? "var(--border)" : "var(--border-subtle)"}`,
    }}>
      <div style={{
        maxWidth: 1100, width: "100%", margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 24, height: 24,
            background: "var(--fg)",
            borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 13, color: "var(--accent-inv)", fontWeight: 600 }}>月</span>
          </div>
          <span style={{
            fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600,
            letterSpacing: "-0.03em", color: "var(--fg)",
          }}>tsuki</span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: "var(--fg-faint)", marginLeft: 2, letterSpacing: "0.05em",
          }}>v0.1.0</span>
        </a>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[
            { label: "Languages",   href: "#languages"   },
            { label: "Performance", href: "#performance" },
            { label: "Roadmap",     href: "#roadmap"     },
            { label: "Install",     href: "#install"     },
            { label: "GitHub",      href: "https://github.com/s7lver2/tsuki", external: true },
          ].map(l => (
            <a
              key={l.label}
              href={l.href}
              target={(l as any).external ? "_blank" : undefined}
              rel={(l as any).external ? "noopener noreferrer" : undefined}
              style={{
                fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400,
                color: "var(--fg-muted)", textDecoration: "none",
                padding: "5px 10px", borderRadius: 5,
                transition: "color 0.15s, background 0.15s",
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
            >{l.label}</a>
          ))}

          <a
            href="#install"
            style={{
              fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
              color: "var(--accent-inv)", background: "var(--fg)",
              textDecoration: "none",
              padding: "6px 14px", borderRadius: 5, marginLeft: 8,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            Install
          </a>
        </div>
      </div>
    </nav>
  );
}