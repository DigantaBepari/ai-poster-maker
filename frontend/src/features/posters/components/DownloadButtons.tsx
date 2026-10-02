"use client";
import { useState } from "react";
import { downloadPoster } from "../posters.api";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
export function DownloadButtons({
  id,
  disabled = false,
}: {
  id: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  async function download(format: "png" | "pdf") {
    setBusy(format);
    setError("");
    try {
      const blob = await downloadPoster(id, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "poster-" + id + "." + format;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ডাউনলোড করা যায়নি।");
    } finally {
      setBusy("");
    }
  }
  return (
    <div>
      <div className="download-buttons">
        <Button disabled={disabled || !!busy} onClick={() => download("png")}>
          {busy === "png" ? "ডাউনলোড হচ্ছে…" : "PNG ডাউনলোড ↓"}
        </Button>
        <Button
          className="secondary"
          disabled={disabled || !!busy}
          onClick={() => download("pdf")}
        >
          {busy === "pdf" ? "ডাউনলোড হচ্ছে…" : "PDF ডাউনলোড ↓"}
        </Button>
      </div>
      {error && <Toast message={error} />}
    </div>
  );
}
