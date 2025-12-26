"use client";

import React, { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/app/components/Auth/AuthGuard";

// Warm Espresso Theme Colors
const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

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

  // Adaptive part size: 50MB for large files, 10MB for smaller files
  const getPartSize = (fileSize: number) => {
    if (fileSize > 500 * 1024 * 1024) return 50 * 1024 * 1024; // 50MB for files > 500MB
    if (fileSize > 100 * 1024 * 1024) return 25 * 1024 * 1024; // 25MB for files > 100MB
    return 10 * 1024 * 1024; // 10MB default
  };

  // Calculate MD5 checksum for integrity verification
  const calculateMD5 = async (blob: Blob): Promise<string> => {
    const buffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

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

    const PART_SIZE = getPartSize(file.size);
    const totalParts = Math.ceil(file.size / PART_SIZE);
    const urls = await requestPartUrls(key, uploadId, totalParts);

    let uploadedBytes = 0;
    const perPartLoaded: Record<number, number> = {};
    const partsOut: Array<{ PartNumber: number; ETag: string }> = [];
    const partChecksums: Record<number, string> = {};

    // Adaptive concurrency control
    let currentConcurrency = 1; // Start conservative
    let successCount = 0;
    let failureCount = 0;
    const MAX_CONCURRENCY = 6;
    const MIN_CONCURRENCY = 1;

    const adjustConcurrency = (success: boolean) => {
      if (success) {
        successCount++;
        failureCount = Math.max(0, failureCount - 1);
        // Increase concurrency after 3 consecutive successes
        if (successCount >= 3 && currentConcurrency < MAX_CONCURRENCY) {
          currentConcurrency++;
          successCount = 0;
          console.log(`📈 Increased concurrency to ${currentConcurrency}`);
        }
      } else {
        failureCount++;
        successCount = 0;
        // Decrease concurrency immediately on failure
        if (currentConcurrency > MIN_CONCURRENCY) {
          currentConcurrency = Math.max(MIN_CONCURRENCY, Math.floor(currentConcurrency / 2));
          console.log(`📉 Decreased concurrency to ${currentConcurrency}`);
        }
      }
    };

    const uploadPart = async (partNumber: number, maxRetries = 5) => {
      const start = (partNumber - 1) * PART_SIZE;
      const end = Math.min(start + PART_SIZE, file.size);
      const blob = file.slice(start, end);
      const url = urls[partNumber];
      
      // Calculate checksum for integrity verification
      if (!partChecksums[partNumber]) {
        partChecksums[partNumber] = await calculateMD5(blob);
      }
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const etag = await new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
            
            // Dynamic timeout based on part size and attempt
            const baseTimeout = Math.max(120000, (blob.size / 1024 / 1024) * 2000); // 2s per MB, min 2min
            xhr.timeout = baseTimeout * (attempt + 1); // Increase timeout on retries
            
            let lastProgressTime = Date.now();
            let stallTimeout: NodeJS.Timeout | null = null;
            
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                lastProgressTime = Date.now();
                if (stallTimeout) clearTimeout(stallTimeout);
                
                const loaded = e.loaded;
                const prev = perPartLoaded[partNumber] || 0;
                perPartLoaded[partNumber] = loaded;
                uploadedBytes += Math.max(0, loaded - prev);
                const pct = Math.min(100, (uploadedBytes / file.size) * 100);
                setProgress(pct);
                
                // Detect stalled uploads (no progress for 30s)
                stallTimeout = setTimeout(() => {
                  if (Date.now() - lastProgressTime > 30000) {
                    xhr.abort();
                    reject(new Error("Upload stalled"));
                  }
                }, 30000);
              }
            };
            
            xhr.onerror = () => {
              if (stallTimeout) clearTimeout(stallTimeout);
              reject(new Error("Network error"));
            };
            xhr.ontimeout = () => {
              if (stallTimeout) clearTimeout(stallTimeout);
              reject(new Error("Upload timeout"));
            };
            xhr.onabort = () => {
              if (stallTimeout) clearTimeout(stallTimeout);
              reject(new Error("Upload aborted"));
            };
            xhr.onload = () => {
              if (stallTimeout) clearTimeout(stallTimeout);
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
                reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
              }
            };
            xhr.send(blob);
          });
          
          partsOut.push({ PartNumber: partNumber, ETag: etag });
          adjustConcurrency(true);
          return; // Success
        } catch (err: any) {
          adjustConcurrency(false);
          
          if (attempt < maxRetries) {
            // Exponential backoff with jitter
            const baseDelay = Math.min(30000, 1000 * Math.pow(2, attempt)); // Max 30s
            const jitter = Math.random() * 1000; // 0-1s jitter
            const delay = baseDelay + jitter;
            
            console.log(`⚠️ Part ${partNumber} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${err.message}. Retrying in ${(delay/1000).toFixed(1)}s...`);
            
            // Reset progress for this part
            const prev = perPartLoaded[partNumber] || 0;
            uploadedBytes -= prev;
            perPartLoaded[partNumber] = 0;
            setProgress(Math.max(0, (uploadedBytes / file.size) * 100));
            
            await new Promise(r => setTimeout(r, delay));
          } else {
            throw new Error(`Part ${partNumber} failed after ${maxRetries + 1} attempts: ${err.message}`);
          }
        }
      }
    };

    // Dynamic parallel upload with adaptive concurrency
    const partQueue = Array.from({ length: totalParts }, (_, i) => i + 1);
    const activeUploads = new Set<Promise<void>>();

    while (partQueue.length > 0 || activeUploads.size > 0) {
      // Start new uploads up to current concurrency limit
      while (partQueue.length > 0 && activeUploads.size < currentConcurrency) {
        const partNumber = partQueue.shift();
        if (partNumber) {
          const uploadPromise = uploadPart(partNumber).finally(() => {
            activeUploads.delete(uploadPromise);
          });
          activeUploads.add(uploadPromise);
        }
      }
      
      // Wait for at least one upload to complete
      if (activeUploads.size > 0) {
        await Promise.race(activeUploads);
      }
    }

    // Sort parts by part number before completing
    partsOut.sort((a, b) => a.PartNumber - b.PartNumber);

    const completeRes = await fetch("/api/talks/multipart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", key, uploadId, parts: partsOut }),
    });
    const completed = await completeRes.json().catch(() => ({}));
    if (!completeRes.ok) throw new Error(completed?.error || "Failed to complete upload");
    
    console.log(`✅ Upload completed successfully with ${partsOut.length} parts`);
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

  const inputClass = "mt-1 w-full border border-[#FB923C]/30 focus:border-[#FB923C] focus:ring-[#FB923C] rounded-md px-3 py-2 text-[#FAFAFA] bg-white/5 placeholder:text-[#FAFAFA]/30";
  const labelClass = "block text-sm font-medium text-[#FAFAFA]/90";
  const fileInputClass = "block w-full text-sm text-[#FAFAFA] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#FB923C] file:text-[#1C1917] hover:file:bg-[#FCD34D]";

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-[#1C1917]">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-[#1C1917] border border-[#FB923C]/30 rounded-xl shadow-sm">
            <div className="border-b border-[#FB923C]/30 rounded-t-xl p-6">
              <h1 className="text-2xl font-bold tracking-tight text-[#FAFAFA]">Talks Upload</h1>
              <p className="text-sm text-[#FAFAFA]/70 mt-1">Upload a sermon/talk to the talks bucket.</p>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div className="rounded-lg border border-[#FB923C]/30 p-4 bg-white/5">
                <div className="mb-3 text-sm font-medium text-[#FAFAFA]/90">Details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Speaker</label>
                    <input value={speaker} onChange={(e) => setSpeaker(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="dd-mm-yyyy" className={inputClass} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#FB923C]/30 p-4 bg-white/5">
                <div className="mb-3 text-sm font-medium text-[#FAFAFA]/90">Series</div>
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-[#FAFAFA]">
                    <input type="radio" name="series" checked={seriesMode === 'none'} onChange={() => setSeriesMode('none')} className="text-[#FB923C] focus:ring-[#FB923C]" />
                    None
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-[#FAFAFA]">
                    <input type="radio" name="series" checked={seriesMode === 'new'} onChange={() => setSeriesMode('new')} className="text-[#FB923C] focus:ring-[#FB923C]" />
                    New
                  </label>
                  {seriesMode === 'new' && (
                    <input value={seriesNew} onChange={(e) => setSeriesNew(e.target.value)} placeholder="e.g. Romans" className={`flex-1 ${inputClass}`} />
                  )}
                  <label className="inline-flex items-center gap-2 text-sm text-[#FAFAFA]">
                    <input type="radio" name="series" checked={seriesMode === 'existing'} onChange={() => setSeriesMode('existing')} className="text-[#FB923C] focus:ring-[#FB923C]" />
                    Existing
                  </label>
                  {seriesMode === 'existing' && (
                    <select value={seriesExisting} onChange={(e) => setSeriesExisting(e.target.value)} className={`flex-1 ${inputClass}`} style={{ backgroundColor: '#1C1917' }}>
                      <option value="">Select series…</option>
                      {seriesList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-[#FB923C]/30 p-4 bg-white/5">
                <div className="mb-3 text-sm font-medium text-[#FAFAFA]/90">Files</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Thumbnail (optional)</label>
                    <div className="mt-1 rounded-md border border-[#FB923C]/30 p-3 bg-white/5">
                      <input type="file" accept="image/*" onChange={(e) => setThumbFile((e.target.files && e.target.files[0]) || null)} className={fileInputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Video/Audio File</label>
                    <div className="mt-1 rounded-md border border-[#FB923C]/30 p-3 bg-white/5">
                      <input type="file" accept="video/*,audio/*" onChange={(e) => setMediaFile((e.target.files && e.target.files[0]) || null)} className={fileInputClass} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#FB923C]/30 p-4 bg-white/5">
                <label className={labelClass}>Summary (Markdown supported)</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={8} className={`${inputClass} whitespace-pre-wrap min-h-40`} placeholder="Add points with - bullets and line breaks" />
                {progress > 0 && progress < 100 && (
                  <div className="mt-2 h-2 w-full bg-white/10 rounded">
                    <div className="h-2 bg-[#FB923C] rounded" style={{ width: `${Math.floor(progress)}%` }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" disabled={loading} className="px-5 py-3 rounded-md bg-[#FB923C] text-[#1C1917] hover:bg-[#FCD34D] disabled:opacity-50 shadow font-semibold">
                  {loading ? "Uploading…" : "Upload Talk"}
                </button>
                {message ? <div className="text-sm text-green-500">{message}</div> : null}
                {error ? <div className="text-sm text-red-500">{error}</div> : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
