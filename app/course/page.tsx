"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// STATIC COURSE OUTLINE (replace later with your real video IDs)
// For now we use dummy embeds (YouTube/Vimeo) so layout is testable.
// ─────────────────────────────────────────────────────────────
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
      { title: "Lights, Camera, Action! - INCISION TO IMPLANT PLACEMENT STEP-BY-STEP.", embedUrl: "https://player.vimeo.com/video/137857207" },
      { title: "Proper suturing AND Flap closure- Because everyone needs a closure so do implants!", embedUrl: "https://www.youtube.com/embed/9bZkp7q19f0" },
    ],
  },
  {
    title: "6. Post-Operative Care & Healing",
    lectures: [
      { title: "Evidence-based patient aftercare", embedUrl: "https://player.vimeo.com/video/76979871" },
      { title: "Pain, swelling, & inflammation control.", embedUrl: "https://www.youtube.com/embed/ysz5S6PUM-U" },
      { title: "Recognizing Complication and managing them", embedUrl: "https://player.vimeo.com/video/22439234" },
    ],
  },
  {
    title: "7. From Crisis to Confidence — Full-Scope Complication Management Protocols",
    lectures: [
      { title: "Management of complications During surgery", embedUrl: "https://www.youtube.com/embed/ScMzIvxBSi4" },
      { title: "Management of Prosthetic & all other complications after surgical part", embedUrl: "https://player.vimeo.com/video/357274789" },
    ],
  },
  {
    title: "8. Prosthetic Phase & Long-Term Success",
    lectures: [
      { title: "Impression techniques for precision fit", embedUrl: "https://player.vimeo.com/video/1084537" },
      { title: "Abutment selection & crown placement workflow", embedUrl: "https://www.youtube.com/embed/DLX62G4lc44" },
    ],
  },
];

export default function CoursePage() {
  // which lecture is selected to play
  const [selected, setSelected] = useState<Lecture>(
    courseStructure[0].lectures[0]
  );
  // which sections are expanded
  const [open, setOpen] = useState<boolean[]>(
    courseStructure.map(() => true) // start with all expanded; change to false to start collapsed
  );

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 border-r border-white/10 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-3">Course Content</h2>
          <p className="text-sm text-white/60 mb-4">
            Click a lesson to load the player → (dummy videos for now).
          </p>

          <div className="space-y-3">
            {courseStructure.map((section, i) => (
              <div key={i} className="bg-white/5 rounded">
                <button
                  onClick={() =>
                    setOpen((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                  }
                  className="w-full text-left px-3 py-2 font-medium hover:bg-white/10 rounded"
                >
                  {section.title}
                </button>

                {open[i] && (
                  <ul className="px-2 pb-2">
                    {section.lectures.map((lec, j) => {
                      const active = selected.embedUrl === lec.embedUrl;
                      return (
                        <li key={j}>
                          <button
                            onClick={() => setSelected(lec)}
                            className={`w-full text-left px-3 py-2 rounded hover:bg-white/10 ${
                              active ? "bg-blue-600" : ""
                            }`}
                          >
                            {lec.title}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Player area */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-5xl aspect-video">
          {/* Dummy embeds only for layout testing */}
          <iframe
            key={selected.embedUrl} // force re-render when switching
            src={selected.embedUrl}
            className="w-full h-full rounded-md"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </main>
    </div>
  );
}
