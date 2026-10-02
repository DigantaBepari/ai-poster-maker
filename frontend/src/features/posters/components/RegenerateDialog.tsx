"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Poster } from "@/types/models";
import { editableSchema, type EditableData } from "../poster.schema";
import { regeneratePoster } from "../posters.api";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
const labels: Record<keyof EditableData, string> = {
  name: "নাম",
  designation: "পদবি",
  party: "দল / সংগঠন",
  union: "ইউনিয়ন / ওয়ার্ড",
  thana: "থানা / উপজেলা",
  district: "জেলা",
  headline: "শিরোনাম",
};
export function RegenerateDialog({
  poster,
  onUpdated,
}: {
  poster: Poster;
  onUpdated: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditableData>({
    resolver: zodResolver(editableSchema),
    defaultValues: poster.formData,
  });
  const remaining =
    poster.remainingRegenerations ??
    Math.max(0, (poster.maxRegenerations ?? 3) - poster.retryCount);
  async function submit(data: EditableData) {
    setError("");
    try {
      await regeneratePoster(poster._id, data);
      dialog.current?.close();
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "পুনরায় তৈরি করা যায়নি।");
    }
  }
  return (
    <>
      <Button
        className="secondary"
        disabled={
          remaining === 0 || poster.flagged || poster.status === "generating"
        }
        onClick={() => {
          reset(poster.formData);
          setError("");
          dialog.current?.showModal();
        }}
      >
        লেখা সম্পাদনা / পুনরায় তৈরি ({remaining})
      </Button>
      <dialog
        ref={dialog}
        className="edit-dialog"
        aria-labelledby="regenerate-title"
        onCancel={(e) => {
          if (isSubmitting) e.preventDefault();
        }}
      >
        <form onSubmit={(event) => void handleSubmit(submit)(event)}>
          <div className="page-heading">
            <h2 id="regenerate-title">লেখা সম্পাদনা করুন</h2>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => dialog.current?.close()}
              aria-label="বন্ধ করুন"
            >
              ×
            </button>
          </div>
          <p>
            অবশিষ্ট {remaining} বার পুনরায় তৈরি করতে পারবেন। ছবি অপরিবর্তিত
            থাকবে।
          </p>
          {(Object.keys(labels) as (keyof EditableData)[]).map((key) => (
            <label className="field" key={key}>
              <span>{labels[key]}</span>
              {key === "headline" ? (
                <textarea rows={3} {...register(key)} />
              ) : (
                <input {...register(key)} />
              )}{" "}
              {errors[key] && (
                <small className="field-error">{errors[key]?.message}</small>
              )}
            </label>
          ))}
          {error && <Toast message={error} />}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "অপেক্ষা করুন…" : "সংরক্ষণ ও পুনরায় তৈরি করুন"}
          </Button>
        </form>
      </dialog>
    </>
  );
}
