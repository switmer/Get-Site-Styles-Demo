import { NextResponse } from "next/server";

const API_BASE_URL = process.env.GSS_API_BASE_URL ?? "https://get-site-styles-api.onrender.com";
const API_KEY = process.env.GSS_API_KEY ?? "gss_mb1r5n49_918ec955cf99e9bd8aba34c790659eeb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, format, colorFormat, compact } = body || {};

    if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: "Invalid 'url' provided" }, { status: 400 });
    }

    const upstream = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({ url, format, colorFormat, compact }),
      cache: "no-store",
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream API error", status: upstream.status, body: text },
        { status: upstream.status }
      );
    }

    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Request failed", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
