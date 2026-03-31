// ── tsuki Package Registry — Config ──────────────────────────────────────────
// Edit these values to point to your repo and branches.

export const PKG_REPO_OWNER  = "s7lver2"
export const PKG_REPO_NAME   = "tsuki"

// stable  → published, main branch
// testing → unreleased / WIP — set to your working branch
export const STABLE_BRANCH  = "main"
export const TESTING_BRANCH = "v6.0-WEBPAGE-AND-FIXES"   // ← change to your testing branch name

// ── URL builders ─────────────────────────────────────────────────────────────

export function rawUrl(branch: string, path: string): string {
  return `https://raw.githubusercontent.com/${PKG_REPO_OWNER}/${PKG_REPO_NAME}/refs/heads/${branch}/${path}`
}

export function packagesJsonUrl(branch: string): string {
  return rawUrl(branch, "pkg/packages.json")
}

export function readmeUrl(branch: string, pkgName: string): string {
  return rawUrl(branch, `pkg/${pkgName}/README.md`)
}

export function tomlUrl(branch: string, pkgName: string, version: string): string {
  return rawUrl(branch, `pkg/${pkgName}/${version}/godotinolib.toml`)
}

export type Channel = "stable" | "testing"