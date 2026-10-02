import Image from "next/image";
import type { Poster } from "@/types/models";
import { EmptyState } from "@/components/ui/EmptyState";
export function PosterPreview({ poster }: { poster: Poster }) {
  return poster.generatedImageUrl ? (
    <div className="poster-output">
      <Image
        src={poster.generatedImageUrl}
        alt={poster.formData.headline}
        width={1200}
        height={1600}
        unoptimized
        priority
      />
    </div>
  ) : (
    <EmptyState
      title={
        poster.flagged ? "পোস্টারটি পর্যালোচনাধীন" : "প্রিভিউ পাওয়া যায়নি"
      }
      description={
        poster.errorMessage ?? "পোস্টার প্রস্তুত হলে এখানে দেখা যাবে।"
      }
    />
  );
}
