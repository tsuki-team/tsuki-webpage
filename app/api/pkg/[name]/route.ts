import { NextRequest, NextResponse } from "next/server";
import { fetchPkgToml, fetchPkgReadme } from "@/lib/pkg-fetcher";
import type { Channel } from "@/lib/pkg-config";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name }   = await params;
  const sp         = req.nextUrl.searchParams;
  const channel    = (sp.get("channel") ?? "stable") as Channel;
  const version    = sp.get("version") ?? "latest";

  const [readme, toml] = await Promise.all([
    fetchPkgReadme(channel, name),
    version !== "latest" ? fetchPkgToml(channel, name, version) : Promise.resolve(null),
  ]);

  return NextResponse.json({ readme, toml });
}