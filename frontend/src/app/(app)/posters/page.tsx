"use client";
import Link from "next/link";
import { useAuth } from "@/features/auth/useAuth";
import { usePosters } from "@/features/posters/usePosters";
import { PosterCard } from "@/features/posters/components/PosterCard";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
export default function Page() {
  const { user } = useAuth();
  const { posters, loading, error, refresh } = usePosters(user?.id);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">আপনার সংগ্রহ</span>
          <h1>আমার পোস্টার</h1>
        </div>
        <Link href="/templates" className="button">
          ＋ নতুন পোস্টার
        </Link>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Toast message={error} />
      ) : posters.length ? (
        <div className="history-grid">
          {posters.map((p) => (
            <PosterCard key={p._id} poster={p} onDeleted={refresh} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="আপনার প্রথম পোস্টার তৈরি করুন"
          description="একটি টেমপ্লেট বেছে নিয়ে শুরু করুন।"
        >
          <Link href="/templates" className="button">
            টেমপ্লেট দেখুন
          </Link>
        </EmptyState>
      )}
    </>
  );
}
