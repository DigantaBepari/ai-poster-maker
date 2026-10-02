"use client";
import { useState, useEffect, useCallback } from "react";
export function useAdminList<T>(load: () => Promise<T[]>) {
  const [result, setResult] = useState<{ items: T[]; error: string } | null>(
    null,
  );
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    load()
      .then((items) => {
        if (active) setResult({ items, error: "" });
      })
      .catch((e) => {
        if (active)
          setResult({
            items: [],
            error: e instanceof Error ? e.message : "তথ্য লোড করা যায়নি।",
          });
      });
    return () => {
      active = false;
    };
  }, [load, version]);
  return {
    items: result?.items ?? [],
    error: result?.error ?? "",
    loading: !result,
    refresh: useCallback(() => setVersion((v) => v + 1), []),
  };
}
