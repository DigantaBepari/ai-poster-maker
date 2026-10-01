import type { Template } from "@/types/models";
import { TemplateCard } from "./TemplateCard";
export function TemplateGrid({ templates }: { templates: Template[] }) {
  return (
    <div className="template-grid">
      {templates.map((t) => (
        <TemplateCard key={t._id} template={t} />
      ))}
    </div>
  );
}
