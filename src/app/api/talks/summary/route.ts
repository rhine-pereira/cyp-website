import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3, TALKS_S3_BUCKET } from "@/app/lib/s3";

async function bodyToString(body: any): Promise<string> {
  if (!body) return "";
  if (typeof body.transformToString === "function") return body.transformToString();
  if (typeof body.transformToByteArray === "function") {
    const arr: Uint8Array = await body.transformToByteArray();
    return new TextDecoder().decode(arr);
  }
  if (typeof body.getReader === "function") {
    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const c of chunks) { merged.set(c, offset); offset += c.length; }
    return new TextDecoder().decode(merged);
  }
  return "";
}

function deriveSummaryKeyFromMediaKey(mediaKey: string): string | null {
  if (!mediaKey) return null;
  const parts = mediaKey.split('/');
  if (parts.length <= 1) return null;
  parts.pop();
  const dir = parts.join('/');
  return `${dir}/summary.md`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const key = searchParams.get("key");
    const dir = searchParams.get("dir");
    let summaryKey: string | null = null;
    if (dir) summaryKey = `${dir.replace(/\/$/, '')}/summary.md`;
    else if (key) summaryKey = deriveSummaryKeyFromMediaKey(key);

    if (!summaryKey) return NextResponse.json({ summary: null });

    try {
      const out = await s3.send(new GetObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: summaryKey }));
      const text = await bodyToString((out as any).Body);
      return NextResponse.json({ summary: text || null });
    } catch {
      // Fallback: list the directory and try to locate a case-insensitive summary.md
      const dir = summaryKey.split('/').slice(0, -1).join('/');
      const list = await s3.send(new ListObjectsV2Command({ Bucket: TALKS_S3_BUCKET, Prefix: dir ? `${dir}/` : undefined }));
      const items = (list.Contents || []).map(o => o.Key || "").filter(Boolean);
      const found = items.find(k => k.split('/').pop()!.toLowerCase() === 'summary.md');
      if (!found) return NextResponse.json({ summary: null });
      const alt = await s3.send(new GetObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: found }));
      const text = await bodyToString((alt as any).Body);
      return NextResponse.json({ summary: text || null });
    }
  } catch (e) {
    return NextResponse.json({ summary: null });
  }
}
