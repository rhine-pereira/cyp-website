import { NextRequest, NextResponse } from "next/server";
import { DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3, TALKS_S3_BUCKET } from "@/app/lib/s3";
import { getAllTalks, saveAllTalks } from "@/app/lib/talksStore";

function dirFromKey(key: string) {
  return key.split("/").slice(0, -1).join("/");
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const items = await getAllTalks();
    const item = items.find((it) => it.id === id || it.key === id);
    
    if (!item) {
      return NextResponse.json({ error: "Talk not found" }, { status: 404 });
    }

    const key = item.key || item.id;
    const dir = dirFromKey(key);

    // Delete all files in the directory (media file, thumbnail, summary)
    try {
      const listResult = await s3.send(
        new ListObjectsV2Command({
          Bucket: TALKS_S3_BUCKET,
          Prefix: `${dir}/`,
        })
      );

      if (listResult.Contents && listResult.Contents.length > 0) {
        const objectsToDelete = listResult.Contents.map((obj) => ({ Key: obj.Key })).filter(
          (obj): obj is { Key: string } => !!obj.Key
        );

        if (objectsToDelete.length > 0) {
          await s3.send(
            new DeleteObjectsCommand({
              Bucket: TALKS_S3_BUCKET,
              Delete: { Objects: objectsToDelete },
            })
          );
        }
      }
    } catch (e) {
      console.error("Error deleting files:", e);
      // Continue even if file deletion fails
    }

    // Remove from metadata
    const filtered = items.filter((it) => it.id !== id && it.key !== id);
    await saveAllTalks(filtered);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete error:", e);
    return NextResponse.json({ error: "Failed to delete talk" }, { status: 500 });
  }
}
