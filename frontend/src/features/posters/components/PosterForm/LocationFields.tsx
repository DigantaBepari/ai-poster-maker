import { FormField } from "./FormField";
export function LocationFields() {
  return (
    <fieldset>
      <legend>আপনার এলাকা</legend>
      <div className="form-grid">
        <FormField name="union" label="ইউনিয়ন / ওয়ার্ড" />
        <FormField name="thana" label="থানা / উপজেলা" />
      </div>
      <FormField name="district" label="জেলা" />
    </fieldset>
  );
}
