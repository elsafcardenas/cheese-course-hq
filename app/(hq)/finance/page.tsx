import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, writeFlags } from "@/lib/records-server";
import { todayISO } from "@/lib/ui";
import { FinanceView } from "./FinanceView";

export default async function FinancePage() {
  const { repo, user } = await pageUser("/finance");
  const r = await loadMany(repo, user, ["expenses", "budget_lines", "sales_monthly"]);
  const [annual, square] = await Promise.all([repo.sales(), repo.metrics("square")]);
  return (
    <>
      <PageHeader href="/finance" title="Finance">
        Miami sales, spending against budget, and a simple monthly profit and loss.
      </PageHeader>
      <FinanceView {...r} annual={annual} squareDaily={square.filter((m) => m.metric === "net_sales")} today={todayISO()} can={writeFlags(user, ["expenses", "budget_lines", "sales_monthly"])} />
    </>
  );
}
