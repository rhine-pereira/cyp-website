'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { GalleryItem } from '@/app/types/gallery';
import Spinner from '@/app/components/Spinner';

export type GallerySectionProps = {
  category: string;
  initialItems?: GalleryItem[];
  initialCursor?: string;
  heading?: string;
  showViewFullLink?: boolean;
  viewFullHref?: string; // if not provided, will default to /gallery/{category}
  gridClassName?: string;
  theme?: 'light' | 'dark';
};

export default function GallerySection({
  category,
  initialItems = [],
  initialCursor,
  heading = 'Photos & Videos',
  showViewFullLink = true,
  viewFullHref,
  gridClassName,
  theme = 'light',
}: GallerySectionProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Theme-based styles
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const subTextColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const captionColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const linkHoverColor = isDark ? 'hover:text-white' : 'hover:text-gray-900';

  // Fetch initial if SSR did not provide
  useEffect(() => {
    if (initialItems.length === 0) {
      const loadInitial = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('category', category);
        params.set('limit', '12');
        const res = await fetch(`/api/gallery?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        setItems(json.items || []);
        setCursor(json.nextCursor);
        setLoading(false);
      };
      void loadInitial();
    } else {
      setItems(initialItems);
      setCursor(initialCursor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('category', category);
    params.set('limit', '12');
    params.set('cursor', cursor);
    const res = await fetch(`/api/gallery?${params.toString()}`, { cache: 'no-store' });
    const json = await res.json();
    setItems((prev) => [...prev, ...(json.items || [])]);
    setCursor(json.nextCursor);
    setLoading(false);
  };

  const openAt = (i: number) => { setIndex(i); setOpen(true); };
  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () => {
    setIndex((i) => {
      const next = Math.min(items.length - 1, i + 1);
      if (next >= items.length - 3 && cursor && !loading) void loadMore();
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-xl font-semibold ${textColor}`}>{heading}</h2>
        {showViewFullLink && (
          <Link href={viewFullHref || `/gallery/${encodeURIComponent(category)}`} className={`text-sm underline ${subTextColor} ${linkHoverColor}`}>View full gallery</Link>
        )}
      </div>
      <div className={"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 " + (gridClassName || '')}>
        {items.map((it, idx) => (
          <div key={it.id} className="cursor-pointer group" onClick={() => openAt(idx)}>
            {it.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.thumbnailUrl || it.url} alt={it.caption || it.title || 'image'} className="w-full h-full rounded-xl object-cover transition-transform group-hover:scale-[1.02]" loading="lazy" />
            ) : (
              <div className="relative w-full overflow-hidden rounded-xl bg-black/80 aspect-[4/3]">
                {it.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.thumbnailUrl} alt={it.caption || it.title || 'video'} className="w-full h-full object-cover opacity-90" loading="lazy" />
                ) : <div className="flex items-center justify-center w-full h-full text-white/70 text-xs">Video</div>}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow">
                    <div className="ml-1 w-0 h-0 border-t-8 border-b-8 border-l-0 border-r-0 border-transparent" style={{ borderLeft: '14px solid black' }} />
                  </div>
                </div>
              </div>
            )}
            {it.caption ? <div className={`mt-2 text-sm ${captionColor}`}>{it.caption}</div> : null}
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        {cursor ? (
          <button onClick={loadMore} disabled={loading} className={`px-5 py-3 rounded-xl ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'} disabled:opacity-50 flex items-center gap-3 transition-colors`}>
            {loading && <Spinner label="" size={20} ringWidth={3} trackClassName={isDark ? "border-black/20" : "border-white/40"} ringClassName={isDark ? "border-t-black" : "border-t-white"} />}
            {loading ? 'Loading…' : 'Load more'}
          </button>
        ) : (
          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {loading ? <Spinner label="Loading…" size={28} ringWidth={3} trackClassName={isDark ? "border-gray-700" : "border-gray-300"} ringClassName={isDark ? "border-t-gray-300" : "border-t-gray-700"} labelClassName={isDark ? "text-gray-400" : "text-gray-700"} /> : (items.length === 0 ? 'No items found' : 'No more items')}
          </div>
        )}
      </div>
      <Lightbox open={open} items={items} index={index} onClose={() => setOpen(false)} onPrev={handlePrev} onNext={handleNext} />
    </div>
  );
}

function Lightbox({ open, items, index, onClose, onPrev, onNext }: { open: boolean; items: GalleryItem[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const item = items[index];
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [swipeStart, setSwipeStart] = useState({ x: 0, y: 0, time: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    const handleWheel = (e: WheelEvent) => {
      if (item?.type !== 'image') return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((s) => Math.max(1, Math.min(5, s * delta)));
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); };
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKey);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [open, item, onClose, onPrev, onNext]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1 || item?.type !== 'image') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => { if (isDragging) setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      containerRef.current?.setAttribute('data-pinch-start', dist.toString());
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setSwipeStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
      if (scale > 1 && item?.type === 'image') {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - translate.x, y: touch.clientY - translate.y });
      }
    }
  };
  const handleTouchMove2 = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const start = parseFloat(containerRef.current?.getAttribute('data-pinch-start') || '0');
      if (start > 0) {
        const newScale = scale * (dist / start);
        setScale(Math.max(1, Math.min(5, newScale)));
        containerRef.current?.setAttribute('data-pinch-start', dist.toString());
      }
    } else if (e.touches.length === 1 && isDragging && scale > 1 && item?.type === 'image') {
      const touch = e.touches[0];
      setTranslate({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
    }
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && !isDragging && scale <= 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeStart.x;
      const deltaY = touch.clientY - swipeStart.y;
      const deltaTime = Date.now() - swipeStart.time;
      const velocity = Math.abs(deltaX) / deltaTime;
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 2 && velocity > 0.3) {
        if (deltaX > 0) onPrev(); else onNext();
      }
    }
    setIsDragging(false);
    containerRef.current?.removeAttribute('data-pinch-start');
  };

  if (!open || !item) return null;
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center touch-none" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-2xl" aria-label="Close">×</button>
      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-3xl" aria-label="Previous">‹</button>
      )}
      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-3xl" aria-label="Next">›</button>
      )}
      <div
        ref={containerRef}
        className="max-w-5xl w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove2}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? 'move' : 'default' }}
      >
        {item.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt={item.caption || item.title || ''}
            className="max-w-full max-h-full object-contain select-none"
            style={{ transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}
            draggable={false}
          />
        ) : (
          item.url.includes('youtube.com') || item.url.includes('youtu.be') || item.url.includes('vimeo.com') ? (
            <div className="aspect-video w-full max-w-4xl">
              <iframe className="w-full h-full rounded-lg" src={item.url.replace('watch?v=', 'embed/')} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          ) : (
            <video controls className="max-w-full max-h-full rounded-lg" src={item.url} />
          )
        )}
      </div>
      {item.caption && <div className="absolute bottom-4 left-4 right-4 text-center text-white/90 text-sm md:text-base bg-black/40 rounded-lg px-4 py-2">{item.caption}</div>}
      {scale > 1 && item.type === 'image' && <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">{Math.round(scale * 100)}%</div>}
    </div>
  );
}
