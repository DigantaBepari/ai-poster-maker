"use client";
import { useFormContext } from "react-hook-form";
import type { PosterFields } from "../../poster.schema";
export function FormField({
  name,
  label,
  multiline = false,
}: {
  name: keyof PosterFields;
  label: string;
  multiline?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<PosterFields>();
  const message = errors[name]?.message;
  return (
    <label className="field" htmlFor={name}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          id={name}
          rows={4}
          maxLength={500}
          {...register(name)}
          aria-invalid={!!message}
          aria-describedby={message ? name + "-error" : undefined}
        />
      ) : (
        <input
          id={name}
          maxLength={200}
          {...register(name)}
          aria-invalid={!!message}
          aria-describedby={message ? name + "-error" : undefined}
        />
      )}{" "}
      {message && (
        <small className="field-error" id={name + "-error"}>
          {String(message)}
        </small>
      )}
    </label>
  );
}
