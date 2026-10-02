"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Template } from "@/types/models";
import { fetchTemplate } from "../posters.api";
import { PosterForm } from "./PosterForm/PosterForm";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
export function NewPosterPage() {
  const id = useSearchParams().get("templateId");
  const [result, setResult] = useState<{
    id: string;
    template?: Template;
    error: string;
  } | null>(null);
  useEffect(() => {
    if (!id) return;
    let active = true;
    fetchTemplate(id)
      .then((template) => {
        if (active) setResult({ id, template, error: "" });
      })
      .catch((e) => {
        if (active)
          setResult({
            id,
            error: e instanceof Error ? e.message : "টেমপ্লেট লোড করা যায়নি।",
          });
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (!id)
    return (
      <EmptyState
        title="আগে একটি টেমপ্লেট বেছে নিন"
        description="আপনার উপলক্ষ অনুযায়ী ডিজাইন নির্বাচন করুন।"
      >
        <Link className="button" href="/templates">
          টেমপ্লেট দেখুন
        </Link>
      </EmptyState>
    );
  if (result?.id !== id) return <Spinner />;
  if (result.error) return <Toast message={result.error} />;
  const template = result.template!;
  return (
    <>
      <span className="eyebrow">নতুন পোস্টার</span>
      <h1>আপনার কথা, আপনার ডিজাইন</h1>
      <div className="poster-editor">
        <PosterForm key={template._id} template={template} />
        <aside className="template-sidebar">
          <Image
            src={template.thumbnailUrl}
            alt={template.title}
            width={800}
            height={1000}
            unoptimized
          />
          <h3>{template.title}</h3>
          <p>
            চূড়ান্ত পোস্টার ২৪০০ × ৩২০০ পিক্সেল PNG ও PDF হিসেবে প্রস্তুত হবে।
          </p>
          <Link href="/templates">অন্য টেমপ্লেট বেছে নিন →</Link>
        </aside>
      </div>
    </>
  );
}
