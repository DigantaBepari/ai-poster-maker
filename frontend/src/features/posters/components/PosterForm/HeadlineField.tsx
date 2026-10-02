"use client";
import { useFormContext, useWatch } from "react-hook-form";
import type { PosterFields } from "../../poster.schema";
import { FormField } from "./FormField";
export function HeadlineField() {
  const { control, register } = useFormContext<PosterFields>();
  const headline = useWatch({ control, name: "headline" });
  return (
    <fieldset>
      <legend>আপনার বার্তা</legend>
      <FormField name="headline" label="বাংলা শিরোনাম" multiline />
      <small className="muted">
        {headline?.length ?? 0} / ৫০০ অক্ষর · আপনার লেখা হুবহু থাকবে
      </small>
      <label className="field">
        <span>রঙের পছন্দ</span>
        <select {...register("paletteHint")}>
          <option value="template">টেমপ্লেটের রঙ</option>
          <option value="green-red">সবুজ ও লাল</option>
          <option value="navy-gold">নীল ও সোনালি</option>
          <option value="monochrome">সাদা ও কালো</option>
        </select>
      </label>
    </fieldset>
  );
}
