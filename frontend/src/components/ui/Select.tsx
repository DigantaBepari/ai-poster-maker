import { useId, type SelectHTMLAttributes } from "react";
export function Select({
  label,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const generated = useId();
  return (
    <label htmlFor={id ?? generated} className="field">
      <span>{label}</span>
      <select id={id ?? generated} {...props}>
        {children}
      </select>
    </label>
  );
}
