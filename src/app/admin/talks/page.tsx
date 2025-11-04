"use client";

import React, { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/app/components/Auth/AuthGuard";

function slugify(v: string) {
  return (v || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminTalksUploadPage() {
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [date, setDate] = useState<string>("");
  const [seriesMode, setSeriesMode] = useState<"none" | "new" | "existing">("none");
  const [seriesNew, setSeriesNew] = useState("");
  const [seriesExisting, setSeriesExisting] = useState<string>("");
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState<number>(0);

  const pickedSeries = useMemo(() => {
    if (seriesMode === "new") return seriesNew.trim() || undefined;
    if (seriesMode === "existing") return (seriesExisting || "").trim() || undefined;
    return undefined;
  }, [seriesMode, seriesNew, seriesExisting]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/talks/series", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        setSeriesList(Array.isArray(data.series) ? data.series : []);
      } catch { /* ignore */ }
    })();
  }, []);

  const PART_SIZE = 10 * 1024 * 1024;

  const requestPartUrls = async (key: string, uploadId: string, totalParts: number) => {
    const partNumbers = Array.from({ length: totalParts }, (_, i) => i + 1);
    const MAX_PER_REQ = 100;
    const all: Record<number, string> = {};
    for (let i = 0; i < partNumbers.length; i += MAX_PER_REQ) {
      const chunk = partNumbers.slice(i, i + MAX_PER_REQ);
      const res = await fetch("/api/talks/multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "parts", key, uploadId, partNumbers: chunk }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to get part URLs");
      Object.assign(all, data.urls || {});
    }
    return all;
  };

  const multipartUploadFile = async (file: File, payload: { kind?: "thumbnail" | undefined; }): Promise<{ key: string; publicUrl: string }> => {
    const { kind } = payload;
    const createRes = await fetch("/api/talks/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", filename: file.name, contentType: file.type || "application/octet-stream", title, date: date || undefined, series: pickedSeries, kind }),
    });
    const created = await createRes.json().catch(() => ({}));
    if (!createRes.ok) throw new Error(created?.error || "Failed to init multipart");
    const { uploadId, key } = created as { uploadId: string; key: string };

    const totalParts = Math.ceil(file.size / PART_SIZE);
    const urls = await requestPartUrls(key, uploadId, totalParts);

    let uploadedBytes = 0;
    const perPartLoaded: Record<number, number> = {};
    const partsOut: Array<{ PartNumber: number; ETag: string }> = [];

    const uploadPart = async (partNumber: number) => {
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const blob = file.slice(start, end);
      const url = urls[partNumber];
      const etag = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const loaded = e.loaded;
            const prev = perPartLoaded[partNumber] || 0;
            perPartLoaded[partNumber] = loaded;
            uploadedBytes += Math.max(0, loaded - prev);
            const pct = Math.min(100, (uploadedBytes / file.size) * 100);
            setProgress(pct);
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const et = xhr.getResponseHeader("ETag") || "";
            const finalLoaded = perPartLoaded[partNumber] || 0;
            if (finalLoaded < blob.size) {
              uploadedBytes += blob.size - finalLoaded;
              perPartLoaded[partNumber] = blob.size;
              const pct = Math.min(100, (uploadedBytes / file.size) * 100);
              setProgress(pct);
            }
            resolve(et);
          } else {
            reject(new Error(`Part ${partNumber} failed (${xhr.status})`));
          }
        };
        xhr.send(blob);
      });
      partsOut.push({ PartNumber: partNumber, ETag: etag });
    };

    for (let i = 1; i <= totalParts; i++) {
      // sequential to keep code simpler and UI deterministic; can be parallelized if needed
      await uploadPart(i);
    }

    const completeRes = await fetch("/api/talks/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", key, uploadId, parts: partsOut }),
    });
    const completed = await completeRes.json().catch(() => ({}));
    if (!completeRes.ok) throw new Error(completed?.error || "Failed to complete upload");
    return { key: completed.key as string, publicUrl: completed.publicUrl as string };
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMessage(undefined); setError(undefined); setProgress(0);
    try {
      if (!title.trim()) throw new Error("Title is required");
      if (!mediaFile) throw new Error("Select a video/audio file");

      const mediaOut = await multipartUploadFile(mediaFile, {});
      let thumbKey: string | undefined = undefined;
      if (thumbFile) {
        const thumbOut = await multipartUploadFile(thumbFile, { kind: "thumbnail" });
        thumbKey = thumbOut.key;
      }

      const seriesValue = pickedSeries;
      const body = {
        title: title.trim(),
        speaker: speaker.trim() || undefined,
        date: date || undefined,
        series: seriesValue,
        type: (mediaFile.type || "").toLowerCase().startsWith("video/") ? "video" : "audio",
        mediaKey: mediaOut.key,
        thumbnailKey: thumbKey,
        summary,
      };

      const saveRes = await fetch("/api/talks/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const saved = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) throw new Error(saved?.error || "Failed to save talk");

      setMessage("Talk uploaded successfully");
      setTitle(""); setSpeaker(""); setDate(""); setSeriesMode("none"); setSeriesNew(""); setSeriesExisting("");
      setMediaFile(null); setThumbFile(null); setSummary(""); setProgress(0);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="border-b border-gray-200 rounded-t-xl p-6">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Talks Upload</h1>
              <p className="text-sm text-gray-600 mt-1">Upload a sermon/talk to the talks bucket.</p>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div className="rounded-lg border border-gray-200 p-4 bg-white/50">
                <div className="mb-3 text-sm font-medium text-gray-700">Details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Title</label>
                    <input value={title} onChange={(e)=>setTitle(e.target.value)} className="mt-1 w-full border border-gray-300 focus:border-gray-500 focus:ring-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Speaker</label>
                    <input value={speaker} onChange={(e)=>setSpeaker(e.target.value)} className="mt-1 w-full border border-gray-300 focus:border-gray-500 focus:ring-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Date</label>
                    <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} placeholder="dd-mm-yyyy" className="mt-1 w-full border border-gray-300 focus:border-gray-500 focus:ring-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 bg-white/50">
                <div className="mb-3 text-sm font-medium text-gray-700">Series</div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-900">
                    <input type="radio" name="series" checked={seriesMode==='none'} onChange={()=>setSeriesMode('none')} />
                    None
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-900">
                    <input type="radio" name="series" checked={seriesMode==='new'} onChange={()=>setSeriesMode('new')} />
                    New
                  </label>
                  {seriesMode==='new' && (
                    <input value={seriesNew} onChange={(e)=>setSeriesNew(e.target.value)} placeholder="e.g. Romans" className="flex-1 border-gray-300 focus:border-gray-500 focus:ring-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white" />
                  )}
                  <label className="inline-flex items-center gap-2 text-sm text-gray-900">
                    <input type="radio" name="series" checked={seriesMode==='existing'} onChange={()=>setSeriesMode('existing')} />
                    Existing
                  </label>
                  {seriesMode==='existing' && (
                    <select value={seriesExisting} onChange={(e)=>setSeriesExisting(e.target.value)} className="flex-1 border-gray-300 focus:border-gray-500 focus:ring-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white">
                      <option value="">Select series…</option>
                      {seriesList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 bg-white/50">
                <div className="mb-3 text-sm font-medium text-gray-700">Files</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Thumbnail (optional)</label>
                    <div className="mt-1 rounded-md border border-gray-300 p-3 bg-white">
                      <input type="file" accept="image/*" onChange={(e)=>setThumbFile((e.target.files && e.target.files[0]) || null)} className="block w-full text-sm text-gray-900 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">Video/Audio File</label>
                    <div className="mt-1 rounded-md border border-gray-300 p-3 bg-white">
                      <input type="file" accept="video/*,audio/*" onChange={(e)=>setMediaFile((e.target.files && e.target.files[0]) || null)} className="block w-full text-sm text-gray-900 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-900 hover:file:bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 bg-white/50">
                <label className="block text-sm font-medium text-gray-900">Summary (Markdown supported)</label>
                <textarea value={summary} onChange={(e)=>setSummary(e.target.value)} rows={8} className="mt-1 w-full border border-gray-300 focus:border-gray-500 focus:ring-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white whitespace-pre-wrap min-h-40" placeholder="Add points with - bullets and line breaks" />
                {progress > 0 && progress < 100 && (
                  <div className="mt-2 h-2 w-full bg-gray-200 rounded">
                    <div className="h-2 bg-gray-900 rounded" style={{ width: `${Math.floor(progress)}%` }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={loading} className="px-5 py-3 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50 shadow">
                  {loading ? "Uploading…" : "Upload Talk"}
                </button>
                {message ? <div className="text-sm text-green-700">{message}</div> : null}
                {error ? <div className="text-sm text-red-700">{error}</div> : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
