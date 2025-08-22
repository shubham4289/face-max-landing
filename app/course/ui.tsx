'use client';

// Theme tokens (from landing page)
// bg: bg-gradient-to-b from-white to-slate-50
// surface: bg-white
// border: border-slate-200
// text: text-slate-900
// muted: text-slate-600
// accent: text-amber-400

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
        <div className="aspect-video w-full rounded-lg bg-black overflow-hidden border border-slate-200 relative">
          {!playerSrc && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
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

        <div className="mt-6">
          <h1 className="text-2xl md:text-3xl font-bold leading-snug">{active?.title || '—'}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {index > 0 ? `Lesson ${String(index).padStart(2, '0')}` : 'Lesson'} • {active?.duration || '—'}
          </p>
        </div>

        {/* Tabs (minimal) */}
        <div className="mt-8 border-b border-slate-200">
          <div className="flex gap-6 text-sm">
            <button className="py-3 font-semibold text-slate-900">Overview</button>
            <button className="py-3 text-slate-600">Notes</button>
            <button className="py-3 text-slate-600">Announcements</button>
            <button className="py-3 text-slate-600">Learning tools</button>
          </div>
        </div>

        <div className="mt-6 text-sm leading-6 text-slate-700">
          This program covers anatomy, planning, surgery, prosthetics and complications with secure DRM video playback.
        </div>
      </div>

      {/* RIGHT: syllabus cards */}
      <aside className="lg:sticky lg:top-24 h-fit space-y-6">
        <div>
          <div className="text-sm font-semibold">Course content</div>
          <div className="text-xs text-slate-600 mt-1">{totalLectures} lectures</div>
        </div>

        {data.length === 0 ? (
          <p className="text-sm text-slate-600">No sections yet</p>
        ) : (
          data.map((sec) => {
            const isOpen = open[sec.id];
            return (
              <div key={sec.id} className="rounded-lg border border-slate-200 bg-white">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  onClick={() => setOpen((m) => ({ ...m, [sec.id]: !m[sec.id] }))}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-left">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>{sec.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600">
                      {sec.lectures.length} lecture{sec.lectures.length === 1 ? '' : 's'}
                    </span>
                    <span className="text-slate-400">{isOpen ? '▾' : '▸'}</span>
                  </div>
                </button>

                {isOpen && (
                  sec.lectures.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-600">No lectures yet</p>
                  ) : (
                    <ul className="px-2 py-2">
                      {sec.lectures.map((lec) => {
                        const activeRow = active?.id === lec.id;
                        return (
                          <li key={lec.id}>
                            <button
                              onClick={() => setActive(lec)}
                              className={[
                                'w-full px-3 py-2 rounded-sm flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                                activeRow ? 'bg-slate-100' : 'hover:bg-slate-50',
                              ].join(' ')}
                            >
                              <input
                                type="checkbox"
                                className="mt-[1px] h-4 w-4 rounded accent-amber-400"
                                checked={!!done[lec.id]}
                                onChange={(e) => setDone((d) => ({ ...d, [lec.id]: e.target.checked }))}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className={['flex-1 text-sm', activeRow ? 'font-medium text-slate-900' : 'text-slate-900'].join(' ')}>
                                {lec.title}
                              </span>
                              <span className="text-xs text-slate-600">{lec.duration}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )
                )}
              </div>
            );
          })
        )}
      </aside>
    </>
  );
}

