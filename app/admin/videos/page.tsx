import { notFound } from "next/navigation";
import { getSession } from "@/app/lib/cookies";
import { isAdmin } from "@/app/lib/auth";
import AdminVideoList from "./videolist";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const sess = getSession();
  if (!sess?.email || !isAdmin(sess.email)) notFound();

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8">
      <h1 className="text-2xl font-semibold">VdoCipher videos</h1>
      <p className="text-sm text-neutral-600 mt-1">
        Admin‑only. Click an ID to copy, or copy a full embed snippet.
      </p>
      <div className="mt-6">
        <AdminVideoList />
      </div>
    </div>
  );
}
