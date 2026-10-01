import Image from "next/image";
import Link from "next/link";
import type { Template } from "@/types/models";
import { occasionLabels } from "@/lib/constants";
export function TemplateCard({ template }: { template: Template }) {
  return (
    <article className="template-card">
      <div className="template-preview">
        <Image
          src={template.thumbnailUrl}
          alt={template.title}
          width={800}
          height={1000}
          unoptimized
        />
        <span className="photo-count">
          {template.layoutConfig.photoSlots.length}টি ছবির স্থান
        </span>
      </div>
      <div className="template-meta">
        <span className="eyebrow">{occasionLabels[template.occasionType]}</span>
        <h3>{template.title}</h3>
        <Link href={"/posters/new?templateId=" + template._id}>
          টেমপ্লেট দেখুন <span>↗</span>
        </Link>
      </div>
    </article>
  );
}
