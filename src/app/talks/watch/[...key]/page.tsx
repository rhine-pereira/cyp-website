import TalkPlayer from "../../../components/TalkPlayer";
import TalkShareButton from '@/app/components/TalkShareButton';
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3, TALKS_S3_BUCKET } from "@/app/lib/s3";

function decodeKeyParam(param: string | string[]): string {
  const joined = Array.isArray(param) ? param.join("/") : param;
  try { return decodeURIComponent(joined); } catch { return joined; }
}

function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { out.push("<ul class=\"list-disc pl-6 my-2\">"); inList = true; }
      const item = line.replace(/^\s*[-*]\s+/, "");
      out.push(`<li>${escapeHtml(item)}</li>`);
      continue;
    }
    if (inList && line === "") { out.push("</ul>"); inList = false; continue; }
    if (line === "") { out.push("<br/>"); continue; }
    out.push(`<p class=\"my-2\">${escapeHtml(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

async function getSummary(key: string): Promise<string | null> {
  try {
    const dir = key.split('/').slice(0, -1).join('/');
    const summaryKey = `${dir}/summary.md`;

    try {
      const out = await s3.send(new GetObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: summaryKey }));
      const text = await bodyToString((out as any).Body);
      return text || null;
    } catch {
      // Fallback: only search within the same directory (case-insensitive filename).
      // If there is no directory (root-level key), don't list the entire bucket — return null.
      if (!dir) return null;
      const list = await s3.send(new ListObjectsV2Command({ Bucket: TALKS_S3_BUCKET, Prefix: `${dir}/` }));
      const items = (list.Contents || []).map(o => o.Key || "").filter(Boolean);
      const found = items.find(k => k.split('/').pop()!.toLowerCase() === 'summary.md');
      if (!found) return null;
      const alt = await s3.send(new GetObjectCommand({ Bucket: TALKS_S3_BUCKET, Key: found }));
      const text = await bodyToString((alt as any).Body);
      return text || null;
    }
  } catch {
    return null;
  }
}

async function getTalkTitle(key: string): Promise<string> {
  try {
    // Fetch from the talks API to get the actual title
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/talks`, { 
      cache: 'no-store' 
    });
    const data = await res.json();
    const talk = data.items?.find((item: any) => (item.key || item.id) === key);
    if (talk?.title) return talk.title;
  } catch {
    // Fall back to deriving title from filename
  }
  
  // Fallback: derive title from filename using the same logic as the API
  const filename = key.split("/").pop() || key;
  return filename.replace(/\.[^.]+$/, '').replace(/[\-_]+/g, ' ').trim();
}

export default async function Page({ params }: { params: Promise<{ key: string[] }> }) {
  const p = await params;
  const key = decodeKeyParam(p?.key || []);
  const title = await getTalkTitle(key);

  let summaryHtml: string | null = null;
  try {
    const summary = await getSummary(key);
    if (summary) summaryHtml = renderMarkdown(summary);
  } catch {}

  return (
    <main className="mx-auto max-w-5xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <a href="/talks" className="text-sm text-blue-700 hover:underline">← Back to Talks</a>
            <div className="ml-4">
              <TalkShareButton title={title} />
            </div>
          </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 break-words">{title}</h1>
  {/* Video object key removed from public view for privacy/security */}
      <div className="rounded-lg overflow-hidden bg-slate-900">
        <TalkPlayer className="w-full aspect-video" objectKey={key} autoPlay={false} />
      </div>
      {summaryHtml ? (
        <div className="mt-6 prose prose-sm max-w-none text-slate-900" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
      ) : null}
    </main>
  );
}
