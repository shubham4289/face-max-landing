"use client";

import { useMemo, useState } from "react";

type Lecture = { title: string; duration: string; embedUrl: string };
type Section = { title: string; total: string; lectures: Lecture[] };

const sections: Section[] = [
  {
    title: "1. Introduction to Dental Implants",
    total: "2 lectures • 12m",
    lectures: [
      { title: "What is a dental implant?", duration: "6m", embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U" },
      { title: "When and why implants are needed.", duration: "6m", embedUrl: "https://player.vimeo.com/video/76979871" },
    ],
  },
  {
    title: "2. Basic Anatomy for Implantology",
    total: "4 lectures • 28m",
    lectures: [
      { title: "UNDERSTANDING BONE & soft tissue", duration: "8m", embedUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "UNDERSTANDING bone density", duration: "6m", embedUrl: "https://player.vimeo.com/video/357274789" },
      { title: "UNDERSTANDING NERVES AND SINUS ANATOMY", duration: "8m", embedUrl: "https://www.youtube.com/embed/DLX62G4lc44" },
      { title: "UNDERSTANDING THE NORMAL AND CONCLUSION", duration: "6m", embedUrl: "https://player.vimeo.com/video/22439234" },
    ],
  },
  {
    title: "3. Essential Equipment & Materials",
    total: "3 lectures • 22m",
    lectures: [
      { title: "Every Instrument, Every Purpose — Unpacked", duration: "8m", embedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
      { title: "UNDERSTANDING IMPLANT PLATFORMS, WHAT TO CHOOSE WHEN", duration: "7m", embedUrl: "https://player.vimeo.com/video/1084537" },
      { title: "EXACT ASSEMBLY LINE ! & CONCLUSION", duration: "7m", embedUrl: "https://www.youtube.com/embed/2Vv-BfVoq4g" },
    ],
  },
  {
    title: "4. Treatment Planning & Case Selection",
    total: "3 lectures • 20m",
    lectures: [
      { title: "Critical medical & dental history that really matters", duration: "7m", embedUrl: "https://www.youtube.com/embed/2OEL4P1Rz04" },
      { title: "Radiographic assessment and site mapping (CBCT, OPG).", duration: "6m", embedUrl: "https://player.vimeo.com/video/148751763" },
      { title: "CHOOSING THE CORRECT IMPLANT FOR THE CORRECT SITE", duration: "7m", embedUrl: "https://www.youtube.com/embed/3fumBcKC6RE" },
    ],
  },
  {
    title: "5. Surgical Protocols From Flap to Final Suture",
    total: "2 lectures • 16m",
    lectures: [
      { title: "Lights, Camera, Action! – INCISION TO PLACEMENT STEP‑BY‑STEP", duration: "9m", embedUrl: "https://player.vimeo.com/video/137857207" },
      { title: "Proper suturing & flap closure", duration: "7m", embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0" },
    ],
  },
  {
    title: "6. Post‑Operative Care & Healing",
    total: "3 lectures • 18m",
    lectures: [
      { title: "Evidence‑based patient aftercare", duration: "6m", embedUrl: "https://player.vimeo.com/video/76979871" },
      { title: "Pain, swelling, & inflammation control", duration: "6m", embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U" },
      { title: "Recognizing complication and managing them", duration: "6m", embedUrl: "https://player.vimeo.com/video/22439234" },
    ],
  },
  {
    title: "7. Full‑Scope Complication Management Protocols",
    total: "2 lectures • 14m",
    lectures: [
      { title: "Management of complications During surgery", duration: "7m", embedUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Management of Prosthetic & other complications after surgical part", duration: "7m", embedUrl: "https://player.vimeo.com/video/357274789" },
    ],
  },
  {
    title: "8. Prosthetic Phase & Long‑Term Success",
    total: "2 lectures • 14m",
    lectures: [
      { title: "Impression techniques for precision fit", duration: "7m", embedUrl: "https://player.vimeo.com/video/1084537" },
      { title: "Abutment selection & crown placement workflow", duration: "7m", embedUrl: "https://www.youtube.com/embed/DLX62G4lc44" },
    ],
  },
];

export default function CourseUdemyLike() {
  const [active, setActive] = useState<Lecture>(sections[0].lectures[0]);
  const flat = useMemo(() => sections.flatMap((s) => s.lectures), []);
  const idx = flat.findIndex((l) => l.embedUrl === active.embedUrl) + 1;

  const [open, setOpen] = useState<Record<number, boolean>>(() =>
    sections.reduce((a, _, i) => ((a[i] = i === 0), a), {} as Record<number, boolean>)
  );
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-white text-[#111]">
      {/* Top bar */}
      <div className="border-b border-neutral-200">
        <div className="mx-auto max-w-[1200px] px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">The Face Max</div>
          <div className="text-neutral-400">|</div>
          <div className="text-sm text-neutral-600">Dental Implant Mastery</div>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-24">
        {/* LEFT */}
        <div>
          <div className="aspect-video w-full rounded-sm bg-black overflow-hidden border border-neutral-200">
            <iframe
              key={active.embedUrl}
              src={active.embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={active.title}
            />
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-semibold leading-snug">{active.title}</h1>
            <p className="text-sm text-neutral-600 mt-1">Lesson {String(idx).padStart(2, "0")} • {active.duration}</p>
          </div>

          {/* Tabs — Q&A and Reviews removed */}
          <div className="mt-6 border-b border-neutral-200">
            <div className="flex gap-6 text-sm">
              <button className="py-3 border-b-2 border-black font-medium">Overview</button>
              <button className="py-3 text-neutral-600">Notes</button>
              <button className="py-3 text-neutral-600">Announcements</button>
              <button className="py-3 text-neutral-600">Learning tools</button>
            </div>
          </div>

          <div className="mt-4 text-sm leading-6 text-neutral-700">
            This is your comprehensive program for mastering dental implants — real‑world workflows,
            clear anatomy, and proven protocols. Lifetime access • Certificate • Continuous updates.
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <aside className="lg:sticky lg:top-6 h-fit">
          <div className="border border-neutral-200 rounded-sm">
            <div className="px-4 py-3 border-b border-neutral-200">
              <div className="text-sm font-semibold">Course content</div>
              <div className="text-xs text-neutral-500 mt-1">
                {sections.reduce((a, s) => a + s.lectures.length, 0)} lectures • ~2h 25m
              </div>
            </div>

            <div className="divide-y divide-neutral-200">
              {sections.map((sec, si) => {
                const isOpen = open[si];
                return (
                  <div key={si}>
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between"
                      onClick={() => setOpen((m) => ({ ...m, [si]: !m[si] }))}
                    >
                      <div className="text-sm font-medium text-left">{sec.title}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500">{sec.total}</span>
                        <span className="text-neutral-400">{isOpen ? "▾" : "▸"}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <ul className="px-2 py-2">
                        {sec.lectures.map((lec, li) => {
                          const key = `${sec.title}__${lec.title}`;
                          const activeRow = active.embedUrl === lec.embedUrl;
                          return (
                            <li key={li} className={["rounded-sm", activeRow ? "bg-neutral-100" : ""].join(" ")}>
                              <button
                                onClick={() => setActive(lec)}
                                className="w-full px-3 py-2 flex items-center gap-3 text-left"
                              >
                                <input
                                  type="checkbox"
                                  className="mt-[1px] h-4 w-4"
                                  checked={!!done[key]}
                                  onChange={(e) => setDone((d) => ({ ...d, [key]: e.target.checked }))}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1">
                                  <div className={["text-sm", activeRow ? "font-medium" : "text-neutral-800"].join(" ")}>
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
      </div>
    </div>
  );
}
