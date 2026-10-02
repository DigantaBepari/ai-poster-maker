"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Poster } from "@/types/models";
import { deletePoster } from "../posters.api";
import { PosterStatusBadge } from "./PosterStatusBadge";
import { DownloadButtons } from "./DownloadButtons";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
export function PosterCard({
  poster,
  onDeleted,
}: {
  poster: Poster;
  onDeleted: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function remove() {
    if (!confirm("এই পোস্টারটি মুছে ফেলবেন?")) return;
    setBusy(true);
    try {
      await deletePoster(poster._id);
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "মুছে ফেলা যায়নি।");
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="history-card">
      <Link href={"/posters/" + poster._id} className="history-image">
        {poster.generatedImageUrl ? (
          <Image
            src={poster.generatedImageUrl}
            alt={poster.formData.headline}
            width={1200}
            height={1600}
            unoptimized
          />
        ) : (
          <span>
            {poster.flagged
              ? "পর্যালোচনাধীন"
              : poster.status === "generating"
                ? "পোস্টার তৈরি হচ্ছে…"
                : "প্রিভিউ নেই"}
          </span>
        )}
      </Link>
      <div className="history-meta">
        <PosterStatusBadge status={poster.status} />
        {poster.flagged && <span className="status-badge failed">চিহ্নিত</span>}
        <h3>
          <Link href={"/posters/" + poster._id}>
            {poster.formData.headline}
          </Link>
        </h3>
        <p>{new Date(poster.createdAt).toLocaleDateString("bn-BD")}</p>
        {poster.status === "completed" && (
          <DownloadButtons id={poster._id} disabled={poster.flagged} />
        )}
        <Button
          className="danger"
          disabled={busy || poster.status === "generating"}
          onClick={remove}
        >
          {busy ? "মুছছে…" : "পোস্টার মুছুন"}
        </Button>
        {error && <Toast message={error} />}
      </div>
    </article>
  );
}
