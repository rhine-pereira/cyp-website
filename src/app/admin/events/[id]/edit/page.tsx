'use client';

import AuthGuard from '@/app/components/Auth/AuthGuard';
import Spinner from '@/app/components/Spinner';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AdminEventEditPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [headerImageUrl, setHeaderImageUrl] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${encodeURIComponent(id)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load');
        setTitle(json.title || '');
        setDate(json.date ? json.date.slice(0, 10) : '');
        setLocation(json.location || '');
        setShortDescription(json.shortDescription || '');
        setLongDescription(json.longDescription || '');
        setHeaderImageUrl(json.headerImageUrl || '');
        setGalleryCategory(json.galleryCategory || '');
      } catch (e: any) {
        setError(e?.message || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/gallery?limit=1000', { cache: 'no-store' });
        const json = await res.json();
        if (res.ok) {
          const cats: string[] = Array.from(new Set((json.items || []).map((i: any) => (i.categoryLabel || i.category)).filter(Boolean)));
          cats.sort();
          setCategories(cats);
        }
      } catch { }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    try {
      const res = await fetch(`/api/events/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, location, shortDescription, longDescription, headerImageUrl, galleryCategory }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      router.push('/admin/events');
    } catch (e: any) {
      setError(e?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1 w-full border border-[#FB923C]/30 focus:border-[#FB923C] focus:ring-[#FB923C] rounded-md px-3 py-2 text-[#FAFAFA] placeholder:text-[#FAFAFA]/30 bg-white/5";
  const labelClass = "block text-sm font-medium text-[#FAFAFA]/90";

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#1C1917]">
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-semibold text-[#FAFAFA] mb-4">Edit Event</h1>
          {loading ? (
            <div className="py-10 flex items-center justify-center">
              <Spinner label="Loading event…" trackClassName="opacity-25 bg-[#FB923C]/30" ringClassName="text-[#FB923C]" labelClassName="text-[#FAFAFA]/70" />
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Event title" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} placeholder="YYYY-MM-DD" style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Location" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className={inputClass} placeholder="Short description" />
              </div>
              <div>
                <label className={labelClass}>Long Description</label>
                <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} className={inputClass} placeholder="Long description" />
              </div>
              <div>
                <label className={labelClass}>Header Image URL</label>
                <input value={headerImageUrl} onChange={(e) => setHeaderImageUrl(e.target.value)} className={inputClass} placeholder="https://..." />
              </div>
              <div>
                <label className={labelClass}>Link to Gallery Category</label>
                <select
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className={inputClass}
                  style={{ backgroundColor: '#1C1917' }}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-xs text-[#FAFAFA]/50 mt-1">Choose from existing gallery category slugs to auto-show photos on the event page.</p>
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-[#FB923C] text-[#1C1917] hover:bg-[#FCD34D] disabled:opacity-50 font-semibold">{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
