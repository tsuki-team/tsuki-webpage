import {
  packagesJsonUrl,
  readmeUrl,
  tomlUrl,
  STABLE_BRANCH,
  TESTING_BRANCH,
  type Channel,
} from "./pkg-config"

// ── Types ─────────────────────────────────────────────────────────────────────

export type PkgType = "tsuki" | "board"

export interface PkgEntry {
  name:        string
  description: string
  author:      string
  latest:      string
  versions:    Record<string, string>   // { "1.0.0": "<toml-url>" }
  type:        PkgType
}

export interface PkgWithChannel extends PkgEntry {
  channels: Channel[]   // which channels carry this package
}

export interface TomlFunction {
  go?:     string
  python?: string
  cpp?:    string
}

export interface TomlConstant {
  go?:     string
  python?: string
  cpp?:    string
}

export interface ParsedToml {
  name:        string
  version:     string
  description: string
  author:      string
  cpp_header?: string
  arduino_lib?: string
  cpp_class?:  string
  aliases?:    string[]
  functions:   TomlFunction[]
  constants:   TomlConstant[]
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 120 } })
    if (!res.ok) return null
    return await res.json() as T
  } catch {
    return null
  }
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 120 } })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// ── packages.json shape ───────────────────────────────────────────────────────

interface RawPackagesJson {
  packages: Record<string, {
    description: string
    author:      string
    latest:      string
    versions:    Record<string, string>
    type?:       PkgType
  }>
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Fetch all packages from a given branch. Returns empty array on failure. */
export async function fetchPkgList(channel: Channel): Promise<PkgEntry[]> {
  const branch = channel === "stable" ? STABLE_BRANCH : TESTING_BRANCH
  const data   = await fetchJson<RawPackagesJson>(packagesJsonUrl(branch))
  if (!data?.packages) return []

  return Object.entries(data.packages).map(([name, pkg]) => ({
    name,
    description: pkg.description,
    author:      pkg.author,
    latest:      pkg.latest,
    versions:    pkg.versions,
    type:        pkg.type ?? "tsuki",
  }))
}

/**
 * Fetch packages from both channels and merge them, marking which channels
 * each package appears in.
 */
export async function fetchAllPkgs(): Promise<PkgWithChannel[]> {
  const [stable, testing] = await Promise.all([
    fetchPkgList("stable"),
    fetchPkgList("testing"),
  ])

  const map = new Map<string, PkgWithChannel>()

  for (const pkg of stable) {
    map.set(pkg.name, { ...pkg, channels: ["stable"] })
  }
  for (const pkg of testing) {
    const existing = map.get(pkg.name)
    if (existing) {
      existing.channels.push("testing")
      // merge versions from testing into existing entry
      existing.versions = { ...existing.versions, ...pkg.versions }
    } else {
      map.set(pkg.name, { ...pkg, channels: ["testing"] })
    }
  }

  return Array.from(map.values())
}

/** Fetch and parse a package's godotinolib.toml (basic TOML subset parser). */
export async function fetchPkgToml(
  channel: Channel,
  pkgName: string,
  version: string,
): Promise<ParsedToml | null> {
  const branch = channel === "stable" ? STABLE_BRANCH : TESTING_BRANCH
  const raw    = await fetchText(tomlUrl(branch, pkgName, version))
  if (!raw) return null
  return parseToml(raw)
}

/** Fetch README.md for a package on a given channel. */
export async function fetchPkgReadme(
  channel: Channel,
  pkgName: string,
): Promise<string | null> {
  const branch = channel === "stable" ? STABLE_BRANCH : TESTING_BRANCH
  return fetchText(readmeUrl(branch, pkgName))
}

// ── Minimal TOML parser (handles the godotinolib.toml subset) ─────────────────

function parseToml(raw: string): ParsedToml {
  const lines    = raw.split("\n")
  const result: ParsedToml = {
    name: "", version: "", description: "", author: "",
    functions: [], constants: [],
  }

  let currentTable = ""
  let currentBlock: Record<string, string> = {}

  const flushBlock = () => {
    if (currentTable === "[[function]]") {
      result.functions.push({ ...currentBlock } as TomlFunction)
    } else if (currentTable === "[[constant]]") {
      result.constants.push({ ...currentBlock } as TomlConstant)
    }
    currentBlock = {}
  }

  for (const raw_line of lines) {
    const line = raw_line.trim()
    if (!line || line.startsWith("#")) continue

    if (line === "[package]") {
      flushBlock()
      currentTable = "[package]"
      continue
    }
    if (line === "[[function]]") {
      flushBlock()
      currentTable = "[[function]]"
      continue
    }
    if (line === "[[constant]]") {
      flushBlock()
      currentTable = "[[constant]]"
      continue
    }
    if (line.startsWith("[")) {
      flushBlock()
      currentTable = line
      continue
    }

    const eqIdx = line.indexOf("=")
    if (eqIdx === -1) continue

    const key   = line.slice(0, eqIdx).trim()
    const value = line.slice(eqIdx + 1).trim()
      .replace(/^"(.*)"$/, "$1")   // strip outer quotes
      .replace(/\\n/g, "\n")

    // Array values like aliases = ["BME280", "bme280"]
    if (value.startsWith("[")) {
      if (currentTable === "[package]") {
        const items = value.replace(/[\[\]"]/g, "").split(",").map(s => s.trim()).filter(Boolean)
        if (key === "aliases") result.aliases = items
      }
      continue
    }

    if (currentTable === "[package]") {
      if (key === "name")        result.name        = value
      if (key === "version")     result.version     = value
      if (key === "description") result.description = value
      if (key === "author")      result.author      = value
      if (key === "cpp_header")  result.cpp_header  = value
      if (key === "arduino_lib") result.arduino_lib = value
      if (key === "cpp_class")   result.cpp_class   = value
    } else {
      currentBlock[key] = value
    }
  }

  flushBlock()
  return result
}