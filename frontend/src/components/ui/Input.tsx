import { useId, type InputHTMLAttributes } from "react";
export function Input({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const generated = useId();
  return (
    <label htmlFor={id ?? generated} className="field">
      <span>{label}</span>
      <input id={id ?? generated} {...props} />
    </label>
  );
}
