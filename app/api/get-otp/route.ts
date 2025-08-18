import { NextResponse } from "next/server";

async function handler(request: Request) {
  let videoId: string | undefined;

  if (request.method === "GET") {
    const url = new URL(request.url);
    videoId = url.searchParams.get("videoId") || undefined;
  } else {
    try {
      const body = await request.json();
      videoId = body.videoId;
    } catch (e) {
      videoId = undefined;
    }
  }

  if (!videoId) {
    return NextResponse.json(
      { error: "videoId required" },
      {
        status: 400,
        headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": new URL(request.url).origin },
      }
    );
  }

  try {
    const apiRes = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
      method: "POST",
      headers: {
        Authorization: `Apisecret ${process.env.VDOCIPHER_API_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ttl: 300 }),
    });

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      throw new Error(errorText || `VdoCipher API error: ${apiRes.status}`);
    }

    const data = await apiRes.json();

    return NextResponse.json(
      { otp: data.otp, playbackInfo: data.playbackInfo },
      {
        status: 200,
        headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": new URL(request.url).origin },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      {
        status: 500,
        headers: { "Cache-Control": "no-store", "Access-Control-Allow-Origin": new URL(request.url).origin },
      }
    );
  }
}

export async function GET(request: Request) {
  return handler(request);
}

export async function POST(request: Request) {
  return handler(request);
}
