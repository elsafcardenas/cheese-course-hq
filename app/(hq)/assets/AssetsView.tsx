"use client";

import { ExternalLink, Film, FolderOpen, Link2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { deleteAsset, saveAssetLink, uploadFootage } from "@/app/actions";
import { Field } from "@/components/Drawer";
import { Empty, Note, Pill, Section } from "@/components/ui";
import { useRun } from "@/components/useRun";
import type { Asset } from "@/lib/types";
import { fmtDate } from "@/lib/ui";

const ICON = { "Drive folder": FolderOpen, Link: Link2, Upload: Film } as const;

export function AssetsView({
  assets,
  links,
  live,
  canEdit,
  canUpload,
  lockedStore,
}: {
  assets: Asset[];
  links: Record<string, string>;
  live: boolean;
  canEdit: boolean;
  canUpload: boolean;
  lockedStore: string | null;
}) {
  const [store, setStore] = useState<string>(lockedStore ?? "Both stores");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const linkRun = useRun();
  const upRun = useRun();
  const delRun = useRun();
  const groups = ["Weston", "Pinecrest", "Both stores", null] as const;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        {groups.map((g) => {
          const rows = assets.filter((a) => a.store === g);
          if (!rows.length) return null;
          return (
            <Section key={g ?? "general"} title={g ?? "General"}>
              <ul>
                {rows.map((a) => {
                  const Icon = ICON[a.kind];
                  const href = links[a.id] ?? (a.url.startsWith("http") ? a.url : null);
                  return (
                    <li key={a.id} className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-0">
                      <Icon size={16} className="mt-0.5 shrink-0 text-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {href ? (
                            <a href={href} target="_blank" rel="noreferrer" className="font-medium hover:text-accent hover:underline">
                              {a.title}
                            </a>
                          ) : (
                            <span className="font-medium">{a.title}</span>
                          )}
                          <Pill>{a.kind}</Pill>
                        </div>
                        {a.notes && <p className="mt-0.5 text-[12.5px] text-muted">{a.notes}</p>}
                        <p className="mt-0.5 text-[11.5px] text-muted">Added {fmtDate(a.createdAt)}</p>
                      </div>
                      {href && (
                        <a href={href} target="_blank" rel="noreferrer" className="btn-ghost" aria-label="Open">
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {canEdit && (
                        <button className="btn-ghost hover:text-bad" onClick={() => confirm("Remove this from the library? (The Drive folder itself is not touched.)") && delRun.run(() => deleteAsset(a.id))} aria-label="Remove">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>
          );
        })}
        {assets.length === 0 && <Empty>Nothing in the library yet.</Empty>}
      </div>

      {(canEdit || canUpload) && (
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card space-y-3 p-4">
            <h3 className="font-semibold">Add footage or a link</h3>
            <Field label="Store">
              <select className="input" value={store} disabled={!!lockedStore} onChange={(e) => setStore(e.target.value)}>
                <option>Weston</option>
                <option>Pinecrest</option>
                {!lockedStore && <option>Both stores</option>}
              </select>
            </Field>
            <Field label="Title">
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weston lunch rush, Nov 12" />
            </Field>
            <Field label="Notes">
              <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What's in it" />
            </Field>

            <div className="border-t border-line pt-3">
              <Field label="Drive or other link">
                <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://drive.google.com/…" />
              </Field>
              <button
                className="btn mt-2 w-full justify-center"
                disabled={linkRun.pending || !url || !title}
                onClick={() =>
                  linkRun.run(
                    () => saveAssetLink({ title, url, store, notes }),
                    () => {
                      setUrl("");
                      setTitle("");
                      setNotes("");
                    },
                  )
                }
              >
                <Link2 size={14} /> Add link
              </button>
              {linkRun.error && <p className="mt-1 text-[12px] text-bad">{linkRun.error}</p>}
            </div>

            <div className="border-t border-line pt-3">
              <span className="label">Upload a file</span>
              {live ? (
                <>
                  <input ref={fileRef} type="file" accept="video/*,image/*" className="block w-full text-[12.5px] file:mr-2 file:rounded file:border-0 file:bg-sunk file:px-2 file:py-1" />
                  <button
                    className="btn-primary mt-2 w-full justify-center"
                    disabled={upRun.pending}
                    onClick={() => {
                      const f = fileRef.current?.files?.[0];
                      if (!f) return upRun.setError("Choose a file first.");
                      const fd = new FormData();
                      fd.set("file", f);
                      fd.set("store", store);
                      fd.set("title", title || f.name);
                      fd.set("notes", notes);
                      upRun.run(
                        () => uploadFootage(fd),
                        () => {
                          if (fileRef.current) fileRef.current.value = "";
                          setTitle("");
                          setNotes("");
                        },
                      );
                    }}
                  >
                    <Upload size={14} /> {upRun.pending ? "Uploading…" : "Upload"}
                  </button>
                  <p className="mt-1 text-[11.5px] text-muted">Up to 50 MB per file. For longer clips, upload to Drive and add the link.</p>
                  {upRun.error && <p className="mt-1 text-[12px] text-bad">{upRun.error}</p>}
                </>
              ) : (
                <Note>Uploads switch on once Supabase is connected. Add a Drive link for now.</Note>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
