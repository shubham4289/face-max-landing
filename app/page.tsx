"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle2,
  Video,
  Star,
  ArrowRight,
  IndianRupee,
  Clock
} from "lucide-react";
import "./globals.css";
import MotionReveal from "./components/MotionReveal";
import ImplantHero from "./components/ImplantHero";

/* ===== Clean, balanced icons (keep wrapper the same) ===== */
const IconImplant = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* head */}
    <rect x="7" y="3" width="10" height="4" rx="2" />
    {/* body taper */}
    <path d="M9 7h6c0 5.5-2 8.5-3 13-.3 1.2-1.7 1.2-2 0-1-4.5-3-7.5-3-13h2z" />
    {/* threads */}
    <path d="M9 10h6M8.8 12h6.4M8.6 14h6.8M8.4 16h7.2" />
  </svg>
);

const IconScalpel = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* handle */}
    <path d="M3.5 17.5 L12 9" />
    {/* blade (simple wedge) */}
    <path d="M13 9.5 L21 17 L18 20 L10 12" />
    {/* cutting edge support */}
    <path d="M7 21h9l5-5" />
  </svg>
);

const IconAlertTooth = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* tooth outline */}
    <path d="M8.5 4.2c2-1.4 5-1.4 7 0 1.9 1.4 2.1 4.2.6 5.9-.9 1-1.4 2.6-1.8 4-.3 1-1.7 1-2 0-.4-1.4-.9-3-1.8-4C6.9 8.4 6.6 5.6 8.5 4.2Z" />
    {/* small alert triangle at upper-left */}
    <path d="M3.2 10.4l2-3.5c.2-.3.6-.3.8 0l2 3.5c.2.3 0 .7-.4.7H3.6c-.4 0-.6-.4-.4-.7Z" />
    <path d="M5.2 8.8v1.1M5.2 11.2h0" />
  </svg>
);


const features = [
  {
    icon: <img src="/icons/implant.png" alt="Dental implant icon" className="w-7 h-7" />,
    title: "Every Clinical Scenario Covered",
    text: "From single tooth to full arch — master protocols for every type of case you’ll encounter in real practice.",
  },
  {
    icon: <img src="/icons/scalpel.png" alt="Scalpel icon" className="w-7 h-7" />,
    title: "Step-by-Step Surgical Clarity",
    text: "Crystal-clear instructions for every surgical stage, so you work with precision and confidence.",
  },
  {
    icon: <img src="/icons/alert-tooth.png" alt="Alert tooth icon" className="w-7 h-7" />,
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
    title: "Diagnostics & Case Selection",
    bullets: [
      "CBCT reading essentials for implants",
      "Risk assessment: sinus, nerve, bone quality",
      "Treatment planning worksheet (download)",
    ],
  },
  {
    week: "Module 2",
    title: "Surgical Protocols",
    bullets: [
      "Incisions, flap design & suturing",
      "Osteotomy sequence by bone type",
      "Immediate vs delayed placement",
    ],
  },
  {
    week: "Module 3",
    title: "Prosthetic Phase",
    bullets: [
      "Abutment selection & torque charts",
      "Impressions: implant- vs abutment-level",
      "Cement- vs screw-retained crowns",
    ],
  },
  {
    week: "Module 4",
    title: "Complications & Rescue",
    bullets: [
      "Loose crowns/abutment fracture",
      "Peri-implantitis protocols",
      "When to refer & fail-safes",
    ],
  },
];

const faqs = [
  {
    q: "Who is this course for?",
    a:
      "General dentists and oral surgeons who want a structured, clinically-useful path from diagnosis to restoration.",
  },
  {
    q: "How long do I get access?",
    a: "Lifetime. Rewatch modules, download updates, and access new case uploads.",
  },
  {
    q: "Will I get a certificate?",
    a:
      "Yes—digital verifiable certificate on completion of quizzes and final case submission.",
  },
  {
    q: "Is there mentorship?",
    a:
      "Pro plan includes 3 live case discussions and WhatsApp group support for 6 months.",
  },
];

const testimonials = [
  {
    name: "Dr. Emily Carter, DDS – USA",
    text:
      "The decision trees alone are worth the fee. Helped me standardize my flap design and torque protocol.",
  },
  {
    name: "Dr. Sophia Williams, DDS – USA",
    text:
      "Clean videos, literature references, and practical pearls. Placed my first two cases confidently.",
  },
  {
    name: "Dr. S. Patel, OMFS",
    text: "Loved the complication module—exactly what most courses skip.",
  },
];

