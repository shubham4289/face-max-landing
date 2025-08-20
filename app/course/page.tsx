"use client";

import { useMemo, useState } from "react";

type Lecture = { title: string; embedUrl: string };
type Section = { title: string; lectures: Lecture[] };

const courseStructure: Section[] = [
  {
    title: "1. Introduction to Dental Implants",
    lectures: [
      { title: "What is a dental implant?", embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U" },
      { title: "When and why implants are needed.", embedUrl: "https://player.vimeo.com/video/76979871" },
    ],
  },
  {
    title: "2. Basic Anatomy for Implantology",
    lectures: [
      { title: "UNDERSTANDING BONE & soft tissue", embedUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "UNDERSTANDING bone density", embedUrl: "https://player.vimeo.com/video/357274789" },
      { title: "UNDERSTANDING NERVES AND SINUS ANATOMY", embedUrl: "https://www.youtube.com/embed/DLX62G4lc44" },
      { title: "UNDERSTANDING THE NORMAL AND CONCLUSION", embedUrl: "https://player.vimeo.com/video/22439234" },
    ],
  },
  {
    title: "3. Essential Equipment & Materials",
    lectures: [
      { title: "Every Instrument, Every Purpose — Unpacked", embedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
      { title: "UNDERSTANDING IMPLANT PLATFORMS, WHAT TO CHOOSE WHEN", embedUrl: "https://player.vimeo.com/video/1084537" },
      { title: "EXACT ASSEMBLY LINE ! & CONCLUSION", embedUrl: "https://www.youtube.com/embed/2Vv-BfVoq4g" },
    ],
  },
  {
    title: "4. Treatment Planning & Case Selection",
    lectures: [
      { title: "Critical medical & dental history that really matters", embedUrl: "https://www.youtube.com/embed/2OEL4P1Rz04" },
      { title: "Radiographic assessment and site mapping (CBCT, OPG).", embedUrl: "https://player.vimeo.com/video/148751763" },
      { title: "CHOOSING THE CORRECT IMPLANT FOR THE CORRECT SITE", embedUrl: "https://www.youtube.com/embed/3fumBcKC6RE" },
    ],
  },
  {
    title: "5. Surgical Protocols From Flap to Final Suture",
    lectures: [
      { title: "Lights, Camera, Action! – INCISION TO PLACEMENT (step‑by‑step)", embedUrl: "https://player.vimeo.com/video/137857207" },
      { title: "Proper suturing & flap closure", embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0" },
    ],
  },
  {
    title: "6. Post‑Operative Care & Healing",
    lectures: [
      { title: "Evidence‑based patient aftercare", embedUrl: "https://player.vimeo.com/video/76979871" },
      { title: "Pain, swelling & inflammation control", embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U" },
      { title: "Recognizing complications & management", embedUrl: "https://player.vimeo.com/video/22439234" },
    ],
  },
  {
    title: "7. Full‑Scope Complication Management Protocols",
    lectures: [
      { title: "Management of complications during surgery", embedUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Management of prosthetic & other post‑surgical complications", embedUrl: "https://player.vimeo.com/video/357274789" },
    ],
  },
  {
    title: "8. Prosthetic Phase & Long‑Term Success",
    lectures: [
      { title: "Impression techniques for precision fit", embedUrl: "https://player.vimeo.com/video/1084537" },
      { title: "Abutment selection & crown placement workflow", embedUrl: "https://www.youtube.com/embed/DLX62G4lc44" },
    ],
  },
];

export default function CoursePage() {
  const [selected, setSelected] = useState<Lecture>(courseStructure[0].lectures[0]);

  // Build a flat index for numbered items shown in the right title
  const flatList = useMemo(() => {
    const list: { section: string; lecture: Lecture; index: number }[] = [];
    let idx = 1;
    for (const s of courseStructure) {
      for (const l of s.lectures) {
        list.push({ section: s.title, lecture: l, index: idx++ });
      }
    }
    return list;
  }, []);

  const current = flatList.find((x) => x.lecture.embedUrl === selected.embedUrl);

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Dental Implant Mastery
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Lifetime access • Certificate • Continuous updates
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 self-start">
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-medium">Course Content</h2>
              <p className="mt-1 text-xs text-white/60">
                Select a lesson to play. (Secure VdoCipher will replace these dummy videos next.)
              </p>
            </div>

            <nav className="divide-y divide-white/10">
              {courseStructure.map((section, si) => (
                <div key={si} className="px-5 py-4">
                  <div className="text-sm font-semibold text-white/90 mb-3">
                    {section.title}
                  </div>
                  <ul className="space-y-1.5">
                    {section.lectures.map((lec, li) => {
                      const active = selected.embedUrl === lec.embedUrl;
                      return (
                        <li key={li}>
                          <button
                            onClick={() => setSelected(lec)}
                            className={[
                              "w-full text-left px-3 py-2 rounded-md text-sm transition-none",
                              active
                                ? "bg-white text-black"
                                : "bg-white/0 hover:bg-white/10 text-white/90",
                            ].join(" ")}
                          >
                            {lec.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Player */}
        <main className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                key={selected.embedUrl}
                src={selected.embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">Now Playing</p>
                <h3 className="mt-1 text-xl font-medium leading-snug text-white/95">
                  {selected.title}
                </h3>
                {current && (
                  <p className="mt-1 text-sm text-white/60">
                    {current.section}
                  </p>
                )}
              </div>
              {current && (
                <div className="hidden sm:block text-right">
                  <span className="inline-flex items-center rounded-md border border-white/15 px-2.5 py-1 text-xs text-white/70">
                    Lesson {current.index.toString().padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-white/50">
          © {new Date().getFullYear()} The Face Max. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
