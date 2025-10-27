"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  objectKey: string;
  className?: string;
  autoPlay?: boolean;
};

export default function TalkPlayer({ objectKey, className, autoPlay }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  const ext = useMemo(() => (objectKey.split(".").pop() || "").toLowerCase(), [objectKey]);
  const isAudio = useMemo(() => ["mp3", "m4a", "aac", "wav", "oga", "ogg", "opus", "webm"].includes(ext), [ext]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setUrl(null);
        const res = await fetch("/api/talks/play", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: objectKey }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || `Failed to resolve play URL (${res.status})`);
        }
        const data = await res.json();
        if (!data?.url) throw new Error("No URL returned");
        if (!cancelled) setUrl(data.url);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Unexpected error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [objectKey]);

  useEffect(() => {
    const el = mediaRef.current as any;
    if (!el) return;
    el.setAttribute("controlsList", "nodownload noremoteplayback");
    if ("disablePictureInPicture" in el) el.disablePictureInPicture = true;
  }, [url]);

  if (loading) return <div className={className}>Loading…</div>;
  if (error) return <div className={className}>Error: {error}</div>;
  if (!url) return <div className={className}>No media</div>;

  if (isAudio) {
    return (
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        className={className}
        controls
        controlsList="nodownload noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
        // @ts-expect-error The library type definition is missing this property.
        disableRemotePlayback
        preload="metadata"
        autoPlay={autoPlay}
        src={url}
      />
    );
  }

  return (
    <video
      ref={mediaRef as React.RefObject<HTMLVideoElement>}
      className={className}
      controls
      controlsList="nodownload noremoteplayback"

      disablePictureInPicture
      
      disableRemotePlayback
      onContextMenu={(e) => e.preventDefault()}
      playsInline
      preload="metadata"
      autoPlay={autoPlay}
      src={url}
    />
  );
}
