"use client";
import { useState } from "react";
import type { Template } from "@/types/models";
import { getAdminTemplates, toggleTemplate } from "@/features/admin/admin.api";
import { useAdminList } from "@/features/admin/useAdminList";
import { TemplateEditor } from "@/features/admin/TemplateEditor";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
export default function Page() {
  const { items, loading, error, refresh } = useAdminList(getAdminTemplates);
  const [editing, setEditing] = useState<Template | null | undefined>(),
    [actionError, setActionError] = useState(""),
    [busy, setBusy] = useState("");
  async function toggle(t: Template) {
    setBusy(t._id);
    setActionError("");
    try {
      await toggleTemplate(t._id, !t.isActive);
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "পরিবর্তন করা যায়নি।");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="page-heading">
        <h1>টেমপ্লেট ব্যবস্থাপনা</h1>
        <Button onClick={() => setEditing(null)}>＋ নতুন টেমপ্লেট</Button>
      </div>
      {editing !== undefined && (
        <TemplateEditor
          key={editing?._id ?? "new"}
          template={editing ?? undefined}
          onCancel={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refresh();
          }}
        />
      )}
      {(error || actionError) && <Toast message={error || actionError} />}{" "}
      {loading ? (
        <Spinner />
      ) : items.length ? (
        <div className="admin-list">
          {items.map((t) => (
            <article className="admin-row" key={t._id}>
              <div>
                <h3>{t.title}</h3>
                <span className="small">
                  {t.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </span>
              </div>
              <div className="download-buttons">
                <Button className="secondary" onClick={() => setEditing(t)}>
                  সম্পাদনা
                </Button>
                <Button disabled={!!busy} onClick={() => toggle(t)}>
                  {t.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="টেমপ্লেট নেই"
          description="নতুন একটি টেমপ্লেট যোগ করুন।"
        />
      )}
    </>
  );
}
