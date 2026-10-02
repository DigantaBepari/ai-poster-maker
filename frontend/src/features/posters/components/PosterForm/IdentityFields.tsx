import { FormField } from "./FormField";
export function IdentityFields() {
  return (
    <fieldset>
      <legend>আপনার পরিচয়</legend>
      <FormField name="name" label="নাম" />
      <div className="form-grid">
        <FormField name="designation" label="পদবি" />
        <FormField name="party" label="দল / সংগঠন" />
      </div>
    </fieldset>
  );
}
