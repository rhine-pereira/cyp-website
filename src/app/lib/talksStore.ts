import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, TALKS_S3_BUCKET } from "@/app/lib/s3";
import type { TalkItem, TalksMetadataFile } from "@/app/types/talks";

const METADATA_KEY = "talks-metadata/metadata.json";

async function bodyToUint8Array(body: any): Promise<Uint8Array> {
  if (!body) return new Uint8Array();
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
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    return merged;
  }
  if (typeof body.on === "function") {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      body.on("data", (c: Buffer) => chunks.push(c));
      body.on("end", () => resolve());
      body.on("error", reject);
    });
    const buf = Buffer.concat(chunks);
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  }
  if (typeof body.transformToByteArray === "function") {
    const arr: Uint8Array = await body.transformToByteArray();
    return arr;
  }
  if (body instanceof Uint8Array) return body;
  if (Buffer.isBuffer(body)) return new Uint8Array(body.buffer, body.byteOffset, body.length);
  return new Uint8Array();
}

export async function getAllTalks(): Promise<TalkItem[]> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: METADATA_KEY }));
    const buf = await bodyToUint8Array((res as any).Body);
    const text = new TextDecoder().decode(buf);
    const parsed: TalksMetadataFile = JSON.parse(text);
    return parsed.items || [];
  } catch {
    return [];
  }
}

export async function saveAllTalks(items: TalkItem[]): Promise<void> {
  const payload: TalksMetadataFile = { items, updatedAt: new Date().toISOString() };
  const Body = Buffer.from(JSON.stringify(payload, null, 2));
  await s3.send(
    new PutObjectCommand({
      Bucket: TALKS_S3_BUCKET,
      Key: METADATA_KEY,
      Body,
      ContentType: "application/json",
    })
  );
}

export async function prependTalks(newItems: TalkItem[]): Promise<void> {
  if (!newItems.length) return;
  const items = await getAllTalks();
  const combined = [...newItems, ...items];
  await saveAllTalks(combined);
}
