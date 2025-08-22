"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  Video,
  Star,
  ArrowRight,
  Clock,
} from "lucide-react";
import "./globals.css";
import MotionReveal from "./components/MotionReveal";
import ImplantHero from "./components/ImplantHero";
import DealCountdown from "./components/DealCountdown";
import TrailerModal from "./components/TrailerModal";
import GeoPrice from "./components/GeoPrice";

/* ===== Clean, balanced icons (kept for future use if needed) ===== */
const _IconImplant = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="7" y="3" width="10" height="4" rx="2" />
    <path d="M9 7h6c0 5.5-2 8.5-3 13-.3 1.2-1.7 1.2-2 0-1-4.5-3-7.5-3-13h2z" />
    <path d="M9 10h6M8.8 12h6.4M8.6 14h6.8M8.4 16h7.2" />
  </svg>
);

const _IconScalpel = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3.5 17.5 L12 9" />
    <path d="M13 9.5 L21 17 L18 20 L10 12" />
    <path d="M7 21h9l5-5" />
  </svg>
);

const _IconAlertTooth = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 4.2c2-1.4 5-1.4 7 0 1.9 1.4 2.1 4.2.6 5.9-.9 1-1.4 2.6-1.8 4-.3 1-1.7 1-2 0-.4-1.4-.9-3-1.8-4C6.9 8.4 6.6 5.6 8.5 4.2Z" />
    <path d="M3.2 10.4l2-3.5c.2-.3.6-.3.8 0l2 3.5c.2.3 0 .7-.4.7H3.6c-.4 0-.6-.4-.4-.7Z" />
    <path d="M5.2 8.8v1.1M5.2 11.2h0" />
  </svg>
);

/* ===== Feature cards content (PNG icons with explicit dimensions) ===== */
const features = [
  {
    icon: <img src="/icons/implant.png" alt="Dental implant icon" width={28} height={28} className="w-7 h-7" />,
    title: "Every Clinical Scenario Covered",
    text: "From single-tooth to multiple implants— master protocols for every case you’ll meet in real practice.",
  },
  {
    icon: <img src="/icons/scalpel.png" alt="Scalpel icon" width={28} height={28} className="w-7 h-7" />,
    title: "Step-by-Step Surgical Clarity",
    text: "Crystal-clear instructions for every surgical stage, so you work with precision and confidence.",
  },
  {
    icon: <img src="/icons/alert-tooth.png" alt="Alert tooth icon" width={28} height={28} className="w-7 h-7" />,
    title: "Complication Management Mastery",
    text: "Detailed protocols for handling every possible implant complication — turning uncertainty into confidence.",
  },
  {
    icon: <Shield className="w-6 h-6" aria-hidden />,
    title: "Evidence-based",
    text: "Every protocol mapped to literature and real-world decision trees.",
  },
];

const modules = [
  {
    week: "Module 1",
    title: "Foundations of Implantology",
    bullets: [
      "What exactly implants are & when they’re indicated",
      "Science behind predictable, lasting results",
      "Go or No-Go: Clinical Decision Matrix",
    ],
  },
  {
    week: "Module 2",
    title: "Surgical Anatomy & Biological Considerations",
    bullets: [
      "Jawbone & soft tissue anatomy essentials",
      "Assessing bone density for implant stability",
      "Nerve positioning & surgical safety landmarks",
    ],
  },
  {
    week: "Module 3",
    title: "Armamentarium & Implant Systems",
    bullets: [
      "Every Instrument, Every Purpose — Unpacked",
      "Understanding mini vs standard implant systems",
      "Choosing the right implant design for the case",
    ],
  },
  {
    week: "Module 4",
    title: "Treatment Planning & Case Selection Mastery",
    bullets: [
      "Critical medical & dental history that really matters",
      "CBCT interpretation & site mapping",
      "Risk assessment & site suitability protocols",
    ],
  },
  {
    week: "Module 5",
    title: "Surgical Protocols: From Flap to Final Suture",
    bullets: [
      "Pre-surgical preparation checklist",
      "Drilling sequences & insertion techniques",
      "Flap closure & suturing for optimal healing",
    ],
  },
  {
    week: "Module 6",
    title: "Post-Operative Care, Healing & Complication Prevention",
    bullets: [
      "Evidence-based patient aftercare",
      "Pain, swelling, & inflammation control",
      "Proactive complication prevention strategies",
      ],
  },
  {
    week: "Module 7",
    title: "Prosthetic Phase & Long-Term Success",
    bullets: [
      "Abutment selection & crown placement workflow",
      "Impression techniques for precision fit",
    ],
  },
  {
    week: "Module 8",
    title: "From Crisis to Confidence — Full-Scope Complication Management Protocols",
    bullets: [
      "Management of complications during surgery",
      "Management of prosthetic & all other complications after the surgical phase",
    ],
  },
];

