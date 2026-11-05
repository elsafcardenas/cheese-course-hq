import { signOut } from "@/app/actions";
import { Sidebar } from "@/components/Sidebar";
import { NAV_FOR_ROLE, visibleToUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { todayISO } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function HqLayout({ children }: { children: React.ReactNode }) {
  const repo = getRepo();
  const user = await repo.me();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md p-8">
          <p className="eyebrow">The Cheese Course HQ</p>
          <h1 className="mt-1 font-display text-3xl">Almost there</h1>
          <p className="mt-3 text-muted">
            You&apos;re signed in, but you haven&apos;t been given a role yet. Ask Elsa to add you on the Team tab, then sign in again.
          </p>
          <form action={signOut} className="mt-5">
            <button className="btn">Sign out</button>
          </form>
        </div>
      </main>
    );
  }

  const [tasks, decisions, people] = await Promise.all([repo.list("tasks"), repo.list("decisions"), repo.profiles()]);
  const today = todayISO();
  const mine = visibleToUser(user, tasks);
  const overdue = mine.filter((t) => t.deadline && t.deadline < today && t.status !== "Done" && t.status !== "Cancelled").length;
  const needsDad = decisions.filter((d) => d.status === "Needs Ricardo").length;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        allowed={NAV_FOR_ROLE[user.role]}
        user={user}
        mode={repo.mode}
        people={people}
        badges={{ "/tasks": overdue, "/decisions": needsDad }}
      />
      <div className="min-w-0 flex-1">
        {repo.mode === "demo" && (
          <div className="border-b border-line bg-rind/10 px-6 py-2 text-[12.5px] text-rind">
            <b>Demo mode.</b> Running on a copy of your Notion data; changes reset when the server restarts. Connect Supabase to
            save for real (see the README).
          </div>
        )}
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
