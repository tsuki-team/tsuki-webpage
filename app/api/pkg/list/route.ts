import { NextResponse } from "next/server";
import { fetchAllPkgs } from "@/lib/pkg-fetcher";

export const dynamic = "force-dynamic";

export async function GET() {
  const pkgs = await fetchAllPkgs();
  return NextResponse.json(pkgs);
}