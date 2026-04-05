import { NextResponse } from "next/server";

const ORG = "tsuki-team";

// Cache result for 6 hours — GitHub's contributor stats endpoint is slow
// and has a low rate limit (60 req/h unauthenticated, 5000 with token).
let cache: { data: Record<string, number>; ts: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000;

async function ghFetch(path: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return fetch(`https://api.github.com${path}`, { headers });
}

export async function GET() {
  // Return cache if still fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // 1. List all repos in the org (up to 100)
    const reposRes = await ghFetch(`/orgs/${ORG}/repos?per_page=100&sort=updated`);
    if (!reposRes.ok) throw new Error(`repos ${reposRes.status}`);
    const repos: { name: string; fork: boolean }[] = await reposRes.json();

    // Only count source repos, skip forks
    const sourceRepos = repos.filter(r => !r.fork);

    // 2. For each repo, fetch contributor stats (additions per week)
    const totals: Record<string, number> = {};

    await Promise.all(
      sourceRepos.map(async repo => {
        // GitHub may return 202 while it computes stats — retry once after a pause
        let statsRes = await ghFetch(`/repos/${ORG}/${repo.name}/stats/contributors`);
        if (statsRes.status === 202) {
          await new Promise(r => setTimeout(r, 2500));
          statsRes = await ghFetch(`/repos/${ORG}/${repo.name}/stats/contributors`);
        }
        if (!statsRes.ok) return;

        const contributors: {
          author: { login: string } | null;
          weeks: { a: number; d: number }[];
        }[] = await statsRes.json();

        if (!Array.isArray(contributors)) return;

        for (const c of contributors) {
          if (!c.author) continue;
          const username = c.author.login.toLowerCase();
          // Count net lines (additions - deletions), floored at 0
          const net = c.weeks.reduce((sum, w) => sum + Math.max(0, w.a - w.d), 0);
          totals[username] = (totals[username] ?? 0) + net;
        }
      })
    );

    cache = { data: totals, ts: Date.now() };
    return NextResponse.json(totals);
  } catch (err) {
    console.error("[github-lines]", err);
    // Return empty object — page falls back to hardcoded values
    return NextResponse.json({}, { status: 200 });
  }
}