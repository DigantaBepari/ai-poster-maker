"use client";
import { useState, type FormEvent } from "react";
import type { Template } from "@/types/models";
import { occasionLabels } from "@/lib/constants";
import { saveTemplate } from "./admin.api";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
const defaultLayout = {
  canvas: { width: 800, height: 1000 },
  photoSlots: [{ x: 250, y: 340, w: 300, h: 300, shape: "circle" }],
  textSlots: [
    {
      key: "headline",
      x: 60,
      y: 220,
      w: 680,
      fontSize: 60,
      fontFamily: "Hind Siliguri",
      color: "#ffffff",
      align: "center",
    },
    {
      key: "name",
      x: 60,
      y: 885,
      w: 680,
      fontSize: 40,
      fontFamily: "Noto Sans Bengali",
      color: "#ffffff",
      align: "center",
    },
  ],
  colorScheme: {
    primary: "#0b6b3a",
    secondary: "#d6212a",
    accent: "#f2c94c",
    background: "#06402a",
    footerBg: "#d6212a",
  },
  decorations: [
    { type: "border", x: 18, y: 18, w: 764, h: 964, color: "#f2c94c" },
    { type: "footer", x: 30, y: 830, w: 740, h: 140, color: "#d6212a" },
  ],
};
export function TemplateEditor({
  template,
  onSaved,
  onCancel,
}: {
  template?: Template;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const layoutConfig = JSON.parse(
        String(f.get("layout")),
      ) as Template["layoutConfig"];
      await saveTemplate(
        {
          title: String(f.get("title")),
          occasionType: String(f.get("occasion")) as Template["occasionType"],
          thumbnailUrl: String(f.get("thumbnail")),
          layoutConfig,
          isActive: f.get("active") === "on",
        },
        template?._id,
      );
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "সংরক্ষণ করা যায়নি।");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="admin-editor" onSubmit={submit}>
      <h2>{template ? "টেমপ্লেট সম্পাদনা" : "নতুন টেমপ্লেট"}</h2>
      <label className="field">
        <span>শিরোনাম</span>
        <input
          name="title"
          defaultValue={template?.title}
          required
          maxLength={150}
        />
      </label>
      <label className="field">
        <span>উপলক্ষ</span>
        <select name="occasion" defaultValue={template?.occasionType}>
          {Object.entries(occasionLabels).map(([v, l]) => (
            <option value={v} key={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>থাম্বনেইল লিংক</span>
        <input
          name="thumbnail"
          defaultValue={template?.thumbnailUrl ?? "/templates/victory-day.svg"}
          required
        />
      </label>
      <label className="field">
        <span>লেআউট (JSON)</span>
        <textarea
          name="layout"
          rows={15}
          defaultValue={JSON.stringify(
            template?.layoutConfig ?? defaultLayout,
            null,
            2,
          )}
          required
          spellCheck={false}
        />
      </label>
      <label className="consent">
        <input
          type="checkbox"
          name="active"
          defaultChecked={template?.isActive ?? true}
        />
        সক্রিয় টেমপ্লেট
      </label>
      {error && <Toast message={error} />}
      <div className="download-buttons">
        <Button disabled={busy} type="submit">
          {busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করুন"}
        </Button>
        <Button
          disabled={busy}
          type="button"
          className="secondary"
          onClick={onCancel}
        >
          বাতিল
        </Button>
      </div>
    </form>
  );
}