export default function Page() {
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
            <a href="#what" className="hover:opacity-80">
              What we do
            </a>
            <a href="#curriculum" className="hover:opacity-80">
              Curriculum
            </a>
            <a href="#pricing" className="hover:opacity-80">
              Pricing
            </a>
            <a href="#faq" className="hover:opacity-80">
              FAQ
            </a>
            <a
              href="#enroll"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-slate-900 text-white"
            >
              Enroll <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      </header>

     {/* Hero */}
<section className="relative overflow-hidden">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center text-center">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-3xl"
    >
      {/* Headline */}
      <h1 className="headline text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] text-slate-900">
        The Ultimate Implant Course
      </h1>

      {/* Description */}
      <p className="mt-4 text-lg text-slate-600">
        No jargon. No fluff. Just clear, clinic-ready implant protocols.
      </p>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          id="enroll"
          href="#pricing"
          className="inline-flex items-center justify-center rounded-2xl px-6 py-3 bg-slate-900 text-white font-semibold"
        >
          Enroll Now
        </a>
        <a
          href="#preview"
          className="inline-flex items-center justify-center rounded-2xl px-6 py-3 border border-slate-300 font-semibold"
        >
          Watch Preview
        </a>
      </div>

     {/* Course Info Badges */}
<div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-base md:text-lg font-bold font-headline text-slate-900">
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
<div className="mt-4 flex items-center justify-center gap-2 text-base md:text-lg font-bold font-headline text-slate-900">
  <CheckCircle2 className="w-5 h-5" aria-hidden />
  <span>Trusted by over <span className="font-extrabold">1,000+</span> dentists worldwide.</span>
</div>

{/* Bonus Line */}
<div className="mt-4 text-lg md:text-xl font-bold font-headline text-slate-900 text-center">
  After you complete the course, our team of surgeons will personally guide you through your first
  <span className="text-2xl md:text-3xl font-extrabold"> 100 implant cases</span>.
</div>


      {/* Course Trailer */}
      <div className="mt-8 aspect-video rounded-2xl bg-slate-200 shadow-inner grid place-items-center">
        <button className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white/80 px-4 py-2">
          <Video className="w-5 h-5" /> Course Trailer
        </button>
      </div>
      <p id="preview" className="sr-only">Preview video placeholder</p>
    </motion.div>
  </div>
</section>

<ImplantHero />

      {/* What we do */}
      <section id="what" className="py-16 border-y border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionReveal y={12} delay={0.05}>
  <h2 className="text-3xl md:text-4xl font-bold text-center">
    <span className="font-bold">From</span>{' '}
    <span className="text-lg font-normal">confusion to</span>{' '}
    <span className="font-bold">complete</span>{' '}
    <span className="font-bold">confidence</span>
  </h2>
</MotionReveal>



          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold">Books & Checklists</h3>
              <p className="mt-2 text-sm text-slate-600">
                Crisp, clear, to the point. PDFs that simplify—not
                complicate.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold">Online Courses</h3>
              <p className="mt-2 text-sm text-slate-600">
                Implant Surgery to prosthetic, everything step-by-step from beginner to advanced level.
              </p>
            </div>
            <div className="rounded-2xl border p-6">
              <h3 className="font-semibold">Community</h3>
              <p className="mt-2 text-sm text-slate-600">
                Judgement-free Telegram group for case discussions & quick help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center">Why this course</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <MotionReveal
                key={i}
                delay={i * 0.05}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 grid place-items-center text-slate-900">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.text}</p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Course */}
      <section id="featured" className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl font-bold">The Ultimate Implant Course — Face Max Signature</h2>
              <p className="mt-3 text-slate-700">
                From diagnosis to Implant crown — a complete, Implant literature-backed pathway for dentists worldwide, from beginner to expert, combining Face Max’s signature hands-on clarity with proven real-world protocols
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-700">
                {[
                  "Treatment Planning & CBCT Mastery",
                  "Surgical & Prosthetic Protocols in Depth",
                  "Crisp Video Demonstrations on Models",
                  "Complication Management Strategies",
                  "Lifetime Access & Continuous Updates",
                ].map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">Face Max Implant Course</div>
                <div className="text-xs rounded-full bg-slate-900 text-white px-2 py-0.5">
                  Most Popular
                </div>
              </div>
              <div className="mt-3 flex items-end gap-2">
                <IndianRupee className="w-5 h-5" />
                <div className="text-4xl font-extrabold">24,999</div>
                <div className="text-slate-500 mb-2 text-sm">one-time</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" /> Lifetime access to all modules
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" /> Step-by-step surgical & prosthetic walkthroughs for real-world scenarios
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" /> Priority answers to your clinical queries by the mentor team
                </li>
                <li className="flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 mt-0.5" /> Direct access to course mentors for clinical guidance
                </li>
              </ul>
              <a
                href="#checkout"
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 text-white px-4 py-3 font-semibold"
              >
                Add to Cart
              </a>
              <p className="mt-2 text-xs text-slate-500">GST extra if applicable</p>
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
              <MotionReveal
                key={i}
                delay={i * 0.1}
                className="rounded-2xl border p-6 bg-white shadow-sm transition transform hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="italic">“{t.text}”</p>
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
                className="rounded-2xl border border-slate-200 p-6"
              >
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  {m.week}
                </div>
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

      {/* FAQ + Guarantee */}
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
            <div className="rounded-2xl border p-6 bg-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4" /> 7-day no-questions refund
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                If the course doesn’t fit your needs, email us within 7 days of purchase
                for a full refund.
              </p>
              <a
                href="#pricing"
                className="mt-4 inline-flex items-center gap-2 text-slate-900 font-semibold"
              >
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
          <div className="text-xs text-slate-600">
            Lifetime access • Certificate • Downloads
          </div>
        </div>
        <a
          href="#checkout"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold"
        >
          Enroll
        </a>
      </div>

      {/* Footer */}
      <footer className="py-10 border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-sm text-slate-600 grid md:grid-cols-3 gap-6">
          <div>
            <div className="font-semibold">Face Max Academy</div>
            <div className="mt-2">
              © {new Date().getFullYear()} Face Max Academy. All rights reserved.
            </div>
          </div>
          <div>
            <div className="font-semibold">Quick Links</div>
            <ul className="mt-2 space-y-1">
              <li>
                <a href="#what">What we do</a>
              </li>
              <li>
                <a href="#featured">Featured course</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
            </ul>
          </div>
          <div id="contact">
            <div className="font-semibold">Contact</div>
            <div className="mt-2 text-sm">WhatsApp / Phone: +91-00000-00000</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
