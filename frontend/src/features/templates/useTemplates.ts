"use client";
import { useEffect, useState } from "react";
import type { Occasion, Template } from "@/types/models";
import { fetchTemplates } from "./templates.api";
type Result = { occasion?: Occasion; templates: Template[]; error: string };
export function useTemplates(occasion?: Occasion) {
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    let active = true;
    fetchTemplates(occasion)
      .then((templates) => {
        if (active) setResult({ occasion, templates, error: "" });
      })
      .catch((error) => {
        if (active)
          setResult({
            occasion,
            templates: [],
            error:
              error instanceof Error
                ? error.message
                : "Could not load templates",
          });
      });
    return () => {
      active = false;
    };
  }, [occasion]);
  const loading = result === null || result.occasion !== occasion;
  return {
    templates: loading ? [] : result.templates,
    loading,
    error: loading ? "" : result.error,
  };
}
