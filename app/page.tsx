"use client";
import { useState, useEffect } from "react";
import Countdown from "@/components/Countdown";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Languages from "@/components/Languages";
import Performance from "@/components/Performance";
import InstallSection from "@/components/InstallSection";
import Roadmap from "@/components/Roadmap";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

// ── Change this to your real launch date ────────────────────────────────────
const LAUNCH_DATE = new Date("2026-04-10T16:00:00Z");
// ────────────────────────────────────────────────────────────────────────────

const COOKIE_NAME = "tsuki_unlocked";

function isUnlocked(): boolean {
  if (typeof document === "undefined") return false;
  const hasCookie = document.cookie.split(";").some(c => c.trim().startsWith(`${COOKIE_NAME}=1`));
  if (hasCookie) return true;
  return Date.now() >= LAUNCH_DATE.getTime();
}

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    setUnlocked(isUnlocked());
    setReady(true);

    const iv = setInterval(() => {
      if (isUnlocked()) setUnlocked(true);
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  if (!ready) return null;

  if (!unlocked) {
    return <Countdown launchDate={LAUNCH_DATE} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Languages />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Performance />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <InstallSection />
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
        <Roadmap />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}