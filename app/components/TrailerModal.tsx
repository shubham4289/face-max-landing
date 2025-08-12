"use client";
import React, { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  // Use either youtubeId OR src (mp4). If both given, youtubeId wins.
  youtubeId?: string;
  src?: string; // e.g. "/videos/trailer.mp4"
};

export default function TrailerModal({ open, onClose, youtubeId, src }: Props) {
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-label="Course trailer"
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close trailer"
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Close button */}
        <button
          className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium hover:bg-slate-50"
          onClick={onClose}
        >
          Close
        </button>

        {/* Video wrapper keeps 16:9 */}
        <div className="aspect-video w-full overflow-hidden rounded-2xl">
          {youtubeId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title="Course trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : src ? (
            <video className="h-full w-full" controls autoPlay preload="metadata">
              <source src={src} type="video/mp4" />
              Sorry, your browser can’t play this video.
            </video>
          ) : (
            <div className="grid h-full w-full place-items-center text-sm text-slate-500">
              Add a youtubeId or video src to TrailerModal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
