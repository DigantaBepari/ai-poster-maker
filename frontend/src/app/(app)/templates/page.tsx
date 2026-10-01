"use client";
import { useState } from "react";
import type { Occasion } from "@/types/models";
import { useTemplates } from "@/features/templates/useTemplates";
import { OccasionFilter } from "@/components/templates/OccasionFilter";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
export default function Page() {
  const [occasion, setOccasion] = useState<Occasion>();
  const { templates, loading, error } = useTemplates(occasion);
  return (
    <>
      <span className="eyebrow">টেমপ্লেট লাইব্রেরি</span>
      <h1>উপলক্ষের সঙ্গে মানানসই ডিজাইন</h1>
      <p className="muted">আপনার বার্তার জন্য বেছে নিন একটি টেমপ্লেট।</p>
      <OccasionFilter value={occasion} onChange={setOccasion} />
      {loading ? (
        <Spinner />
      ) : error ? (
        <Toast message={error} />
      ) : templates.length ? (
        <TemplateGrid templates={templates} />
      ) : (
        <EmptyState
          title="এখনও কোনো টেমপ্লেট নেই"
          description="এই উপলক্ষের টেমপ্লেট শীঘ্রই যোগ করা হবে।"
        />
      )}
    </>
  );
}
