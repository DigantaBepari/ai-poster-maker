import { EmptyState } from "@/components/ui/EmptyState";
export default function Page() {
  return (
    <>
      <span className="eyebrow">আপনার সংগ্রহ</span>
      <h1>আমার পোস্টার</h1>
      <EmptyState
        title="আপনার গল্পের জন্য প্রস্তুত"
        description="পোস্টার তৈরি ও ইতিহাসের সুবিধা পরবর্তী ধাপে আসছে।"
      />
    </>
  );
}
