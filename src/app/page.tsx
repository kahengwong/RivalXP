
"use client";

import { useState, useEffect } from 'react';
import { RivalSetup } from "@/components/game/RivalSetup";
import { Dashboard } from "@/components/game/Dashboard";
import { Rival } from "@/lib/game-types";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [rival, setRival] = useState<Rival | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if rival setup already happened
    const saved = localStorage.getItem('rival_xp_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setRival(state.rival);
      } catch (e) {
        console.error("Failed to parse state", e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-background font-body">
      {!rival ? (
        <RivalSetup onComplete={(r) => setRival(r)} />
      ) : (
        <Dashboard initialRival={rival} />
      )}
      <Toaster />
    </main>
  );
}
