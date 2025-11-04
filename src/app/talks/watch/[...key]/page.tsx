import TalkPlayer from "../../../components/TalkPlayer";

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

export default async function Page({ params }: { params: Promise<{ key: string[] }> }) {
  const p = await params;
  const key = decodeKeyParam(p?.key || []);
  const name = key.split("/").pop() || key;

  let summaryHtml: string | null = null;
  try {
    const dir = key.split('/').slice(0, -1).join('/');
    const res = await fetch(`/api/talks/summary?dir=${encodeURIComponent(dir)}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.summary) summaryHtml = renderMarkdown(String(data.summary));
    }
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
