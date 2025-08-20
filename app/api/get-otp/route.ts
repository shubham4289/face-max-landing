import { NextResponse } from "next/server";

function sanitize(input?: string) {
  if (!input) return undefined;
  return input.trim().slice(0, 64).replace(/[<>"']/g, "");
}

async function handler(request: Request) {
  let videoId: string | undefined;
  let viewerName: string | undefined;
  let viewerEmail: string | undefined;

  if (request.method === "GET") {
    const url = new URL(request.url);
    videoId = url.searchParams.get("videoId") || undefined;
    viewerName = url.searchParams.get("viewerName") || undefined;
    viewerEmail = url.searchParams.get("viewerEmail") || undefined;
  } else {
    try {
      const body = await request.json();
      videoId = body.videoId;
      viewerName = body.viewerName;
      viewerEmail = body.viewerEmail;
    } catch (e) {
      videoId = undefined;
    }
  }

  const headers = {
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": new URL(request.url).origin,
  } as const;

  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400, headers });
  }

  const apiSecret = process.env.VDOCIPHER_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json({ error: "VDOCIPHER_API_SECRET not set" }, { status: 500, headers });
  }

  viewerName = sanitize(viewerName);
  viewerEmail = sanitize(viewerEmail);

  const safeName = viewerName || "Student";
  const safeEmail = viewerEmail || "thefacemax.com";

  const wmItems = [
    {
      type: "rtext",
      text: ` Licensed to ${safeName} · ${safeEmail} · {ip} · {date.h:i:s A} `,
      alpha: "0.22",
      color: "0xFFFFFF",
      size: "16",
      interval: "5000",
    },
  ];

  try {
    const apiRes = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
      method: "POST",
      headers: {
        Authorization: `Apisecret ${apiSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ttl: 120,
        annotate: JSON.stringify(wmItems),
      }),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(errorText || `VdoCipher API error: ${apiRes.status}`);
    }

    const data = await apiRes.json();

    return NextResponse.json(
      { otp: data.otp, playbackInfo: data.playbackInfo },
      { status: 200, headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500, headers }
    );
  }
}

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
