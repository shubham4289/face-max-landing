'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CoursePage() {
  const router = useRouter();
  const [src, setSrc] = useState('');

  useEffect(() => {
    async function load() {
      const meRes = await fetch('/api/auth/me');
      if (meRes.status === 401) {
        router.push('/login');
        return;
      }
      const me = await meRes.json();
      const res = await fetch(
        `/api/get-otp?videoId=056ef4706ec54b21baa09deccbb710f7&viewerName=${encodeURIComponent(me.name)}&viewerEmail=${encodeURIComponent(
          me.email
        )}`
      );
      const { otp, playbackInfo } = await res.json();
      setSrc(
        `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(otp)}&playbackInfo=${encodeURIComponent(playbackInfo)}`
      );
    }
    load();
  }, [router]);

  return (
    <div
      id="vdo-wrap"
      onContextMenu={(e) => e.preventDefault()}
      onDoubleClick={(e) => e.preventDefault()}
    >
      {src && (
        <iframe
          src={src}
          allow="encrypted-media; fullscreen; picture-in-picture 'none'"
          className="w-full h-96"
        />
      )}
    </div>
  );
}
