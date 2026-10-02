import type { Poster } from "@/types/models";
const labels = {
  draft: "খসড়া",
  generating: "তৈরি হচ্ছে",
  completed: "প্রস্তুত",
  failed: "ব্যর্থ",
};
export function PosterStatusBadge({ status }: { status: Poster["status"] }) {
  return <span className={"status-badge " + status}>{labels[status]}</span>;
}
