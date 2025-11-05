import TalkPlayer from "../../../components/TalkPlayer";
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
      // Fallback: list the directory and try to locate a case-insensitive summary.md
      const list = await s3.send(new ListObjectsV2Command({ Bucket: TALKS_S3_BUCKET, Prefix: dir ? `${dir}/` : undefined }));
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

export default async function Page({ params }: { params: Promise<{ key: string[] }> }) {
  const p = await params;
  const key = decodeKeyParam(p?.key || []);
  const name = key.split("/").pop() || key;

  let summaryHtml: string | null = null;
  try {
    const summary = await getSummary(key);
    if (summary) summaryHtml = renderMarkdown(summary);
  } catch {}

  return (
    <main className="mx-auto max-w-5xl p-4">
      <div className="mb-2">
        <a href="/talks" className="text-sm text-blue-700 hover:underline">← Back to Talks</a>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 break-words">{name}</h1>
      <div className="text-xs text-slate-600 mb-4 break-words">{key}</div>
      <div className="rounded-lg overflow-hidden bg-slate-900">
        <TalkPlayer className="w-full aspect-video" objectKey={key} autoPlay={false} />
      </div>
      {summaryHtml ? (
        <div className="mt-6 prose prose-sm max-w-none text-slate-900" dangerouslySetInnerHTML={{ __html: summaryHtml }} />
      ) : null}
    </main>
  );
}
