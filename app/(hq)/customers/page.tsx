import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadFor, lockStoreFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { CustomersView } from "./CustomersView";

export default async function CustomersPage() {
  const { repo, user } = await pageUser("/customers");
  const [reviews, google] = await Promise.all([loadFor(repo, user, "reviews"), repo.metrics("google")]);
  return (
    <>
      <PageHeader href="/customers" title="Reviews & feedback">
        Every review, complaint and compliment in one place: what people say, the rating per store, and what still needs a reply.
      </PageHeader>
      <CustomersView reviews={reviews} google={google} canWrite={canWriteRecords(user.role, "reviews")} lockStore={lockStoreFor(user)} />
    </>
  );
}
