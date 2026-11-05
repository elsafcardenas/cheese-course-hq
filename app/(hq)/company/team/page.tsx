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
        Who can sign in and what they can do. Invites arrive by email; no passwords.
      </PageHeader>
      <TeamView people={people} meId={user!.id} live={repo.mode === "live"} />
    </>
  );
}
