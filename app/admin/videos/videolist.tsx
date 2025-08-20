"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  title: string;
  duration?: number | null;
  createdAt?: string | null;
};

export default function AdminVideoList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/vdocipher-videos", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch");
        setItems(data.items || []);
      } catch (e: any) {
        setErr(e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copy = (text: string) => navigator.clipboard.writeText(text);

  const rows = useMemo(() => items, [items]);

  if (loading) return <div className="text-sm text-neutral-600">Loading…</div>;
  if (err) return <div className="text-sm text-red-600">Error: {err}</div>;
  if (!rows.length) return <div className="text-sm text-neutral-600">No videos found.</div>;

  return (
    <div className="border border-neutral-200 rounded-sm overflow-hidden">
      <div className="grid grid-cols-[220px_1fr_160px_160px_180px] bg-neutral-50 text-xs font-medium text-neutral-700 px-4 py-2">
        <div>Video ID</div>
        <div>Title</div>
        <div>Duration</div>
        <div>Created</div>
        <div>Embed / Copy</div>
      </div>

      <div className="divide-y divide-neutral-200">
        {rows.map((r) => {
          const embed = `<iframe src="https://player.vdocipher.com/v2/?otp=YOUR_OTP&playbackInfo=YOUR_PLAYBACK_INFO" allow="encrypted-media" allowfullscreen style="border:0" width="720" height="405"></iframe>`;
          return (
            <div key={r.id} className="grid grid-cols-[220px_1fr_160px_160px_180px] px-4 py-3 items-center text-sm">
              <button
                className="font-mono text-[12px] text-blue-700 underline underline-offset-2 text-left"
                onClick={() => copy(r.id)}
                title="Click to copy ID"
              >
                {r.id}
              </button>
              <div className="truncate pr-3">{r.title}</div>
              <div className="text-neutral-600">{r.duration ?? "—"}</div>
              <div className="text-neutral-600">{r.createdAt ?? "—"}</div>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 border border-neutral-300 text-xs rounded-sm"
                  onClick={() => copy(r.id)}
                >
                  Copy ID
                </button>
                <button
                  className="px-2 py-1 border border-neutral-300 text-xs rounded-sm"
                  onClick={() => copy(embed)}
                  title="Copies a generic player snippet. Use your OTP endpoint to get OTP + playbackInfo at runtime."
                >
                  Copy embed
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
