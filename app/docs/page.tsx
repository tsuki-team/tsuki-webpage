"use client";

import DocLayout from "@/components/docs/DocLayout";
import {
  DocHeading, DocText, DocCode, DocCallout,
  DocSteps, DocStep, DocTable, DocDivider,
  DocBadge, DocCard, DocCards, DocSection,
  DocKeyboard, DocProperties, DocProperty,
  DocInlineCode, DocLink,
} from "@/components/docs/DocPrimitives";

// ─────────────────────────────────────────────────────────────────────────────
//  /docs — Introduction
// ─────────────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <DocLayout activePath="/docs">

      {/* ── Hero ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--fg-faint)",
          marginBottom: 16,
        }}>
          <span>Getting started</span>
          <span style={{ color: "var(--border)" }}>—</span>
          <DocBadge variant="ok">v1.0.0</DocBadge>
        </div>
        <DocHeading level={1} id="introduction">Introduction</DocHeading>
        <DocText>
          tsuki is an Arduino firmware framework that lets you write firmware in{" "}
          <DocInlineCode>Go</DocInlineCode> or <DocInlineCode>Python</DocInlineCode>,
          then automatically transpiles it to <DocInlineCode>C++</DocInlineCode>,
          ready to compile and flash to your board.
        </DocText>
        <DocText>
          The toolchain is distributed as a single static binary — no runtime,
          no hidden dependencies. Install in one command, start writing in your language of choice.
        </DocText>
      </div>

      <DocCallout variant="info" title="Beta">
        tsuki is currently in closed beta. Some features described here may change before v1.0 stable.
      </DocCallout>

      {/* ── Quick start ── */}
      <DocSection id="quickstart" title="Quick start">
        <DocSteps>
          <DocStep n={1} title="Install tsuki">
            <DocText muted>On macOS or Linux, run the one-line installer:</DocText>
            <DocCode lang="bash" filename="terminal">
              {`curl -fsSL https://tsuki.s7lver.xyz/install.sh | sh`}
            </DocCode>
            <DocText muted>On Windows (PowerShell):</DocText>
            <DocCode lang="powershell" filename="PowerShell">
              {`irm https://tsuki.s7lver.xyz/install.bat | iex`}
            </DocCode>
          </DocStep>

          <DocStep n={2} title="Create a project">
            <DocCode lang="bash">
              {`tsuki init my-robot
cd my-robot`}
            </DocCode>
            <DocText muted>
              This scaffolds a new project directory with a{" "}
              <DocInlineCode>tsuki_package.json</DocInlineCode> manifest and a{" "}
              <DocInlineCode>src/main.go</DocInlineCode> entry point.
            </DocText>
          </DocStep>

          <DocStep n={3} title="Write firmware">
            <DocCode lang="go" filename="src/main.go">
{`package main

import "arduino"

func setup() {
    arduino.PinMode(arduino.LED_BUILTIN, arduino.OUTPUT)
}

func loop() {
    arduino.DigitalWrite(arduino.LED_BUILTIN, arduino.HIGH)
    arduino.Delay(500)
    arduino.DigitalWrite(arduino.LED_BUILTIN, arduino.LOW)
    arduino.Delay(500)
}`}
            </DocCode>
          </DocStep>

          <DocStep n={4} title="Build and flash">
            <DocCode lang="bash">
              {`tsuki build --compile
tsuki upload`}
            </DocCode>
            <DocText muted>
              tsuki transpiles your Go source to C++, compiles it with the right toolchain
              for your board, and flashes the firmware over USB. Board and port are auto-detected.
            </DocText>
          </DocStep>
        </DocSteps>
      </DocSection>

      <DocDivider />

      {/* ── How it works ── */}
      <DocSection id="how-it-works" title="How it works">
        <DocText>
          tsuki is composed of three binaries that form a pipeline:
        </DocText>

        <DocCode lang="text">
{`Your source (.go / .py)
    │
    ▼
tsuki-core (Rust)       Go/Python → C++ transpiler
    │
    ▼
tsuki-flash (Rust)      C++ → .hex / .bin / .uf2 + flash
    │
    ▼
Board ✓`}
        </DocCode>

        <DocCallout variant="ok" title="No arduino-cli required">
          tsuki ships its own compile and flash toolchain. You don't need{" "}
          <DocInlineCode>arduino-cli</DocInlineCode> installed unless you prefer to use it
          as a backend via <DocInlineCode>--backend arduino-cli</DocInlineCode>.
        </DocCallout>
      </DocSection>

      <DocDivider />

      {/* ── Language support ── */}
      <DocSection id="languages" title="Language support">
        <DocTable
          headers={["Language", "Status", "Notes"]}
          rows={[
            [<DocInlineCode>Go</DocInlineCode>,     <DocBadge variant="ok">stable</DocBadge>,   "Full support. Recommended."],
            [<DocInlineCode>Python</DocInlineCode>, <DocBadge variant="ok">stable</DocBadge>,   "Full support via separate pipeline."],
            [<DocInlineCode>C++</DocInlineCode>,    <DocBadge variant="default">passthrough</DocBadge>, "src/*.cpp compiled directly, no transpilation."],
            [<DocInlineCode>.ino</DocInlineCode>,   <DocBadge variant="default">passthrough</DocBadge>, "Arduino sketch files compiled directly."],
          ]}
        />
        <DocText>
          The language is declared in <DocInlineCode>tsuki_package.json</DocInlineCode> via
          the <DocInlineCode>language</DocInlineCode> field. It defaults to{" "}
          <DocInlineCode>"go"</DocInlineCode> when omitted.
        </DocText>
      </DocSection>

      <DocDivider />

      {/* ── Go subset ── */}
      <DocSection id="go-subset" title="Supported Go subset">
        <DocText>
          tsuki supports a practical subset of Go suitable for embedded firmware — not the full language.
          The following constructs are available:
        </DocText>

        <DocTable
          headers={["Feature", "Status"]}
          rows={[
            ["Variables (var, :=)",              <DocBadge variant="ok">✓</DocBadge>],
            ["Constants (const)",                <DocBadge variant="ok">✓</DocBadge>],
            ["Functions + methods",              <DocBadge variant="ok">✓</DocBadge>],
            ["Structs + type aliases",           <DocBadge variant="ok">✓</DocBadge>],
            ["if / else, switch / case",         <DocBadge variant="ok">✓</DocBadge>],
            ["for (C-style, while, range)",       <DocBadge variant="ok">✓</DocBadge>],
            ["All operators",                    <DocBadge variant="ok">✓</DocBadge>],
            ["import + package calls",           <DocBadge variant="ok">✓</DocBadge>],
            ["Goroutines (go)",                  <DocBadge variant="warn">stub</DocBadge>],
            ["defer",                            <DocBadge variant="warn">stub</DocBadge>],
            ["Multiple return values",           <DocBadge variant="warn">struct-packed</DocBadge>],
            ["Interfaces",                       <DocBadge variant="warn">type-only</DocBadge>],
            ["Channels (chan)",                  <DocBadge variant="err">not supported</DocBadge>],
            ["Generics",                         <DocBadge variant="err">not planned</DocBadge>],
            ["Garbage collection",               <DocBadge variant="err">not applicable</DocBadge>],
          ]}
        />

        <DocCallout variant="warn" title="No GC">
          Arduino hardware has no heap garbage collector. Avoid dynamic allocations
          in <DocInlineCode>loop()</DocInlineCode>. Prefer stack variables and global structs.
        </DocCallout>
      </DocSection>

      <DocDivider />

      {/* ── Supported boards ── */}
      <DocSection id="boards" title="Supported boards">
        <DocTable
          headers={["ID", "Board", "CPU", "Flash", "RAM"]}
          rows={[
            [<DocInlineCode>uno</DocInlineCode>,       "Arduino Uno",           "ATmega328P",    "32K",   "2K"],
            [<DocInlineCode>nano</DocInlineCode>,      "Arduino Nano",          "ATmega328P",    "32K",   "2K"],
            [<DocInlineCode>mega</DocInlineCode>,      "Arduino Mega 2560",     "ATmega2560",    "256K",  "8K"],
            [<DocInlineCode>leonardo</DocInlineCode>,  "Arduino Leonardo",      "ATmega32U4",    "32K",   "2K"],
            [<DocInlineCode>esp32</DocInlineCode>,     "ESP32 Dev Module",      "Xtensa LX6",    "4096K", "520K"],
            [<DocInlineCode>esp8266</DocInlineCode>,   "ESP8266 NodeMCU",       "ESP8266EX",     "4096K", "80K"],
            [<DocInlineCode>pico</DocInlineCode>,      "Raspberry Pi Pico",     "RP2040",        "2048K", "264K"],
          ]}
        />
        <DocText>
          Run <DocInlineCode>tsuki boards list</DocInlineCode> to see the full table with FQBN strings.
          Run <DocInlineCode>tsuki boards detect</DocInlineCode> to auto-detect connected boards via USB.
        </DocText>
      </DocSection>

      <DocDivider />

      {/* ── Explore docs ── */}
      <DocSection id="explore" title="Explore the docs">
        <DocCards cols={2}>
          <DocCard
            title="Installation"
            description="Detailed install instructions for macOS, Linux, and Windows, including no-sudo and PATH setup."
            href="/docs/installation"
            icon={<svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v9M4 8l4 4 4-4"/><path d="M2 14h12"/></svg>}
          />
          <DocCard
            title="Go reference"
            description="Complete reference for the supported Go subset, built-in package mappings, and idioms."
            href="/docs/go"
            badge="stable"
            badgeVariant="ok"
            icon={<svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7h6M5 10h4"/></svg>}
          />
          <DocCard
            title="Packages"
            description="Browse and install community packages for sensors, displays, actuators, and more."
            href="/docs/packages"
            icon={<svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l6-3 6 3v6l-6 3-6-3V5z"/><path d="M8 2v14M2 5l6 3 6-3"/></svg>}
          />
          <DocCard
            title="CLI reference"
            description="All commands, flags, and configuration options for the tsuki command-line interface."
            href="/docs/cli/build"
            icon={<svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M5 7l2 2-2 2M9 11h2"/></svg>}
          />
        </DocCards>
      </DocSection>

      <DocDivider />

      {/* ── Keyboard shortcuts ── */}
      <DocSection id="shortcuts" title="IDE keyboard shortcuts">
        <DocTable
          headers={["Action", "Shortcut"]}
          rows={[
            ["Build project",           <DocKeyboard keys={["Ctrl", "B"]} />],
            ["Build + compile",         <DocKeyboard keys={["Ctrl", "Shift", "B"]} />],
            ["Upload firmware",         <DocKeyboard keys={["Ctrl", "U"]} />],
            ["Check (no output)",       <DocKeyboard keys={["Ctrl", "K"]} />],
            ["Save active file",        <DocKeyboard keys={["Ctrl", "S"]} />],
            ["Toggle sidebar",          <DocKeyboard keys={["Ctrl", "\\"]} />],
            ["Open command palette",    <DocKeyboard keys={["Ctrl", "P"]} />],
            ["Switch workstation 1–3",  <DocKeyboard keys={["Ctrl", "1"]} />],
          ]}
        />
      </DocSection>

    </DocLayout>
  );
}