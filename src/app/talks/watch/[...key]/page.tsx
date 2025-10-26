import TalkPlayer from "../../../components/TalkPlayer";

function decodeKeyParam(param: string | string[]): string {
  const joined = Array.isArray(param) ? param.join("/") : param;
  try { return decodeURIComponent(joined); } catch { return joined; }
}

export default async function Page({ params }: { params: Promise<{ key: string[] }> }) {
  const p = await params;
  const key = decodeKeyParam(p?.key || []);
  const name = key.split("/").pop() || key;
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
    </main>
  );
}
