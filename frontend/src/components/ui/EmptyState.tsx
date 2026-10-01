import type { ReactNode } from "react";
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">▧</div>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </div>
  );
}
