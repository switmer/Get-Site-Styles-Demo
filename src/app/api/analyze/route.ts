import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const API_BASE_URL = process.env.GSS_API_BASE_URL ?? "https://get-site-styles-api.onrender.com";
const API_KEY = process.env.GSS_API_KEY ?? "gss_mb1r5n49_918ec955cf99e9bd8aba34c790659eeb";

export async function POST(req: Request) {
  const body = await safeJson(req);
  const { url, format, colorFormat, compact } = body || {};

  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Invalid 'url' provided" }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({ url, format, colorFormat, compact }),
      cache: "no-store",
    });

    // If upstream responds but with 5xx, fall back
    if (!upstream.ok) {
      const text = await upstream.text();
      if (upstream.status >= 500) {
        const fallback = await loadSample(url, { format, colorFormat, compact }, {
          reason: `upstream_${upstream.status}`,
          body: text,
        });
        return NextResponse.json(fallback, { status: 200 });
      }
      return NextResponse.json(
        { error: "Upstream API error", status: upstream.status, body: text },
        { status: upstream.status }
      );
    }

    const text = await upstream.text();
    return new NextResponse(text, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Network/timeout – also fall back
    const fallback = await loadSample(url, { format, colorFormat, compact }, {
      reason: "network_error",
      message: err?.message ?? "Unknown error",
    });
    return NextResponse.json(fallback, { status: 200 });
  }
}

async function safeJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

async function loadSample(url: string, opts: any, meta: Record<string, unknown>) {
  const file = path.join(process.cwd(), "public", "sample-analysis.json");
  try {
    const raw = await fs.readFile(file, "utf8");
    const sample = JSON.parse(raw);

    const colorsArray: string[] = sample?.tokens?.colors || [];
    const colors = Object.fromEntries(
      colorsArray.slice(0, 24).map((c: string, i: number) => [
        `color-${String(i + 1).padStart(2, "0")}`,
        c,
      ])
    );

    return {
      data: {
        css: sample?.css ?? "",
        colors,
        tokens: sample?.tokens ?? {},
        theme: sample?.theme ?? {},
      },
      input: { url, ...opts },
      meta: { source: "local-sample", ...sample?.meta, fallback: meta },
    };
  } catch (e: any) {
    return {
      error: "Fallback sample missing",
      message: e?.message ?? String(e),
    };
  }
}
