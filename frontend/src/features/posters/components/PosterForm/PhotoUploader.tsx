"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import Image from "next/image";
import type { PosterFields } from "../../poster.schema";
import { uploadPhoto } from "../../posters.api";
import { Toast } from "@/components/ui/Toast";
export function PhotoUploader({
  limit,
  onBusy,
}: {
  limit: number;
  onBusy: (busy: boolean) => void;
}) {
  const { control, setValue } = useFormContext<PosterFields>();
  const consent = useWatch({ control, name: "photoConsent" });
  const urls = useWatch({ control, name: "uploadedPhotoUrls" });
  const [photos, setPhotos] = useState<{ preview: string; url: string }[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const previews = useRef<string[]>([]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const allocatedPreviews = previews.current;
    return () => {
      mounted.current = false;
      allocatedPreviews.forEach(URL.revokeObjectURL);
    };
  }, []);
  async function select(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setError("");
    if (files.length + urls.length > limit) {
      setError("সর্বোচ্চ " + limit + "টি ছবি দিতে পারবেন।");
      return;
    }
    if (
      files.some(
        (f) =>
          f.size > 5 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(f.type),
      )
    ) {
      setError("JPEG, PNG বা WebP ছবি দিন, প্রতিটি সর্বোচ্চ ৫ MB।");
      return;
    }
    setBusy(true);
    onBusy(true);
    const added: { preview: string; url: string }[] = [];
    try {
      for (const file of files) {
        const result = await uploadPhoto(file);
        if (!mounted.current) return;
        const preview = URL.createObjectURL(file);
        previews.current.push(preview);
        added.push({ preview, url: result.url });
      }
    } catch (e) {
      if (mounted.current)
        setError(e instanceof Error ? e.message : "ছবি আপলোড করা যায়নি।");
    } finally {
      if (mounted.current) {
        setPhotos((p) => [...p, ...added]);
        setValue("uploadedPhotoUrls", [...urls, ...added.map((p) => p.url)], {
          shouldValidate: true,
        });
        setBusy(false);
        onBusy(false);
      }
    }
  }
  function remove(index: number) {
    URL.revokeObjectURL(photos[index].preview);
    setPhotos((p) => p.filter((_, i) => i !== index));
    setValue(
      "uploadedPhotoUrls",
      urls.filter((_, i) => i !== index),
    );
  }
  return (
    <fieldset>
      <legend>
        আপনার ছবি ({photos.length}/{limit})
      </legend>
      <p className="small muted">ছবি ঐচ্ছিক। বাম থেকে ডানে ক্রমানুসারে বসবে।</p>
      <div className="photo-upload-grid">
        {photos.map((photo, i) => (
          <div className="photo-tile" key={photo.url}>
            <Image
              src={photo.preview}
              alt={"ছবি " + (i + 1)}
              width={100}
              height={100}
              unoptimized
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(i)}
              aria-label={"ছবি " + (i + 1) + " সরান"}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {photos.length < limit && (
        <label className={"upload-zone " + (!consent ? "disabled" : "")}>
          <span>{busy ? "আপলোড হচ্ছে…" : "＋ ছবি যোগ করুন"}</span>
          <input
            aria-label="ছবি নির্বাচন"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={!consent || busy}
            onChange={select}
          />
        </label>
      )}
      {!consent && (
        <small className="muted">ছবি আপলোড করতে আগে অনুমতি নিশ্চিত করুন।</small>
      )}
      {error && <Toast message={error} />}
    </fieldset>
  );
}
