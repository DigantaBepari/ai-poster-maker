"use client";
import { useState } from "react";
import Link from "next/link";
import type { Poster } from "@/types/models";
import { getAdminPosters, flagPoster } from "@/features/admin/admin.api";
import { useAdminList } from "@/features/admin/useAdminList";
import { PosterStatusBadge } from "@/features/posters/components/PosterStatusBadge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
export default function Page() {
  const { items, loading, error, refresh } = useAdminList(getAdminPosters);
  const [filter, setFilter] = useState(false),
    [actionError, setActionError] = useState(""),
    [busy, setBusy] = useState("");
  async function toggle(p: Poster) {
    setBusy(p._id);
    setActionError("");
    try {
      await flagPoster(p._id, !p.flagged);
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "পরিবর্তন করা যায়নি।");
    } finally {
      setBusy("");
    }
  }
  const visible = items.filter((p) => !filter || p.flagged);
  return (
    <>
      <h1>পোস্টার পর্যালোচনা</h1>
      <label className="consent">
        <input
          type="checkbox"
          checked={filter}
          onChange={(e) => setFilter(e.target.checked)}
        />
        শুধু চিহ্নিত পোস্টার
      </label>
      {(error || actionError) && <Toast message={error || actionError} />}{" "}
      {loading ? (
        <Spinner />
      ) : visible.length ? (
        <div className="admin-list">
          {visible.map((p) => (
            <article className="admin-row" key={p._id}>
              <div>
                <h3>
                  <Link href={"/posters/" + p._id}>{p.formData.headline}</Link>
                </h3>
                <p>
                  {p.formData.name} · {p.formData.party}
                </p>
                <PosterStatusBadge status={p.status} />
              </div>
              <Button
                disabled={!!busy}
                className={p.flagged ? "secondary" : "danger"}
                onClick={() => toggle(p)}
              >
                {p.flagged ? "চিহ্ন সরান" : "চিহ্নিত করুন"}
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="পোস্টার নেই"
          description="এই তালিকায় এখনও কোনো পোস্টার নেই।"
        />
      )}
    </>
  );
}
