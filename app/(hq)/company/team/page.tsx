import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { TeamView } from "./TeamView";

export default async function TeamPage() {
  const repo = getRepo();
  const user = await repo.me();
  if (!can(user, "manage:team")) redirect("/");
  const people = await repo.profiles();
  return (
    <>
      <PageHeader href="/company/team" title="Team">
        Everyone who can use HQ: their name, whether they're active, what they can change and which pages they can open.
      </PageHeader>
      <TeamView people={people} meId={user!.id} live={repo.mode === "live"} />
    </>
  );
}
