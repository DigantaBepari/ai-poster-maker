"use client";
import { useFormContext } from "react-hook-form";
import type { PosterFields } from "../../poster.schema";
export function ConsentCheckbox() {
  const {
    register,
    formState: { errors },
  } = useFormContext<PosterFields>();
  return (
    <div>
      <label className="consent">
        <input type="checkbox" {...register("photoConsent")} />
        <span>এই ছবিগুলো ব্যবহারের অনুমতি আমার আছে</span>
      </label>
      {errors.photoConsent && (
        <small className="field-error">{errors.photoConsent.message}</small>
      )}
    </div>
  );
}
