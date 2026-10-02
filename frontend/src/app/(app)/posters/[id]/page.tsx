"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePoster } from "@/features/posters/usePoster";
import { PosterPreview } from "@/features/posters/components/PosterPreview";
import { PosterStatusBadge } from "@/features/posters/components/PosterStatusBadge";
import { GenerationProgress } from "@/features/posters/components/GenerationProgress";
import { DownloadButtons } from "@/features/posters/components/DownloadButtons";
import { RegenerateDialog } from "@/features/posters/components/RegenerateDialog";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { poster, loading, error, refresh } = usePoster(id);
  if (loading) return <Spinner />;
  return (
    <>
      <Link href="/posters" className="text-link">
        ← আমার পোস্টার
      </Link>
      {error && (
        <>
          <Toast message={error} />
          <Button onClick={refresh}>আবার লোড করুন</Button>
        </>
      )}
      {poster && (
        <>
          <div className="page-heading">
            <h1>{poster.formData.headline}</h1>
            <PosterStatusBadge status={poster.status} />
          </div>
          {poster.flagged && (
            <Toast message="পোস্টারটি পর্যালোচনাধীন। ডাউনলোড সাময়িকভাবে বন্ধ।" />
          )}
          {poster.status === "generating" || poster.status === "draft" ? (
            <GenerationProgress />
          ) : (
            <div className="poster-detail">
              <PosterPreview poster={poster} />
              <aside className="detail-actions">
                <h2>{poster.formData.name}</h2>
                <p>
                  {poster.formData.designation}
                  <br />
                  {poster.formData.party}
                </p>
                {poster.status === "completed" && (
                  <DownloadButtons id={id} disabled={poster.flagged} />
                )}
                <RegenerateDialog
                  key={poster.retryCount}
                  poster={poster}
                  onUpdated={refresh}
                />
                <p className="small muted">
                  অবশিষ্ট পুনরায় তৈরি: {poster.remainingRegenerations ?? 0}
                  <br />
                  ছাপার আগে নাম, বানান ও ছবির অবস্থান পরীক্ষা করুন।
                </p>
              </aside>
            </div>
          )}
        </>
      )}
    </>
  );
}
