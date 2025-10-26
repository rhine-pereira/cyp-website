import { NextRequest, NextResponse } from "next/server";
import { TALKS_S3_BUCKET, TALKS_PUBLIC_BASEURL, s3 } from "@/app/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: NextRequest) {
  try {
    const { key, id } = await req.json();
    const objectKey = key || id;
    if (!objectKey) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    if (TALKS_PUBLIC_BASEURL) {
      const base = TALKS_PUBLIC_BASEURL.endsWith("/") ? TALKS_PUBLIC_BASEURL.slice(0, -1) : TALKS_PUBLIC_BASEURL;
      const url = `${base}/${objectKey}`;
      return NextResponse.json({ url, public: true });
    }

    const command = new GetObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: objectKey });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    return NextResponse.json({ url, public: false });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create playback URL" }, { status: 500 });
  }
}
