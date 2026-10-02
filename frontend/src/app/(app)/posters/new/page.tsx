import { Suspense } from "react";
import { NewPosterPage } from "@/features/posters/components/NewPosterPage";
import { Spinner } from "@/components/ui/Spinner";
export default function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <NewPosterPage />
    </Suspense>
  );
}
