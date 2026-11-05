"use client";

import { Check, Pause, Pencil, Play, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { removeMember, saveMember } from "@/app/actions";
import { Drawer, Field } from "@/components/Drawer";
import { Icon, IconTile } from "@/components/Icon";
import { Note, Pill } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { ROLE_HELP } from "@/lib/auth";
import { accessKey, grantable, roleDefaults, roleWorkspaces, WORKSPACES, WS_LABEL, type Workspace } from "@/lib/nav";
import { ROLES, type Profile, type Role } from "@/lib/types";

const LEVEL: Record<Role, { name: string; icon: string; tone: string }> = {
  admin: { name: "Admin", icon: "user-cog", tone: "--dept-company" },
  editor: { name: "Editor", icon: "wand", tone: "--dept-marketing" },
  viewer: { name: "Viewer", icon: "eye", tone: "--dept-finance" },
  store_manager: { name: "Store manager", icon: "store", tone: "--dept-ops" },
};

type Draft = {
  id?: string;
  email: string;
  name: string;
  title: string;
  status: "active" | "paused";
  role: Role;
  store: "Weston" | "Pinecrest" | null;
  workspaces: Workspace[];
  access: string[];
};

const defaultsFor = (role: Role, sides: Workspace[]) => sides.flatMap((ws) => roleDefaults(role, ws));
const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

function toDraft(p: Profile): Draft {
  const sides = p.workspaces?.length ? p.workspaces : roleWorkspaces(p.role);
  return {
    id: p.id,
    email: p.email,
    name: p.name,
    title: p.title ?? "",
    status: p.status ?? "active",
    role: p.role,
    store: p.store,
    workspaces: [...sides],
    access: p.access ?? defaultsFor(p.role, sides),
  };
}

const blank = (): Draft => ({ email: "", name: "", title: "", status: "active", role: "editor", store: null, workspaces: roleWorkspaces("editor"), access: defaultsFor("editor", roleWorkspaces("editor")) });

/** How many pages someone can open, counting Home and the guide on each side. */
function pageCount(p: Profile) {
  if (p.role === "admin") return null;
  const sides = p.workspaces?.length ? p.workspaces : roleWorkspaces(p.role);
  const list = p.access ?? defaultsFor(p.role, sides);
  return list.filter((k) => sides.some((s) => k.startsWith(`${s}:`))).length;
}

export function TeamView({ people, meId, live }: { people: Profile[]; meId: string; live: boolean }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const sorted = [...people].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13.5px] text-muted">Click anyone to change their name, status or what they can open.</p>
        <button className="btn-primary" onClick={() => setDraft(blank())}>
          <UserPlus size={16} /> Add a person
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((p) => {
          const paused = p.status === "paused";
          const sides = p.role === "admin" ? (["miami", "spain"] as Workspace[]) : p.workspaces?.length ? p.workspaces : roleWorkspaces(p.role);
          const n = pageCount(p);
          return (
            <button
              key={p.id}
              onClick={() => setDraft(toDraft(p))}
              className={`card group flex flex-col gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift ${paused ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[16px] font-bold text-surface">{p.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 font-bold" data-no-translate>
                    <span className="truncate">{p.name}</span>
                    {p.id === meId && <Pill className="bg-accent/10 text-accent">You</Pill>}
                  </div>
                  <div className="truncate text-[12.5px] text-muted">{p.title || "No job title yet"}</div>
                  <div className="truncate text-[12px] text-muted" data-no-translate>
                    {p.email}
                  </div>
                </div>
                <Pencil size={15} className="mt-1 text-muted opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Pill className={paused ? "bg-sunk text-muted" : "bg-good/10 text-good"}>{paused ? "Paused" : "Active"}</Pill>
                <Pill style={{ background: `rgb(var(${LEVEL[p.role].tone}) / 0.12)`, color: `rgb(var(${LEVEL[p.role].tone}))` }}>{LEVEL[p.role].name}</Pill>
                {p.role === "store_manager" && p.store && <Pill className="bg-sunk text-muted">{p.store}</Pill>}
                <span className="ml-auto text-[13px]" title={sides.map((s) => WS_LABEL[s].name).join(" + ")}>
                  {sides.map((s) => WS_LABEL[s].flag).join(" ")}
                </span>
              </div>
              <div className="border-t border-line pt-2.5 text-[12.5px] text-muted">{n == null ? "Opens everything" : `Opens ${n} page${n === 1 ? "" : "s"} plus Home and Help`}</div>
            </button>
          );
        })}
      </div>

      {!live && (
        <Note>
          Preview mode: to check what someone sees, use <b>Preview as</b> at the bottom of the sidebar. Once the database is connected, adding a person sends them a sign-in email.
        </Note>
      )}

      {draft && <MemberDrawer key={draft.id ?? "new"} initial={draft} isMe={draft.id === meId} live={live} onClose={() => setDraft(null)} />}
    </div>
  );
}

function MemberDrawer({ initial, isMe, live, onClose }: { initial: Draft; isMe: boolean; live: boolean; onClose: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [reset, setReset] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const save = useRun();
  const remove = useRun();
  const isNew = !d.id;
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const defaults = useMemo(() => defaultsFor(d.role, d.workspaces), [d.role, d.workspaces]);
  const custom = !sameSet(d.access.filter((k) => d.workspaces.some((s) => k.startsWith(`${s}:`))), defaults);

  const pickRole = (role: Role) => {
    const sides = roleWorkspaces(role);
    set({ role, workspaces: sides, access: defaultsFor(role, sides), store: role === "store_manager" ? d.store ?? "Weston" : null });
    setReset(role !== d.role);
  };
  const toggleSide = (ws: Workspace) => {
    const on = d.workspaces.includes(ws);
    const workspaces = on ? d.workspaces.filter((w) => w !== ws) : WORKSPACES.filter((w) => w === ws || d.workspaces.includes(w));
    // Switching a side on starts with that level's usual pages there.
    const access = on ? d.access.filter((k) => !k.startsWith(`${ws}:`)) : [...d.access.filter((k) => !k.startsWith(`${ws}:`)), ...roleDefaults(d.role, ws)];
    set({ workspaces, access });
  };
  const togglePage = (key: string) => set({ access: d.access.includes(key) ? d.access.filter((k) => k !== key) : [...d.access, key] });
  const toggleArea = (keys: string[]) => {
    const allOn = keys.every((k) => d.access.includes(k));
    set({ access: allOn ? d.access.filter((k) => !keys.includes(k)) : [...new Set([...d.access, ...keys])] });
  };

  const submit = () => {
    const sidesDefault = sameSet(d.workspaces, roleWorkspaces(d.role));
    const access = d.access.filter((k) => d.workspaces.some((s) => k.startsWith(`${s}:`)));
    save.run(
      () =>
        saveMember({
          id: d.id,
          email: d.email,
          name: d.name,
          title: d.title,
          status: d.status,
          role: d.role,
          store: d.store,
          workspaces: sidesDefault ? null : d.workspaces,
          access: sameSet(access, defaults) ? null : access,
        }),
      onClose,
    );
  };

  return (
    <Drawer
      open
      wide
      onClose={onClose}
      title={isNew ? "Add a person" : `Edit ${initial.name}`}
      footer={
        <>
          {!isNew && !isMe ? (
            confirmRemove ? (
              <span className="flex items-center gap-2 text-[13px]">
                Remove {initial.name}?
                <button className="btn border-bad/40 text-bad" disabled={remove.pending} onClick={() => remove.run(() => removeMember(d.id!), onClose)}>
                  Yes, remove
                </button>
                <button className="btn-ghost" onClick={() => setConfirmRemove(false)}>
                  No
                </button>
              </span>
            ) : (
              <button className="btn-ghost text-bad" onClick={() => setConfirmRemove(true)}>
                <Trash2 size={15} /> Remove from team
              </button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" disabled={save.pending || !d.name.trim() || (isNew && !d.email.trim())} onClick={submit}>
              <Check size={16} /> {isNew ? (live ? "Add and send invite" : "Add person") : "Save changes"}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {(save.error || remove.error) && <Note tone="bad">{save.error || remove.error}</Note>}

        <Step n={1} title="Who are they?">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input className="input" value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="Luis" autoFocus={isNew} />
            </Field>
            <Field label="Job title">
              <input className="input" value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="Designer, Owner, Store manager…" />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              {isNew ? (
                <input type="email" className="input" value={d.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@example.com" />
              ) : (
                <div className="input bg-sunk text-muted" data-no-translate>
                  {d.email}
                </div>
              )}
            </Field>
          </div>
        </Step>

        <Step n={2} title="Status">
          <div className="grid grid-cols-2 gap-2">
            <Choice on={d.status === "active"} onClick={() => set({ status: "active" })} icon={<Play size={16} />} title="Active" sub="Can sign in and use HQ" />
            <Choice on={d.status === "paused"} disabled={isMe} onClick={() => set({ status: "paused" })} icon={<Pause size={16} />} title="Paused" sub="Can't sign in. Nothing is deleted." />
          </div>
        </Step>

        <Step n={3} title="What can they change?">
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLES.map((r) => (
              <Choice
                key={r}
                on={d.role === r}
                disabled={isMe && r !== "admin"}
                onClick={() => pickRole(r)}
                icon={<IconTile name={LEVEL[r].icon} tone={LEVEL[r].tone} size={30} />}
                title={LEVEL[r].name}
                sub={ROLE_HELP[r]}
              />
            ))}
          </div>
          {d.role === "store_manager" && (
            <div className="mt-3">
              <span className="label">Which store?</span>
              <div className="grid grid-cols-2 gap-2">
                {(["Weston", "Pinecrest"] as const).map((s) => (
                  <Choice key={s} on={d.store === s} onClick={() => set({ store: s })} icon={<Icon name="store" size={16} />} title={s} />
                ))}
              </div>
            </div>
          )}
          {reset && <p className="mt-2 text-[12.5px] text-muted">The pages below were set to the usual ones for this level. Change them if you like.</p>}
        </Step>

        {d.role === "admin" ? (
          <Note tone="good">Admins can open everything on both sides, including this Team page.</Note>
        ) : (
          <>
            <Step n={4} title="Which side do they work on?">
              <div className="grid grid-cols-2 gap-2">
                {WORKSPACES.map((ws) => (
                  <Choice key={ws} on={d.workspaces.includes(ws)} onClick={() => toggleSide(ws)} icon={<span className="text-[18px]">{WS_LABEL[ws].flag}</span>} title={WS_LABEL[ws].name} sub={WS_LABEL[ws].sub} check />
                ))}
              </div>
            </Step>

            <Step
              n={5}
              title="What can they open?"
              action={
                custom && (
                  <button className="btn-ghost text-[12.5px]" onClick={() => set({ access: defaults })}>
                    <RotateCcw size={13} /> Back to usual
                  </button>
                )
              }
            >
              <p className="mb-3 text-[12.5px] text-muted">
                Tap to switch pages on or off. Home and Help are always on. If you give someone a page beyond their level, they can look at it but not change it.
              </p>
              {d.workspaces.length === 0 && <Note tone="warn">Tick Miami, Spain or both above.</Note>}
              <div className="space-y-4">
                {d.workspaces.map((ws) => (
                  <div key={ws}>
                    {d.workspaces.length > 1 && (
                      <div className="mb-2 text-[12px] font-bold uppercase tracking-wide text-muted">
                        {WS_LABEL[ws].flag} {WS_LABEL[ws].name}
                      </div>
                    )}
                    <div className="divide-y divide-line rounded-card border border-line">
                      {grantable(ws).map((g) => {
                        const keys = g.items.map((i) => accessKey(ws, i.href));
                        const onCount = keys.filter((k) => d.access.includes(k)).length;
                        return (
                          <div key={g.id} className="px-3 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <IconTile name={g.icon} tone={g.tone} size={28} />
                              <span className="flex-1 text-[13.5px] font-bold">{g.label}</span>
                              <Switch on={onCount === keys.length} some={onCount > 0 && onCount < keys.length} onClick={() => toggleArea(keys)} label={`All of ${g.label}`} />
                            </div>
                            {g.items.length > 1 && (
                              <div className="mt-2 flex flex-wrap gap-1.5 pl-[38px]">
                                {g.items.map((i) => {
                                  const k = accessKey(ws, i.href);
                                  const on = d.access.includes(k);
                                  return (
                                    <button
                                      key={k}
                                      onClick={() => togglePage(k)}
                                      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12.5px] font-semibold transition ${on ? "border-ink bg-ink text-surface" : "border-line text-muted hover:border-ink/30"}`}
                                    >
                                      {on && <Check size={12} strokeWidth={3} />}
                                      {i.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Step>
          </>
        )}
      </div>
    </Drawer>
  );
}

function Step({ n, title, children, action }: { n: number; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-surface">{n}</span>
        <h3 className="flex-1 text-[15px] font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Choice({ on, onClick, icon, title, sub, disabled, check }: { on: boolean; onClick: () => void; icon: React.ReactNode; title: string; sub?: string; disabled?: boolean; check?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${on ? "border-ink bg-sunk ring-1 ring-ink" : "border-line hover:border-ink/30"}`}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-bold">{title}</span>
        {sub && <span className="mt-0.5 block text-[12px] leading-snug text-muted">{sub}</span>}
      </span>
      {(check || on) && (
        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${on ? "border-ink bg-ink text-surface" : "border-line"}`}>{on && <Check size={12} strokeWidth={3} />}</span>
      )}
    </button>
  );
}

function Switch({ on, some, onClick, label }: { on: boolean; some?: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onClick} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-ink" : some ? "bg-ink/40" : "bg-line"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all ${on ? "left-[22px]" : some ? "left-[12px]" : "left-0.5"}`} />
    </button>
  );
}
