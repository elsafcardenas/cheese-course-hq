import { redirect } from "next/navigation";
import { isLive } from "@/lib/supabase";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!isLive()) redirect("/");
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-8">
        <p className="eyebrow">The Cheese Course</p>
        <h1 className="mt-1 font-display text-4xl leading-none">HQ</h1>
        <p className="mt-3 text-muted">Sign in with your email. We&apos;ll send you a link; no password needed.</p>
        <LoginForm
          url={process.env.NEXT_PUBLIC_SUPABASE_URL!}
          anon={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
          initialError={error ?? null}
        />
      </div>
    </main>
  );
}
