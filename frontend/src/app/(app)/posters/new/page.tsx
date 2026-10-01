import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
export default function Page() {
  return (
    <EmptyState
      title="শীঘ্রই তৈরি করুন আপনার পোস্টার"
      description="ছবি, পরিচয় ও বাংলা শিরোনাম দিয়ে পোস্টার তৈরির সুবিধা পরবর্তী ধাপে আসছে।"
    >
      <Link className="button" href="/templates">
        টেমপ্লেটে ফিরে যান
      </Link>
    </EmptyState>
  );
}
