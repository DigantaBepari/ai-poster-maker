"use client";
import { useEffect, useState, useCallback } from "react";
import type { Poster } from "@/types/models";
import { listPosters } from "./posters.api";
export function usePosters(userId?: string) {
  const [result, setResult] = useState<{
    userId: string;
    posters: Poster[];
    error: string;
  } | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let active = true,
      timer: ReturnType<typeof setTimeout>;
    async function load() {
      try {
        const posters = await listPosters(userId!);
        if (!active) return;
        setResult({ userId: userId!, posters, error: "" });
        if (posters.some((p) => p.status === "generating"))
          timer = setTimeout(load, 4000);
      } catch (e) {
        if (active)
          setResult({
            userId: userId!,
            posters: [],
            error: e instanceof Error ? e.message : "তালিকা লোড করা যায়নি।",
          });
      }
    }
    void load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [userId, version]);
  return {
    posters: result?.userId === userId ? (result?.posters ?? []) : [],
    error: result?.userId === userId ? (result?.error ?? "") : "",
    loading: !result || result.userId !== userId,
    refresh: useCallback(() => setVersion((v) => v + 1), []),
  };
}
