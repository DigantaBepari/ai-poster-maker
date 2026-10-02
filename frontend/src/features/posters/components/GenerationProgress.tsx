import { Spinner } from "@/components/ui/Spinner";
export function GenerationProgress() {
  return (
    <div className="generation-progress" role="status" aria-live="polite">
      <Spinner />
      <h2>আপনার পোস্টার তৈরি হচ্ছে</h2>
      <p>
        ছবি ও লেখা সাজিয়ে প্রিন্টের জন্য প্রস্তুত করছি।
        <br />
        কিছুক্ষণ অপেক্ষা করুন। এই পৃষ্ঠা নিজে থেকেই আপডেট হবে।
      </p>
    </div>
  );
}
