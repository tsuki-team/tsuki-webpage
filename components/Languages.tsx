"use client";

const LANGS_ROW_1 = [
  { name: "Go",         color: "#6ba4e0", slug: "go"         },
  { name: "Rust",       color: "#f74c00", slug: "rust"       },
  { name: "C++",        color: "#00599c", slug: "cplusplus"  },
  { name: "Python",     color: "#3572a5", slug: "python"     },
  { name: "JavaScript", color: "#f7df1e", slug: "javascript" },
  { name: "TypeScript", color: "#4db8ff", slug: "typescript" },
  { name: "Java",       color: "#e76f00", slug: "java"       },
  { name: "Kotlin",     color: "#7f52ff", slug: "kotlin"     },
  { name: "Swift",      color: "#f05138", slug: "swift"      },
  { name: "Zig",        color: "#f7a41d", slug: "zig"        },
];

const LANGS_ROW_2 = [
  { name: "C",          color: "#a8b9cc", slug: "c"          },
  { name: "Dart",       color: "#00b4ab", slug: "dart"       },
  { name: "Ruby",       color: "#cc342d", slug: "ruby"       },
  { name: "Haskell",    color: "#5d4f85", slug: "haskell"    },
  { name: "Lua",        color: "#000080", slug: "lua"        },
  { name: "Elixir",     color: "#6e4a7e", slug: "elixir"     },
  { name: "C#",         color: "#239120", slug: "csharp"     },
  { name: "Nim",        color: "#ffe953", slug: "nim"        },
  { name: "Arduino",    color: "#00979d", slug: "arduino"    },
  { name: "Clojure",    color: "#5881d8", slug: "clojure"    },
];

function LangCard({ name, color, slug }: { name: string; color: string; slug: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 108,
        height: 94,
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
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = color + "55";
        el.style.background = "var(--surface-2)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border)";
        el.style.background = "var(--surface-1)";
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://cdn.simpleicons.org/${slug}/${color.replace("#", "")}`}
        alt={name}
        width={28}
        height={28}
        style={{ display: "block", opacity: 0.88 }}
        onError={e => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
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
  const items = [...langs, ...langs];
  const animName = direction === "left" ? "marquee-left" : "marquee-right";

  return (
    <div style={{
      overflow: "hidden", width: "100%", position: "relative",
      // Promote the clip container to its own GPU layer FIRST.
      // When the animated child is later promoted, they share the same layer
      // context — preventing the clip/animation desync that makes the
      // carousel vanish at certain scroll positions.
      transform: "translateZ(0)",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 120, zIndex: 2,
        pointerEvents: "none",
        background: "linear-gradient(to right, var(--surface) 20%, transparent)",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 120, zIndex: 2,
        pointerEvents: "none",
        background: "linear-gradient(to left, var(--surface) 20%, transparent)",
      }} />

      <div
        style={{
          display: "flex",
          gap: 10,
          width: "max-content",
          animation: `${animName} ${duration}s linear infinite`,
          // backfaceVisibility: hidden forces compositing without triggering
          // the double-promotion conflict that breaks overflow clipping.
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {items.map((lang, i) => (
          <LangCard key={`${lang.slug}-${i}`} {...lang} />
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
        <CarouselRow langs={LANGS_ROW_1} direction="left"  duration={34} />
        <CarouselRow langs={LANGS_ROW_2} direction="right" duration={28} />
      </div>
    </section>
  );
}