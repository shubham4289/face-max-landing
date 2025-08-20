export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { isAdmin } from '@/app/lib/admin';
import AdminVideoList from './videolist';

export default async function AdminVideosPage() {
  if (!isAdmin()) {
    return <div style={{ padding: 24 }}>Unauthorized</div>;
  }

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
