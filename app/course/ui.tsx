'use client';

import { useEffect, useMemo, useState } from 'react';

type Lecture = {
  id: string;
  title: string;
  order: number;
  videoId: string | null;
  duration: string;
};

type Section = {
  id: string;
  title: string;
  order: number;
  lectures: Lecture[];
};

export default function CourseClient({
  data,
  totalLectures,
}: {
  data: Section[];
  totalLectures: number;
}) {
  // Pick first lecture with a videoId; if none, just first lecture if present
  const firstWithVideo = useMemo(() => {
    for (const s of data) for (const l of s.lectures) if (l.videoId) return l;
    for (const s of data) if (s.lectures[0]) return s.lectures[0];
    return null;
  }, [data]);

  const [active, setActive] = useState<Lecture | null>(firstWithVideo);
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    data.forEach((s, i) => (m[s.id] = i === 0));
    return m;
  });

  const flat = useMemo(() => data.flatMap((s) => s.lectures), [data]);
  const index = useMemo(() => {
    if (!active) return 0;
    const i = flat.findIndex((l) => l.id === active.id);
    return i >= 0 ? i + 1 : 0;
  }, [flat, active]);

  const [loading, setLoading] = useState(false);
  const [playerSrc, setPlayerSrc] = useState<string>('');

  // Load secure VdoCipher player via OTP
  useEffect(() => {
    const load = async () => {
      if (!active?.videoId) {
        setPlayerSrc('');
        return;
      }
      try {
        setLoading(true);
        const res = await fetch('/api/video-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: active.videoId }),
          cache: 'no-store',
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'OTP failed');
        const url = `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(
          json.otp
        )}&playbackInfo=${encodeURIComponent(json.playbackInfo)}`;
        setPlayerSrc(url);
      } catch (e) {
        console.error(e);
        setPlayerSrc('');
        alert('Unable to load secure player. Please try another lesson or refresh.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [active]);

  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <>
      {/* LEFT: player + details */}
      <div>
        <div className="aspect-video w-full rounded-sm bg-black overflow-hidden border border-neutral-200 relative">
          {!playerSrc && (
            <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
              {loading ? 'Loading secure player…' : 'Select a lecture'}
            </div>
          )}
        {playerSrc && (
            <iframe
              key={playerSrc}
              src={playerSrc}
              className="w-full h-full"
              allow="encrypted-media"
              allowFullScreen
              style={{ border: 0 }}
              title={active?.title || 'Lesson'}
            />
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-xl font-semibold leading-snug">{active?.title || '—'}</h1>
          <p className="text-sm text-neutral-600 mt-1">
            {index > 0 ? `Lesson ${String(index).padStart(2, '0')}` : 'Lesson'} • {active?.duration || '—'}
          </p>
        </div>

        {/* Tabs (minimal) */}
        <div className="mt-6 border-b border-neutral-200">
          <div className="flex gap-6 text-sm">
            <button className="py-3 border-b-2 border-black font-medium">Overview</button>
            <button className="py-3 text-neutral-600">Notes</button>
            <button className="py-3 text-neutral-600">Announcements</button>
            <button className="py-3 text-neutral-600">Learning tools</button>
          </div>
        </div>

        <div className="mt-4 text-sm leading-6 text-neutral-700">
          This program covers anatomy, planning, surgery, prosthetics and complications with secure DRM video playback.
        </div>
      </div>

      {/* RIGHT: sticky accordion */}
      <aside className="lg:sticky lg:top-6 h-fit">
        <div className="border border-neutral-200 rounded-sm">
          <div className="px-4 py-3 border-b border-neutral-200">
            <div className="text-sm font-semibold">Course content</div>
            <div className="text-xs text-neutral-500 mt-1">
              {totalLectures} lectures
            </div>
          </div>

          <div className="divide-y divide-neutral-200">
            {data.map((sec) => {
              const isOpen = open[sec.id];
              return (
                <div key={sec.id}>
                  <button
                    className="w-full px-4 py-3 flex items-center justify-between"
                    onClick={() => setOpen((m) => ({ ...m, [sec.id]: !m[sec.id] }))}
                  >
                    <div className="text-sm font-medium text-left">
                      {sec.order}. {sec.title}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-neutral-500">
                        {sec.lectures.length} lecture{sec.lectures.length === 1 ? '' : 's'}
                      </span>
                      <span className="text-neutral-400">{isOpen ? '▾' : '▸'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <ul className="px-2 py-2">
                      {sec.lectures.map((lec) => {
                        const activeRow = active?.id === lec.id;
                        return (
                          <li key={lec.id} className={['rounded-sm', activeRow ? 'bg-neutral-100' : ''].join(' ')}>
                            <button
                              onClick={() => setActive(lec)}
                              className="w-full px-3 py-2 flex items-center gap-3 text-left"
                            >
                              <input
                                type="checkbox"
                                className="mt-[1px] h-4 w-4"
                                checked={!!done[lec.id]}
                                onChange={(e) => setDone((d) => ({ ...d, [lec.id]: e.target.checked }))}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <div className={['text-sm', activeRow ? 'font-medium' : 'text-neutral-800'].join(' ')}>
                                  {lec.title}
                                </div>
                                <div className="text-xs text-neutral-500 mt-[2px]">{lec.duration}</div>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

