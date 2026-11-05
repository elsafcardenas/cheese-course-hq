import { cookies } from "next/headers";
import { BASICS, FAQ, PAGES, ROLES } from "@/data/help";
import { Icon } from "@/components/Icon";
import { helpAnchor, PageHeader, Section } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { itemFor, groupFor } from "@/lib/nav";
import { pageUser } from "@/lib/page";
import { appUrl } from "@/lib/integrations/registry";

export default async function HelpPage() {
  const { user, ws } = await pageUser("/help");
  const es = (await cookies()).get("lang")?.value === "es";
  const L = (x: { en: string; es: string }) => (es ? x.es : x.en);
  const mine = ROLES[{ admin: 0, viewer: 1, ops_manager: 2, editor: 3, store_manager: 4 }[user.role]];
  const visible = PAGES.filter((p) => p.href === "/" || itemFor(p.href, ws) || itemFor(p.href, ws === "miami" ? "spain" : "miami"));
  const link = appUrl();

  return (
    <div data-no-translate>
      <PageHeader href="/help" title={es ? "Cómo usar HQ" : "How to use HQ"}>
        {es ? "Todo lo que necesitas para empezar. Puedes mandar esta página a cualquiera del equipo." : "Everything you need to get going. You can send this page to anyone on the team."}
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Section title={es ? `Para ti: ${L(mine.who)}` : `For you: ${L(mine.who)}`} sub={L(mine.does)} icon="star" tone="--dept-customers">
            <ol className="space-y-3 p-4">
              {mine.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-accent-ink">{i + 1}</span>
                  <span className="pt-0.5 text-[14px] leading-relaxed">{L(s)}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section title={es ? "Lo básico" : "The basics"} icon="book" tone="--dept-home">
            <div className="grid gap-px bg-line sm:grid-cols-2">
              {BASICS.map((b) => (
                <div key={b.title.en} className="bg-surface p-4">
                  <h3 className="font-bold">{L(b.title)}</h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{L(b.body)}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title={es ? "Página por página" : "Page by page"} icon="list" tone="--dept-company">
            <ul>
              {visible.map((p) => {
                const g = groupFor(p.href, ws);
                const it = itemFor(p.href, ws) ?? itemFor(p.href, ws === "miami" ? "spain" : "miami");
                return (
                  <li key={p.href} id={helpAnchor(p.href)} className="flex scroll-mt-6 gap-3 border-b border-line px-4 py-3.5 last:border-0 target:bg-accent/[0.06]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `rgb(var(${g.tone}) / 0.14)`, color: `rgb(var(${g.tone}))` }}>
                      <Icon name={it?.icon ?? "home"} size={16} />
                    </span>
                    <div>
                      <a href={p.href} className="font-bold hover:text-accent">
                        {L(p.title)}
                      </a>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{L(p.body)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title={es ? "Preguntas frecuentes" : "Questions"} icon="help" tone="--dept-company">
            <div className="divide-y divide-line">
              {FAQ.map((f) => (
                <details key={f.q.en} className="group px-4 py-3">
                  <summary className="cursor-pointer font-semibold">{L(f.q)}</summary>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{L(f.a)}</p>
                </details>
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-4">
            <h3 className="font-bold">{es ? "Invitar a alguien" : "Inviting someone"}</h3>
            <p className="mt-1 text-[13px] text-muted">
              {es
                ? "Elsa los añade en Team & access con su rol. Les llega un email para entrar. Luego mándales este enlace:"
                : "Elsa adds them in Team & access with their role. They get an email to sign in. Then send them this link:"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-sunk px-2 py-1 font-mono text-[12px]">{link}/help</code>
              <CopyButton text={`${link}/help`} label="" className="btn-ghost" />
            </div>
          </div>
          <div className="card p-4">
            <h3 className="font-bold">{es ? "Roles" : "Roles"}</h3>
            <ul className="mt-2 space-y-2.5">
              {ROLES.map((r) => (
                <li key={r.who.en}>
                  <div className="text-[13px] font-semibold">{L(r.who)}</div>
                  <div className="text-[12.5px] text-muted">{L(r.does)}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4 text-[13px] text-muted">
            <kbd className="rounded border border-line bg-sunk px-1.5 font-mono text-[11px]">⌘K</kbd> {es ? "busca cualquier cosa desde cualquier página." : "searches anything from any page."}
          </div>
        </aside>
      </div>
    </div>
  );
}