const faqs = [
  {
    q: "Who is this course for?",
    a: "For those starting from scratch, upgrading their skills, or tired of half-explained tutorials that leave more questions than answers.",
  },
  {
    q: "How long do I get access?",
    a: "Forever yours — rewatch every lesson, gain instant access to future updates, and learn from newly added clinical cases.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes—digital verifiable certificate on completion of quizzes and final case submission.",
  },
  {
    q: "Will I get extra discount on new courses?",
    a: "Enroll once, save forever — enjoy a guaranteed 50% off every future course we release.",
  },
];

const testimonials = [
  {
    name: "Dr. Emily Carter, DDS — USA",
    text: "The decision trees alone are worth the fee. Helped me standardize my flap design and torque protocol.",
    stars: 5,
  },
  {
    name: "Dr. Sophia Williams, DDS — USA",
    text: "Clean videos, literature references, and practical pearls. Placed my first two cases confidently.",
    stars: 5,
  },
  {
    name: "Dr. S. Patel, OMFS",
    text: "Loved the complication module—exactly what most courses skip.",
    stars: 5,
  },
];

export default function Page() {
  const [trailerOpen, setTrailerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Face Max Academy" className="h-9 w-auto" />
            <span className="font-semibold">Face Max Academy</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#what" className="hover:opacity-80">What we do</a>
            <a href="#curriculum" className="hover:opacity-80">Curriculum</a>
            <a href="#pricing" className="hover:opacity-80">Pricing</a>
            <a href="#faq" className="hover:opacity-80">FAQ</a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
            >
              Login
            </Link>
            <a href="#enroll" className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-slate-900 text-white">
              Enroll <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      </header>

      {/* Limited-time deal countdown bar */}
      <DealCountdown minutes={10} anchorId="#pricing" />

      {/* Spacer so the bar doesn’t cover the hero (matches header + bar height) */}
      <div aria-hidden className="h-16 md:h-20"></div>

      {/* VdoCipher Player */}
      <div className="flex justify-center py-8">
        <div id="vdo-wrap">
          <iframe
            id="vdoplayer"
            width="720"
            height="405"
            allow="encrypted-media; fullscreen; picture-in-picture 'none'"
            allowFullScreen
            style={{ border: 0 }}
          ></iframe>
        </div>
      </div>
     <script
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
        const VIDEO_ID = "056ef4706ec54b21baa09deccbb710f7";

        // 1) Get viewer info from URL (?name=...&email=...) or use defaults for testing
        const qs = new URLSearchParams(window.location.search);
        const viewerName  = qs.get('name')  || 'Demo Student';
        const viewerEmail = qs.get('email') || 'demo.student@example.com';

        // 2) Ask our backend for OTP + playbackInfo (includes watermark "annotate")
        const params = new URLSearchParams({ videoId: VIDEO_ID, viewerName, viewerEmail });
        fetch('/api/get-otp?' + params.toString(), { cache: 'no-store' })
          .then(res => res.json())
          .then(({ otp, playbackInfo }) => {
            const iframe = document.getElementById('vdoplayer');
            if (!iframe) return;
            // 3) Build the secure player URL — encode values!
            const src =
              'https://player.vdocipher.com/v2/?otp=' + encodeURIComponent(otp) +
              '&playbackInfo=' + encodeURIComponent(playbackInfo);
            iframe.src = src;
          })
          .catch(() => alert('Failed to load secure video'));
          })();
        `,
      }}
    />

     <script
       dangerouslySetInnerHTML={{
         __html: `
      // block right-click inside the player area
      document.addEventListener('DOMContentLoaded', () => {
        const wrap = document.getElementById('vdo-wrap');
        if (wrap) {
          wrap.addEventListener('contextmenu', (e) => e.preventDefault());
          // optional: block double-click fullscreen toggle on wrapper
          wrap.addEventListener('dblclick', (e) => e.preventDefault());
        }
      });
    `,
       }}
     />


      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-3xl">
            {/* Headline */}
            <h1 className="headline text-6xl lg:text-7xl font-extrabold leading-[1.02] tracking-tight text-slate-900">
              The Ultimate{" "}
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">Implant Course</span>
            </h1>

            {/* Description */}
            <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
              Expert-built. Proven. Precise. Full-depth. Step-by-step. Clinic-ready.
            </p>

            {/* Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <a id="enroll" href="#pricing" className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 bg-slate-900 text-white font-semibold shadow-sm hover:shadow-md hover:bg-slate-800 transition">
                Enroll Now
              </a>
              <a href="#preview" className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 border border-slate-300/80 bg-white hover:bg-slate-50 font-semibold">
                Watch Preview
              </a>
            </div>

            {/* Course Info Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base font-semibold text-slate-900 tracking-tight">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" aria-hidden />
                <span>Certificate on completion</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" aria-hidden />
                <span>Lifetime access</span>
              </div>
            </div>

            {/* Trusted By */}
            <div className="mt-3 flex items-center justify-center gap-2 text-base font-semibold text-slate-900 tracking-tight">
              <CheckCircle2 className="w-5 h-5" aria-hidden />
              <span>Trusted by over <span className="font-extrabold">1,000+</span> dentists worldwide.</span>
            </div>

            {/* Bonus Line */}
            <div className="mt-4 text-lg font-bold text-slate-900 text-center">
              After you complete the course, our team of surgeons will personally guide you through your first
              <span className="mx-1 text-3xl font-extrabold tracking-tight">100</span> implant cases.
            </div>

            {/* Course Trailer */}
            <div className="mt-8 aspect-video rounded-2xl bg-slate-200 shadow-inner grid place-items-center">
              <button
                type="button"
                onClick={() => setTrailerOpen(true)}
                className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white/80 px-4 py-2 hover:bg-white"
              >
                <Video className="w-5 h-5" /> Course Trailer
              </button>
            </div>

            {/* Trailer Modal */}
            <TrailerModal
              open={trailerOpen}
              onClose={() => setTrailerOpen(false)}
              youtubeId="YOUR_YOUTUBE_ID_HERE"
            />

            <p id="preview" className="sr-only">Preview video placeholder</p>
          </motion.div>
        </div>
      </section>

      <ImplantHero />

      {/* What we do */}
      <section id="what" className="py-16 border-y border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionReveal y={12} delay={0.05}>
            <h2 className="text-[40px] md:text-[44px] lg:text-[48px] leading-tight font-bold text-center">
              From confusion to complete confidence
            </h2>
          </MotionReveal>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold">Signature Implantology Books Free</h3>
              <p className="mt-2 text-sm text-slate-600">Includes members-only books on Contemporary implant Protocols I & II by Face Max Academy.</p>
            </div>
            <div className="rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold">Complete Implant Training</h3>
              <p className="mt-2 text-sm text-slate-600">Implant surgery to prosthetic—everything step-by-step, from beginner to advanced.</p>
            </div>
            <div className="rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold">Community</h3>
              <p className="mt-2 text-sm text-slate-600">Judgement-free Telegram group for case discussions & quick help.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features — subtle background accent */}
      <section className="py-16 relative" id="features">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          aria-hidden
          style={{ background: "radial-gradient(600px 300px at 50% 0%, rgba(203,213,225,0.25), transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Why this course</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <MotionReveal
                key={i}
                delay={i * 0.05}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition hover:-translate-y-0.5"
              >
                <div className="w-12 h-12 rounded-xl bg-white grid place-items-center text-slate-900 ring-1 ring-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,.6)] bg-gradient-to-b from-slate-50 to-slate-100">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.text}</p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Course / Pricing */}
      <section id="pricing" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl font-bold">The Ultimate Implant Course — Face Max Signature</h2>
              <p className="mt-3 text-slate-700">
                From diagnosis to implant crown—an evidence-backed pathway for dentists worldwide, from beginner to expert, combining Face Max’s hands-on clarity with proven real-world protocols.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {[
                  "Precision Treatment Planning & CBCT Interpretation Mastery",
                  "Surgical & Prosthetic Protocols in Depth",
                  "Crisp Video Demonstrations on Models",
                  "Battle-Tested Complication Management Frameworks",
                  "Permanent Access with Continuous Content Enhancements",
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="group relative rounded-2xl p-[2px] bg-gradient-to-br from-slate-900 to-amber-400/60 hover:to-amber-400 transition">
              <div className="rounded-2xl bg-white p-7 shadow-sm hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold">Face Max Implant Course</div>
                  <div className="text-xs rounded-full bg-slate-900 text-white px-2 py-0.5">Most Popular</div>
                </div>

                {/* Geo-aware price */}
                <div className="mt-4">
                  <GeoPrice baseInr={24999} subLabel="one-time" />
                </div>

                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Lifetime access to all modules</li>
                  <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Step-by-step surgical & prosthetic walkthroughs</li>
                  <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Priority answers to your clinical queries</li>
                  <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 mt-0.5" /> Direct access to course mentors</li>
                </ul>

                <a href="#checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 text-white px-4 py-3 font-semibold hover:bg-slate-800 transition">
                  Add to Cart
                </a>

                <p className="mt-2 text-xs text-slate-500">Includes certificate • Lifetime updates • 50% off on all future courses</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">What doctors say</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <MotionReveal key={i} delay={i * 0.1} className="rounded-2xl border p-6 bg-white shadow-sm transition transform hover:-translate-y-1 hover:shadow-lg">
                {/* Stars (fixed height row) */}
                <div className="flex items-center gap-1 mb-3 text-amber-400 min-h-[20px]" aria-label={`${t.stars} out of 5 stars`}>
                  {[...Array(t.stars)].map((_, s) => (<Star key={s} className="w-4 h-4" fill="currentColor" />))}
                  {[...Array(5 - t.stars)].map((_, s) => (<Star key={`o-${s}`} className="w-4 h-4 text-slate-300" />))}
                </div>

                {/* Quote */}
                <p className="italic text-slate-800 before:content-['“'] after:content-['”']">{t.text}</p>

                {/* Name */}
                <div className="mt-4 font-semibold">{t.name}</div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Curriculum Overview</h2>
          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            {modules.map((m, idx) => (
              <MotionReveal
                key={idx}
                delay={idx * 0.05}
                className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-md transition relative
                           before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-l-2xl
                           before:bg-gradient-to-b before:from-amber-400 before:to-slate-900/70"
              >
                <div className="text-xs uppercase tracking-wide text-slate-500">{m.week}</div>
                <div className="mt-1 font-semibold text-lg">{m.title}</div>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {m.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + Urgency block */}
      <section id="faq" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold">Frequently asked questions</h2>
              <div className="mt-8 divide-y">
                {faqs.map((f, i) => (
                  <div key={i} className="py-4">
                    <div className="font-semibold">{f.q}</div>
                    <p className="mt-1 text-slate-700 text-sm">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                One Chance to Level Up — Forever
              </h3>

              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
                <li className="flex items-start gap-3">
                  <Star className="w-4 h-4 flex-none mt-1 text-amber-500" strokeWidth={0} fill="currentColor" />
                  <span>Miss this and you’ll spend years piecing together half-baked tutorials, wasting cases, and second-guessing your skills.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-4 h-4 flex-none mt-1 text-amber-500" strokeWidth={0} fill="currentColor" />
                  <span>In just weeks, we hand you the exact frameworks, case protocols, and decision trees that took us a decade to master.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-4 h-4 flex-none mt-1 text-amber-500" strokeWidth={0} fill="currentColor" />
                  <span>Every day you wait, another patient chooses someone else.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Star className="w-4 h-4 flex-none mt-1 text-amber-500" strokeWidth={0} fill="currentColor" />
                  <span>Seats are limited, and once this cohort closes — it’s gone.</span>
                </li>
              </ul>

              <a href="#pricing" className="mt-4 inline-flex items-center gap-2 text-slate-900 font-semibold">
                See pricing <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <div className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-6 md:w-[360px] rounded-2xl border bg-white shadow-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Ready to start placing implants?</div>
          <div className="text-xs text-slate-600">Lifetime access • Certificate • Updates</div>
        </div>
        <a href="#checkout" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 transition">
          Enroll
        </a>
      </div>

      {/* Footer */}
      <footer className="py-10 border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-slate-600 grid md:grid-cols-3 gap-8 md:gap-10">
          {/* Column 1 — Contact */}
          <div id="contact">
            <div className="font-semibold">Contact</div>
            <div className="mt-2 text-sm">Email: admin@thefacemax.com</div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <div className="font-semibold">Quick Links</div>
            <ul className="mt-2 space-y-1">
              <li><a href="#what">What we do</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#curriculum">Curriculum</a></li>
            </ul>
          </div>

          {/* Column 3 — Brand + © */}
          <div>
            <div className="font-semibold">Face Max Academy</div>
            <div className="mt-2">© {new Date().getFullYear()} Face Max Academy. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
