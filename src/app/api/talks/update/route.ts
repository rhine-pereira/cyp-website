import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, TALKS_S3_BUCKET } from "@/app/lib/s3";
import { getAllTalks, saveAllTalks } from "@/app/lib/talksStore";
import type { TalkItem } from "@/app/types/talks";

function dirFromKey(key: string) {
  return key.split("/").slice(0, -1).join("/");
}

export async function POST(req: NextRequest) {
  try {
    const { id, title, speaker, date, series, summary } = await req.json();
    if (!id || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const items = await getAllTalks();
    const index = items.findIndex((it) => it.id === id || it.key === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Talk not found" }, { status: 404 });
    }

    // Update the item
    items[index] = {
      ...items[index],
      title,
      speaker: speaker || undefined,
      date: date || undefined,
      series: series || undefined,
    };

    await saveAllTalks(items);

    // Update summary if provided
    if (summary !== undefined) {
      const key = items[index].key || items[index].id;
      const dir = dirFromKey(key);
      const summaryKey = `${dir}/summary.md`;
      
      if (summary === "" || summary === null) {
        // Delete summary if empty
        try {
          await s3.send(new DeleteObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: summaryKey }));
        } catch {
          // Ignore if doesn't exist
        }
      } else {
        // Update summary
        const Body = Buffer.from(summary, "utf8");
        await s3.send(
          new PutObjectCommand({
            Bucket: TALKS_S3_BUCKET,
            Key: summaryKey,
            Body,
            ContentType: "text/markdown; charset=utf-8",
          })
        );
      }
    }

    return NextResponse.json({ ok: true, item: items[index] });
  } catch (e) {
    console.error("Update error:", e);
    return NextResponse.json({ error: "Failed to update talk" }, { status: 500 });
  }
}
