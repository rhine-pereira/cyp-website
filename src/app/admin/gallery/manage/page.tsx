'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/app/components/Auth/AuthGuard';
import VideoThumbnail from '@/app/components/Gallery/VideoThumbnail';
import type { GalleryItem } from '@/app/types/gallery';
import { Trash2, Eye, Video, Image as ImageIcon, CheckSquare, Square, X } from 'lucide-react';

export default function ManageGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  const load = async (reset = false) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (category && category !== 'all') params.set('category', category);
    if (!reset && cursor) params.set('cursor', cursor);
    const res = await fetch(`/api/gallery?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
    setCursor(data.nextCursor);
    setLoading(false);
  };

  useEffect(() => { setItems([]); setCursor(undefined); void load(true); }, [category]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const it of items) {
      if (it.category) {
        const slug = it.category;
        const label = it.categoryLabel || it.category;
        if (!map.has(slug)) map.set(slug, label);
      }
    }
    return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((i) => i.type === typeFilter);
    }

    // Search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((i) => (
        (i.title || '').toLowerCase().includes(q) ||
        (i.caption || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.categoryLabel || '').toLowerCase().includes(q) ||
        (i.url || '').toLowerCase().includes(q)
      ));
    }

    return result;
  }, [items, query, typeFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const selectAllFiltered = () => {
    setSelected(new Set(filtered.map((i) => i.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const deleteSelected = async () => {
    if (!selected.size) return;
    const confirmMsg = `Delete ${selected.size} selected item(s)? This cannot be undone.`;
    if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) return;
    const ids = Array.from(selected);
    const res = await fetch('/api/gallery/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
    if (res.ok) {
      const remaining = items.filter((i) => !selected.has(i.id));
      setItems(remaining);
      setSelected(new Set());
    }
  };

  const deleteOne = async (id: string) => {
    const it = items.find(x => x.id === id);
    const label = it?.title || it?.caption || it?.categoryLabel || it?.category || 'this item';
    const confirmMsg = `Delete "${label}"?`;
    if (typeof window !== 'undefined' && !window.confirm(confirmMsg)) return;
    const res = await fetch('/api/gallery/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [id] }) });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  // Extract filename from URL for display
  const getFileName = (url: string) => {
    try {
      const path = new URL(url).pathname;
      const parts = path.split('/');
      return decodeURIComponent(parts[parts.length - 1] || parts[parts.length - 2] || url);
    } catch {
      return url.split('/').pop() || url;
    }
  };

  const inputClass = "px-3 py-2 rounded-lg border border-[#FB923C]/30 text-sm text-[#FAFAFA] placeholder:text-[#FAFAFA]/40 bg-[#1C1917] focus:border-[#FB923C] focus:ring-1 focus:ring-[#FB923C] outline-none";
  const buttonClass = "px-3 py-2 rounded-lg border border-[#FB923C]/30 text-sm text-[#FAFAFA] bg-[#1C1917] hover:bg-[#FB923C]/10 transition-colors";

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] bg-[#1C1917]">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="bg-[#1C1917] border border-[#FB923C]/30 rounded-xl shadow-lg text-[#FAFAFA]">
            {/* Header */}
            <div className="p-4 border-b border-[#FB923C]/30">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-[#FAFAFA]">Manage Gallery</h1>
                  <div className="text-sm text-[#FAFAFA]/60">
                    {filtered.length} items {selected.size > 0 && `• ${selected.size} selected`}
                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, category, URL..."
                    className={`${inputClass} flex-1 min-w-[200px]`}
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputClass}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.label}</option>))}
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className={inputClass}
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images Only</option>
                    <option value="video">Videos Only</option>
                  </select>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={selectAllFiltered} className={buttonClass}>
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4" />
                      Select All ({filtered.length})
                    </span>
                  </button>
                  <button onClick={clearSelection} className={buttonClass} disabled={!selected.size}>
                    <span className="flex items-center gap-1.5">
                      <Square className="w-4 h-4" />
                      Clear
                    </span>
                  </button>
                  <button
                    onClick={deleteSelected}
                    disabled={!selected.size}
                    className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm disabled:opacity-40 hover:bg-red-700 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selected.size})
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filtered.map((it) => (
                  <div
                    key={it.id}
                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${selected.has(it.id)
                        ? 'border-[#FB923C] ring-2 ring-[#FB923C]/30'
                        : 'border-[#FB923C]/20 hover:border-[#FB923C]/50'
                      }`}
                  >
                    {/* Thumbnail */}
                    <div
                      className="aspect-square bg-gray-900 cursor-pointer"
                      onClick={() => toggleSelect(it.id)}
                    >
                      {it.type === 'image' ? (
                        <img
                          src={it.thumbnailUrl || it.url}
                          alt={it.title || getFileName(it.url)}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <VideoThumbnail
                          src={it.url}
                          alt={it.title || getFileName(it.url)}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Type Badge */}
                      <div className="absolute top-1.5 left-1.5">
                        <div className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${it.type === 'video' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                          }`}>
                          {it.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          {it.type}
                        </div>
                      </div>

                      {/* Selection Checkbox */}
                      <div className="absolute top-1.5 right-1.5">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected.has(it.id)
                            ? 'bg-[#FB923C] border-[#FB923C]'
                            : 'bg-black/40 border-white/50 group-hover:border-white'
                          }`}>
                          {selected.has(it.id) && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                      </div>
                    </div>

                    {/* Info Panel */}
                    <div className="p-2 bg-[#1C1917]">
                      <div className="text-xs font-medium text-[#FAFAFA] truncate" title={getFileName(it.url)}>
                        {it.title || it.caption || getFileName(it.url)}
                      </div>
                      <div className="text-[10px] text-[#FAFAFA]/50 truncate">
                        {it.categoryLabel || it.category || 'Uncategorized'}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 mt-1.5">
                        <button
                          onClick={() => setPreviewItem(it)}
                          className="flex-1 px-2 py-1 rounded text-[10px] bg-white/10 hover:bg-white/20 text-[#FAFAFA] transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => deleteOne(it.id)}
                          className="px-2 py-1 rounded text-[10px] bg-red-600/80 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!filtered.length && (
                <div className="p-12 text-center text-[#FAFAFA]/50">
                  No items match your filters.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#FB923C]/30 flex items-center justify-between">
              {cursor ? (
                <button
                  disabled={loading}
                  onClick={() => load(false)}
                  className="px-4 py-2 rounded-lg bg-[#FB923C] text-[#1C1917] disabled:opacity-50 hover:bg-[#FCD34D] font-semibold transition-colors"
                >
                  {loading ? 'Loading…' : 'Load More'}
                </button>
              ) : (
                <span className="text-sm text-[#FAFAFA]/50">End of list</span>
              )}
              <span className="text-sm text-[#FAFAFA]/50">
                Total loaded: {items.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <button
            onClick={() => setPreviewItem(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[80vh] w-full" onClick={(e) => e.stopPropagation()}>
            {previewItem.type === 'image' ? (
              <img
                src={previewItem.url}
                alt={previewItem.title || ''}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <video
                src={previewItem.url}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                playsInline
                preload="metadata"
              />
            )}
            <div className="mt-3 text-center">
              <div className="text-white font-medium">{previewItem.title || previewItem.caption || getFileName(previewItem.url)}</div>
              <div className="text-white/60 text-sm">{previewItem.categoryLabel || previewItem.category}</div>
              <button
                onClick={() => { deleteOne(previewItem.id); setPreviewItem(null); }}
                className="mt-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete This Item
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
