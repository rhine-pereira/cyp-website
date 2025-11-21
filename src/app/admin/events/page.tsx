'use client';

import AuthGuard from '@/app/components/Auth/AuthGuard';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { EventItem } from '@/app/types/event';
import Spinner from '@/app/components/Spinner';

export default function AdminEventsListPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/events', { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load');
        setItems((json.items as EventItem[]) || []);
      } catch (e: any) {
        setError(e?.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#1C1917]">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-[#FAFAFA]">Events</h1>
            <Link href="/admin/events/create" className="px-4 py-2 rounded-md bg-[#FB923C] text-[#1C1917] hover:bg-[#FCD34D] font-semibold">New event</Link>
          </div>
          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <Spinner label="Loading events…" trackClassName="opacity-25 bg-[#FB923C]/30" ringClassName="text-[#FB923C]" labelClassName="text-[#FAFAFA]/70" />
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="space-y-2">
              {items.map(ev => (
                <div key={ev.id} className="rounded-md border border-[#FB923C]/30 bg-[#1C1917] p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div>
                    <div className="font-medium text-[#FAFAFA]">{ev.title}</div>
                    <div className="text-sm text-[#FAFAFA]/70">{ev.date ? new Date(ev.date).toDateString() : ''}{ev.location ? ` · ${ev.location}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/events/${encodeURIComponent(ev.slug)}`} className="text-sm text-[#FB923C] underline hover:text-[#FCD34D]">View</Link>
                    <Link href={`/admin/events/${encodeURIComponent(ev.id)}/edit`} className="text-sm text-[#FB923C] underline hover:text-[#FCD34D]">Edit</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
