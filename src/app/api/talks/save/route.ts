import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, TALKS_S3_BUCKET, TALKS_PUBLIC_BASEURL } from "@/app/lib/s3";
import { prependTalks } from "@/app/lib/talksStore";
import type { TalkItem } from "@/app/types/talks";

function dirFromKey(key: string) {
  const parts = key.split("/");
  parts.pop();
  return parts.join("/");
}

export async function POST(req: NextRequest) {
  try {
    const { title, speaker, date, series, type, mediaKey, thumbnailKey, summary } = await req.json();
    if (!title || !mediaKey || !type) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const item: TalkItem = {
      id: mediaKey,
      key: mediaKey,
      title,
      speaker: speaker || undefined,
      date: date || undefined,
      type,
      createdAt: new Date().toISOString(),
      series: series || undefined,
      thumbnailKey: thumbnailKey || undefined,
    };

    await prependTalks([item]);

    if (summary && typeof summary === "string") {
      const dir = dirFromKey(mediaKey);
      const key = `${dir}/summary.md`;
      const Body = Buffer.from(summary, "utf8");
      await s3.send(new PutObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: key, Body, ContentType: "text/markdown; charset=utf-8" }));
    }

    const base = TALKS_PUBLIC_BASEURL || `https://${TALKS_S3_BUCKET}.s3.amazonaws.com`;
    const toUrl = (k?: string) => (k ? `${base}${base.endsWith("/") ? "" : "/"}${k}` : undefined);

    return NextResponse.json({ ok: true, item: { ...item, thumbnailUrl: toUrl(item.thumbnailKey) } });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save talk" }, { status: 500 });
  }
}
