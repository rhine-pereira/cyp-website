"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import GallerySection from '@/app/components/Gallery/GallerySection';
import type { EventItem } from "@/app/types/event";
import Spinner from "@/app/components/Spinner";
import { ArrowLeft } from "lucide-react";

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = decodeURIComponent(params.slug);
  const [event, setEvent] = useState<EventItem | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Warm Espresso Theme Colors
  const theme = {
    background: '#1C1917',
    surface: '#1C1917',
    primary: '#FB923C',
    text: '#FAFAFA',
    border: '#FB923C30',
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load event");
        const ev: EventItem | undefined = (data.items && data.items[0]) || undefined;
        setEvent(ev);
      } catch (e: any) {
        setError(e?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
      <Spinner
        label="Loading event…"
        trackClassName="border-white/20"
        ringClassName="border-t-[#FB923C]"
        labelClassName="text-[#FAFAFA]"
      />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-red-500" style={{ backgroundColor: theme.background }}>
      {error}
    </div>
  );
  if (!event) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: theme.background, color: theme.text }}>
      Event not found.
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.background, color: theme.text }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            href="/events"
            className="inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: theme.primary }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to events
          </Link>
        </div>

        <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          {event.headerImageUrl && (
            <div className="w-full aspect-[16/9] bg-gray-900 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.headerImageUrl} alt={event.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}
          <div className="p-8 md:p-10">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: theme.text }}>{event.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm md:text-base opacity-80">
              {event.date && (
                <span className="font-semibold px-3 py-1 rounded-full border" style={{ borderColor: theme.border, color: theme.primary }}>
                  {new Date(event.date).toDateString()}
                </span>
              )}
              {event.location && (
                <span className="flex items-center">
                  📍 {event.location}
                </span>
              )}
            </div>

            {event.shortDescription && (
              <p className="text-lg md:text-xl font-light leading-relaxed mb-8 opacity-90 border-l-4 pl-4" style={{ borderColor: theme.primary }}>
                {event.shortDescription}
              </p>
            )}

            {event.longDescription && (
              <div className="prose prose-invert max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-base md:text-lg opacity-80" style={{ color: theme.text }}>
                  {event.longDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {event.galleryCategory && (
          <div className="mt-16">
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>Event Gallery</h2>
              <div className="h-px flex-1 opacity-20" style={{ backgroundColor: theme.text }}></div>
            </div>
            <GallerySection category={event.galleryCategory} heading="" showViewFullLink={false} theme="dark" />
          </div>
        )}
      </div>
    </div>
  );
}
