import { NextResponse } from "next/server";

// POST /api/unlock  — call this from your terminal to bypass the countdown:
//   curl -X POST https://tsuki.s7lver.xyz/api/unlock
//
// DELETE /api/unlock — re-lock the site (for testing):
//   curl -X DELETE https://tsuki.s7lver.xyz/api/unlock

const COOKIE_NAME = "tsuki_unlocked";
const MAX_AGE     = 60 * 60 * 24 * 365; // 1 year

export async function POST() {
  const res = NextResponse.json(
    {
      ok:      true,
      message: "🌙 tsuki unlocked. Refresh the page.",
    },
    { status: 200 }
  );

  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: false,   // readable by JS so the client can gate without a server round-trip
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, message: "Locked." });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

export async function GET() {
  return NextResponse.json({
    usage: {
      unlock: "POST /api/unlock",
      lock:   "DELETE /api/unlock",
      hint:   "curl -X POST https://tsuki.s7lver.xyz/api/unlock",
    },
  });
}