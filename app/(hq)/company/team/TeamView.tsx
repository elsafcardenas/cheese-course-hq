"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";
import { inviteMember, updateMember } from "@/app/actions";
import { Field } from "@/components/Drawer";
import { Note, Pill, Section } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { ROLE_HELP, ROLE_LABEL } from "@/lib/auth";
import { ROLES, type Profile, type Role } from "@/lib/types";

export function TeamView({ people, meId, live }: { people: Profile[]; meId: string; live: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [store, setStore] = useState<"Weston" | "Pinecrest">("Weston");
  const invite = useRun();
  const edit = useRun();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Section title="People">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="th">Name</th>
              <th className="th">Role</th>
              <th className="th">Store</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.id}>
                <td className="td">
                  <div className="font-medium">
                    {p.name} {p.id === meId && <Pill className="ml-1 bg-accent/10 text-accent">You</Pill>}
                  </div>
                  <div className="text-[12px] text-muted">{p.email}</div>
                </td>
                <td className="td">
                  <select
                    className="input w-auto"
                    value={p.role}
                    disabled={p.id === meId || edit.pending}
                    onChange={(e) => edit.run(() => updateMember(p.id, { role: e.target.value, store: e.target.value === "store_manager" ? p.store ?? "Weston" : null }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABEL[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="td">
                  {p.role === "store_manager" ? (
                    <select className="input w-auto" value={p.store ?? "Weston"} disabled={edit.pending} onChange={(e) => edit.run(() => updateMember(p.id, { role: p.role, store: e.target.value }))}>
                      <option>Weston</option>
                      <option>Pinecrest</option>
                    </select>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {edit.error && <p className="px-4 py-2 text-[12.5px] text-bad">{edit.error}</p>}
      </Section>

      <div className="space-y-4">
        <div className="card space-y-3 p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <UserPlus size={16} /> Invite someone
          </h3>
          <Field label="Name">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Luis" />
          </Field>
          <Field label="Email">
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </Field>
          <Field label="Role">
            <select className="input" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </Field>
          <p className="text-[12.5px] text-muted">{ROLE_HELP[role]}</p>
          {role === "store_manager" && (
            <Field label="Store">
              <select className="input" value={store} onChange={(e) => setStore(e.target.value as typeof store)}>
                <option>Weston</option>
                <option>Pinecrest</option>
              </select>
            </Field>
          )}
          <button
            className="btn-primary w-full justify-center"
            disabled={invite.pending || !email || !name}
            onClick={() =>
              invite.run(
                () => inviteMember({ email, name, role, store: role === "store_manager" ? store : null }),
                () => {
                  setEmail("");
                  setName("");
                },
              )
            }
          >
            {live ? "Send invite" : "Add (demo)"}
          </button>
          {invite.error && <p className="text-[12.5px] text-bad">{invite.error}</p>}
          {!live && <Note>In demo mode this only adds them to the list. Once Supabase is connected it sends a real sign-in email.</Note>}
        </div>

        <Section title="What each role can do">
          <ul>
            {ROLES.map((r) => (
              <li key={r} className="border-b border-line px-4 py-2.5 last:border-0">
                <div className="font-medium">{ROLE_LABEL[r]}</div>
                <div className="text-[12.5px] text-muted">{ROLE_HELP[r]}</div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
