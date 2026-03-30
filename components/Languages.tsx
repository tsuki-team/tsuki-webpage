"use client";

// No external image requests — colored inline icons only.
// Eliminates all CDN-loading jank during CSS animation.
const LANGS_ROW_1 = [
  { name: "Go",         color: "#6ba4e0", abbr: "Go"  },
  { name: "Rust",       color: "#e07050", abbr: "Rs"  },
  { name: "C++",        color: "#659bd6", abbr: "C++" },
  { name: "Python",     color: "#4b8bbe", abbr: "Py"  },
  { name: "JavaScript", color: "#f0d060", abbr: "JS"  },
  { name: "TypeScript", color: "#4db8ff", abbr: "TS"  },
  { name: "Java",       color: "#e89050", abbr: "Jv"  },
  { name: "Kotlin",     color: "#9d74f5", abbr: "Kt"  },
  { name: "Swift",      color: "#f06048", abbr: "Sw"  },
  { name: "Zig",        color: "#f0a030", abbr: "Zig" },
];

const LANGS_ROW_2 = [
  { name: "C",          color: "#a8b9cc", abbr: "C"   },
  { name: "Dart",       color: "#40c4b0", abbr: "Dt"  },
  { name: "Ruby",       color: "#c04040", abbr: "Rb"  },
  { name: "Haskell",    color: "#8878b8", abbr: "Hs"  },
  { name: "Lua",        color: "#7080c0", abbr: "Lua" },
  { name: "Elixir",     color: "#a060c0", abbr: "Ex"  },
  { name: "C#",         color: "#60b060", abbr: "C#"  },
  { name: "Nim",        color: "#d0c050", abbr: "Nm"  },
  { name: "Arduino",    color: "#00a0a8", abbr: "Ard" },
  { name: "Clojure",    color: "#6080d8", abbr: "Clj" },
];

function LangCard({ name, color, abbr }: { name: string; color: string; abbr: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 108,
        height: 90,
        background: "var(--surface-1)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "default",
        userSelect: "none",
        // contain: layout+style prevents card internals from affecting scroll layer
        contain: "layout style",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = color + "55";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Language monogram — no external requests, no layout shifts */}
      <div style={{
        width: 36, height: 36,
        borderRadius: 6,
        background: color + "18",
        border: `1px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: abbr.length > 2 ? 9 : 11,
          fontWeight: 600,
          color: color,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {abbr}
        </span>
      </div>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9.5,
        letterSpacing: "0.06em",
        color: "var(--fg-faint)",
        textTransform: "uppercase",
      }}>
        {name}
      </span>
    </div>
  );
}

function CarouselRow({
  langs,
  direction,
  duration = 30,
}: {
  langs: typeof LANGS_ROW_1;
  direction: "left" | "right";
  duration?: number;
}) {
  // Exactly 2 copies → animate translateX(0 → -50%) = always one perfect loop
  const items = [...langs, ...langs];
  const animName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div style={{
      overflow: "hidden",
      width: "100%",
      position: "relative",
      // Promote to own compositing layer up-front, before animation starts
      willChange: "transform",
    }}>
      {/* Edge fades */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 100,
        zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to right, var(--surface) 30%, transparent)",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 100,
        zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(to left, var(--surface) 30%, transparent)",
      }} />

      {/* The track — promoted to GPU layer via transform3d */}
      <div
        style={{
          display: "flex",
          gap: 10,
          width: "max-content",
          // translateZ(0) promotes to compositing layer immediately
          transform: "translateZ(0)",
          animation: `${animName} ${duration}s linear infinite`,
        }}
      >
        {items.map((lang, i) => (
          <LangCard key={`${lang.abbr}-${i}`} {...lang} />
        ))}
      </div>
    </div>
  );
}

export default function Languages() {
  return (
    <section
      id="languages"
      style={{
        padding: "100px 0",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      <div className="container" style={{ marginBottom: 56 }}>
        <div className="t-label" style={{ marginBottom: 16 }}>Language Support</div>
        <h2 className="t-h2" style={{ maxWidth: 520, marginBottom: 16 }}>
          Write in the language you know
        </h2>
        <p className="t-body" style={{ maxWidth: 480 }}>
          tsuki supports a growing list of programming languages for Arduino firmware development.
          Your tools, your syntax, zero compromise.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <CarouselRow langs={LANGS_ROW_1} direction="left"  duration={36} />
        <CarouselRow langs={LANGS_ROW_2} direction="right" duration={30} />
      </div>
    </section>
  );
}