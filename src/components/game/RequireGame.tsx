"use client";

import { useGame } from "@/context/GameContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function RequireGame({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!state) router.replace("/setup");
  }, [state, router, hydrated]);

  return <>{children}</>;
}
