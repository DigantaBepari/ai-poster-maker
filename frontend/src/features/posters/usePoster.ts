"use client";
import { useEffect, useState, useCallback } from "react";
import type { Poster } from "@/types/models";
import { getPoster } from "./posters.api";
export function usePoster(id: string) {
  const [result, setResult] = useState<{
    id: string;
    poster?: Poster;
    error: string;
  } | null>(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true,
      timer: ReturnType<typeof setTimeout>;
    let attempts = 0,
      failures = 0;
    async function poll() {
      try {
        const poster = await getPoster(id);
        if (!active) return;
        setResult({ id, poster, error: "" });
        failures = 0;
        if (poster.status === "generating" || poster.status === "draft")
          timer = setTimeout(poll, Math.min(1500 * 1.3 ** attempts++, 5000));
      } catch (e) {
        if (!active) return;
        setResult((r) => ({
          id,
          poster: r?.id === id ? r.poster : undefined,
          error: e instanceof Error ? e.message : "পোস্টার লোড করা যায়নি।",
        }));
        if (++failures < 5)
          timer = setTimeout(poll, Math.min(2000 * failures, 10000));
      }
    }
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id, version]);
  return {
    poster: result?.id === id ? result.poster : undefined,
    error: result?.id === id ? result.error : "",
    loading: !result || result.id !== id,
    refresh: useCallback(() => setVersion((v) => v + 1), []),
  };
}
