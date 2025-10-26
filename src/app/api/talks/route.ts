import { NextRequest, NextResponse } from "next/server";
import { s3, TALKS_S3_BUCKET, TALKS_PUBLIC_BASEURL } from "@/app/lib/s3";
import { getAllTalks, saveAllTalks } from "@/app/lib/talksStore";
import type { TalkItem } from "@/app/types/talks";
import { ListObjectsV2Command, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";

// Lists talks using talks/metadata.json as the source of truth, and merges in any new
// objects discovered under the `talks/` prefix (mp3/mp4)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const cursor = searchParams.get("cursor"); // numeric index offset

  let all = await getAllTalks();

  try {
    const existing = new Set((all || []).map(i => i.key).filter(Boolean) as string[]);
    const prefix = ""; // talks are stored at bucket root
    let continuationToken: string | undefined = undefined;
    const discovered: TalkItem[] = [];

    const base = TALKS_PUBLIC_BASEURL || `https://${TALKS_S3_BUCKET}.s3.amazonaws.com`;

    do {
      const out: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({ Bucket: TALKS_S3_BUCKET, Prefix: prefix || undefined, ContinuationToken: continuationToken })
      );
      const contents = out.Contents || [];
      for (const obj of contents) {
        const key = obj.Key as string;
        if (!key || key.endsWith("/")) continue;
        if (existing.has(key)) continue;
        const ext = (key.split(".").pop() || "").toLowerCase();
        if (!['mp3','m4a','wav','aac','mp4','m4v','mov','webm'].includes(ext)) continue;
        const type: TalkItem["type"] = ['mp4','m4v','mov','webm'].includes(ext) ? 'video' : 'audio';
        const filename = key.split("/").pop() || key;
        const title = filename.replace(/\.[^.]+$/, '').replace(/[\-_]+/g, ' ').trim();
        const createdAt = (obj.LastModified ? new Date(obj.LastModified).toISOString() : new Date().toISOString());
        const item: TalkItem = {
          id: key,
          key,
          title,
          type,
          createdAt,
        };
        discovered.push(item);
      }
      continuationToken = out.IsTruncated ? out.NextContinuationToken : undefined;
    } while (continuationToken);

    if (discovered.length) {
      all = [...discovered, ...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      await saveAllTalks(all);
    }
  } catch (_) {
    // swallow discovery errors
  }

  const start = cursor ? parseInt(cursor, 10) : 0;
  const slice = all.slice(start, start + limit);
  const nextCursor = start + slice.length < all.length ? String(start + slice.length) : undefined;

  return NextResponse.json({ items: slice, nextCursor });
}
