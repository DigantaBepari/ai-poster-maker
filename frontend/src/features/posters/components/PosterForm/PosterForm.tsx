"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Template } from "@/types/models";
import { posterFormSchema, type PosterFields } from "../../poster.schema";
import { createPoster } from "../../posters.api";
import { IdentityFields } from "./IdentityFields";
import { LocationFields } from "./LocationFields";
import { HeadlineField } from "./HeadlineField";
import { PhotoUploader } from "./PhotoUploader";
import { ConsentCheckbox } from "./ConsentCheckbox";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
export function PosterForm({ template }: { template: Template }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [uploading, setUploading] = useState(false);
  const methods = useForm<PosterFields>({
    resolver: zodResolver(posterFormSchema),
    defaultValues: {
      name: "",
      designation: "",
      party: "",
      union: "",
      thana: "",
      district: "",
      headline: template.title,
      photoConsent: false,
      uploadedPhotoUrls: [],
      paletteHint: "template",
    },
  });
  async function submit(values: PosterFields) {
    setError("");
    const { uploadedPhotoUrls, paletteHint, ...formData } = values;
    try {
      const poster = await createPoster({
        templateId: template._id,
        formData: { ...formData, occasionType: template.occasionType },
        uploadedPhotoUrls,
        paletteHint,
      });
      router.push("/posters/" + poster._id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "পোস্টার তৈরি করা যায়নি।");
    }
  }
  return (
    <FormProvider {...methods}>
      <form className="poster-form" onSubmit={methods.handleSubmit(submit)}>
        <IdentityFields />
        <LocationFields />
        <HeadlineField />
        <ConsentCheckbox />
        <PhotoUploader
          limit={template.layoutConfig.photoSlots.length}
          onBusy={setUploading}
        />
        {error && <Toast message={error} />}
        <Button
          type="submit"
          disabled={uploading || methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting
            ? "তৈরি হচ্ছে…"
            : "পোস্টার তৈরি করুন →"}
        </Button>
      </form>
    </FormProvider>
  );
}
