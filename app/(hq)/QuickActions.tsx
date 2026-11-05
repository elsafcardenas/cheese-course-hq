import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { Workspace } from "@/lib/nav";
import type { Role } from "@/lib/types";

type Action = { href: string; icon: string; tone: string; label: string; sub: string };

const A = {
  task: { href: "/company/tasks?new=1", icon: "list", tone: "--dept-company", label: "Add a task", sub: "Something to do, with a date" },
  post: { href: "/marketing/calendar?new=1", icon: "calendar", tone: "--dept-marketing", label: "Plan a post", sub: "Add it to the calendar" },
  review: { href: "/marketing/review?new=1", icon: "check-circle", tone: "--dept-marketing", label: "Upload for review", sub: "A design, video or caption" },
  catering: { href: "/ops/catering?tab=list&new=1", icon: "gift", tone: "--dept-ops", label: "Log a catering order", sub: "Customer, date, what they want" },
  issue: { href: "/ops/maintenance?tab=list&new=1", icon: "wrench", tone: "--dept-ops", label: "Report a problem", sub: "Something broken at a store" },
  feedback: { href: "/customers?tab=all&new=1", icon: "star", tone: "--dept-customers", label: "Log a review", sub: "Or a complaint or compliment" },
  checklist: { href: "/ops/checklists", icon: "list-check", tone: "--dept-ops", label: "Do today's checklist", sub: "Opening or closing" },
  waste: { href: "/ops/inventory?tab=Waste&new=1", icon: "boxes", tone: "--dept-ops", label: "Log waste", sub: "What got thrown away" },
  footage: { href: "/marketing/assets", icon: "film", tone: "--dept-marketing", label: "Upload footage", sub: "Videos from the shoot list" },
  decide: { href: "/company/decisions", icon: "scale", tone: "--dept-company", label: "Answer decisions", sub: "Things waiting on you" },
  forRicardo: { href: "/marketing/calendar", icon: "calendar", tone: "--dept-marketing", label: "See finished posts", sub: "Use the “For Ricardo” filter" },
  numbers: { href: "/finance", icon: "wallet", tone: "--dept-finance", label: "See the numbers", sub: "Sales, spending, budget" },
  milestone: { href: "/madrid?tab=milestones", icon: "flag", tone: "--dept-madrid", label: "Update a milestone", sub: "Mark progress on the opening" },
  contact: { href: "/madrid?tab=contacts&new=1", icon: "users", tone: "--dept-madrid", label: "Add a contact", sub: "Partner, lawyer, architect…" },
  help: { href: "/help", icon: "help", tone: "--dept-company", label: "How to use HQ", sub: "Short guide for your role" },
} satisfies Record<string, Action>;

const FOR: Record<Workspace, Partial<Record<Role, Action[]>>> = {
  miami: {
    admin: [A.task, A.post, A.review, A.catering, A.issue, A.feedback],
    editor: [A.review, A.post, A.task, A.help],
    viewer: [A.decide, A.forRicardo, A.numbers, A.help],
    store_manager: [A.checklist, A.catering, A.issue, A.waste, A.footage, A.help],
  },
  spain: {
    admin: [A.task, A.milestone, A.contact, A.post, A.review, A.help],
    editor: [A.review, A.post, A.task, A.help],
    viewer: [A.decide, A.milestone, A.help],
  },
};

/** Big, plain buttons for the things people do most, so nobody has to hunt through menus. */
export function QuickActions({ role, ws, canOpen }: { role: Role; ws: Workspace; canOpen: string[] }) {
  // Only show buttons for pages this person can actually open (the admin can switch pages off on the Team page).
  const list = (FOR[ws][role] ?? [A.help]).filter((a) => canOpen.includes(a.href.split("?")[0]));
  return (
    <section className="mt-5">
      <h2 className="mb-2.5 text-[13px] font-bold text-muted">What do you want to do?</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {list.map((a) => (
          <Link key={a.href + a.label} href={a.href} className="card group flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-lift">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:scale-105" style={{ background: `rgb(var(${a.tone}) / 0.12)`, color: `rgb(var(${a.tone}))` }}>
              <Icon name={a.icon} size={20} strokeWidth={2.1} />
            </span>
            <span>
              <span className="block text-[14.5px] font-bold leading-tight">{a.label}</span>
              <span className="mt-0.5 block text-[12px] text-muted">{a.sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
